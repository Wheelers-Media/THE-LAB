// Product page: step-by-step configurator.
// Presentation layer only. store.js still renders the form and still validates everything on Add to Cart.
// This script shows one existing block at a time (hides the rest with .pdp-off), gates "Next" with rules that are
// never stricter than the add-to-cart rules in store.js, and shows a read-only review before the Add button.
// If anything throws, the full form is restored.
(function () {
    const root = document.getElementById('pdp-container');
    if (!root) return;

    const $ = (id) => document.getElementById(id);
    const val = (id) => (($(id) || {}).value || '').trim();
    const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

    // field blocks store.js can render, in page order: [id, title, "ready to continue?", "can skip when empty?"]
    const BLOCKS = [
        ['pdp-tune-level-wrap', 'Choose your power level', () => !!root.querySelector('.pdp-tune-card[aria-pressed="true"]')],
        ['pdp-transmission-wrap', 'Transmission strategy', null, () => !val('pdp-transmission')],
        ['pdp-hardware-wrap', 'Your tuning device', null],
        ['pdp-sct-wrap', 'Your SCT device', () => !!val('pdp-sct-ecu')],
        ['pdp-gdp-wrap', 'Your GDP device', () => !!val('pdp-gdp-ecu')],
        ['pdp-vin-wrap', 'Your VIN', () => val('pdp-vin-input').toUpperCase().length === 17],
        ['pdp-efi-wrap', 'Your EFI Live device', () => !!val('pdp-efi-serial') && val('pdp-efi-auth').length === 20],
        ['pdp-credit-wrap', 'Device serial number', () => !!val('pdp-credit-serial')],
        ['pdp-serial-wrap', 'Device serial number', null, () => !val('pdp-serial-input')],
        ['pdp-mods-wrap', 'Your modifications', null, () => !val('pdp-mods-input')],
        ['pdp-tcm-feel-wrap', 'How should it shift?', () => !!val('pdp-tcm-feel')],
    ];

    let state = { key: null };
    let ui = null;
    let queued = false;
    let dead = false;

    function build() {
        const qtyIn = $('pdp-qty-input');
        if (!$('pdp-add-btn') || !qtyIn) return false;
        const qtyRow = qtyIn.closest('.flex.flex-col.gap-3');
        if (!qtyRow) return false;

        const fields = [];
        BLOCKS.forEach(([id, title, ok, skip]) => {
            const el = $(id);
            if (el) fields.push({ key: id, el, title, ok, skip, els: [el], live: () => !el.classList.contains('hidden') });
        });
        const g = $('pdp-gridiron-wrap');
        if (g) {
            const kids = [...g.querySelector('.space-y-4').children];
            fields.push({ key: 'grid-a', title: 'Your truck', els: [g, kids[0], kids[1]], live: () => true,
                ok: () => !!val('gridiron-yymm') && val('gridiron-vin').length >= 11 });
            fields.push({ key: 'grid-b', title: 'Finish and colours', els: [g].concat(kids.slice(2)), live: () => true,
                ok: () => !!val('gridiron-finish') });
        }
        if (fields.length < 2) return false; // one field or none: the plain form is already short

        const finalEls = [];
        const gate = $('pdp-compliance-gate');
        if (gate) finalEls.push(gate);
        root.querySelectorAll('.upsell-checkbox').forEach((c) => { const b = c.closest('.mb-5'); if (b) finalEls.push(b); });
        finalEls.push(qtyRow);
        const pickup = qtyRow.nextElementSibling;
        if (pickup && pickup.classList.contains('mt-8')) finalEls.push(pickup);

        const head = document.createElement('div');
        head.className = 'pdp-steps-head';
        head.tabIndex = -1;
        head.innerHTML = '<p class="pdp-steps-count" aria-live="polite"></p><h2 class="pdp-steps-title"></h2><div class="pdp-bar" aria-hidden="true"><i></i></div>';
        const nav = document.createElement('div');
        nav.className = 'pdp-steps-nav';
        nav.innerHTML = '<button type="button" class="pdp-back">Back</button><button type="button" class="pdp-next">Next</button>';
        const recap = document.createElement('ul');
        recap.className = 'pdp-recap';

        const first = fields[0].els[0];
        first.parentNode.insertBefore(head, first);
        finalEls[0].parentNode.insertBefore(recap, finalEls[0]);
        finalEls.unshift(recap);

        ui = { head, nav, recap, fields, finalUnit: { key: 'final', title: 'Review and add to cart', els: finalEls, live: () => true, ok: () => true } };

        nav.querySelector('.pdp-back').addEventListener('click', () => go(-1));
        nav.querySelector('.pdp-next').addEventListener('click', () => go(1));
        ['input', 'change', 'click'].forEach((t) => root.addEventListener(t, schedule, true));
        new MutationObserver(schedule).observe(root, { subtree: true, attributes: true, attributeFilter: ['class'] });
        $('pdp-add-btn').addEventListener('click', () => setTimeout(routeErrors, 80));
        return true;
    }

    const units = () => ui.fields.filter((u) => u.live()).concat([ui.finalUnit]);

    function schedule() { if (queued || dead) return; queued = true; requestAnimationFrame(() => { queued = false; try { render(); } catch (e) { bail(e); } }); }

    function go(step) {
        const list = units();
        const i = Math.max(0, Math.min(list.length - 1, list.findIndex((u) => u.key === state.key) + step));
        state.key = list[i].key;
        render();
        ui.head.scrollIntoView({ block: 'start', behavior: calm() ? 'auto' : 'smooth' });
        ui.head.focus({ preventScroll: true });
    }

    function setOff(el, off) { if (el.classList.contains('pdp-off') !== off) el.classList.toggle('pdp-off', off); }

    function render() {
        const list = units();
        let i = list.findIndex((u) => u.key === state.key);
        if (i < 0) { i = 0; state.key = list[0].key; }
        const u = list[i];
        const all = new Set();
        list.forEach((x) => x.els.forEach((e) => all.add(e)));
        all.forEach((e) => setOff(e, !u.els.includes(e)));

        const last = i === list.length - 1;
        ui.head.querySelector('.pdp-steps-count').textContent = 'Step ' + (i + 1) + ' of ' + list.length;
        ui.head.querySelector('.pdp-steps-title').textContent = u.title;
        ui.head.querySelector('.pdp-bar i').style.transform = 'scaleX(' + ((i + 1) / list.length) + ')';

        const back = ui.nav.querySelector('.pdp-back'), next = ui.nav.querySelector('.pdp-next');
        back.hidden = i === 0;
        next.hidden = last;
        next.disabled = !(!u.ok || u.ok());
        next.textContent = u.skip && u.skip() ? 'Skip' : 'Next';
        // Back/Next sit right under the visible block; on the review step Back sits above it
        if (last) {
            if (ui.nav.nextElementSibling !== u.els[0]) u.els[0].parentNode.insertBefore(ui.nav, u.els[0]);
        } else {
            const anchor = u.els[u.els.length - 1];
            if (ui.nav.previousElementSibling !== anchor) anchor.parentNode.insertBefore(ui.nav, anchor.nextSibling);
        }
        if (last) fillRecap();
    }

    function fillRecap() {
        const rows = [];
        const add = (label, v) => { if (v) rows.push([label, v]); };
        const card = root.querySelector('.pdp-tune-card[aria-pressed="true"]');
        if (card) add('Power level', (card.querySelector('p') || card).textContent.trim());
        const tr = $('pdp-transmission'); if (tr && tr.value) add('Transmission', tr.options[tr.selectedIndex].text);
        const hw = root.querySelector('input[name="pdp-hardware"]:checked');
        if (hw) { const lab = hw.closest('label'); const p = lab && lab.querySelector('p'); add('Device', p && p.textContent.trim()); }
        add('SCT ECU code', val('pdp-sct-ecu')); add('SCT TCU code', val('pdp-sct-tcu'));
        add('GDP ECU serial', val('pdp-gdp-ecu')); add('GDP TCU serial', val('pdp-gdp-tcu'));
        add('VIN', val('pdp-vin-input').toUpperCase());
        add('EFI serial', val('pdp-efi-serial')); add('Credit serial', val('pdp-credit-serial')); add('Device serial', val('pdp-serial-input'));
        add('Modifications', val('pdp-mods-input'));
        const tf = $('pdp-tcm-feel'); if (tf && tf.value) add('Shift feel', tf.options[tf.selectedIndex].text);
        add('Vehicle', val('gridiron-yymm')); add('VIN (bumper)', val('gridiron-vin').toUpperCase()); add('Finish', val('gridiron-finish'));
        add('Main colour', val('gridiron-color-main')); add('Center colour', val('gridiron-color-center')); add('D-ring colour', val('gridiron-color-dring'));
        ui.recap.textContent = '';
        rows.forEach(([l, v]) => {
            const li = document.createElement('li');
            const a = document.createElement('span'); a.textContent = l;
            const b = document.createElement('b'); b.textContent = String(v).trim();
            li.append(a, b);
            ui.recap.appendChild(li);
        });
        ui.recap.hidden = rows.length === 0;
    }

    // Add to Cart failed validation inside a hidden block: take the customer to it
    function routeErrors() {
        try {
            for (const u of units()) {
                const bad = u.els.some((e) => e.querySelector && (e.querySelector('[role="alert"]:not(.hidden)') || e.querySelector('input[style*="239, 68, 68"],select[style*="239, 68, 68"]')));
                if (bad && u.key !== state.key) { state.key = u.key; render(); ui.head.scrollIntoView({ block: 'start' }); return; }
            }
        } catch (e) { bail(e); }
    }

    function bail(e) {
        console.warn('[pdp-steps] showing the full form instead', e);
        dead = true;
        root.querySelectorAll('.pdp-off').forEach((el) => el.classList.remove('pdp-off'));
        if (ui) { ui.head.remove(); ui.nav.remove(); ui.recap.remove(); }
        ['input', 'change', 'click'].forEach((t) => root.removeEventListener(t, schedule, true));
    }

    function start() {
        try { if (build()) render(); } catch (e) { bail(e); }
    }

    // store.js renders the product after the catalog loads; wait for its Add button, then run once
    if ($('pdp-add-btn')) start();
    else {
        const mo = new MutationObserver(() => { if ($('pdp-add-btn')) { mo.disconnect(); start(); } });
        mo.observe(root, { childList: true, subtree: true });
    }
})();
