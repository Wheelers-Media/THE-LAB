// Tinting walkthrough: shade preview + info sheet, film choice, tap-your-windows, then the price.
// Prices are read from the page's own price tables (inside #pricing), so those tables stay the single source of truth.
(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const root = $('[data-wz]');
    const car = $('.bd-car');
    if (!root || !car) return;

    /* ---------- Step 1: shade preview ---------- */
    const SHADES = [
        { pct: 100, label: 'None', name: 'No tint', note: 'Factory glass. This is the view you have now.' },
        { pct: 35, label: '35%', name: 'Light Smoke', note: 'Subtle upgrade: adds comfort and UV protection without a heavily tinted look.' },
        { pct: 25, label: '25%', name: 'Balanced Smoke', note: 'Daily-driver balance: keeps the vehicle clean, dark, and usable.' },
        { pct: 18, label: '18%', name: 'Popular Privacy', note: 'Daily-driver balance with strong privacy.' },
        { pct: 5, label: '5%', name: 'Limo Dark', note: 'Maximum privacy: the darkest look.' },
    ];
    const range = $('#shade-range'), img = $('#shade-img'), chips = $$('.shade-chip');
    let shadeIdx = 0;
    function setShade(i) {
        shadeIdx = i;
        const s = SHADES[i];
        img.style.filter = s.pct >= 100 ? 'none' : 'brightness(' + (0.14 + 0.86 * Math.pow(s.pct / 100, 0.75)).toFixed(2) + ') contrast(1.05)';
        $('#shade-pct').textContent = s.pct >= 100 ? 'No tint' : s.label;
        $('#shade-name').textContent = s.pct >= 100 ? '' : s.name;
        $('#shade-note').textContent = s.note;
        range.value = i;
        chips.forEach((c, k) => { c.setAttribute('aria-checked', String(k === i)); c.tabIndex = k === i ? 0 : -1; });
    }
    range.addEventListener('input', () => setShade(+range.value));
    chips.forEach((c, k) => c.addEventListener('click', () => setShade(k)));
    setShade(0);

    const sheet = $('#shade-help');
    $('#shade-info').addEventListener('click', () => (sheet.showModal ? sheet.showModal() : sheet.setAttribute('open', '')));
    $$('[data-close]', sheet).forEach((b) => b.addEventListener('click', () => sheet.close()));
    sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); }); // tap the dimmed area to close

    /* ---------- Prices, read from the page's own tables ---------- */
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
    const PR = { carbon: {}, ceramic: {} };
    $$('#pricing .pt').forEach((card) => {
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

    /* ---------- Step 3: windows ---------- */
    const LABELS = {
        brow: ['BROW', 150, 146, 0], ws: ['WINDSHIELD', 150, 178, 0], sun: ['ROOF', 150, 250, 0],
        fl: ['FRONT', 82, 248, -90], fr: ['FRONT', 218, 248, 90], rl: ['REAR', 80, 344, -90], rr: ['REAR', 220, 344, 90],
        ql: ['¼', 80, 420, 0], qr: ['¼', 220, 420, 0], rear: ['REAR GLASS', 150, 480, 0],
    };
    $$('.win', car).forEach((w) => {
        const l = LABELS[w.dataset.id];
        if (!l) return;
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('class', 'wl');
        t.setAttribute('x', l[1]); t.setAttribute('y', l[2]);
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('dominant-baseline', 'middle');
        if (l[3]) t.setAttribute('transform', 'rotate(' + l[3] + ' ' + l[1] + ' ' + l[2] + ')');
        t.textContent = l[0];
        w.after(t);
    });

    const VEH = { sedan: 'Sedan', truck: 'Crew cab truck', suv: 'SUV' };
    const BASE = ['fl', 'fr', 'rl', 'rr', 'ql', 'qr', 'rear'];
    const S = { film: 'ceramic', veh: 'truck', sel: new Set(), brow: '1', roof: 'sunroof' };

    const cur = () => { try { return localStorage.getItem('theLab_currency') === 'USD' ? 'USD' : 'CAD'; } catch (e) { return 'CAD'; } };
    const usd = (c) => (c || cur()) === 'USD';
    const num = (n, c) => '$' + (usd(c) ? Math.round(n * 0.74) : n).toLocaleString('en-CA');
    const money = (n, c) => num(n, c) + (usd(c) ? ' USD' : ' CAD');
    const rng = (lo, hi, from, c) => lo === hi
        ? (from ? 'from ' : '') + money(lo, c)
        : num(lo, c) + '–' + num(hi, c) + (usd(c) ? ' USD' : ' CAD') + (from ? '+' : '');

    function compute() {
        const P = PR[S.film], items = [];
        const add = (key, n, label) => { const p = P[key]; if (p) items.push({ label, n, lo: p.lo * n, hi: p.hi * n, from: p.from }); };
        if (BASE.every((id) => S.sel.has(id)) && P['pkg:' + S.veh]) {
            const p = P['pkg:' + S.veh];
            items.push({ label: 'Full package: all side + rear glass', n: 1, lo: p.lo, hi: p.hi, from: p.from });
        } else {
            if (S.sel.has('fl') || S.sel.has('fr')) add('front', 1, 'Front windows (pair)');
            const sides = ['rl', 'rr'].filter((i) => S.sel.has(i)).length; if (sides) add('side', sides, 'Rear side window' + (sides > 1 ? 's' : ''));
            const qs = ['ql', 'qr'].filter((i) => S.sel.has(i)).length; if (qs) add('quarter', qs, 'Quarter glass');
            if (S.sel.has('rear')) add(S.veh === 'suv' ? 'rearLarge' : 'rear', 1, 'Rear glass');
        }
        if (S.sel.has('ws')) add('windshield', 1, 'Full windshield');
        if (S.sel.has('brow')) add(S.brow === '1' ? 'brow1' : 'brow2', 1, 'Windshield brow (' + S.brow + '-piece)');
        if (S.sel.has('sun')) add(S.roof === 'pano' ? 'pano' : 'sunroof', 1, S.roof === 'pano' ? 'Panoramic roof' : 'Sunroof');
        const lo = items.reduce((a, i) => a + i.lo, 0), hi = items.reduce((a, i) => a + i.hi, 0);
        return { items, lo, hi, from: items.some((i) => i.from) };
    }

    const shadeText = () => (SHADES[shadeIdx].pct >= 100 ? 'No tint' : SHADES[shadeIdx].label + ' ' + SHADES[shadeIdx].name);
    const filmText = () => (S.film === 'ceramic' ? 'Ceramic' : 'Carbon');

    function render() {
        $$('.win', car).forEach((w) => w.setAttribute('aria-pressed', String(S.sel.has(w.dataset.id))));
        $$('[data-film]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.film === S.film)));
        $$('[data-veh]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.veh === S.veh)));
        $$('[data-brow]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.brow === S.brow)));
        $$('[data-roof]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.roof === S.roof)));
        $('#opt-brow').hidden = !S.sel.has('brow');
        $('#opt-roof').hidden = !S.sel.has('sun');

        const c = compute();
        const count = c.items.length ? [...S.sel].filter((id) => id !== 'fr').length : 0;
        $('#win-count').textContent = count ? count + (count === 1 ? ' window selected' : ' windows selected') : 'Nothing selected yet';
        if (root.wz && root.wz.index === 2) root.wz.setNext(c.items.length > 0);

        // step 4 recap + price
        $('#rc-shade').textContent = shadeText();
        $('#rc-film').textContent = filmText();
        $('#rc-veh').textContent = VEH[S.veh];
        $('#est-lines').innerHTML = c.items.map((i) =>
            '<li><span>' + i.label + (i.n > 1 && i.label.indexOf('package') < 0 ? ' &times; ' + i.n : '') + '</span><span class="price">' + rng(i.lo, i.hi, i.from) + '</span></li>').join('');
        $('#est-total').textContent = c.items.length ? rng(c.lo, c.hi, c.from) : money(0);
        const summary = c.items.length
            ? 'Shade ' + shadeText() + '; ' + filmText() + ' film, ' + VEH[S.veh] + ': ' + c.items.map((i) => i.label + (i.n > 1 && i.label.indexOf('package') < 0 ? ' x' + i.n : '')).join('; ') + '. Estimate ' + rng(c.lo, c.hi, c.from, 'CAD')
            : '';
        // hand-off to the booking form (intake.js): field values use that form's own option labels
        const full = BASE.every((id) => S.sel.has(id));
        const set = {};
        const pct = SHADES[shadeIdx].pct;
        if (pct < 100) set.tint_shade = pct === 5 ? '5% (Limo)' : String(pct);
        if (full) set.tint_pref = S.film === 'ceramic' ? 'Full Vehicle (Premium Ceramic)' : 'Full Vehicle (Carbon Tint)';
        else if (S.sel.has('fl')) set.tint_pref = S.film === 'ceramic' ? 'Premium Ceramic Tint (Front Roll-Ups)' : 'Standard Carbon Tint (Front Roll-Ups)';
        set.tint_addons = [];
        if (S.sel.has('brow') && S.brow === '1') set.tint_addons.push('Windshield Brow (1-Piece Custom Cut)');
        if (S.sel.has('sun') && S.roof === 'pano') set.tint_addons.push('Panoramic Roof');
        if (S.sel.has('ws')) set.tint_addons.push('Full Windshield');
        if (!full && S.sel.has('rear')) set.tint_addons.push('Rear Glass Standard');
        const est = c.items.length ? { total: rng(c.lo, c.hi, c.from, 'CAD'), lines: c.items.map((i) => ({ label: i.label + (i.n > 1 && i.label.indexOf('package') < 0 ? ' x' + i.n : ''), price: rng(i.lo, i.hi, i.from, 'CAD') })) } : null;
        window.labHandoff('Window Tinting', summary, set, est);
    }

    const toggle = (id) => {
        if (id === 'fl' || id === 'fr') { // front windows are priced as a pair
            const on = !S.sel.has('fl');
            ['fl', 'fr'].forEach((i) => (on ? S.sel.add(i) : S.sel.delete(i)));
        } else if (S.sel.has(id)) S.sel.delete(id); else S.sel.add(id);
        render();
    };
    $$('.win', car).forEach((w) => {
        w.addEventListener('click', () => toggle(w.dataset.id));
        w.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(w.dataset.id); } });
    });
    $$('[data-film]').forEach((b) => {
        b.addEventListener('click', () => { S.film = b.dataset.film; render(); });
        b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } });
    });
    $$('[data-veh]').forEach((b) => b.addEventListener('click', () => { S.veh = b.dataset.veh; render(); }));
    $$('[data-brow]').forEach((b) => b.addEventListener('click', () => { S.brow = b.dataset.brow; render(); }));
    $$('[data-roof]').forEach((b) => b.addEventListener('click', () => { S.roof = b.dataset.roof; render(); }));
    $('#bd-all').addEventListener('click', () => { BASE.forEach((i) => S.sel.add(i)); render(); });
    $('#bd-clear').addEventListener('click', () => { S.sel.clear(); render(); });
    $('#wz-restart').addEventListener('click', () => { S.sel.clear(); setShade(0); S.film = 'ceramic'; render(); root.dispatchEvent(new CustomEvent('wz:goto', { detail: 0 })); });
    root.addEventListener('wz:enter', render);

    // the header currency toggle re-renders prices too
    const orig = window.setCurrency;
    if (orig) window.setCurrency = function (c) { orig(c); render(); };
    render();
})();
