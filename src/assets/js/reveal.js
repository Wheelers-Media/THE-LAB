// Scroll reveals: blocks below the fold fade and rise once as they enter the screen, and lazy photos fade in when they load.
// This file only tags elements and flips a class. The animation is CSS (opacity + transform, compositor only; see "Motion" in lab.css).
// Nothing is hidden if JavaScript or IntersectionObserver is missing, or if the visitor asked for reduced motion.
(function () {
    'use strict';
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // grids whose children should appear one after another instead of as one block
    var GRIDS = '.gi-cards,.gi-trucks,.gi-road-grid,.gi-gallery-grid,.results-grid,.quotes,.addons,.plans,.story,.checks';
    // sections that are interactive or manage their own motion
    var SKIP = '.page-hero,.wz,[data-wz],.book,.lf,[data-intake],.hero,.door';

    function init() {
        var main = document.getElementById('main');
        if (!main) return;
        var vh = window.innerHeight;
        var targets = [];

        main.querySelectorAll('main > section, main > div > section, main > div > article').forEach(function (sec) {
            if (sec.matches(SKIP)) return;
            var box = sec.children.length === 1 && sec.firstElementChild.classList.contains('wrap') ? sec.firstElementChild : sec;
            [].forEach.call(box.children, function (el) {
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.hidden) return;
                if (el.matches(GRIDS)) [].forEach.call(el.children, function (c) { targets.push(c); });
                else targets.push(el);
            });
        });

        // only blocks that start below the first screen: anything already visible stays put, so nothing flashes on load
        targets = targets.filter(function (el) { return el.getBoundingClientRect().top > vh * 0.92; });
        if (!targets.length) { initImages(main); return; }

        document.documentElement.classList.add('js');
        targets.forEach(function (el) { el.setAttribute('data-reveal', ''); });

        var io = new IntersectionObserver(function (entries) {
            var seen = entries.filter(function (e) { return e.isIntersecting || e.boundingClientRect.top < 0; });
            seen.sort(function (a, b) { return a.target.compareDocumentPosition(b.target) & 4 ? -1 : 1; });
            seen.forEach(function (e, i) {
                var el = e.target;
                if (e.boundingClientRect.top < 0) el.style.transition = 'none'; // already scrolled past (anchor jump): no animation
                el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
                el.classList.add('is-in');
                io.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        targets.forEach(function (el) { io.observe(el); });

        window.addEventListener('beforeprint', function () {
            targets.forEach(function (el) { el.style.transition = 'none'; el.classList.add('is-in'); });
        });
        initImages(main);
    }

    // lazy photos start transparent and fade in on load; failures still show
    function initImages(main) {
        main.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
            if (img.complete) return;
            document.documentElement.classList.add('js');
            img.classList.add('img-wait');
            var done = function () { img.classList.remove('img-wait'); };
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
