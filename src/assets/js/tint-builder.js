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

    /* ---------- Vehicle step + windows (shapes and the popular picks live in vehicle-shapes.js) ---------- */
    const LV = window.labVehicle;
    const S = { film: 'ceramic', style: 'crew', size: 2, sel: new Set(LV.STYLES.crew.popular), brow: '1', roof: 'sunroof' };
    const SPEC = () => LV.STYLES[S.style];
    const vehicle = { year: '', make: '', model: '' };
    const WIN_STEP = $$('.wz-step', root).findIndex((st) => st.dataset.title === 'Tap your windows');
    const vehText = () => {
        const typed = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
        return typed ? typed + ' (' + SPEC().name + ')' : SPEC().name;
    };
    // the contact form reads this, so the customer never types the vehicle twice
    function saveVehicle() {
        if (!(vehicle.year || vehicle.make || vehicle.model)) return;
        try { sessionStorage.setItem('labVehicle', JSON.stringify({ year: vehicle.year, make: vehicle.make, model: vehicle.model })); } catch (e) { /* storage unavailable */ }
    }
    // pick a body style: draw it and start on the windows most people tint
    function setStyle(style, size) {
        S.style = style; S.size = size == null ? 1 : size;
        S.sel = new Set(LV.STYLES[style].popular);
        LV.draw(car, style, S.size);
    }
    const vIn = { year: $('#tv-year'), make: $('#tv-make'), model: $('#tv-model') };
    const result = $('#tv-result'), RESULT0 = result.textContent;
    $('#tv-makes').innerHTML = LV.makes().map((mk) => '<option value="' + mk + '">').join('');
    function readVehicle() {
        vehicle.year = vIn.year.value.trim(); vehicle.make = vIn.make.value.trim(); vehicle.model = vIn.model.value.trim();
        $('#tv-models').innerHTML = LV.models(vehicle.make).map((mo) => '<option value="' + mo + '">').join('');
        const hit = LV.find(vehicle.make, vehicle.model);
        if (hit && hit.sxs) result.innerHTML = 'Side-by-sides have their own tint page. <a href="/boutique/sxs/">Tint a side-by-side</a>';
        else if (hit) {
            result.textContent = 'Got it: ' + hit.name + ', shown as a ' + LV.STYLES[hit.style].name.toLowerCase() + '.';
            if (hit.style !== S.style || hit.size !== S.size) setStyle(hit.style, hit.size);
        } else result.textContent = vehicle.model ? 'We could not match that one. Tap Next and pick your vehicle type.' : RESULT0;
        render();
    }
    Object.keys(vIn).forEach((k) => vIn[k].addEventListener('input', readVehicle));
    LV.draw(car, S.style, S.size);


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
        const spec = SPEC();
        if (spec.pkg && spec.base.every((id) => S.sel.has(id)) && P['pkg:' + spec.pkg]) {
            const p = P['pkg:' + spec.pkg];
            items.push({ label: 'Full package: all side + rear glass', n: 1, lo: p.lo, hi: p.hi, from: p.from });
        } else {
            if (S.sel.has('fl') || S.sel.has('fr')) add('front', 1, 'Front windows (pair)');
            const sides = ['rl', 'rr'].filter((i) => S.sel.has(i)).length; if (sides) add('side', sides, 'Rear side window' + (sides > 1 ? 's' : ''));
            const qs = ['ql', 'qr'].filter((i) => S.sel.has(i)).length; if (qs) add('quarter', qs, 'Quarter glass');
            if (S.sel.has('rear')) add(spec.rearKey, 1, 'Rear glass');
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
        $$('[data-style]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.style === S.style)));
        const pop = SPEC().popular, wholeCar = SPEC().base.every((id) => pop.includes(id));
        $('#win-pop').textContent = 'Showing a ' + SPEC().name.toLowerCase() + '. Most people tint ' + (wholeCar ? 'all the side and rear glass' : 'the front windows') + (pop.includes('brow') ? ' plus the windshield brow' : '') + ', so we started you there. Tap any window to change. Has a sunroof? Tap the roof.';
        $$('[data-brow]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.brow === S.brow)));
        $$('[data-roof]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.roof === S.roof)));
        $('#opt-brow').hidden = !S.sel.has('brow');
        $('#opt-roof').hidden = !S.sel.has('sun');

        const c = compute();
        const count = c.items.length ? [...S.sel].filter((id) => id !== 'fr').length : 0;
        $('#win-count').textContent = count ? count + (count === 1 ? ' window selected' : ' windows selected') : 'Nothing selected yet';
        if (root.wz && root.wz.index === WIN_STEP) root.wz.setNext(c.items.length > 0);

        // step 4 recap + price
        $('#rc-shade').textContent = shadeText();
        $('#rc-film').textContent = filmText();
        $('#rc-veh').textContent = vehText();
        $('#est-lines').innerHTML = c.items.map((i) =>
            '<li><span>' + i.label + (i.n > 1 && i.label.indexOf('package') < 0 ? ' &times; ' + i.n : '') + '</span><span class="price">' + rng(i.lo, i.hi, i.from) + '</span></li>').join('');
        $('#est-total').textContent = c.items.length ? rng(c.lo, c.hi, c.from) : money(0);
        const summary = c.items.length
            ? 'Shade ' + shadeText() + '; ' + filmText() + ' film, ' + vehText() + ': ' + c.items.map((i) => i.label + (i.n > 1 && i.label.indexOf('package') < 0 ? ' x' + i.n : '')).join('; ') + '. Estimate ' + rng(c.lo, c.hi, c.from, 'CAD')
            : '';
        // hand-off to the booking form (intake.js): field values use that form's own option labels
        const spec = SPEC();
        const full = !!spec.pkg && spec.base.every((id) => S.sel.has(id));
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
        if (summary) saveVehicle();
    }

    const toggle = (id) => {
        if (id === 'fl' || id === 'fr') { // front windows are priced as a pair
            const on = !S.sel.has('fl');
            ['fl', 'fr'].forEach((i) => (on ? S.sel.add(i) : S.sel.delete(i)));
        } else if (S.sel.has(id)) S.sel.delete(id); else S.sel.add(id);
        render();
    };
    // the drawing is rebuilt per vehicle, so listen on the svg
    car.addEventListener('click', (e) => { const w = e.target.closest('.win'); if (w) toggle(w.dataset.id); });
    car.addEventListener('keydown', (e) => { const w = e.target.closest('.win'); if (w && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(w.dataset.id); } });
    $$('[data-film]').forEach((b) => {
        b.addEventListener('click', () => { S.film = b.dataset.film; render(); });
        b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } });
    });
    $$('[data-style]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.style !== S.style) setStyle(b.dataset.style); render(); }));
    $$('[data-brow]').forEach((b) => b.addEventListener('click', () => { S.brow = b.dataset.brow; render(); }));
    $$('[data-roof]').forEach((b) => b.addEventListener('click', () => { S.roof = b.dataset.roof; render(); }));
    $('#bd-all').addEventListener('click', () => { SPEC().base.forEach((i) => S.sel.add(i)); render(); });
    $('#bd-clear').addEventListener('click', () => { S.sel.clear(); render(); });
    $('#wz-restart').addEventListener('click', () => { Object.keys(vIn).forEach((k) => { vIn[k].value = ''; }); result.textContent = RESULT0; vehicle.year = vehicle.make = vehicle.model = ''; setStyle('crew', 2); setShade(0); S.film = 'ceramic'; render(); root.dispatchEvent(new CustomEvent('wz:goto', { detail: 0 })); });
    root.addEventListener('wz:enter', render);

    // the header currency toggle re-renders prices too
    const orig = window.setCurrency;
    if (orig) window.setCurrency = function (c) { orig(c); render(); };
    render();
})();
