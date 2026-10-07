// Contact-page quote tool: builds a price estimate step by step and hands it to the booking form (intake.js) through window.labHandoff.
// Prices are read from the service pages themselves (the same tables the walkthroughs use), so there is one source of truth.
// intake.js asks for steps(service), title(service, part) and render(container, service, part).
(function () {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const num = (n) => '$' + Math.round(n).toLocaleString('en-CA');
    const money = (n) => num(n) + ' CAD';
    const rng = (lo, hi, from) => (lo === hi ? (from ? 'from ' : '') + money(lo) : num(lo) + '–' + num(hi) + ' CAD' + (from ? '+' : ''));

    /* ---------- prices, read from the service pages ---------- */
    const cache = {};
    const load = (key, url, parse) => cache[key] || (cache[key] = fetch(url, { credentials: 'same-origin' })
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then((t) => parse(new DOMParser().parseFromString(t, 'text/html'))));

    const FOCUS = { interior: 'Interior', exterior: 'Exterior', complete: 'Complete' };
    const parseDetail = (doc) => {
        const tiers = {};
        Object.keys(FOCUS).forEach((k) => {
            tiers[k] = $$('#panel-' + k + ' .tier', doc).map((t) => ({
                name: $('.tier-name', t).childNodes[0].textContent.trim(),
                badge: (($('.tier-badge', t) || {}).textContent || '').trim(),
                desc: $('.tier-desc', t).textContent.trim(),
                label: $('.tier-label', t).textContent.trim(),
                items: $$('.checks li', t).map((li) => li.textContent.trim()),
                prices: $$('.price-line', t).map((pl) => ({ label: $('span', pl).textContent.trim(), n: parseFloat($('.price', pl).getAttribute('data-price-cad')) })),
            }));
        });
        const addons = $$('[data-addon]', doc).map((i) => ({ name: i.dataset.addon, n: parseFloat(i.dataset.price), from: i.dataset.from === '1' }));
        return { tiers, addons, sizes: tiers.interior[0].prices.map((p) => p.label) };
    };

    const keyOf = (label, sub, pkg) => {
        const l = label.toLowerCase(), s = (sub || '').toLowerCase();
        if (pkg) return 'pkg:' + (l.indexOf('sedan') > -1 ? 'sedan' : l.indexOf('truck') > -1 ? 'truck' : 'suv');
        if (l.indexOf('front roll') === 0) return 'front';
        if (l.indexOf('side windows') === 0) return 'side';
        if (label.charAt(0) === '¼') return 'quarter';
        if (l.indexOf('rear glass') === 0) return l.indexOf('large') > -1 ? 'rearLarge' : 'rear';
        if (l.indexOf('full windshield') > -1) return 'windshield';
        if (l.indexOf('windshield brow') > -1) return s.indexOf('1-piece') > -1 ? 'brow1' : 'brow2';
        if (l.indexOf('standard sunroof') > -1) return 'sunroof';
        if (l.indexOf('panoramic') > -1) return 'pano';
        return null;
    };
    const parseTint = (doc) => {
        const PR = { carbon: {}, ceramic: {} };
        $$('#pricing .pt', doc).forEach((card) => {
            const h = $('h3', card);
            if (!h) return;
            const film = /ceramic/i.test(h.textContent) ? 'ceramic' : /carbon/i.test(h.textContent) ? 'carbon' : null;
            if (!film) return;
            let pkg = false;
            [...card.children].forEach((el) => {
                if (el.classList.contains('pt-sub')) { pkg = true; return; }
                if (!el.classList.contains('pt-row')) return;
                const label = $('.pt-l', el).textContent.trim();
                const sub = (($('small', el) || {}).textContent || '').trim();
                const pe = $('.price', el);
                const attr = pe.getAttribute('data-price-cad') || pe.getAttribute('data-price-from-cad') || (($('[data-price-cad]', pe) || { getAttribute() { return null; } }).getAttribute('data-price-cad'));
                const nums = attr ? [parseFloat(attr)] : (pe.textContent.match(/\d[\d,]*/g) || []).map((n) => +n.replace(/,/g, ''));
                const k = keyOf(label, sub, pkg);
                if (k && nums.length) PR[film][k] = { lo: Math.min.apply(null, nums), hi: Math.max.apply(null, nums), from: /from/i.test(pe.textContent) };
            });
        });
        return PR;
    };
    const parseSxs = (doc) => ({
        films: $$('[data-sxs-film]', doc).map((f) => ({ key: f.dataset.sxsFilm, name: $('.film-name', f).textContent.trim(), price: +f.dataset.price })),
        brow: { lo: +$('#sxs-brow', doc).dataset.lo, hi: +$('#sxs-brow', doc).dataset.hi },
    });

    /* ---------- choices ---------- */
    const D = { focus: null, tier: null, size: 0, add: {} };
    const T = { film: 'ceramic', veh: 'truck', shade: '', front: false, side: false, quarter: false, rear: false, ws: false, browOn: false, brow: '1', roofOn: false, roof: 'sunroof', sxsBrow: false };
    const VEH = { sedan: 'Sedan', truck: 'Crew cab truck', suv: 'SUV', sxs: 'Side-by-side (SxS)' };
    const SHADES = [['35', '35% Light'], ['25', '25%'], ['18', '18% Popular'], ['5', '5% Limo'], ['?', 'Not sure']];
    const SHADE_FORM = { 35: '35', 25: '25', 18: '18', 5: '5% (Limo)', '?': 'Not sure yet - need a recommendation' };

    /* ---------- compute ---------- */
    function computeDetail(P) {
        const tier = D.focus && D.tier != null ? P.tiers[D.focus][D.tier] : null;
        if (!tier) return null;
        const lines = [{ label: FOCUS[D.focus] + ' focus: ' + tier.name, price: tier.prices[D.size].n }];
        let total = tier.prices[D.size].n, from = false;
        P.addons.forEach((a) => { if (D.add[a.name]) { lines.push({ label: a.name, price: a.n, from: a.from }); total += a.n; if (a.from) from = true; } });
        const size = tier.prices[D.size].label;
        const extras = P.addons.filter((a) => D.add[a.name]);
        const summary = FOCUS[D.focus] + ' Focus, ' + tier.name + ', ' + size + (extras.length ? '. Extras: ' + extras.map((a) => a.name).join(', ') : '') + '. Estimate ' + (from ? 'from ' : '') + money(total);
        const FORM_ADDON = { 'Pet Hair Removal': 'Heavy Pet Hair Extraction Clean', 'Odour Elimination': 'Odor Neutralizing Ozone Air Cleansing', 'Headlight Restoration': 'Headlight Restoration', 'Engine Bay Detail': 'Engine Bay Detail & Component Dressing' };
        return {
            est: { total: (from ? 'from ' : '') + money(total), lines: lines.map((l) => ({ label: l.label, price: (l.from ? 'from ' : '') + money(l.price) })) },
            summary,
            set: { detail_pkg: FOCUS[D.focus] + ': ' + tier.name, protection: extras.map((a) => FORM_ADDON[a.name]).filter(Boolean) },
        };
    }

    const hasGlass = () => T.front || T.side || T.quarter || T.rear || T.ws || T.browOn || T.roofOn;
    function computeTint(PR, SX) {
        const filmName = T.film === 'ceramic' ? 'Ceramic' : 'Carbon';
        if (T.veh === 'sxs') {
            const f = SX.films.find((x) => x.key === T.film) || SX.films[0];
            const lines = [{ label: f.name, price: 'from ' + money(f.price) }];
            let total = f.price;
            if (T.sxsBrow) { lines.push({ label: 'Windshield sun-strip (visor brow)', price: money(SX.brow.lo) + ' to ' + money(SX.brow.hi) }); total += SX.brow.lo; }
            return { est: { total: 'from ' + money(total), lines }, summary: 'SxS: ' + f.name + ' film' + (T.sxsBrow ? ' + sun-strip' : '') + '. Estimate from ' + money(total), set: { tint_pref: 'Off-Road SxS & Equipment Film' } };
        }
        if (!hasGlass()) return null;
        const P = PR[T.film], items = [];
        const add = (key, n, label) => { const p = P[key]; if (p) items.push({ label, n, lo: p.lo * n, hi: p.hi * n, from: p.from }); };
        const full = T.front && T.side && T.quarter && T.rear;
        if (full && P['pkg:' + T.veh]) {
            const p = P['pkg:' + T.veh];
            items.push({ label: 'Full package: all side + rear glass', n: 1, lo: p.lo, hi: p.hi, from: p.from });
        } else {
            if (T.front) add('front', 1, 'Front windows (pair)');
            if (T.side) add('side', 2, 'Rear side windows');
            if (T.quarter) add('quarter', 2, 'Quarter glass');
            if (T.rear) add(T.veh === 'suv' ? 'rearLarge' : 'rear', 1, 'Rear glass');
        }
        if (T.ws) add('windshield', 1, 'Full windshield');
        if (T.browOn) add(T.brow === '1' ? 'brow1' : 'brow2', 1, 'Windshield brow (' + T.brow + '-piece)');
        if (T.roofOn) add(T.roof === 'pano' ? 'pano' : 'sunroof', 1, T.roof === 'pano' ? 'Panoramic roof' : 'Sunroof');
        if (!items.length) return null;
        const lo = items.reduce((a, i) => a + i.lo, 0), hi = items.reduce((a, i) => a + i.hi, 0), from = items.some((i) => i.from);
        const set = { tint_addons: [] };
        if (T.shade) set.tint_shade = SHADE_FORM[T.shade];
        if (full) set.tint_pref = T.film === 'ceramic' ? 'Full Vehicle (Premium Ceramic)' : 'Full Vehicle (Carbon Tint)';
        else if (T.front) set.tint_pref = T.film === 'ceramic' ? 'Premium Ceramic Tint (Front Roll-Ups)' : 'Standard Carbon Tint (Front Roll-Ups)';
        if (T.browOn && T.brow === '1') set.tint_addons.push('Windshield Brow (1-Piece Custom Cut)');
        if (T.roofOn && T.roof === 'pano') set.tint_addons.push('Panoramic Roof');
        if (T.ws) set.tint_addons.push('Full Windshield');
        if (!full && T.rear) set.tint_addons.push('Rear Glass Standard');
        const shadeTxt = T.shade ? (T.shade === '?' ? 'Shade: not sure yet; ' : 'Shade ' + T.shade + '%; ') : '';
        return {
            est: { total: rng(lo, hi, from), lines: items.map((i) => ({ label: i.label, price: rng(i.lo, i.hi, i.from) })) },
            summary: shadeTxt + filmName + ' film, ' + VEH[T.veh] + ': ' + items.map((i) => i.label).join('; ') + '. Estimate ' + rng(lo, hi, from),
            set,
        };
    }

    /* ---------- pieces of UI ---------- */
    const seg = (g, opts, val) => '<div class="lq-seg" role="group">' + opts.map((o) => '<button type="button" class="lq-opt" data-g="' + g + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (String(o[0]) === String(val)) + '">' + esc(o[1]) + '</button>').join('') + '</div>';
    const group = (label, inner) => '<div class="lq-group"><p class="lf-label">' + esc(label) + '</p>' + inner + '</div>';
    const row = (g, label, price, on) => '<label class="lf-opt lq-row"><input type="checkbox" data-g="' + esc(g) + '"' + (on ? ' checked' : '') + '><span>' + esc(label) + '</span>' + (price ? '<b class="lq-price">' + esc(price) + '</b>' : '') + '</label>';
    const estCard = (c, ph) => '<div class="lq-est" aria-live="polite"><p class="lf-label">Your estimate</p>' + (c
        ? '<p class="lf-est-total">' + esc(c.est.total) + '</p><ul class="lf-est-lines">' + c.est.lines.map((l) => '<li><span>' + esc(l.label) + '</span><span>' + esc(l.price) + '</span></li>').join('') + '</ul><p class="lf-fine">Starting prices in CAD.</p>'
        : '<p class="lq-ph">' + esc(ph) + '</p>') + '</div>';
    const hint = (t) => '<p class="lq-hint lf-msg" role="alert" hidden>' + esc(t) + '</p>';

    // Same record the service-page walkthroughs leave in sessionStorage (see wizard.js labHandoff), marked src 'quote'
    // so the form knows this estimate was built here and keeps these steps editable.
    function publish(box, service, c) {
        try {
            if (c) sessionStorage.setItem('labForm', JSON.stringify({ service, summary: c.summary, set: c.set, est: c.est, src: 'quote', url: '/contact/' }));
            else {
                const old = JSON.parse(sessionStorage.getItem('labForm') || 'null');
                if (old && old.service === service) sessionStorage.removeItem('labForm'); // nothing to quote yet
            }
        } catch (e) { /* storage unavailable */ }
        box.dispatchEvent(new CustomEvent('lab:handoff', { bubbles: true }));
    }

    /* ---------- the two services ---------- */
    const detail = {
        titles: ['Pick your package', 'Size and extras'],
        data() { return load('detail', '/boutique/detailing/', parseDetail); },
        view(P, part) {
            const c = computeDetail(P);
            if (part === 0) {
                const tiers = D.focus ? P.tiers[D.focus] : [];
                return {
                    ready: !!(D.focus && D.tier != null),
                    html: group('What do you want done?', seg('focus', Object.keys(FOCUS).map((k) => [k, FOCUS[k]]), D.focus))
                        + (D.focus ? group('Choose a level', '<div class="lq-cards">' + tiers.map((t, i) => '<button type="button" class="lq-card" data-g="tier" data-v="' + i + '" aria-pressed="' + (D.tier === i) + '">'
                            + (t.badge ? '<span class="lq-tag">' + esc(t.badge) + '</span>' : '') + '<strong class="display">' + esc(t.name) + '</strong><span>' + esc(t.desc) + '</span><em>' + esc(t.label) + '</em><b>' + money(t.prices[D.size].n) + '</b></button>').join('') + '</div>') : '')
                        + estCard(c, 'Pick what you want done to see a price.') + hint('Pick what you want done and a level to continue.'),
                    c,
                };
            }
            return {
                ready: !!c,
                html: group('Vehicle size', seg('size', P.sizes.map((s, i) => [i, s]), D.size))
                    + group('Extras (optional)', '<div class="lf-opts">' + P.addons.map((a) => row('add:' + a.name, a.name, (a.from ? 'from ' : '') + money(a.n), D.add[a.name])).join('') + '</div>')
                    + estCard(c, 'Go back and pick a package.') + hint('Go back and pick a package first.'),
                c,
            };
        },
        pick(g, v, el) {
            if (g === 'focus') { D.focus = v; D.tier = null; this.P.tiers[v].forEach((t, i) => { if (D.tier === null && t.badge) D.tier = i; }); if (D.tier === null) D.tier = 0; }
            else if (g === 'tier') D.tier = +v;
            else if (g === 'size') D.size = +v;
            else if (g.indexOf('add:') === 0) D.add[g.slice(4)] = el.checked;
        },
    };

    const tint = {
        titles: ['Film and vehicle', 'Pick your glass'],
        data() { return Promise.all([load('tint', '/boutique/tinting/', parseTint), load('sxs', '/boutique/sxs/', parseSxs)]).then((r) => ({ PR: r[0], SX: r[1] })); },
        view(P, part) {
            const c = computeTint(P.PR, P.SX);
            if (part === 0) {
                return {
                    ready: true,
                    html: group('Film', seg('film', [['carbon', 'Carbon (entry)'], ['ceramic', 'Ceramic (recommended)']], T.film))
                        + group('Vehicle', seg('veh', Object.keys(VEH).map((k) => [k, VEH[k]]), T.veh))
                        + (T.veh === 'sxs' ? '' : group('Shade', seg('shade', SHADES, T.shade))),
                    c,
                };
            }
            if (T.veh === 'sxs') {
                return { ready: true, html: group('Windshield sun-strip (optional)', '<div class="lf-opts">' + row('sxsBrow', 'Add the visor brow', money(P.SX.brow.lo) + ' to ' + money(P.SX.brow.hi), T.sxsBrow) + '</div>') + estCard(c, ''), c };
            }
            const p = (k, n) => { const x = P.PR[T.film][k]; return x ? rng(x.lo * n, x.hi * n, x.from) : ''; };
            return {
                ready: hasGlass(),
                html: group('Which glass?', '<div class="lf-opts">'
                    + row('front', 'Front windows (pair)', p('front', 1), T.front)
                    + row('side', 'Rear side windows (pair)', p('side', 2), T.side)
                    + row('quarter', 'Quarter glass (pair)', p('quarter', 2), T.quarter)
                    + row('rear', 'Rear glass', p(T.veh === 'suv' ? 'rearLarge' : 'rear', 1), T.rear)
                    + row('ws', 'Full windshield', p('windshield', 1), T.ws)
                    + row('browOn', 'Windshield brow', '', T.browOn)
                    + (T.browOn ? seg('brow', [['1', '1-piece ' + p('brow1', 1)], ['2', '2-piece ' + p('brow2', 1)]], T.brow) : '')
                    + row('roofOn', 'Sunroof or panoramic roof', '', T.roofOn)
                    + (T.roofOn ? seg('roof', [['sunroof', 'Sunroof ' + p('sunroof', 1)], ['pano', 'Panoramic ' + p('pano', 1)]], T.roof) : '')
                    + '</div><button type="button" class="lq-all" data-g="all">Select all side and rear glass (full package)</button>')
                    + estCard(c, 'Tick the glass you want tinted to see a price.') + hint('Tick at least one window to see a price.'),
                c,
            };
        },
        pick(g, v, el) {
            if (g === 'all') { const on = !(T.front && T.side && T.quarter && T.rear); T.front = T.side = T.quarter = T.rear = on; }
            else if (g === 'film' || g === 'veh' || g === 'shade' || g === 'brow' || g === 'roof') T[g] = v;
            else T[g] = el.checked;
        },
    };

    const TOOLS = { 'Premium Detailing': detail, 'Window Tinting': tint };

    /* ---------- called by intake.js ---------- */
    window.labQuote = {
        steps: (service) => (TOOLS[service] ? 2 : 0),
        title: (service, part) => (service === 'Window Tinting' && part === 1 && T.veh === 'sxs' ? 'Add a sun-strip?' : TOOLS[service] ? TOOLS[service].titles[part] : 'Your quote'),
        // warm the price cache so the first step opens instantly
        prefetch: (service) => { if (TOOLS[service]) TOOLS[service].data().catch(() => {}); },
        async render(box, service, part) {
            const tool = TOOLS[service];
            if (!tool) { box.innerHTML = ''; box.dataset.ready = '1'; return; }
            box.dataset.ready = '0';
            box.innerHTML = '<p class="lq-ph">Loading prices…</p>';
            let P;
            try { P = await tool.data(); } catch (e) {
                box.innerHTML = '<p class="lf-note">We could not load prices just now. Tap Next and Eric will quote it for you.</p>';
                box.dataset.ready = '1';
                return;
            }
            tool.P = P;
            const draw = (focusKey) => {
                const v = tool.view(P, part);
                box.innerHTML = v.html;
                box.dataset.ready = v.ready ? '1' : '0';
                if (focusKey) {
                    const t = box.querySelector('[data-g="' + focusKey[0] + '"][data-v="' + focusKey[1] + '"]') || box.querySelector('[data-g="' + focusKey[0] + '"]');
                    if (t) t.focus({ preventScroll: true });
                }
                return v;
            };
            const first = draw();
            publish(box, service, first.c);
            if (box._lq) { box.removeEventListener('click', box._lq); box.removeEventListener('change', box._lq); }
            box._lq = (e) => {
                const el = e.target.closest('[data-g]');
                if (!el || (e.type === 'click' && el.type === 'checkbox') || (e.type === 'change' && el.type !== 'checkbox')) return;
                tool.pick(el.dataset.g, el.dataset.v, el);
                const v = draw([el.dataset.g, el.dataset.v]);
                publish(box, service, v.c);
            };
            box.addEventListener('click', box._lq);
            box.addEventListener('change', box._lq);
        },
    };
})();
