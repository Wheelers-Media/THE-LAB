// Power-package walkthrough for the parts store: one page per truck and engine, built from a JSON config.
// Markup: <section data-wz data-pp> holding <script type="application/json" id="pp-config">. This file writes the .wz-step blocks
// synchronously (so wizard.js, loaded after it, sees them), then fills in names and prices from the live Shopify catalog
// (window.storeCatalog, loaded by products.js). Prices are never written in the config: only product handles.
// Config: { platform, make, engine, years: [..], models: [..], offroad, steps: [ { key, title, sub, mode: 'one'|'many', svc,
//   groups: [ { label, options: [ { h: handle, variants: true, off: true, inc: [stepKey], label, note } ] } ],
//   ask: [ { id, label, note } ] } ] }
(function () {
    const root = document.querySelector('[data-pp]');
    const cfgEl = document.getElementById('pp-config');
    if (!root || !cfgEl) return;
    const C = JSON.parse(cfgEl.textContent);
    const money = (n) => '$' + Number(n).toLocaleString('en-CA', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const S = { picks: {}, asks: {}, truck: { year: '', model: '', notes: '' } }; // picks[stepKey] = [item]; asks[id] = label
    const offroadText = C.offroad || 'Off-Road and Sanctioned Racing Use Only. Not legal for use on pollution-controlled vehicles driven on public roads.';
    let items = {}; // optId -> { stepKey, off, inc, label, note, product, variant }

    // ---------- build the step shells ----------
    const head = root.querySelector('[data-pp-steps]');
    const stepEls = [];
    C.steps.forEach((st) => {
        const el = document.createElement('div');
        el.className = 'wz-step';
        el.dataset.title = st.title;
        el.dataset.key = st.key;
        el.hidden = true;
        let html = '<h3 class="display wz-h">' + esc(st.title) + '</h3>';
        if (st.sub) html += '<p class="wz-sub">' + esc(st.sub) + '</p>';
        html += '<p class="pp-inc" data-inc hidden></p>';
        html += '<div class="pp-body" data-body></div>';
        if (st.ask && st.ask.length) {
            html += '<div class="pp-asks" role="group" aria-label="Ask Eric to quote">';
            st.ask.forEach((a) => {
                html += '<button type="button" class="pp-opt pp-opt--ask" data-ask="' + esc(a.id) + '" aria-pressed="false"><span class="pp-name">' + esc(a.label) + '</span><span class="pp-note">' + esc(a.note || 'Eric quotes this to your truck.') + '</span><span class="pp-price">Quoted</span></button>';
            });
            html += '</div>';
        }
        if (st.offroad) html += '<p class="pp-warn">' + esc(offroadText) + '</p>';
        if (st.key !== 'truck') html += '<p class="fine pp-skip">Not interested in this step? Tap Next.</p>';
        el.innerHTML = html;
        head.appendChild(el);
        stepEls.push(el);
    });

    // truck + summary shells
    const truckEl = document.createElement('div');
    truckEl.className = 'wz-step';
    truckEl.dataset.title = 'Your truck';
    truckEl.hidden = true;
    truckEl.innerHTML = '<h3 class="display wz-h">What do you drive?</h3><p class="wz-sub">So Eric can check the fit before anything ships or gets installed.</p>' +
        '<div class="wz-fields pp-fields"><label class="wz-field"><span>Year</span><select id="pp-year">' + C.years.map((y) => '<option>' + y + '</option>').join('') + '</select></label>' +
        '<label class="wz-field"><span>Truck</span><select id="pp-model">' + C.models.map((m) => '<option>' + esc(m) + '</option>').join('') + '</select></label>' +
        '<label class="wz-field"><span>Anything else we should know</span><input id="pp-notes" type="text" autocomplete="off" placeholder="Tires, towing, what is already on it"></label></div>';
    head.appendChild(truckEl);

    const sumEl = document.createElement('div');
    sumEl.className = 'wz-step';
    sumEl.dataset.title = 'Your package';
    sumEl.hidden = true;
    sumEl.innerHTML = '<h3 class="display wz-h">Your package.</h3>' +
        '<p class="wz-sub" id="pp-vehicle"></p>' +
        '<ul class="recap pp-recap" id="pp-list"></ul>' +
        '<p class="pp-total"><span>Parts total</span><b id="pp-total">$0</b><i id="pp-count"></i></p>' +
        '<p class="fine" id="pp-askline" hidden></p>' +
        '<p class="pp-warn" id="pp-warn" hidden>' + esc(offroadText) + '</p>' +
        '<p class="fine">Prices are in CAD and come from our store. Parts ship across Canada and to the US. Duties, tariffs and taxes outside Canada are the buyer\'s. Eric checks the fit before your order ships.</p>' +
        '<div class="btns"><button type="button" class="btn btn-primary" id="pp-cart">Add parts to cart</button>' +
        '<a class="btn btn-ghost" id="pp-quote" href="/contact/?form=build&service=Custom%20Tuning#form">Book the install or get a quote</a>' +
        '<button type="button" class="btn btn-ghost" id="pp-restart">Start over</button></div>' +
        '<p class="fine" id="pp-msg" role="status" aria-live="polite"></p>';
    head.appendChild(sumEl);

    // ---------- fill options from the catalog ----------
    // "2011-2026 Ford Powerstroke 6.7L - Polar - 4\" Exhaust" -> "4\" Exhaust": drop the leading year/engine segment and the Polar tag
    function clean(t) {
        const a = String(t).split(' - ');
        if (a.length > 1 && /^\d{4}/.test(a[0])) a.shift();
        if (a.length > 1 && a[0] === 'Polar') a.shift();
        return a.join(' - ');
    }
    function byHandle(h) { return (window.storeCatalog || []).find((p) => p.handle === h); }

    function optButton(id, name, note, priceText, off) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pp-opt';
        b.dataset.opt = id;
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="pp-name">' + esc(name) + '</span>' + (note ? '<span class="pp-note">' + esc(note) + '</span>' : '') +
            (off ? '<span class="pp-tag">Off-road use only</span>' : '') + '<span class="pp-price">' + priceText + '</span>';
        return b;
    }

    function fill() {
        items = {};
        C.steps.forEach((st, si) => {
            const body = stepEls[si].querySelector('[data-body]');
            body.textContent = '';
            let any = false;
            (st.groups || []).forEach((g, gi) => {
                const wrap = document.createElement('div');
                wrap.className = 'pp-group';
                let n = 0;
                g.options.forEach((o, oi) => {
                    const p = byHandle(o.h);
                    if (!p) return;
                    const vs = o.variants && p.variants && p.variants.length > 1 ? p.variants : [null];
                    vs.forEach((v, vi) => {
                        const id = st.key + '.' + gi + '.' + oi + '.' + vi;
                        const price = v ? v.price : p.price;
                        const name = o.label || (v ? v.title : clean(p.name));
                        const fullName = v ? (o.label || clean(p.name)) + ' - ' + v.title : (o.label || clean(p.name));
                        items[id] = { id, stepKey: st.key, svc: st.svc, off: !!o.off, inc: o.inc || [], label: fullName, price, product: p, variant: v };
                        wrap.appendChild(optButton(id, v ? v.title : name, v ? (o.label || clean(p.name)) : o.note, money(price), o.off));
                        n++;
                    });
                });
                if (n) {
                    if (g.label) { const h = document.createElement('h4'); h.className = 'pp-glabel'; h.textContent = g.label; body.appendChild(h); }
                    body.appendChild(wrap);
                    any = true;
                }
            });
            if (!any && !(st.ask && st.ask.length)) {
                const m = document.createElement('p');
                m.className = 'wz-sub';
                m.textContent = 'Eric quotes this step to your truck. Tap Next and add it to your request at the end.';
                body.appendChild(m);
            }
        });
        restore();
    }

    // ---------- selection ----------
    function stepOf(key) { return C.steps.find((s) => s.key === key); }
    function includedIn(key) {
        for (const k in S.picks) for (const it of S.picks[k]) if (it.inc.includes(key)) return it;
        return null;
    }
    function paint() {
        root.querySelectorAll('[data-opt]').forEach((b) => {
            const it = items[b.dataset.opt];
            const on = !!(it && (S.picks[it.stepKey] || []).some((x) => x.id === it.id));
            b.setAttribute('aria-pressed', on);
            b.disabled = !!(it && includedIn(it.stepKey));
        });
        root.querySelectorAll('[data-ask]').forEach((b) => b.setAttribute('aria-pressed', !!S.asks[b.dataset.ask]));
        stepEls.forEach((el) => {
            const k = el.dataset.key, inc = includedIn(k), msg = el.querySelector('[data-inc]');
            msg.hidden = !inc;
            if (inc) msg.textContent = 'Already included in your ' + inc.label + '.';
        });
    }
    function toggle(id) {
        const it = items[id];
        if (!it || includedIn(it.stepKey)) return;
        const st = stepOf(it.stepKey);
        const cur = S.picks[it.stepKey] || [];
        const has = cur.some((x) => x.id === id);
        let next;
        if (st.mode === 'many') next = has ? cur.filter((x) => x.id !== id) : cur.concat(it);
        else next = has ? [] : [it];
        S.picks[it.stepKey] = next;
        // a package that includes a later step clears anything already chosen there
        next.forEach((x) => x.inc.forEach((k) => { S.picks[k] = []; }));
        paint(); save();
    }
    function save() {
        try { sessionStorage.setItem('ppState:' + C.slug, JSON.stringify({ picks: Object.fromEntries(Object.entries(S.picks).map(([k, v]) => [k, v.map((x) => x.id)])), asks: S.asks, truck: S.truck })); } catch (e) { /* storage unavailable */ }
    }
    function restore() {
        try {
            const r = JSON.parse(sessionStorage.getItem('ppState:' + C.slug) || 'null');
            if (!r) return;
            S.picks = {};
            Object.entries(r.picks || {}).forEach(([k, ids]) => { S.picks[k] = ids.map((i) => items[i]).filter(Boolean); });
            S.asks = r.asks || {};
            Object.assign(S.truck, r.truck || {});
            ['year', 'model', 'notes'].forEach((f) => { const e = document.getElementById('pp-' + f); if (e && S.truck[f]) e.value = S.truck[f]; });
        } catch (e) { /* ignore */ }
        paint();
    }

    root.addEventListener('click', (e) => {
        const o = e.target.closest('[data-opt]');
        if (o) { toggle(o.dataset.opt); return; }
        const a = e.target.closest('[data-ask]');
        if (a) {
            const id = a.dataset.ask;
            if (S.asks[id]) delete S.asks[id]; else S.asks[id] = a.querySelector('.pp-name').textContent;
            paint(); save();
        }
    });
    ['year', 'model', 'notes'].forEach((f) => {
        const e = document.getElementById('pp-' + f);
        e.addEventListener('input', () => { S.truck[f] = e.value; save(); });
        S.truck[f] = e.value;
    });

    // ---------- summary ----------
    function chosen() { return Object.values(S.picks).reduce((a, v) => a.concat(v), []); }
    function summary() {
        const list = chosen();
        const ul = document.getElementById('pp-list');
        ul.textContent = '';
        let total = 0;
        list.forEach((it) => {
            total += it.price;
            const li = document.createElement('li');
            const a = document.createElement('span'); a.textContent = it.label;
            const b = document.createElement('b'); b.textContent = money(it.price);
            li.append(a, b); ul.appendChild(li);
        });
        Object.values(S.asks).forEach((l) => {
            const li = document.createElement('li');
            const a = document.createElement('span'); a.textContent = l;
            const b = document.createElement('b'); b.textContent = 'Quoted';
            li.append(a, b); ul.appendChild(li);
        });
        document.getElementById('pp-total').textContent = money(total);
        document.getElementById('pp-count').textContent = list.length + (list.length === 1 ? ' part' : ' parts');
        const veh = S.truck.year + ' ' + C.make + ' ' + S.truck.model + ' ' + C.engine;
        document.getElementById('pp-vehicle').textContent = veh;
        const asks = Object.values(S.asks);
        const ak = document.getElementById('pp-askline');
        ak.hidden = !asks.length;
        ak.textContent = asks.length ? 'Eric will quote: ' + asks.join(', ') + '. Send your request and he will price them to your truck.' : '';
        document.getElementById('pp-warn').hidden = !(list.some((i) => i.off) || list.some((i) => i.stepKey === 'tune'));
        document.getElementById('pp-cart').disabled = !list.length;
        document.getElementById('pp-cart').textContent = list.length ? 'Add ' + list.length + (list.length === 1 ? ' part' : ' parts') + ' to cart' : 'Pick a part to add to cart';
        if (!list.length && !asks.length) ul.innerHTML = '<li><span>Nothing chosen yet. Go back and pick what you want.</span></li>';

        const svcs = [...new Set(list.map((i) => i.svc).concat(Object.keys(S.asks).map((k) => (C.askSvc || {})[k])).filter(Boolean))];
        const first = svcs[0] || 'Custom Tuning';
        const text = veh + ' | ' + list.map((i) => i.label).concat(asks).join('; ');
        if (window.labHandoff) {
            if (list.length || asks.length) window.labHandoff(first, text, { service: svcs.length ? svcs : [first] }, list.length ? { total: 'Parts ' + money(total) + ' CAD', lines: list.map((i) => ({ label: i.label, price: money(i.price) })) } : null);
            else window.labHandoff(first, '');
        }
        document.getElementById('pp-quote').href = '/contact/?form=build&service=' + encodeURIComponent(svcs.length ? svcs.join(',') : first) + '&intent=quote#form';
    }
    root.addEventListener('wz:enter', (e) => { if (e.detail.step === sumEl) summary(); });

    document.getElementById('pp-cart').addEventListener('click', () => {
        const list = chosen();
        const msg = document.getElementById('pp-msg');
        if (typeof window.addToCart !== 'function') { msg.textContent = 'The cart is still loading. Try again in a moment.'; return; }
        list.forEach((it) => {
            const v = it.variant && it.variant.title && it.variant.title !== 'Default Title' ? it.variant : null;
            window.addToCart(it.product.id, 1, { 'Power Package': C.platform }, v);
        });
        msg.textContent = list.length + (list.length === 1 ? ' part' : ' parts') + ' added to your cart.';
    });
    document.getElementById('pp-restart').addEventListener('click', () => {
        S.picks = {}; S.asks = {}; save(); paint();
        if (window.labHandoff) window.labHandoff('Custom Tuning', '');
        root.dispatchEvent(new CustomEvent('wz:goto', { detail: 0 }));
    });

    // ---------- catalog ----------
    fill();
    let tries = 0;
    (function wait() {
        if ((window.storeCatalog || []).length) { fill(); const ld = root.querySelector('[data-pp-loading]'); if (ld) ld.hidden = true; return; }
        if (++tries > 100) { const ld = root.querySelector('[data-pp-loading]'); if (ld) ld.textContent = 'The parts list did not load. Refresh, or call (250) 261-9502.'; return; }
        setTimeout(wait, 150);
    })();
})();
