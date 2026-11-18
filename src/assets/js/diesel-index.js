(function () {
    // /diesel/?show=a,b keeps only those trucks (sent from the truck selector when the engine has several years).
    var show = new URLSearchParams(location.search).get('show');
    if (!show) return;
    var keep = show.split(',');
    var tiles = document.querySelectorAll('.dx-row');
    var shown = 0;
    tiles.forEach(function (t) {
        var slug = (t.getAttribute('href') || '').split('/').filter(Boolean).pop();
        if (keep.indexOf(slug) === -1) t.hidden = true; else shown++;
    });
    if (!shown) { tiles.forEach(function (t) { t.hidden = false; }); return; }
    document.querySelectorAll('.dx-brand').forEach(function (b) {
        if (b.querySelector('.dx-row:not([hidden])')) return;
        b.hidden = true;
        var chip = document.querySelector('.dx-pick[data-brand="' + b.getAttribute('data-brand') + '"]');
        if (chip) chip.hidden = true;
    });
    var note = document.createElement('p');
    note.className = 'db-hint';
    note.innerHTML = 'Showing the power packages for your truck. Pick your year. <a href="/diesel/">Show all trucks</a>';
    var picker = document.querySelector('.dx-picker');
    if (picker) picker.parentNode.insertBefore(note, picker.nextSibling);
})();
