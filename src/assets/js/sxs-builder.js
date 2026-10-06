// SxS tint walkthrough: choose film -> optional sun-strip -> your price. Starting-at prices live in data attributes on the cards.
(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const root = $('[data-wz]');
    if (!root || !$('[data-sxs-film]')) return;

    const S = { film: 'ceramic', brow: false };
    const cur = () => { try { return localStorage.getItem('theLab_currency') === 'USD' ? 'USD' : 'CAD'; } catch (e) { return 'CAD'; } };
    const money = (n, c) => '$' + (((c || cur()) === 'USD') ? Math.round(n * 0.74) : n).toLocaleString('en-CA') + ' ' + ((c || cur()) === 'USD' ? 'USD' : 'CAD');
    const card = () => $('[data-sxs-film="' + S.film + '"]');
    const browEl = $('#sxs-brow');
    const lo = () => +card().dataset.price;
    const brow = () => ({ lo: +browEl.dataset.lo, hi: +browEl.dataset.hi });

    function render() {
        $$('[data-sxs-film]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.sxsFilm === S.film)));
        $$('[data-sxs-brow]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.sxsBrow === '1') === S.brow)));
        const name = $('.film-name', card()).textContent.trim();
        $('#rc-film').textContent = name;
        $('#rc-brow').textContent = S.brow ? 'Added' : 'Not added';
        const lines = [{ label: name, txt: 'from ' + money(lo()) }];
        let total = lo();
        if (S.brow) { const b = brow(); lines.push({ label: 'Windshield sun-strip (visor brow)', txt: money(b.lo) + ' to ' + money(b.hi) }); total += b.lo; }
        $('#est-lines').innerHTML = lines.map((l) => '<li><span>' + l.label + '</span><span class="price">' + l.txt + '</span></li>').join('');
        $('#est-total').textContent = 'from ' + money(total);
        window.labHandoff('Window Tinting', 'SxS: ' + name + ' film' + (S.brow ? ' + sun-strip' : '') + '. Estimate from ' + money(total, 'CAD'), {
            tint_pref: 'Off-Road SxS & Equipment Film',
            category: 'Side-by-Side (SxS) / Off-Road',
        });
    }

    $$('[data-sxs-film]').forEach((c) => {
        const pick = () => { S.film = c.dataset.sxsFilm; render(); };
        c.addEventListener('click', pick);
        c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    $$('[data-sxs-brow]').forEach((b) => b.addEventListener('click', () => { S.brow = b.dataset.sxsBrow === '1'; render(); }));
    $('#wz-restart').addEventListener('click', () => { S.film = 'ceramic'; S.brow = false; render(); root.dispatchEvent(new CustomEvent('wz:goto', { detail: 0 })); });
    const orig = window.setCurrency;
    if (orig) window.setCurrency = function (c) { orig(c); render(); };
    render();
})();
