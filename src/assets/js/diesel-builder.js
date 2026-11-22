// Diesel power package builder. One page per platform; the platform's steps and product handles live in
// /assets/js/diesel-packages/<id>.json. Prices, images and variants come live from Shopify (shopifyGraphQL and
// createShopifyCheckout are defined in products.js). No price is stored here or in the JSON.
(function () {
    const root = document.getElementById('db-app');
    if (!root) return;

    // Web3Forms public key (same one intake.js uses; safe in client code). Emails the build to the shop inbox.
    const WEB3FORMS_KEY = '947b4a0a-5af7-480b-9aca-5f81e25e834e';
    const OFFROAD = 'Off-Road and Sanctioned Racing Use Only. Not legal for use on pollution-controlled vehicles driven on public roads.';
    const SHOP_TEL = '+12502619502';
    const SHOP_TXT = '(250) 261-9502';
    const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    // phones: parts stack as rows (photo beside the name) instead of a swipe rail
    const ROWS = matchMedia('(max-width: 767px)');
    // Prices show in the currency picked in the header. USD is Shopify's own US price for the variant (window.labUsd),
    // so the totals match checkout. Until the US prices load, CAD shows.
    const usdOn = () => !!(window.labCurrency && window.labCurrency() === 'USD' && window.labUsd && window.labUsd(1) != null);
    const code = () => (usdOn() ? 'USD' : 'CAD');
    const money = (n, vid) => usdOn()
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(window.labUsd(n, vid))
        : new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);

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
        contact: {},        // name, email, phone: asked on the review step, before checkout
        ship: 'shop',       // 'shop' = parts ship to THE LAB and we install; 'home' = ship to the buyer
        i: 0,
        seen: new Set(),    // steps the person has passed (so an optional step skipped shows a tick)
        auto: new Map(),    // handle -> why the builder added it ("Runs your HP Tuners tune")
        runner: null        // the tuning platform the device step last matched
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
        // Parts the truck needs to be tuned are added for the customer (option "preselect": true in the package file).
        // They show in the summary from the start and can be removed. A part that is out of stock is not added.
        S.steps.forEach((s) => s.options.forEach((o) => {
            const v = o.preselect && firstOk(o.handle);
            if (v) choose(s, o.handle, v.id);
        }));
        sync(null);
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
    // the total shown to the customer, in the header currency: each part's own price added up, as checkout does
    const shownTotal = () => usdOn()
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(chosen().reduce((t, c) => t + window.labUsd(parseFloat(c.variant.price.amount), c.variant.id), 0))
        : money(total());

    function included() {
        const set = new Set();
        chosen().forEach((c) => (c.opt.includes || []).forEach((id) => set.add(id)));
        return set;
    }

    function stepDone(s) {
        if (s.kind === 'truck') return truckOk();
        if (s.kind === 'review') return false;
        // a cable step with no cable for the chosen tune is done: the note on the step says what to do
        if (s.id === 'bypass' && s.options && tuneRunner() && !s.options.some(deviceFits)) return true;
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
        S.auto.delete(h);
    }

    // What the person did, then everything that goes with it (see sync)
    function pickOption(step, h, variantId) {
        choose(step, h, variantId);
        sync({ step, opt: optOf(step, h) });
    }
    function dropOption(step, h) {
        unchoose(step, h);
        sync(null);
    }

    // ---------- pairing ----------
    // Choices on one step set up the next, from fields in the package file:
    // - device: the device whose "runner" matches the tune's "runner" (EZ LYNK, HP Tuners, EFILive) is added
    //   when the tune changes, a device for another platform is removed, and only matching devices are shown.
    // - tips: the exhaust's "inlet" (4 or 5) picks the tip variant with the same inlet ("5\" Inlet 6\" Outlet");
    //   other sizes are greyed out. A tip already chosen is switched to the right size, keeping its finish.
    // - "needs": handles in other steps added with the option (the 2023+ downpipe needs the EGR delete).
    // Anything added here can be removed; it is not added again until the choice that brought it changes.
    function pickedOpt(stepId) {
        const s = stepById(stepId);
        const h = s && s.options && Object.keys(S.pick[stepId] || {})[0];
        return h ? optOf(s, h) : null;
    }
    const tuneRunner = () => { const o = pickedOpt('tune'); return (o && o.runner) || null; };
    const exhaustInlet = () => { const o = pickedOpt('exhaust'); return (o && o.inlet) || null; };
    function findOpt(h) {
        for (const s of S.steps) {
            const o = s.options && optOf(s, h);
            if (o) return { step: s, opt: o };
        }
        return null;
    }
    const sized = (h) => variants(h).some((v) => /"\s*Inlet/i.test(v.title));
    function fitsInlet(v, n) {
        if (!n) return true;
        const inlet = v.title.match(/(\d)"\s*Inlet/i);
        if (inlet && Number(inlet[1]) !== n) return false;
        const clamp = v.title.match(/(\d)"\s*Clamp/i);
        return !(clamp && Number(clamp[1]) !== n);
    }
    // the variant for this pipe size, keeping the finish of `prefer` ("Satin Black") when it has one
    function bestFit(h, n, prefer) {
        const ok = variants(h).filter((v) => v.availableForSale && fitsInlet(v, n));
        const finish = (t) => t.split(' / ').slice(1).join(' / ');
        const same = prefer && ok.find((v) => finish(v.title) === finish(prefer.title));
        return same || ok[0] || null;
    }
    function deviceFits(o) {
        const r = tuneRunner();
        return !r || !o.runner || o.runner === r;
    }

    function sync(changed) {
        // the device follows the tune
        const dev = stepById('device');
        const runner = tuneRunner();
        if (dev && dev.options && runner && runner !== S.runner) {
            const p = S.pick.device || (S.pick.device = {});
            Object.keys(p).forEach((h) => { if (!deviceFits(optOf(dev, h) || {})) unchoose(dev, h); });
            if (!Object.keys(p).length) {
                const o = dev.options.find((x) => x.runner === runner && firstOk(x.handle));
                if (o) {
                    choose(dev, o.handle, firstOk(o.handle).id);
                    S.auto.set(o.handle, 'Runs your ' + runner + ' tune');
                }
            }
        }
        // a bypass cable for another tuning platform is dropped when the tune changes
        const byp = stepById('bypass');
        if (byp && byp.options && runner) {
            Object.keys(S.pick.bypass || {}).forEach((h) => { if (!deviceFits(optOf(byp, h) || {})) unchoose(byp, h); });
        }
        S.runner = runner;

        // tips follow the exhaust size
        const n = exhaustInlet();
        S.steps.forEach((s) => {
            const p = s.options && S.pick[s.id];
            if (!p) return;
            Object.keys(p).forEach((h) => {
                if (!sized(h)) return;
                const v = vOf(h, p[h]);
                if (v && fitsInlet(v, n)) return;
                const b = bestFit(h, n, v);
                if (b) p[h] = b.id; else unchoose(s, h);
            });
        });

        // an option brings the parts it needs
        const needs = (changed && changed.opt && changed.opt.needs) || [];
        needs.forEach((h) => {
            const f = findOpt(h);
            const v = f && firstOk(h);
            if (!v || (S.pick[f.step.id] || {})[h]) return;
            choose(f.step, h, v.id);
            S.auto.set(h, 'Needed with the ' + changed.opt.name);
        });
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
        if (cur && refs.bar.scrollWidth > refs.bar.clientWidth) {
            const d = cur.getBoundingClientRect().left - refs.bar.getBoundingClientRect().left;
            refs.bar.scrollLeft += d - (refs.bar.clientWidth - cur.offsetWidth) / 2;
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
        // top = photo + name and price; foot = option menu and button (rows on phones put the photo beside the name)
        const body = el('div', 'db-card-meta');
        const foot = el('div', 'db-card-foot');
        body.append(el('p', 'db-brand', opt.brand || p.vendor), el('h3', 'display db-card-t', opt.name));
        // A platform with two tuning platforms (EZ LYNK and HP Tuners) lists both as separate cards, each tagged here.
        if (opt.runner) body.append(el('p', 'db-chip', 'Runs on ' + opt.runner));
        const inlet = sized(opt.handle) ? exhaustInlet() : null;
        if (opt.preselect && sel) body.append(el('p', 'db-chip is-added', 'Added for your truck'));
        else if (sel && S.auto.has(opt.handle)) body.append(el('p', 'db-chip is-added', S.auto.get(opt.handle)));
        if (inlet) body.append(el('p', 'db-chip', 'Sized for your ' + inlet + '" exhaust'));
        if (opt.note) body.append(el('p', 'db-card-n', opt.note));

        let cur = (sel && vOf(opt.handle, sel)) || (inlet && bestFit(opt.handle, inlet)) || firstOk(opt.handle) || vs[0];
        const price = el('p', 'db-price');
        const showPrice = () => {
            const amt = parseFloat(cur.price.amount);
            const fit = vs.filter((v) => fitsInlet(v, inlet));
            const lo = Math.min.apply(null, (fit.length ? fit : vs).map((v) => parseFloat(v.price.amount)));
            const pool = fit.length ? fit : vs;
            const varies = new Set(pool.map((v) => v.price.amount)).size > 1;
            price.textContent = varies && !sel ? 'From ' + money(lo) : money(sel || !varies ? amt : lo, sel || !varies ? cur.id : null);
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
                const fits = fitsInlet(v, inlet);
                o.textContent = v.title + ' (' + money(parseFloat(v.price.amount), v.id) + ')' + (!v.availableForSale ? ' - ask us' : !fits ? ' - not for a ' + inlet + '" exhaust' : '');
                o.disabled = !v.availableForSale || !fits;
                if (v.id === cur.id) o.selected = true;
                select.append(o);
            });
            select.addEventListener('change', () => {
                cur = vOf(opt.handle, select.value);
                if ((S.pick[step.id] || {})[opt.handle]) { pickOption(step, opt.handle, cur.id); render(false); }
                else showPrice();
            });
            foot.append(lab, select);
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
            foot.append(btn, a);
        } else {
            btn.classList.add(sel ? 'btn-ghost' : 'btn-primary');
            btn.textContent = sel ? 'Selected' : (step.mode === 'one' ? 'Choose this' : 'Add');
            btn.setAttribute('aria-pressed', sel ? 'true' : 'false');
            btn.addEventListener('click', () => {
                if (sel) dropOption(step, opt.handle); else pickOption(step, opt.handle, cur.id);
                render(false);
            });
            foot.append(btn);
        }
        const top = el('div', 'db-card-top');
        top.append(fig, body);
        c.append(tick, top, foot);
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

        // the device step shows only devices that run the chosen tune
        const paired = step.id === 'device' || step.id === 'bypass';
        const opts = paired ? step.options.filter(deviceFits) : step.options;
        if (paired && opts.length && opts.length < step.options.length) {
            wrap.append(el('p', 'db-choose', 'Showing the ' + (step.id === 'device' ? 'device' : 'cable') + ' that runs your ' + tuneRunner() + ' tune.'));
        }

        if (step.id === 'bypass' && !opts.length) {
            wrap.append(el('p', 'db-included', 'Your ' + tuneRunner() + ' tune needs a Security Gateway cable too. Call or text (250) 261-9502 and we\'ll match the right one. You can carry on.'));
            return wrap;
        }
        const inc = included();
        if (inc.has(step.id)) {
            const n = el('p', 'db-included', 'Your exhaust package already includes this part. You can skip this step.');
            wrap.append(n);
        } else {
            const grid = el('div', 'db-grid');
            const n = opts.length;
            grid.dataset.n = String(n);
            if (ROWS.matches || n <= 2) grid.classList.add('is-rows');
            else if (n === 3) grid.classList.add('is-three');
            opts.forEach((o) => grid.append(card(step, o)));
            const rail = el('div', 'db-rail');
            rail.append(grid);
            wrap.append(rail);
            if (opts.length > 1) {
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
                    const n = opts.length;
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
        return 'Diesel power package build. Truck: ' + truck.join(' | ') + '. ' + lines.join('. ') + '. Parts total in the store when built: ' + new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(total()) + ' CAD' + (usdOn() ? ' (customer saw ' + shownTotal() + ' USD)' : '') + '.';
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
            li.append(el('span', null, c.opt.name + (c.variant.title !== 'Default Title' ? ' - ' + c.variant.title : '')), el('span', null, money(parseFloat(c.variant.price.amount), c.variant.id)));
            list.append(li);
        });
        const tot = el('li', 'db-rev-tot');
        tot.append(el('span', null, 'Parts total (' + code() + ')'), el('span', null, shownTotal()));
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

        const who = el('fieldset', 'db-ship db-who');
        who.append(el('legend', 'db-ship-l', 'Your details'));
        [['name', 'Full name', 'text', 'name'], ['email', 'Email', 'email', 'email'], ['phone', 'Phone', 'tel', 'tel']].forEach(([k, label, type, ac]) => {
            const row = el('div', 'db-row');
            const lab = el('label', 'db-lab', label);
            lab.htmlFor = 'ct-' + k;
            const inp = el('input', 'db-input');
            inp.type = type; inp.id = 'ct-' + k; inp.autocomplete = ac; inp.value = S.contact[k] || '';
            if (k === 'email') inp.inputMode = 'email';
            inp.addEventListener('input', () => { S.contact[k] = inp.value.trim(); });
            row.append(lab, inp);
            who.append(row);
        });
        who.append(el('p', 'db-hint', 'We use these to confirm your build and to book your install. Nothing else.'));
        wrap.append(who);

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
        const c = S.contact;
        if (!c.name || c.name.length < 2) return 'Add your name above.';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email || '')) return 'Add a valid email above.';
        if ((c.phone || '').replace(/\D/g, '').length < 10) return 'Add a phone number above, with area code.';
        if (!S.ack) return 'Tick the box above to continue.';
        return '';
    }

    // Email the full build and contact details to the shop before the customer reaches checkout, so an abandoned
    // checkout still leaves a lead.
    function emailBuild(install) {
        const c = S.contact;
        const body = [
            (install ? 'Parts ship to THE LAB and we install.' : 'Parts ship to the customer.'),
            summaryText(),
            'Customer was sent to checkout. Look for the order with this email. Off-road acknowledgement accepted.',
            window.labReferralText && window.labReferralText() && 'REFERRAL: ' + window.labReferralText()
        ].filter(Boolean).join('\n\n');
        try {
            return fetch('https://api.web3forms.com/submit', {
                method: 'POST', keepalive: true,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: 'Power package build: ' + S.pkg.title + ' - ' + c.name, from_name: 'THE LAB Website', name: c.name, email: c.email, phone: c.phone, message: body })
            }).catch(() => {});
        } catch (e) { return Promise.resolve(); }
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
        attrs.Name = S.contact.name; attrs.Phone = S.contact.phone; attrs.Email = S.contact.email;
        attrs['Off-road acknowledgement'] = 'Accepted';
        const install = S.ship === 'shop';
        attrs.Fulfilment = install ? 'Ship to THE LAB, install at THE LAB' : 'Ship to customer';
        const lines = chosen().map((c, k) => ({
            variantId: c.variant.id, quantity: 1,
            customAttributes: k === 0 ? attrs : { Build: S.pkg.title }
        }));
        const opts = { email: S.contact.email, attributes: [{ key: 'Fulfilment', value: attrs.Fulfilment }, { key: 'Build', value: S.pkg.title }, { key: 'VIN', value: (S.truck && S.truck.vin || '').toUpperCase() }, { key: 'Name', value: S.contact.name }, { key: 'Phone', value: S.contact.phone }] };
        if (install) opts.address = { address1: '10219 95 Ave', city: 'Fort St. John', province: 'BC', country: 'CA', zip: 'V1J 5J5', company: 'THE LAB (Luxx Automotive Boutique)', firstName: S.contact.name.split(' ')[0], lastName: S.contact.name.split(' ').slice(1).join(' ') || '-', phone: undefined };
        if (opts.address) delete opts.address.phone;
        refs.buy.disabled = true;
        refs.status.textContent = 'Taking you to checkout...';
        emailBuild(install).finally(() => {}); // fire and forget: never hold up checkout
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
                r.append(el('span', null, c.opt.name), el('span', null, money(parseFloat(c.variant.price.amount), c.variant.id)));
                g.append(r);
            });
            box.append(g);
        });
        const tot = el('div', 'db-side-tot');
        tot.append(el('span', null, 'Total (' + code() + ')'), el('strong', null, shownTotal()));
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
        line.append(el('span', null, n + (n === 1 ? ' part' : ' parts')), el('strong', null, shownTotal()));
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
        refs.main.append(s.kind === 'truck' ? truckStep(s) : s.kind === 'review' ? reviewStep(s) : optionStep(s));
        refs.main.append(el('p', 'db-off db-off-top', OFFROAD));
        renderPills();
        renderSide();
        renderNav();
        const g = refs.main.querySelector('.db-grid');
        if (g && keep) { g.style.scrollBehavior = 'auto'; g.scrollLeft = keep; g.dispatchEvent(new Event('scroll')); }
        if (scroll) {
            // Phones land on the step title so the first parts are in view; larger screens land on the step bar.
            const head = refs.h && refs.h.closest('.db-step-head');
            const target = ROWS.matches && head ? head : refs.bar;
            const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 66) - 12;
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
        ROWS.addEventListener('change', () => render(false));
        document.addEventListener('lab:currency', () => render(false)); // header switch, or US prices finished loading
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
