// Detailing walkthrough: focus -> level -> vehicle + extras -> price.
// Packages and prices are read from the page's own package board (inside #detail-board), the single source of truth.
(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const root = $('[data-wz]');
    if (!root || !$('#detail-board')) return;

    const FOCUS = { interior: 'Interior Focus', exterior: 'Exterior Focus', complete: 'Complete', refresh: 'Quick Refresh' };
    const DATA = {};
    Object.keys(FOCUS).forEach((k) => {
        DATA[k] = $$('.tier', $('#panel-' + k)).map((t) => ({
            name: $('.tier-name', t).childNodes[0].textContent.trim(),
            badge: ($('.tier-badge', t) || {}).textContent || '',
            kick: $('.tier-kick', t).textContent.trim(),
            desc: $('.tier-desc', t).textContent.trim(),
            label: $('.tier-label', t).textContent.trim(),
            items: $$('.checks li', t).map((li) => li.innerHTML),
            prices: $$('.price-line', t).map((pl) => ({ label: $('span', pl).textContent.trim(), n: parseFloat($('.price', pl).getAttribute('data-price-cad')) })),
        }));
    });

    const S = { focus: null, tier: null, size: 0, add: new Set() };
    const cur = () => { try { return localStorage.getItem('theLab_currency') === 'USD' ? 'USD' : 'CAD'; } catch (e) { return 'CAD'; } };
    const money = (n, c) => '$' + (((c || cur()) === 'USD') ? Math.round(n * 0.74) : n).toLocaleString('en-CA') + ' ' + ((c || cur()) === 'USD' ? 'USD' : 'CAD');

    const addons = $$('[data-addon]').map((i) => ({ el: i, name: i.dataset.addon, n: parseFloat(i.dataset.price), from: i.dataset.from === '1' }));
    const sizeLabels = DATA.interior[0].prices.map((p) => p.label);
    $$('[data-size]').forEach((b, k) => { b.textContent = sizeLabels[k] || b.textContent; });

    const tier = () => (S.focus && S.tier != null ? DATA[S.focus][S.tier] : null);

    function renderTiers() {
        const wrap = $('#tier-picks');
        if (!S.focus) { wrap.innerHTML = ''; return; }
        wrap.innerHTML = DATA[S.focus].map((t, i) =>
            '<div class="film" role="button" tabindex="0" data-tier="' + i + '" aria-pressed="' + (S.tier === i) + '">' +
            (t.badge ? '<span class="film-tag">' + t.badge + '</span>' : '') +
            '<strong class="display film-name">' + t.name + '</strong><em>' + t.kick + '</em>' +
            '<p class="tier-desc">' + t.desc + '</p><p class="tier-label">' + t.label + '</p>' +
            '<ul class="checks">' + t.items.map((x) => '<li>' + x + '</li>').join('') + '</ul></div>').join('');
        $$('[data-tier]', wrap).forEach((c) => {
            const pick = () => { S.tier = +c.dataset.tier; render(); };
            c.addEventListener('click', pick);
            c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        });
    }

    function compute() {
        const t = tier();
        const lines = [];
        let total = 0, from = false;
        if (t) { const p = t.prices[S.size]; lines.push({ label: FOCUS[S.focus] + ': ' + t.name, price: p.n }); total += p.n; }
        addons.forEach((a) => { if (S.add.has(a.name)) { lines.push({ label: a.name, price: a.n, from: a.from }); total += a.n; if (a.from) from = true; } });
        return { t, lines, total, from };
    }

    function render() {
        $$('[data-focus]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.focus === S.focus)));
        $$('[data-size]').forEach((b, k) => b.setAttribute('aria-pressed', String(k === S.size)));
        $$('[data-tier]').forEach((c) => c.setAttribute('aria-pressed', String(+c.dataset.tier === S.tier)));
        addons.forEach((a) => { a.el.checked = S.add.has(a.name); });

        const c = compute();
        const sizeNow = c.t ? c.t.prices[S.size].label : '';
        $('#rc-focus').textContent = S.focus ? FOCUS[S.focus] : '';
        $('#rc-tier').textContent = c.t ? c.t.name : '';
        $('#rc-size').textContent = sizeNow;
        $('#est-lines').innerHTML = c.lines.map((l) => '<li><span>' + l.label + '</span><span class="price">' + (l.from ? 'from ' : '') + money(l.price) + '</span></li>').join('');
        $('#est-total').textContent = c.t ? (c.from ? 'from ' : '') + money(c.total) : money(0);
        $('#rc-incl').innerHTML = c.t ? '<p class="tier-label">' + c.t.label + '</p><ul class="checks">' + c.t.items.map((x) => '<li>' + x + '</li>').join('') + '</ul>' : '';

        const i = root.wz ? root.wz.index : 0;
        if (i === 0) root.wz && root.wz.setNext(!!S.focus);
        if (i === 1) root.wz && root.wz.setNext(S.tier != null);

        const summary = c.t
            ? FOCUS[S.focus] + ', ' + c.t.name + ', ' + sizeNow + (S.add.size ? '. Extras: ' + [...S.add].join(', ') : '') + '. Estimate ' + (c.from ? 'from ' : '') + money(c.total, 'CAD')
            : '';
        // option names must match the booking form's own labels (intake.js)
        const FORM_ADDON = { 'Pet Hair Removal': 'Heavy Pet Hair Extraction Clean', 'Headlight Restoration': 'Headlight Restoration', 'Engine Bay Detail': 'Engine Bay Detail & Component Dressing', 'Bio Bomb Deodorization': 'Bio Bomb Vehicle Deodorization', 'Extra Time (30 min)': 'Extra Detailing Time (30 min)' };
        const pkg = c.t ? { interior: 'Interior', exterior: 'Exterior', complete: 'Complete', refresh: 'Refresh' }[S.focus] + ': ' + c.t.name : 'As chosen in my walkthrough (see summary)';
        const est = c.t ? { total: (c.from ? 'from ' : '') + money(c.total, 'CAD'), lines: c.lines.map((l) => ({ label: l.label, price: (l.from ? 'from ' : '') + money(l.price, 'CAD') })) } : null;
        window.labHandoff('Premium Detailing', summary, { detail_pkg: pkg, protection: [...S.add].map((n) => FORM_ADDON[n]).filter(Boolean) }, est);
    }

    $$('[data-focus]').forEach((b) => b.addEventListener('click', () => {
        if (S.focus !== b.dataset.focus) { S.focus = b.dataset.focus; const ts = DATA[S.focus]; const i = ts.findIndex((t) => t.badge); S.tier = i > -1 ? i : 0; renderTiers(); }
        render();
        setTimeout(() => root.dispatchEvent(new CustomEvent('wz:goto', { detail: 1 })), 220); // choice screens move on by themselves
    }));
    $$('[data-size]').forEach((b, k) => b.addEventListener('click', () => { S.size = k; render(); }));
    addons.forEach((a) => a.el.addEventListener('change', () => { a.el.checked ? S.add.add(a.name) : S.add.delete(a.name); render(); }));
    $('#wz-restart').addEventListener('click', () => { S.focus = null; S.tier = null; S.size = 0; S.add.clear(); renderTiers(); render(); root.dispatchEvent(new CustomEvent('wz:goto', { detail: 0 })); });
    root.addEventListener('wz:enter', (e) => { if (e.detail.index === 1) renderTiers(); render(); });

    const orig = window.setCurrency;
    if (orig) window.setCurrency = function (c) { orig(c); render(); };
    render();
})();
