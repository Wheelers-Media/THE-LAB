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
    // Only scrolls if the element is obscured by the header or pushed too far down the screen.
    window.labScrollTo = function (el) {
        if (!el) return;
        var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var hdrH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 0;
        var pad = hdrH + 16; // 16px breathing room (matches scroll-padding-top in CSS)
        var rect = el.getBoundingClientRect();
        
        // If it's already comfortably in view, don't force a jump
        if (rect.top >= pad && rect.top < window.innerHeight * 0.75) {
            return;
        }

        var top = rect.top + window.scrollY - pad;
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

        // phones: the header slides away on the way down and comes back on the way up (CSS .is-away); it stays put near the top,
        // while the menu or search is open, while it holds focus, and for reduced motion
        if (hdr && window.matchMedia) {
            var phone = window.matchMedia('(max-width:767px)'), calm = window.matchMedia('(prefers-reduced-motion: reduce)');
            var lastY = window.scrollY, pending = false;
            var settle = function () {
                pending = false;
                var y = window.scrollY, dy = y - lastY;
                var menuOpen = document.getElementById('mob-menu') && !document.getElementById('mob-menu').hidden;
                var pinned = !phone.matches || calm.matches || y < 120 || menuOpen || hdr.contains(document.activeElement) || document.querySelector('.site-search.is-open');
                if (pinned) hdr.classList.remove('is-away');
                else if (dy > 6) hdr.classList.add('is-away');
                else if (dy < -6) hdr.classList.remove('is-away');
                if (Math.abs(dy) > 6 || pinned) lastY = y;
            };
            window.addEventListener('scroll', function () { if (!pending) { pending = true; requestAnimationFrame(settle); } }, { passive: true });
            hdr.addEventListener('focusin', function () { hdr.classList.remove('is-away'); });
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

    // ── First touch ──────────────────────────────────────────────────────────
    // Remembers, for 30 days, where a visitor first came from (Instagram, Facebook, Google) so intake.js can send it
    // with the form and the CRM can say which channel each lead started on. Direct visits store nothing, so a later
    // real touch is still recorded. Nothing personal is kept: a channel, a campaign name and a landing path.
    var TOUCH_KEY = 'theLab_firstTouch', TOUCH_MS = 30 * 864e5;
    var CHANNELS = { instagram: 'Instagram', facebook: 'Facebook', google: 'Google' };
    function touchChannel(q, host) {
        var src = (q.get('utm_source') || '').toLowerCase();
        if (/instagram|^ig$/.test(src) || /(^|\.)instagram\.com$/.test(host)) return 'instagram';
        if (/facebook|^fb$|^meta$/.test(src) || /(^|\.)(facebook|fb)\.com$/.test(host) || q.get('fbclid')) return 'facebook';
        if (src === 'google' || q.get('gclid') || /(^|\.)google\.[a-z.]+$/.test(host)) return 'google';
        return '';
    }
    function recordTouch() {
        try {
            var saved = JSON.parse(localStorage.getItem(TOUCH_KEY) || 'null');
            if (saved && Date.now() - saved.at < TOUCH_MS) return;
            var host = '';
            try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) { /* bad referrer */ }
            if (host === location.hostname.replace(/^www\./, '')) return; // moving around the site is not a new visit
            var q = new URLSearchParams(location.search), channel = touchChannel(q, host);
            if (!channel) return;
            localStorage.setItem(TOUCH_KEY, JSON.stringify({
                at: Date.now(), channel: channel, label: CHANNELS[channel],
                campaign: (q.get('utm_campaign') || '').slice(0, 60), landing: location.pathname,
            }));
        } catch (e) { /* storage unavailable */ }
    }
    window.labFirstTouch = function () {
        try {
            var t = JSON.parse(localStorage.getItem(TOUCH_KEY) || 'null');
            return t && Date.now() - t.at < TOUCH_MS ? { channel: t.channel, label: t.label, campaign: t.campaign, landing: t.landing } : null;
        } catch (e) { return null; }
    };
    recordTouch();
})();
