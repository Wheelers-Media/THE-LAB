// Shared site chrome behaviour: currency toggle, mobile menu, cart badge, current-page highlight.
// Loaded (not deferred) in <head> on every page so window.setCurrency exists before the service-page builders wrap it.
(function () {
    'use strict';

    // ── Currency ─────────────────────────────────────────────────────────────
    // Prices carry data-price-cad / data-price-from-cad / data-affirm-cad-total; this rewrites them for the chosen currency.
    var RATE = 0.74;
    function readCurrency() { try { return localStorage.getItem('theLab_currency') === 'USD' ? 'USD' : 'CAD'; } catch (e) { return 'CAD'; } }

    window.setCurrency = function (c) {
        c = c === 'USD' ? 'USD' : 'CAD';
        try { localStorage.setItem('theLab_currency', c); } catch (e) { /* storage unavailable */ }
        document.querySelectorAll('[data-cur]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cur') === c)); });
        document.querySelectorAll('[data-price-cad]').forEach(function (el) {
            var cad = parseFloat(el.getAttribute('data-price-cad'));
            if (!isNaN(cad)) el.textContent = c === 'USD' ? '$' + (cad * RATE).toFixed(2) + ' USD' : '$' + cad.toFixed(2) + ' CAD';
        });
        document.querySelectorAll('[data-price-from-cad]').forEach(function (el) {
            var cad = parseFloat(el.getAttribute('data-price-from-cad'));
            if (!isNaN(cad)) el.textContent = c === 'USD' ? 'From $' + (cad * RATE).toFixed(2) + ' USD' : 'From $' + cad.toFixed(2) + ' CAD';
        });
        document.querySelectorAll('[data-affirm-cad-total]').forEach(function (el) {
            var base = parseFloat(el.getAttribute('data-affirm-cad-total'));
            if (isNaN(base)) return;
            var cad = base * 1.12; // estimated tax, matches checkout
            if (base >= 50 && base < 1000) el.innerHTML = 'Pay in 4 installments of <strong>$' + (c === 'USD' ? (cad / 4 * RATE) : (cad / 4)).toFixed(2) + ' ' + c + '</strong> with';
            else if (base >= 1000) el.innerHTML = 'Pay in monthly installments as low as <strong>$' + (c === 'USD' ? (cad / 24 * RATE) : (cad / 24)).toFixed(2) + ' ' + c + '/mo</strong> with';
        });
    };

    // gives a step's content a short fade-and-rise each time it appears (CSS .step-in); skipped for reduced motion
    window.labStepIn = function (els) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        [].forEach.call(els, function (e) { e.classList.remove('step-in'); void e.offsetWidth; e.classList.add('step-in'); });
    };

    // Header-aware smooth scroll — use this everywhere instead of raw scrollIntoView so step changes
    // always land below the sticky bar, never under it. Reads --header-h so it tracks resize automatically.
    window.labScrollTo = function (el) {
        if (!el) return;
        var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var hdrH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 0;
        var pad = hdrH + 16; // 16px breathing room (matches scroll-padding-top in CSS)
        var top = el.getBoundingClientRect().top + window.scrollY - pad;
        if (calm || typeof window.scrollTo !== 'function') {
            el.scrollIntoView({ block: 'start' });
        } else {
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        // keep --header-h equal to the sticky header's real height (it changes with screen size) so scrolls land below it
        var hdr = document.getElementById('site-header');
        if (hdr) {
            var setH = function () { document.documentElement.style.setProperty('--header-h', hdr.offsetHeight + 'px'); };
            setH();
            if (window.ResizeObserver) new ResizeObserver(setH).observe(hdr); else window.addEventListener('resize', setH);
        }

        // apply the saved currency to static prices and set the toggle state
        if (document.querySelector('[data-cur],[data-price-cad],[data-price-from-cad]')) window.setCurrency(readCurrency());
        document.addEventListener('click', function (e) {
            var b = e.target.closest && e.target.closest('[data-cur]');
            if (b) window.setCurrency(b.getAttribute('data-cur'));
        });

        // ── Mobile menu ──────────────────────────────────────────────────────
        var btn = document.getElementById('mob-btn'), menu = document.getElementById('mob-menu');
        function setMenu(open) {
            if (!btn || !menu) return;
            menu.hidden = !open;
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }
        if (btn && menu) {
            btn.addEventListener('click', function () { setMenu(menu.hidden); });
            menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
            window.matchMedia('(min-width:1024px)').addEventListener('change', function (q) { if (q.matches) setMenu(false); });
        }
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (menu && !menu.hidden) { setMenu(false); if (btn) btn.focus(); }
            var open = document.querySelector('.site-nav-item:focus-within');
            if (open && document.activeElement && open.contains(document.activeElement)) document.activeElement.blur();
        });

        // ── Current page ─────────────────────────────────────────────────────
        var p = location.pathname;
        var key = p.indexOf('/boutique') === 0 ? 'boutique' : p.indexOf('/store') === 0 ? 'store' : p.indexOf('/about') === 0 ? 'about' : (p.indexOf('/contact') === 0 || p.indexOf('-success') > -1) ? 'contact' : '';
        if (key) document.querySelectorAll('.site-nav-link[data-nav="' + key + '"]').forEach(function (a) { a.setAttribute('aria-current', 'page'); });

        // ── Cart ─────────────────────────────────────────────────────────────
        // store.js owns the cart drawer on store pages; elsewhere show the count from storage and send the click to the store.
        var cartBtn = document.getElementById('cart-btn'), badge = document.getElementById('cart-count');
        if (badge && typeof window.updateCartUI !== 'function') {
            try {
                var items = JSON.parse(localStorage.getItem('lab_cart') || '[]');
                var n = items.reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
                badge.textContent = n;
                badge.classList.toggle('hidden', n === 0);
            } catch (e) { /* storage unavailable or unreadable */ }
        }
        if (cartBtn) cartBtn.addEventListener('click', function () {
            if (typeof window.openCart !== 'function') location.href = '/store/catalog/?cart=1';
        });
    });
})();
