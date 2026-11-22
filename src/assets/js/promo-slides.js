// Home promo slideshow: "What's on now".
// Edit the PROMO block below to change copy, dates, order or the featured parts. Everything else is plumbing.
//
// Prices are never typed here. They are read live:
//   - Shopify (Storefront API): Polar parts and the gift card. During the sale, set each sale price in Shopify
//     with the old price as "Compare-at price"; the slide then shows was/now by itself. No compare-at = no strike-through.
//   - Service pages: detailing, membership and Gridiron prices are read from those pages, the same way quote.js does.
// All times are Fort St. John time (MST, UTC-7). Preview another date with ?promo-date=2026-11-24T09:00
(function () {
    'use strict';

    // Public Storefront token, same one products.js uses (keep the two in step).
    const STORE_URL = 'https://xr6pmx-y0.myshopify.com/api/2024-01/graphql.json';
    const STORE_TOKEN = '661b1009a0d85bfadfce9c52fcb3d87f';

    const OFFROAD = 'Off-Road and Sanctioned Racing Use Only. Not legal for use on pollution-controlled vehicles driven on public roads.';

    const PROMO = {
        polar: {
            start: '2026-11-23T00:00:00-07:00',
            end: '2026-12-04T23:59:59-07:00',
            pct: 15,                       // online (website) discount. Eric, 2026-11-19: 15% online, 10% in the shop. Eric, 2026-11-21: Polar billet max 5% (automatic discount in Shopify)
            shopPct: 10,                   // in-shop (register) discount, shown in the fine print
            atCheckout: true,              // true = discount is an automatic discount applied at checkout, so the chips work out
                                           // the sale price themselves. If compare-at prices are loaded in Shopify instead, those win.
            parts: [                       // Shopify handles; short names for the chips
                { handle: '2011-2026-ford-powerstroke-6-7l-5-exhaust', name: '6.7 Powerstroke 5" exhaust' },
                { handle: '2019-2024-cummins-6-7l-5-exhaust', name: '2019-24 Cummins 5" exhaust' },
                { handle: '2017-2025-duramax-6-6l-4-exhaust', name: '2017-25 Duramax 4" exhaust' },
                { handle: 'polar-diesel-polished-oval-exhaust-tip-1', name: '304SS polished oval tip' }
            ]
        },
        // Each slide can have several versions; the first one whose dates include "now" is shown.
        // rank orders the slides (lowest first). A slide with no version for "now" is left out.
        slides: [
            {
                id: 'polar', bay: 'parts', img: '/assets/promo-polar.jpg', alt: 'Polished stainless diesel exhaust pipes laid out under white hex lights at THE LAB',
                versions: [
                    {   // teaser: from now until the sale opens
                        to: 'polar.start', rank: 1,
                        eyebrow: 'Polar Diesel Black Friday &middot; Nov 23 to Dec 4',
                        title: 'Polar&rsquo;s biggest sale of the year starts November 23.',
                        text: '{pct}% off Polar exhaust, tips and elbows online. Plan your build now, then check out when the prices drop.',
                        clock: { to: 'polar.start', label: 'Starts in' },
                        chips: 'teaser',
                        ctas: [['Plan my build', '/diesel/'], ['See Polar parts', '/store/catalog/?brand=Polar+Diesel']],
                        fine: 'In the shop: {shopPct}% off Polar from Nov 23. Polar billet parts are 5% off, online and in the shop. ' + OFFROAD
                    },
                    {   // last 48 hours
                        from: '2026-12-03T00:00:00-07:00', to: 'polar.end', rank: 1,
                        eyebrow: 'Polar Diesel Black Friday &middot; Last 2 days',
                        title: 'Last call: {pct}% off Polar Diesel online ends Friday night.',
                        text: 'Exhaust, tips and elbows at the lowest Polar pricing of the year. Ships across Canada and to the US, or installed here.',
                        clock: { to: 'polar.end', label: 'Ends in' },
                        chips: 'sale',
                        ctas: [['Shop the sale', '/store/catalog/?brand=Polar+Diesel'], ['Build a power package', '/diesel/']],
                        fine: 'Online price applies at checkout; {shopPct}% off in the shop. Polar billet parts are 5% off. Ends December 4 at 11:59 p.m. MT. ' + OFFROAD
                    },
                    {   // sale is on
                        from: 'polar.start', to: 'polar.end', rank: 1,
                        eyebrow: 'Polar Diesel Black Friday &middot; On now',
                        title: '{pct}% off Polar Diesel online. Now through December 4.',
                        text: 'Exhaust, tips and elbows at the lowest Polar pricing of the year. Ships across Canada and to the US, or installed here.',
                        chips: 'sale',
                        ctas: [['Shop the sale', '/store/catalog/?brand=Polar+Diesel'], ['Build a power package', '/diesel/']],
                        fine: 'Online price applies at checkout; {shopPct}% off in the shop. Polar billet parts are 5% off. Ends December 4 at 11:59 p.m. MT. ' + OFFROAD
                    }
                ]
            },
            {
                id: 'power', bay: 'parts', img: '/assets/promo-power.jpg', alt: 'THE LAB tuner working on a laptop calibration inside a Ford Super Duty',
                versions: [
                    {   // the $100 bonus was dropped (Eric and Christine, 2026-11-19)
                        rank: 2,
                        eyebrow: 'Power Packages',
                        title: 'Tune and exhaust in one order.',
                        text: 'Pick your truck, choose your parts, see your total as you go. Shipped across Canada, or installed here in Fort St. John.',
                        ctas: [['Build my package', '/diesel/'], ['Ask Eric about my truck', '/contact/?service=Custom%20Tuning#form']],
                        fine: OFFROAD
                    }
                ]
            },
            {
                id: 'winter', bay: 'boutique', img: '/assets/promo-winter.jpg', alt: 'Black Chevrolet Silverado being washed under white hex lights in THE LAB detailing bay',
                versions: [
                    {   // Eric, 2026-11-19: Bio Bomb for $50 with a De-Luxx Interior booked by Dec 4
                        to: 'polar.end', rank: 3,
                        eyebrow: 'The Boutique &middot; Winter reset',
                        title: 'Salt, slush and sand. Out.',
                        text: 'De-Luxx Interior: carpet shampoo, steam clean, leather conditioning and pet hair removal. {deluxx}',
                        bonus: '<strong>Book by December 4:</strong> add Bio Bomb odour elimination for $50{bioBomb}.',
                        more: 'Then keep it that way: The Monthly Signature, {monthly}.',
                        ctas: [['Book a detail', '/contact/?service=Premium%20Detailing#form'], ['See memberships', '/boutique/detailing/#maintenance']],
                        fine: 'Two drop-offs a day, Monday to Friday, 8 to 9 a.m. Memberships need a Signature Detail in the last 30 days.'
                    },
                    {
                        rank: 1,
                        eyebrow: 'The Boutique &middot; Winter reset',
                        title: 'Salt, slush and sand. Out.',
                        text: 'De-Luxx Interior: carpet shampoo, steam clean, leather conditioning and pet hair removal. {deluxx}',
                        more: 'Then keep it that way: The Monthly Signature, {monthly}.',
                        ctas: [['Book a detail', '/contact/?service=Premium%20Detailing#form'], ['See memberships', '/boutique/detailing/#maintenance']],
                        fine: 'Two drop-offs a day, Monday to Friday, 8 to 9 a.m. Memberships need a Signature Detail in the last 30 days.'
                    }
                ]
            },
            {
                id: 'gift', bay: 'boutique', img: '/assets/promo-gift.jpg', alt: 'THE LAB shop at dusk with a lifted GMC, a Ford pickup, an SUV and a side-by-side parked out front',
                versions: [
                    {
                        from: 'polar.start', to: '2026-12-24T23:59:59-07:00', rank: 4,
                        eyebrow: 'Gift cards &middot; Christmas',
                        title: 'The gift every truck owner wants.',
                        text: 'THE LAB gift cards, {gift}. Good for detailing, tint, lighting and installs. Bought online, sent by email.',
                        ctas: [['Buy a gift card', 'https://xr6pmx-y0.myshopify.com/products/the-lab-gift-card'], ['See Boutique services', '/boutique/']],
                        fine: ''
                    }
                ]
            },
            {
                id: 'gridiron', bay: 'parts', img: '/assets/promo-gridiron.jpg', alt: 'White Ford Super Duty with a Gridiron steel front bumper and winch parked outside THE LAB',
                versions: [
                    {   // Black Friday (Gridiron's own promo, Nov 23 to Dec 4): free 30" Hi-Lux 2.0 with an OG or Street Series front bumper
                        from: 'polar.start', to: 'polar.end', rank: 2.5,
                        eyebrow: 'Gridiron Black Friday &middot; Nov 23 to Dec 4',
                        title: 'Free 30&quot; light bar with a Gridiron front bumper.',
                        text: 'Order a Base, Prerunner, Full Tube or Street Series front bumper by December 4 and get a Speed Demon 30&quot; Hi-Lux 2.0 light bar free. {gridiron}',
                        ctas: [['Get a bumper quote', '/contact/?form=build&service=Bumpers%20%26%20Accessories#form'], ['See Gridiron', '/gridiron/']],
                        fine: 'One light bar per bumper order. Wiring harness not included. Installs at our $125/hr shop rate. Ends December 4 at 11:59 p.m. MT.'
                    },
                    {
                        rank: 5,
                        eyebrow: 'Gridiron bumpers &middot; Made in Canada',
                        title: 'Canadian steel. Fitted in Fort St. John.',
                        text: 'Handcrafted 3/16" steel bumpers, front and rear, with or without a winch. {gridiron}',
                        ctas: [['Get a bumper quote', '/contact/?form=build&service=Bumpers%20%26%20Accessories#form'], ['See Gridiron', '/gridiron/']],
                        fine: 'Installs at our $125/hr shop rate.'
                    }
                ]
            }
        ]
    };

    // Prices read from our own service pages: [page, selector, phrase]. {x} in the phrase is the price.
    const PAGE_PRICES = {
        deluxx: ['/boutique/detailing/', '#panel-interior .tier--feature .price', 'From {x}.'],
        monthly: ['/boutique/detailing/', '#maintenance .plan .price', 'from {x} a month'],
        bioBomb: ['/boutique/detailing/', '[data-addon="Bio Bomb Deodorization"]', ' (regular {x})', 'data-price'],
        gridiron: ['/gridiron/', '[data-price-cad]', 'From {x}, installed here.']
    };

    // ── time ────────────────────────────────────────────────────────
    const NOW = (function () {
        const q = window.PROMO_DATE || new URLSearchParams(location.search).get('promo-date');
        const d = q ? new Date(/[zZ]|[+-]\d\d:\d\d$/.test(q) ? q : q + (q.length <= 10 ? 'T09:00:00-07:00' : '-07:00')) : null;
        return d && !isNaN(d) ? d.getTime() : null;
    })();
    const now = () => (NOW !== null ? NOW + (Date.now() - LOADED) : Date.now());
    const LOADED = Date.now();
    const t = (v) => (v == null ? null : new Date(v === 'polar.start' ? PROMO.polar.start : v === 'polar.end' ? PROMO.polar.end : v).getTime());

    const money = (n) => '$' + Number(n).toFixed(2) + ' CAD';
    const priceSpan = (n, tag) => '<' + (tag || 'span') + ' data-price-cad="' + Number(n).toFixed(2) + '">' + money(n) + '</' + (tag || 'span') + '>';
    const fill = (s) => String(s || '').replace(/\{pct\}/g, PROMO.polar.pct).replace(/\{shopPct\}/g, PROMO.polar.shopPct).replace(/\{(\w+)\}/g, (m, k) => '<span data-src="' + k + '"></span>');

    // ── render ──────────────────────────────────────────────────────
    function pick() {
        const n = now();
        return PROMO.slides.map((s) => {
            const v = s.versions.find((x) => (x.from == null || t(x.from) <= n) && (x.to == null || n <= t(x.to)));
            return v ? Object.assign({}, s, v) : null;
        }).filter(Boolean).sort((a, b) => a.rank - b.rank);
    }

    function slideHTML(s, i, total) {
        const ctas = (s.ctas || []).map((c, k) => '<a class="btn ' + (k ? 'btn-ghost' : 'btn-primary') + '" href="' + c[1] + '"' +
            (/^https?:/.test(c[1]) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + c[0] + '</a>').join('');
        const chips = s.chips ? '<ul class="promo-chips" data-chips="' + s.chips + '">' + PROMO.polar.parts.map((p) =>
            '<li class="promo-chip promo-hide" data-handle="' + p.handle + '"><a href="/store/parts/' + p.handle + '/"><span class="promo-chip-name">' + p.name + '</span><span class="promo-chip-price"></span><span class="promo-chip-tag"></span></a></li>').join('') + '</ul>' : '';
        const clock = s.clock ? '<p class="promo-clock" data-clock="' + t(s.clock.to) + '"><small>' + s.clock.label + '</small><span aria-hidden="true"></span><span class="sr-only"></span></p>' : '';
        return '<div class="promo-slide promo-slide--' + s.bay + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + total + '" id="promo-' + s.id + '">' +
            '<div class="promo-media"><img src="' + s.img + '" width="1024" height="576" alt="' + s.alt + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '></div>' +
            '<div class="promo-body">' +
                '<p class="promo-eyebrow">' + s.eyebrow + '</p>' +
                '<p class="display promo-title">' + fill(s.title) + '</p>' +
                clock +
                '<p class="promo-text">' + fill(s.text) + '</p>' +
                chips +
                (s.bonus ? '<p class="promo-bonus">' + fill(s.bonus) + '</p>' : '') +
                (s.more ? '<p class="promo-text">' + fill(s.more) + '</p>' : '') +
                '<div class="btns">' + ctas + '</div>' +
                (s.fine ? '<p class="promo-fine">' + fill(s.fine) + '</p>' : '') +
            '</div></div>';
    }

    // ── live prices ─────────────────────────────────────────────────
    async function storefront(handles) {
        const q = 'query{' + handles.map((h, i) => 'p' + i + ':product(handle:"' + h + '"){handle availableForSale priceRange{minVariantPrice{amount} maxVariantPrice{amount}} compareAtPriceRange{maxVariantPrice{amount}}}').join(' ') + '}';
        const r = await fetch(STORE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': STORE_TOKEN }, body: JSON.stringify({ query: q }) });
        const j = await r.json();
        return Object.values(j.data || {}).filter(Boolean);
    }

    async function pagePrices(root) {
        const wanted = [...new Set([...root.querySelectorAll('[data-src]')].map((e) => e.dataset.src))].filter((k) => PAGE_PRICES[k]);
        const pages = {};
        await Promise.all([...new Set(wanted.map((k) => PAGE_PRICES[k][0]))].map((url) =>
            fetch(url, { credentials: 'same-origin' }).then((r) => r.text()).then((h) => { pages[url] = new DOMParser().parseFromString(h, 'text/html'); }).catch(() => {})));
        wanted.forEach((k) => {
            const [url, sel, phrase, attr] = PAGE_PRICES[k];
            const el = pages[url] && pages[url].querySelector(sel);
            const v = el && parseFloat(el.getAttribute(attr || 'data-price-cad'));
            if (!v) return;
            root.querySelectorAll('[data-src="' + k + '"]').forEach((s) => { s.innerHTML = phrase.replace('{x}', priceSpan(v)); });
        });
    }

    async function shopPrices(root) {
        const handles = PROMO.polar.parts.map((p) => p.handle);
        const needGift = !!root.querySelector('[data-src="gift"]');
        let list = [];
        try { list = await storefront(needGift ? handles.concat('the-lab-gift-card') : handles); } catch (e) { return; }
        list.forEach((p) => {
            const min = parseFloat(p.priceRange.minVariantPrice.amount);
            if (p.handle === 'the-lab-gift-card') {
                const max = parseFloat(p.priceRange.maxVariantPrice.amount);
                root.querySelectorAll('[data-src="gift"]').forEach((s) => { s.innerHTML = max > min ? priceSpan(min) + ' to ' + priceSpan(max) : 'from ' + priceSpan(min); });
                return;
            }
            const was = p.compareAtPriceRange ? parseFloat(p.compareAtPriceRange.maxVariantPrice.amount) : 0;
            root.querySelectorAll('[data-handle="' + p.handle + '"]').forEach((li) => {
                const mode = li.closest('[data-chips]').dataset.chips;
                const onSale = was > min;
                const checkout = !onSale && mode === 'sale' && PROMO.polar.atCheckout;   // automatic discount: work out the price shown at checkout
                const now = checkout ? Math.round(min * (100 - PROMO.polar.pct)) / 100 : min;
                li.querySelector('.promo-chip-price').innerHTML = (onSale ? priceSpan(was, 's') : checkout ? priceSpan(min, 's') : '') + priceSpan(now);
                li.querySelector('.promo-chip-tag').textContent = onSale ? 'Save ' + Math.round((1 - min / was) * 100) + '%' : checkout ? PROMO.polar.pct + '% off at checkout' : (mode === 'teaser' ? PROMO.polar.pct + '% off online Nov 23' : '');
                li.classList.remove('promo-hide');
            });
        });
        try { window.setCurrency && window.setCurrency(localStorage.getItem('theLab_currency') === 'USD' ? 'USD' : 'CAD'); } catch (e) { /* storage unavailable */ }
    }

    // ── countdown ───────────────────────────────────────────────────
    function tick(root) {
        root.querySelectorAll('[data-clock]').forEach((c) => {
            let s = Math.max(0, Math.floor((+c.dataset.clock - now()) / 1000));
            const d = Math.floor(s / 86400); s %= 86400;
            const h = Math.floor(s / 3600); s %= 3600;
            const m = Math.floor(s / 60);
            const txt = (d ? d + 'd ' : '') + h + 'h ' + String(m).padStart(2, '0') + 'm';
            c.children[1].textContent = txt;
            c.children[2].textContent = d + ' days, ' + h + ' hours and ' + m + ' minutes';
        });
    }

    // ── carousel ────────────────────────────────────────────────────
    function carousel(root, count) {
        // Always moves on its own (Nathan, 2026-11-19): every 7 seconds. A tap, swipe, dot or arrow
        // only pauses it for 12 seconds. It also waits while scrolled off screen, the tab is hidden,
        // or a keyboard user is inside it.
        const track = root.querySelector('.promo-track');
        const slides = [...track.children];
        const dots = [...root.querySelectorAll('.promo-dot')];
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        let cur = 0, idleUntil = 0, hold = false, away = false;

        const go = (i) => { cur = (i + count) % count; track.scrollTo({ left: slides[cur].offsetLeft, behavior: reduced ? 'auto' : 'smooth' }); };
        const mark = (i) => { cur = i; dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i))); };
        const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > 0.6) mark(slides.indexOf(e.target)); }), { root: track, threshold: [0.6] });
        slides.forEach((s) => io.observe(s));

        const touched = () => { idleUntil = Date.now() + 12000; };
        if (count > 1) setInterval(() => { if (!hold && !away && !document.hidden && Date.now() > idleUntil) go(cur + 1); }, 7000);

        root.querySelector('[data-promo-prev]').addEventListener('click', () => { touched(); go(cur - 1); });
        root.querySelector('[data-promo-next]').addEventListener('click', () => { touched(); go(cur + 1); });
        dots.forEach((d, k) => d.addEventListener('click', () => { touched(); go(k); }));
        track.addEventListener('pointerdown', touched, { passive: true });
        track.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) touched(); }, { passive: true });
        root.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) hold = true; });
        root.addEventListener('focusout', () => { hold = false; });
        root.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { touched(); go(cur + 1); } if (e.key === 'ArrowLeft') { touched(); go(cur - 1); } });
        new IntersectionObserver((es) => { away = !es[0].isIntersecting; }, { threshold: 0.5 }).observe(root);   // no sliding while scrolled away
        mark(0);
        if (count < 2) root.querySelector('.promo-nav').hidden = true;
    }

    const ICON = {
        prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
        next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
    };

    function init() {
        const root = document.querySelector('[data-promo]');
        if (!root) return;
        const list = pick();
        if (!list.length) { root.hidden = true; return; }
        root.innerHTML =
            '<div class="promo-track" tabindex="-1">' + list.map((s, i) => slideHTML(s, i, list.length)).join('') + '</div>' +
            '<div class="promo-nav"><div class="promo-dots">' + list.map((s, i) => '<button type="button" class="promo-dot" aria-label="Slide ' + (i + 1) + ': ' + s.eyebrow.replace(/&middot;/g, '-').replace(/&\w+;/g, '') + '" aria-controls="promo-' + s.id + '"></button>').join('') + '</div>' +
            '<div class="promo-ctrl"><button type="button" class="promo-btn" data-promo-prev aria-label="Previous slide">' + ICON.prev + '</button><button type="button" class="promo-btn" data-promo-next aria-label="Next slide">' + ICON.next + '</button></div></div>';
        carousel(root, list.length);
        tick(root);
        if (root.querySelector('[data-clock]')) setInterval(() => tick(root), 20000);
        pagePrices(root);
        shopPrices(root);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
