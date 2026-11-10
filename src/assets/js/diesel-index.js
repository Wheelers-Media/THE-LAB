(function () {
    // /diesel/?show=a,b keeps only those trucks (sent from the truck selector when the engine has several years).
    var show = new URLSearchParams(location.search).get('show');
    if (!show) return;
    var keep = show.split(',');
    var tiles = document.querySelectorAll('.db-plat');
    var shown = 0;
    tiles.forEach(function (t) {
        var slug = (t.getAttribute('href') || '').split('/').filter(Boolean).pop();
        if (keep.indexOf(slug) === -1) t.hidden = true; else shown++;
    });
    if (!shown) { tiles.forEach(function (t) { t.hidden = false; }); return; }
    document.querySelectorAll('.db-plats').forEach(function (g) {
        if (!g.querySelector('.db-plat:not([hidden])')) { g.hidden = true; if (g.previousElementSibling && g.previousElementSibling.classList.contains('db-grp')) g.previousElementSibling.hidden = true; }
    });
    var note = document.createElement('p');
    note.className = 'db-hint';
    note.innerHTML = 'Showing the power packages for your truck. Pick your year. <a href="/diesel/">Show all trucks</a>';
    var first = document.querySelector('.db-grp:not([hidden])');
    if (first) first.parentNode.insertBefore(note, first);
})();
