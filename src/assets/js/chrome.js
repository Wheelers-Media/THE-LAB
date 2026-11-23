// Shared site chrome behaviour: currency toggle, mobile menu, cart badge, current-page highlight.
// Loaded (not deferred) in <head> on every page so window.setCurrency exists before the service-page builders wrap it.
// ── Meta pixel ───────────────────────────────────────────────────────────────
// Dataset "666" (THE LAB) in Eric's Meta Business account. PageView on every page; AddToCart fires from store.js
// and the diesel builder through window.labTrack. Shopify's Facebook & Instagram channel sends InitiateCheckout and
// Purchase from checkout on the same pixel, so they are not fired here (no double counting).
!function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
}(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '697977501958056');
fbq('track', 'PageView');
window.labTrack = function (event, data) { try { window.fbq && window.fbq('track', event, data || {}); } catch (e) { /* tracking never breaks the page */ } };

(function () {
    'use strict';

    // ── Currency ─────────────────────────────────────────────────────────────
    // Parts prices carry data-price-cad / data-price-from-cad / data-affirm-cad-total. In USD mode this swaps them for the
    // exact US price Shopify charges at checkout (its United States market), read from the Storefront API and cached for
    // 6 hours. Boutique services, shipping rates and anything inside [data-cad-only] always stay in CAD.
    // A visitor's first currency comes from where they are (US -> USD, everywhere else CAD); the switch overrides it.
    var CUR_KEY = 'theLab_currency', CUR_SET = 'theLab_currencyChosen', IDX_KEY = 'theLab_usdIndex', IDX_MS = 6 * 36e5;
    var SF_URL = 'https://xr6pmx-y0.myshopify.com/api/2024-01/graphql.json', SF_TOKEN = '661b1009a0d85bfadfce9c52fcb3d87f';
    function readCurrency() { try { return localStorage.getItem(CUR_KEY) === 'USD' ? 'USD' : 'CAD'; } catch (e) { return 'CAD'; } }
    window.labCurrency = readCurrency;
    var cadOnlyPage = /^\/(boutique|shipping|contact)/.test(location.pathname) || location.pathname.indexOf('-success') > -1;
    function cadOnly(el) { return cadOnlyPage || !!(el.closest && el.closest('[data-cad-only]')); }

    // US price index: variant id -> [CAD, USD], both straight from Shopify
    var idx = null, idxLoading = null;
    function readIdx() {
        try { var c = JSON.parse(localStorage.getItem(IDX_KEY) || 'null'); return c && Date.now() - c.at < IDX_MS ? c : null; } catch (e) { return null; }
    }
    async function fetchPrices(country) {
        var out = {}, after = null, more = true;
        while (more) {
            var q = 'query($a:String) @inContext(country:' + country + ') { products(first:250, after:$a) { pageInfo { hasNextPage endCursor } nodes { variants(first:100) { nodes { id price { amount } } } } } }';
            var r = await fetch(SF_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SF_TOKEN }, body: JSON.stringify({ query: q, variables: { a: after } }) });
            var j = await r.json(), page = j.data && j.data.products;
            if (!page) throw new Error('prices');
            page.nodes.forEach(function (p) { p.variants.nodes.forEach(function (v) { out[v.id] = parseFloat(v.price.amount); }); });
            more = page.pageInfo.hasNextPage; after = page.pageInfo.endCursor;
        }
        return out;
    }
    function buildIdx(c) {
        var byCad = {}, ratios = [];
        Object.keys(c.v).forEach(function (id) {
            var cad = c.v[id][0], usd = c.v[id][1], k = cad.toFixed(2);
            byCad[k] = byCad[k] === undefined || byCad[k] === usd ? usd : null; // null: same CAD price, different USD prices
            if (cad >= 50) ratios.push(usd / cad);
        });
        ratios.sort(function (a, b) { return a - b; });
        return { v: c.v, byCad: byCad, rate: ratios.length ? ratios[Math.floor(ratios.length / 2)] : null };
    }
    function loadIdx() {
        if (idx) return Promise.resolve(idx);
        var c = readIdx();
        if (c) { idx = buildIdx(c); return Promise.resolve(idx); }
        if (!idxLoading) idxLoading = Promise.all([fetchPrices('CA'), fetchPrices('US')]).then(function (r) {
            var v = {};
            Object.keys(r[1]).forEach(function (id) { if (r[0][id] != null) v[id] = [r[0][id], r[1][id]]; });
            var c2 = { at: Date.now(), v: v };
            try { localStorage.setItem(IDX_KEY, JSON.stringify(c2)); } catch (e) { /* full or unavailable */ }
            idx = buildIdx(c2);
            return idx;
        }).catch(function () { idxLoading = null; return null; });
        return idxLoading;
    }
    // The US price for a CAD amount: the variant's own US price, else the US price of any product at that CAD price,
    // else Shopify's current rate (sale prices and totals). null = not ready, keep CAD.
    window.labUsd = function (cad, variantId) {
        if (!idx || isNaN(cad)) return null;
        if (variantId && idx.v[variantId]) return idx.v[variantId][1];
        var hit = idx.byCad[Number(cad).toFixed(2)];
        if (hit != null) return hit;
        return idx.rate ? Math.round(cad * idx.rate * 100) / 100 : null;
    };
    var fmt = function (n) { return '$' + Number(n).toFixed(2); };

    function paint(c) {
        document.querySelectorAll('[data-cur]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cur') === c)); });
        document.querySelectorAll('[data-cur-toggle]').forEach(function (b) {
            b.textContent = c; b.setAttribute('aria-label', 'Prices in ' + c + '. Switch to ' + (c === 'USD' ? 'CAD' : 'USD'));
        });
        var conv = function (el, cad) {
            if (c !== 'USD' || cadOnly(el)) return { n: cad, cur: 'CAD' };
            var items = el.getAttribute('data-price-items'), usd;
            if (items) { // a cart total is the sum of each line's own US price, as checkout adds it up
                usd = 0;
                items.split(',').forEach(function (it) {
                    var a = it.split(':'), u = window.labUsd(parseFloat(a[1]), a[0]);
                    usd = usd == null || u == null ? null : usd + u * (parseInt(a[2], 10) || 1);
                });
            } else usd = window.labUsd(cad, el.getAttribute('data-variant-id'));
            return usd == null ? { n: cad, cur: 'CAD' } : { n: usd, cur: 'USD' };
        };
        document.querySelectorAll('[data-price-cad]').forEach(function (el) {
            var cad = parseFloat(el.getAttribute('data-price-cad'));
            if (isNaN(cad)) return;
            var p = conv(el, cad), off = parseFloat(el.getAttribute('data-price-off'));
            // a sale price taken off at checkout: Shopify takes the % off that currency's own price
            if (!isNaN(off)) p.n = Math.round(p.n * (100 - off)) / 100;
            el.textContent = fmt(p.n) + ' ' + p.cur;
        });
        document.querySelectorAll('[data-price-from-cad]').forEach(function (el) {
            var cad = parseFloat(el.getAttribute('data-price-from-cad'));
            if (!isNaN(cad)) { var p = conv(el, cad); el.textContent = 'From ' + fmt(p.n) + ' ' + p.cur; }
        });
        document.querySelectorAll('[data-affirm-cad-total]').forEach(function (el) {
            var base = parseFloat(el.getAttribute('data-affirm-cad-total'));
            if (isNaN(base)) return;
            var p = conv(el, base), total = p.n * 1.12; // estimated tax, matches checkout
            if (base >= 50 && base < 1000) el.innerHTML = 'Pay in 4 installments of <strong>' + fmt(total / 4) + ' ' + p.cur + '</strong> with';
            else if (base >= 1000) el.innerHTML = 'Pay in monthly installments as low as <strong>' + fmt(total / 24) + ' ' + p.cur + '/mo</strong> with';
        });
        try { document.dispatchEvent(new CustomEvent('lab:currency', { detail: c })); } catch (e) { /* old browsers */ }
    }

    window.setCurrency = function (c, auto) {
        c = c === 'USD' ? 'USD' : 'CAD';
        try { localStorage.setItem(CUR_KEY, c); if (!auto) localStorage.setItem(CUR_SET, '1'); } catch (e) { /* storage unavailable */ }
        paint(c);
        if (c === 'USD' && !idx) loadIdx().then(function () { if (readCurrency() === 'USD') paint('USD'); });
    };

    // First visit: pick the currency from the visitor's country (Vercel geo, /api/geo). Never overrides a choice.
    function autoCurrency() {
        var chosen = false;
        try { chosen = !!localStorage.getItem(CUR_SET) || !!localStorage.getItem('theLab_geoDone'); } catch (e) { return; }
        if (chosen) return;
        fetch('/api/geo', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (g) {
            try { localStorage.setItem('theLab_geoDone', '1'); } catch (e) { /* storage unavailable */ }
            if (g && g.country === 'US') { window.setCurrency('USD', true); showUsNote(); }
        }).catch(function () { /* stays CAD */ });
    }
    function showUsNote() {
        if (cadOnlyPage || document.getElementById('cur-note')) return;
        var hdr = document.getElementById('site-header');
        if (!hdr) return;
        var n = document.createElement('div');
        n.id = 'cur-note'; n.className = 'cur-note'; n.setAttribute('role', 'status');
        n.innerHTML = '<p>Shopping from the US? Parts prices are in USD, the same price you pay at checkout.</p>' +
            '<button type="button" data-cur="CAD">Switch to CAD</button><button type="button" class="cur-note-x" aria-label="Close">&times;</button>';
        hdr.insertAdjacentElement('afterend', n);
        n.addEventListener('click', function (e) { if (e.target.closest('button')) n.remove(); });
    }

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
        if (document.querySelector('[data-cur],[data-price-cad],[data-price-from-cad]')) window.setCurrency(readCurrency(), true);
        autoCurrency();
        document.addEventListener('click', function (e) {
            var b = e.target.closest && e.target.closest('[data-cur]');
            if (b) window.setCurrency(b.getAttribute('data-cur'));
            var t = e.target.closest && e.target.closest('[data-cur-toggle]');
            if (t) window.setCurrency(readCurrency() === 'USD' ? 'CAD' : 'USD');
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
        var key = p.indexOf('/boutique') === 0 ? 'boutique' : p.indexOf('/gridiron') === 0 ? 'gridiron' : p.indexOf('/store') === 0 ? 'store' : p.indexOf('/about') === 0 ? 'about' : (p.indexOf('/contact') === 0 || p.indexOf('-success') > -1) ? 'contact' : '';
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

    // ── Referral tag ─────────────────────────────────────────────────────────
    // A partner link (?ref=nw&kw=L5P) is remembered for 90 days. The first tag sticks: a later visit, tagged or not,
    // never replaces it. Checkout, the forms and the booking calendar pass it on so the CRM can credit the sale.
    // It never changes a price.
    var REF_KEY = 'theLab_ref', REF_MS = 90 * 864e5;
    function readRef() {
        try {
            var r = JSON.parse(localStorage.getItem(REF_KEY) || 'null');
            return r && Date.now() - r.at < REF_MS ? r : null;
        } catch (e) { return null; }
    }
    try {
        var rq = new URLSearchParams(location.search), code = (rq.get('ref') || '').toLowerCase();
        if (/^[a-z0-9]{1,20}$/.test(code) && !readRef()) {
            localStorage.setItem(REF_KEY, JSON.stringify({ code: code, kw: (rq.get('kw') || '').replace(/[^\w-]/g, '').slice(0, 40), at: Date.now() }));
        }
    } catch (e) { /* storage unavailable */ }
    window.labReferral = function () {
        var r = readRef();
        return r ? { code: r.code, keyword: r.kw || '', at: new Date(r.at).toISOString() } : null;
    };
    // One line for emails to the shop: "nw (keyword L5P, first visit 2026-11-19)"
    window.labReferralText = function () {
        var r = window.labReferral();
        return r ? r.code + ' (' + (r.keyword ? 'keyword ' + r.keyword + ', ' : '') + 'first visit ' + r.at.slice(0, 10) + ')' : '';
    };
})();
