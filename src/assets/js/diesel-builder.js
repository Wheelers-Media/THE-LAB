// Diesel power package builder. One page per platform; the platform's steps and product handles live in
// /assets/js/diesel-packages/<id>.json. Prices, images and variants come live from Shopify (shopifyGraphQL and
// createShopifyCheckout are defined in products.js). No price is stored here or in the JSON.
(function () {
    const root = document.getElementById('db-app');
    if (!root) return;

    const OFFROAD = 'Off-Road and Sanctioned Racing Use Only. Not legal for use on pollution-controlled vehicles driven on public roads.';
    const SHOP_TEL = '+12502619502';
    const SHOP_TXT = '(250) 261-9502';
    const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    const money = (n) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);

    const el = (tag, cls, text) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    };

    const S = {
        pkg: null,
        steps: [],          // pkg steps with at least one live product, plus truck and review
        products: {},       // handle -> live product
        pick: {},           // stepId -> { handle: variantId }
        truck: {},          // field -> value
        ack: false,
        ship: 'shop',       // 'shop' = parts ship to THE LAB and we install; 'home' = ship to the buyer
        i: 0,
        seen: new Set()     // steps the person has passed (so an optional step skipped shows a tick)
    };

    // ---------- data ----------
    function productQuery(handles) {
        const body = handles.map((h, k) => `p${k}: product(handle: ${JSON.stringify(h)}) {
            handle title vendor
            featuredImage { url altText }
            variants(first: 25) { nodes { id title availableForSale price { amount } } }
        }`).join('\n');
        return `query { ${body} }`;
    }

    async function load() {
        const res = await fetch(root.dataset.pkg);
        if (!res.ok) throw new Error('package ' + res.status);
        S.pkg = await res.json();
        const handles = [...new Set(S.pkg.steps.flatMap((s) => s.options.map((o) => o.handle)))];
        const data = await shopifyGraphQL(productQuery(handles));
        Object.values(data).forEach((p) => { if (p) S.products[p.handle] = p; });
        S.steps = S.pkg.steps
            .map((s) => Object.assign({}, s, { options: s.options.filter((o) => S.products[o.handle]) }))
            .filter((s) => s.options.length);
        S.steps.push({ id: 'truck', title: 'Your Truck', required: true, kind: 'truck' });
        S.steps.push({ id: 'review', title: 'Review', required: true, kind: 'review' });
    }

    // ---------- selection helpers ----------
    const prod = (h) => S.products[h];
    const variants = (h) => prod(h).variants.nodes;
    const vOf = (h, id) => variants(h).find((v) => v.id === id);
    const optOf = (step, h) => step.options.find((o) => o.handle === h);
    const firstOk = (h) => variants(h).find((v) => v.availableForSale) || null;
    const stepById = (id) => S.steps.find((s) => s.id === id);

    function chosen() {
        const out = [];
        S.steps.forEach((s) => {
            if (!s.options) return;
            const p = S.pick[s.id] || {};
            Object.keys(p).forEach((h) => {
                const v = vOf(h, p[h]);
                if (v) out.push({ step: s, opt: optOf(s, h), product: prod(h), variant: v });
            });
        });
        return out;
    }
    const total = () => chosen().reduce((t, c) => t + parseFloat(c.variant.price.amount), 0);

    function included() {
        const set = new Set();
        chosen().forEach((c) => (c.opt.includes || []).forEach((id) => set.add(id)));
        return set;
    }

    function stepDone(s) {
        if (s.kind === 'truck') return truckOk();
        if (s.kind === 'review') return false;
        return Object.keys(S.pick[s.id] || {}).length > 0;
    }
    function truckOk() { return /^[A-HJ-NPR-Z0-9]{17}$/.test((S.truck.vin || '').toUpperCase()); }

    function unlocked(k) {
        // every required step before k must be done
        for (let j = 0; j < k; j++) {
            const s = S.steps[j];
            if (s.required && !stepDone(s)) return false;
        }
        return true;
    }

    function choose(step, h, variantId) {
        const p = S.pick[step.id] || (S.pick[step.id] = {});
        if (step.mode === 'one') {
            Object.keys(p).forEach((k) => { if (k !== h) delete p[k]; });
        }
        p[h] = variantId;
        // a package that includes the downpipe replaces any separate downpipe choice
        const inc = included();
        inc.forEach((id) => { if (id !== step.id && S.pick[id]) delete S.pick[id]; });
    }
    function unchoose(step, h) {
        if (S.pick[step.id]) delete S.pick[step.id][h];
    }

    // ---------- render ----------
    const refs = {};

    function shell() {
        root.textContent = '';
        refs.bar = el('ol', 'db-pills');
        refs.bar.setAttribute('aria-label', 'Build steps');
        refs.main = el('div', 'db-main');
        refs.side = el('aside', 'db-side');
        refs.side.setAttribute('aria-label', 'Your power package');
        refs.sticky = el('div', 'db-sticky');
        const layout = el('div', 'db-layout');
        layout.append(refs.main, refs.side);
        root.append(refs.bar, layout);
    }

    function renderPills() {
        refs.bar.textContent = '';
        S.steps.forEach((s, k) => {
            const li = el('li', 'db-pill');
            const b = el('button', null, '');
            b.type = 'button';
            const n = el('span', 'db-pill-n', String(k + 1));
            const t = el('span', 'db-pill-t', s.title);
            b.append(n, t);
            const done = k !== S.i && (stepDone(s) || (S.seen.has(s.id) && !s.required && s.kind !== 'review'));
            if (k === S.i) { li.classList.add('is-now'); b.setAttribute('aria-current', 'step'); }
            if (done) { li.classList.add('is-done'); n.textContent = '✓'; }
            const ok = unlocked(k);
            b.disabled = !ok;
            if (!ok) li.classList.add('is-locked');
            b.addEventListener('click', () => go(k, true));
            li.append(b);
            refs.bar.append(li);
        });
        const cur = refs.bar.querySelector('.is-now');
        if (cur) {
            const d = cur.getBoundingClientRect().left - refs.bar.getBoundingClientRect().left;
            if (d < 0 || d + cur.offsetWidth > refs.bar.clientWidth) refs.bar.scrollLeft += d - 8;
        }
    }

    function card(step, opt) {
        const p = prod(opt.handle);
        const vs = variants(opt.handle);
        const sel = (S.pick[step.id] || {})[opt.handle];
        const anyOk = vs.some((v) => v.availableForSale);
        const c = el('article', 'db-card');
        if (sel) c.classList.add('is-on');
        const tick = el('span', 'db-tick');
        tick.setAttribute('aria-hidden', 'true');
        tick.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

        const fig = el('div', 'db-card-img');
        if (p.featuredImage && p.featuredImage.url) {
            const im = document.createElement('img');
            im.src = p.featuredImage.url + (p.featuredImage.url.includes('?') ? '&' : '?') + 'width=480';
            im.alt = p.featuredImage.altText || opt.name;
            im.width = 240; im.height = 240; im.loading = 'lazy';
            fig.append(im);
        }
        const body = el('div', 'db-card-body');
        body.append(el('p', 'db-brand', opt.brand || p.vendor), el('h3', 'display db-card-t', opt.name));
        // A platform with two tuning platforms (EZ LYNK and HP Tuners) lists both as separate cards, each tagged here.
        if (opt.runner) body.append(el('p', 'db-chip', 'Runs on ' + opt.runner));
        if (opt.note) body.append(el('p', 'db-card-n', opt.note));

        let cur = (sel && vOf(opt.handle, sel)) || firstOk(opt.handle) || vs[0];
        const price = el('p', 'db-price');
        const showPrice = () => {
            const amt = parseFloat(cur.price.amount);
            const lo = Math.min.apply(null, vs.map((v) => parseFloat(v.price.amount)));
            price.textContent = vs.length > 1 && !sel ? 'From ' + money(lo) : money(amt);
        };

        let select = null;
        if (vs.length > 1) {
            const id = 'v-' + step.id + '-' + opt.handle;
            const lab = el('label', 'db-lab', 'Option');
            lab.htmlFor = id;
            select = el('select', 'db-select');
            select.id = id;
            vs.forEach((v) => {
                const o = document.createElement('option');
                o.value = v.id;
                o.textContent = v.title + ' (' + money(parseFloat(v.price.amount)) + ')' + (v.availableForSale ? '' : ' - ask us');
                o.disabled = !v.availableForSale;
                if (v.id === cur.id) o.selected = true;
                select.append(o);
            });
            select.addEventListener('change', () => {
                cur = vOf(opt.handle, select.value);
                if ((S.pick[step.id] || {})[opt.handle]) { choose(step, opt.handle, cur.id); render(false); }
                else showPrice();
            });
            body.append(lab, select);
        }
        showPrice();
        body.append(price);

        const btn = el('button', 'btn db-pick');
        btn.type = 'button';
        if (!anyOk) {
            btn.disabled = true;
            btn.textContent = 'Ask us about this one';
            btn.classList.add('btn-ghost');
            const a = el('a', 'db-ask', 'Call or text ' + SHOP_TXT);
            a.href = 'tel:' + SHOP_TEL;
            body.append(btn, a);
        } else {
            btn.classList.add(sel ? 'btn-ghost' : 'btn-primary');
            btn.textContent = sel ? 'Selected' : (step.mode === 'one' ? 'Choose this' : 'Add');
            btn.setAttribute('aria-pressed', sel ? 'true' : 'false');
            btn.addEventListener('click', () => {
                if (sel) unchoose(step, opt.handle); else choose(step, opt.handle, cur.id);
                render(false);
            });
            body.append(btn);
        }
        c.append(tick, fig, body);
        // tap anywhere on the card to choose it (the option menu and the buttons keep their own behaviour)
        if (anyOk) c.addEventListener('click', (e) => { if (!e.target.closest('select, label, a, button')) btn.click(); });
        return c;
    }

    function optionStep(step) {
        const wrap = el('section', 'db-step');
        const head = el('div', 'db-step-head');
        head.append(el('p', 'db-count', 'Step ' + (S.i + 1) + ' of ' + S.steps.length));
        const h = el('h2', 'display db-step-t', step.title);
        h.tabIndex = -1;
        refs.h = h;
        head.append(h, el('span', 'db-badge ' + (step.required ? 'is-req' : 'is-opt'), step.required ? 'Required' : 'Optional'));
        wrap.append(head, el('p', 'db-step-p', step.text));
        wrap.append(el('p', 'db-choose', step.mode === 'one' ? 'Choose one.' : 'Choose as many as you like.' + (step.required ? '' : ' Skip it if you don\'t need it.')));

        const inc = included();
        if (inc.has(step.id)) {
            const n = el('p', 'db-included', 'Your exhaust package already includes this part. You can skip this step.');
            wrap.append(n);
        } else {
            const grid = el('div', 'db-grid');
            step.options.forEach((o) => grid.append(card(step, o)));
            const rail = el('div', 'db-rail');
            rail.append(grid);
            wrap.append(rail);
            if (step.options.length > 1) {
                const mk = (dir, label) => {
                    const b = el('button', 'db-arrow db-arrow-' + (dir < 0 ? 'prev' : 'next'));
                    b.type = 'button';
                    b.setAttribute('aria-label', label);
                    b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>';
                    b.addEventListener('click', () => grid.scrollBy({ left: dir * grid.clientWidth * 0.85, behavior: calm() ? 'auto' : 'smooth' }));
                    return b;
                };
                const prev = mk(-1, 'Previous products'), next = mk(1, 'More products');
                rail.append(prev, next);
                const ctr = el('p', 'db-swipe');
                ctr.setAttribute('aria-hidden', 'true');
                const upd = () => {
                    const first = grid.firstElementChild, second = grid.children[1];
                    const w = (second ? second.offsetLeft - first.offsetLeft : first.offsetWidth) || 1;
                    const n = step.options.length;
                    const k = Math.min(n, Math.round(grid.scrollLeft / w) + 1);
                    const shown = Math.max(1, Math.round((grid.clientWidth + 16) / w));
                    ctr.textContent = (shown > 1 ? k + '-' + Math.min(n, k + shown - 1) : k) + ' of ' + n + (matchMedia('(max-width: 767px)').matches ? '. Swipe for more.' : '');
                    const atStart = grid.scrollLeft <= 2, atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
                    prev.disabled = atStart; next.disabled = atEnd;
                    rail.classList.toggle('is-flat', atStart && atEnd);
                };
                grid.addEventListener('scroll', upd, { passive: true });
                requestAnimationFrame(upd);
                upd();
                wrap.append(ctr);
            }
        }
        return wrap;
    }

    const FIELDS = [
        { id: 'vin', label: 'VIN', req: true, ph: '17 characters', hint: 'Your tune is written to your truck, so we need the VIN.' },
        { id: 'drive', label: 'Drivetrain', type: 'select', opts: ['4WD', '2WD'] },
        { id: 'tires', label: 'Tire size', ph: 'e.g. 35x12.50R20' },
        { id: 'tank', label: 'Fuel tank', type: 'select', opts: ['Factory tank', 'Aftermarket tank'] },
        { id: 'axle', label: 'Axle ratio', ph: 'e.g. 3.73' },
        { id: 'mods', label: 'Other modifications', type: 'area', ph: 'Lift, intake, lift pump, anything already on the truck' }
    ];

    function truckStep(step) {
        const wrap = el('section', 'db-step');
        const head = el('div', 'db-step-head');
        head.append(el('p', 'db-count', 'Step ' + (S.i + 1) + ' of ' + S.steps.length));
        const h = el('h2', 'display db-step-t', step.title);
        h.tabIndex = -1;
        refs.h = h;
        head.append(h, el('span', 'db-badge is-req', 'Required'));
        wrap.append(head, el('p', 'db-step-p', 'Tell us about the truck so the tune and parts are set up right. Only the VIN is required.'));
        const form = el('div', 'db-form');
        FIELDS.forEach((f) => {
            const row = el('div', 'db-row');
            const id = 'tf-' + f.id;
            const lab = el('label', 'db-lab', f.label + (f.req ? '' : ' (optional)'));
            lab.htmlFor = id;
            let inp;
            if (f.type === 'select') {
                inp = el('select', 'db-select');
                const blank = document.createElement('option');
                blank.value = ''; blank.textContent = 'Choose';
                inp.append(blank);
                f.opts.forEach((o) => { const op = document.createElement('option'); op.value = o; op.textContent = o; inp.append(op); });
            } else if (f.type === 'area') {
                inp = el('textarea', 'db-input'); inp.rows = 3;
            } else {
                inp = el('input', 'db-input'); inp.type = 'text';
                if (f.id === 'vin') { inp.maxLength = 17; inp.autocapitalize = 'characters'; inp.autocomplete = 'off'; inp.spellcheck = false; }
            }
            inp.id = id;
            if (f.ph) inp.placeholder = f.ph;
            inp.value = S.truck[f.id] || '';
            inp.addEventListener('input', () => {
                S.truck[f.id] = inp.value.trim();
                renderPills(); renderSide(); renderNav();
            });
            row.append(lab, inp);
            if (f.hint) row.append(el('p', 'db-hint', f.hint));
            form.append(row);
        });
        wrap.append(form);
        return wrap;
    }

    function summaryText() {
        const lines = [];
        S.steps.forEach((s) => {
            if (!s.options) return;
            const items = chosen().filter((c) => c.step === s);
            if (items.length) lines.push(s.title + ': ' + items.map((c) => c.opt.name + (c.variant.title !== 'Default Title' ? ' (' + c.variant.title + ')' : '')).join(', '));
        });
        const t = S.truck;
        const truck = [S.pkg.title, t.vin && 'VIN ' + t.vin, t.drive, t.tires && 'Tires ' + t.tires, t.tank, t.axle && 'Axle ' + t.axle, t.mods && 'Mods: ' + t.mods].filter(Boolean);
        return 'Diesel power package build. Truck: ' + truck.join(' | ') + '. ' + lines.join('. ') + '. Parts total in the store when built: ' + money(total()) + ' CAD.';
    }

    function reviewStep(step) {
        const wrap = el('section', 'db-step');
        const head = el('div', 'db-step-head');
        head.append(el('p', 'db-count', 'Step ' + (S.i + 1) + ' of ' + S.steps.length));
        const h = el('h2', 'display db-step-t', 'Review your build');
        h.tabIndex = -1;
        refs.h = h;
        head.append(h);
        wrap.append(head);
        const items = chosen();
        if (!items.length) {
            wrap.append(el('p', 'db-step-p', 'Nothing chosen yet. Go back and pick your tune and exhaust.'));
            return wrap;
        }
        const list = el('ul', 'db-rev');
        items.forEach((c) => {
            const li = el('li');
            li.append(el('span', null, c.opt.name + (c.variant.title !== 'Default Title' ? ' - ' + c.variant.title : '')), el('span', null, money(parseFloat(c.variant.price.amount))));
            list.append(li);
        });
        const tot = el('li', 'db-rev-tot');
        tot.append(el('span', null, 'Parts total (CAD)'), el('span', null, money(total())));
        list.append(tot);
        wrap.append(list);
        const how = el('fieldset', 'db-ship');
        how.append(el('legend', 'db-ship-l', 'Where should the parts go?'));
        const mk = (val, title, sub) => {
            const lab = el('label', 'db-ship-o');
            const r = document.createElement('input');
            r.type = 'radio'; r.name = 'db-ship'; r.value = val; r.checked = S.ship === val;
            r.addEventListener('change', () => { S.ship = val; renderShip(); });
            const t = el('span', 'db-ship-t');
            t.append(el('strong', null, title), el('span', null, sub));
            lab.append(r, t);
            return lab;
        };
        how.append(mk('shop', 'Ship to THE LAB and we install it', 'Parts come to our Fort St. John shop. We fit them for you.'), mk('home', 'Ship to me', 'I will fit the parts myself or have them fitted elsewhere.'));
        wrap.append(how);
        const note = el('div', 'db-ship-n');
        refs.shipNote = note;
        wrap.append(note);

        const ackWrap = el('label', 'db-ack');
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = S.ack;
        cb.addEventListener('change', () => { S.ack = cb.checked; renderNav(); });
        ackWrap.append(cb, el('span', null, ' I understand. ' + OFFROAD));
        wrap.append(ackWrap);

        const row = el('div', 'db-finish');
        const buy = el('button', 'btn btn-primary', 'Pay for the parts');
        buy.type = 'button'; buy.dataset.act = 'buy';
        row.append(buy);
        const status = el('p', 'db-hint');
        status.setAttribute('role', 'status');
        refs.status = status;
        wrap.append(row, status);
        buy.addEventListener('click', doBuy);
        refs.buy = buy;
        renderShip();
        wrap.append(el('p', 'db-hint', 'Not sure about a part? Call or text ' + SHOP_TXT + '.'));
        return wrap;
    }

    function renderShip() {
        const n = refs.shipNote;
        if (!n) return;
        n.textContent = '';
        if (S.ship === 'shop') {
            n.append(el('p', 'db-ship-h', 'How it works'));
            const ol = el('ol', 'db-ship-ol');
            ['Pay for the parts now. They ship to our shop, so the address at checkout is already filled in.',
             'We contact you when the parts arrive. You pick your install day then, so you never hold a slot for parts that are still on the way.',
             'Plan for one to two days in the shop, depending on the build. Labour is billed at the shop rate after the install. No deposit is needed, because the parts are already paid for.'
            ].forEach((t) => ol.append(el('li', null, t)));
            n.append(ol, el('p', 'db-hint', 'Shipping and taxes are worked out at checkout.'));
        } else {
            n.append(el('p', 'db-hint', 'Shipping and taxes are worked out at checkout. Parts ship across Canada and to the US. Duties and taxes outside Canada are the buyer\u2019s.'));
        }
        if (refs.buy) refs.buy.textContent = S.ship === 'shop' ? 'Pay for the parts' : 'Buy the parts';
    }

    function gate() {
        if (!truckOk()) return 'Add your VIN on the Your Truck step first.';
        if (!S.ack) return 'Tick the box above to continue.';
        return '';
    }

    function doBuy() {
        const g = gate();
        if (g) { refs.status.textContent = g; return; }
        const t = S.truck;
        const attrs = { Build: S.pkg.title };
        if (t.vin) attrs.VIN = t.vin.toUpperCase();
        if (t.drive) attrs.Drivetrain = t.drive;
        if (t.tires) attrs.Tires = t.tires;
        if (t.tank) attrs['Fuel tank'] = t.tank;
        if (t.axle) attrs['Axle ratio'] = t.axle;
        if (t.mods) attrs.Mods = t.mods;
        attrs['Off-road acknowledgement'] = 'Accepted';
        const install = S.ship === 'shop';
        attrs.Fulfilment = install ? 'Ship to THE LAB, install at THE LAB' : 'Ship to customer';
        const lines = chosen().map((c, k) => ({
            variantId: c.variant.id, quantity: 1,
            customAttributes: k === 0 ? attrs : { Build: S.pkg.title }
        }));
        const opts = { attributes: [{ key: 'Fulfilment', value: attrs.Fulfilment }, { key: 'Build', value: S.pkg.title }] };
        if (install) opts.address = { address1: '10219 95 Ave', city: 'Fort St. John', province: 'BC', country: 'CA', zip: 'V1J 5J5', company: 'THE LAB (Luxx Automotive Boutique)' };
        refs.buy.disabled = true;
        refs.status.textContent = 'Taking you to checkout...';
        window.createShopifyCheckout(lines, opts).then(() => { refs.buy.disabled = false; }, () => { refs.buy.disabled = false; });
    }

    function renderSide() {
        refs.side.textContent = '';
        const box = el('div', 'db-sticky');
        box.append(el('h2', 'display db-side-t', 'Your power package'));
        const items = chosen();
        if (!items.length) box.append(el('p', 'db-hint', 'Nothing chosen yet. Start with your tune.'));
        S.steps.forEach((s) => {
            if (!s.options) return;
            const mine = items.filter((c) => c.step === s);
            if (!mine.length) return;
            const g = el('div', 'db-side-g');
            g.append(el('p', 'db-side-h', s.title));
            mine.forEach((c) => {
                const r = el('div', 'db-side-i');
                r.append(el('span', null, c.opt.name), el('span', null, money(parseFloat(c.variant.price.amount))));
                g.append(r);
            });
            box.append(g);
        });
        const tot = el('div', 'db-side-tot');
        tot.append(el('span', null, 'Total (CAD)'), el('strong', null, money(total())));
        box.append(tot);
        // Desktop: Back / Next also live here, next to the total, so they are always in view.
        const sn = el('div', 'db-side-nav');
        box.append(sn, el('p', 'db-off', OFFROAD));
        refs.side.append(box);
    }

    function buildNav(cls) {
        const s = S.steps[S.i];
        const nav = el('div', 'db-nav ' + cls);
        const n = chosen().length;
        const line = el('p', 'db-nav-tot');
        line.append(el('span', null, n + (n === 1 ? ' part' : ' parts')), el('strong', null, money(total())));
        const back = el('button', 'btn btn-ghost', 'Back');
        back.type = 'button';
        back.disabled = S.i === 0;
        back.addEventListener('click', () => go(S.i - 1, true));
        nav.append(line, back);
        if (S.i < S.steps.length - 1) {
            const done = stepDone(s);
            const next = el('button', 'btn btn-primary', !s.required && !done ? 'Skip this step' : 'Next');
            next.type = 'button';
            next.disabled = s.required && !done;
            next.addEventListener('click', () => go(S.i + 1, true));
            nav.append(next);
            if (s.required && !done) line.insertAdjacentElement('beforebegin', el('p', 'db-nav-hint', s.kind === 'truck' ? 'Enter a 17 character VIN to continue.' : 'Choose one to continue.'));
        }
        return nav;
    }

    function renderNav() {
        root.querySelectorAll('.db-nav').forEach((n) => n.remove());
        refs.main.append(buildNav('db-nav-main'));
        const slot = refs.side.querySelector('.db-side-nav');
        if (slot) slot.append(buildNav('db-nav-side'));
    }

    let lastStep = -1;
    function render(scroll) {
        const s = S.steps[S.i];
        S.seen.add(s.id);
        const prev = refs.main.querySelector('.db-grid');
        const keep = prev && lastStep === S.i ? prev.scrollLeft : 0;
        lastStep = S.i;
        refs.main.textContent = '';
        const disclaimer = el('p', 'db-off db-off-top', OFFROAD);
        refs.main.append(disclaimer);
        refs.main.append(s.kind === 'truck' ? truckStep(s) : s.kind === 'review' ? reviewStep(s) : optionStep(s));
        renderPills();
        renderSide();
        renderNav();
        const g = refs.main.querySelector('.db-grid');
        if (g && keep) { g.style.scrollBehavior = 'auto'; g.scrollLeft = keep; g.dispatchEvent(new Event('scroll')); }
        if (scroll) {
            const top = refs.bar.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 66) - 8;
            window.scrollTo({ top: Math.max(0, top), behavior: calm() ? 'auto' : 'smooth' });
            if (refs.h) refs.h.focus({ preventScroll: true });
        }
    }

    function go(k, scroll) {
        k = Math.max(0, Math.min(S.steps.length - 1, k));
        if (!unlocked(k)) return;
        S.i = k;
        render(scroll);
    }

    // ---------- start ----------
    shell();
    refs.main.append(el('p', 'db-hint', 'Loading live parts and prices...'));
    load().then(() => {
        if (!S.steps.some((s) => s.options)) throw new Error('no products');
        render(false);
    }).catch((e) => {
        console.error('[diesel-builder]', e);
        root.textContent = '';
        const box = el('div', 'db-fail');
        box.append(el('h2', 'display db-step-t', 'We could not load the builder'));
        const p = el('p', 'db-step-p', 'Please refresh the page, or call or text us at ');
        const a = el('a', null, SHOP_TXT);
        a.href = 'tel:' + SHOP_TEL;
        p.append(a, ' and we will build your package with you.');
        box.append(p);
        root.append(box);
    });
})();
