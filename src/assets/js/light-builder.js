// Lighting walkthrough: pick what you want -> your vehicle -> your plan (quote request). No prices: lighting is quoted to the vehicle.
(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const root = $('[data-wz]');
    if (!root || !$('#light-picks')) return;

    const cards = $$('.light-card');
    const sel = new Set();
    const f = { year: $('#lv-year'), make: $('#lv-make'), model: $('#lv-model') };
    const name = (c) => $('.light-name', c).textContent.trim();
    const vehicle = () => [f.year.value, f.make.value, f.model.value].map((x) => x.trim()).filter(Boolean).join(' ');

    function render() {
        cards.forEach((c) => {
            const on = sel.has(c.dataset.pick);
            c.setAttribute('data-on', String(on));
            const b = $('.light-add', c);
            b.setAttribute('aria-pressed', String(on));
            b.textContent = on ? 'Added to my plan' : 'Add to my plan';
        });
        const chosen = cards.filter((c) => sel.has(c.dataset.pick));
        $('#light-count').textContent = chosen.length ? chosen.length + (chosen.length === 1 ? ' upgrade selected' : ' upgrades selected') : 'Nothing selected yet';
        const i = root.wz ? root.wz.index : 0;
        if (i === 0) root.wz && root.wz.setNext(chosen.length > 0);
        if (i === 1) root.wz && root.wz.setNext(!!(f.year.value.trim() && f.make.value.trim() && f.model.value.trim()));
        $('#rc-wish').innerHTML = chosen.map((c) => '<li>' + name(c) + '</li>').join('');
        $('#rc-veh').textContent = vehicle();
        try {
            const FORM_OPT = { morimoto: 'Morimoto Headlight/Taillight Assemblies', offroad: 'Off-Road & Auxiliary (Baja Designs / BMC)', accent: 'Accent & Replacement Bulbs (Diode Dynamics)', starlight: 'Starlight Headliner Installation' };
            window.labHandoff('Custom Lighting', chosen.length ? chosen.map(name).join('; ') + (vehicle() ? ' | Vehicle: ' + vehicle() : '') : '', { lighting: chosen.map((c) => FORM_OPT[c.dataset.pick]) });
            sessionStorage.setItem('labVehicle', JSON.stringify({ year: f.year.value.trim(), make: f.make.value.trim(), model: f.model.value.trim() }));
        } catch (e) { /* storage unavailable */ }
    }

    cards.forEach((c) => {
        const toggle = () => { sel.has(c.dataset.pick) ? sel.delete(c.dataset.pick) : sel.add(c.dataset.pick); render(); };
        // tapping the card toggles it; the Add button inside is the keyboard and screen reader control (its click bubbles here)
        c.addEventListener('click', (e) => { if (e.target.closest('details, summary')) return; toggle(); });
    });
    Object.keys(f).forEach((k) => f[k].addEventListener('input', render));
    $('#wz-restart').addEventListener('click', () => { sel.clear(); Object.keys(f).forEach((k) => (f[k].value = '')); render(); root.dispatchEvent(new CustomEvent('wz:goto', { detail: 0 })); });
    root.addEventListener('wz:enter', render);
    render();
})();
