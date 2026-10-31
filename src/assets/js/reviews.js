// Google reviews section. tools/build_reviews.mjs writes /assets/data/reviews.json on each deploy
// (real rating, count and reviews from Google). This renders it into any [data-reviews] section.
// If the file is missing or malformed, the static fallback markup inside the section stays as it is.
// Review text is set with textContent, exactly as Google returned it.
(function () {
    var roots = document.querySelectorAll('[data-reviews]');
    if (!roots.length) return;

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    function stars(rating, cls) {
        var wrap = el('span', 'rv-stars' + (cls ? ' ' + cls : ''));
        wrap.setAttribute('role', 'img');
        wrap.setAttribute('aria-label', rating + ' out of 5 stars');
        for (var i = 1; i <= 5; i++) {
            var s = el('span', 'rv-star' + (rating >= i - 0.25 ? ' is-on' : ''), '★');
            s.setAttribute('aria-hidden', 'true');
            wrap.appendChild(s);
        }
        return wrap;
    }

    function link(href, cls, text, label) {
        var a = el('a', cls, text);
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        if (label) a.setAttribute('aria-label', label);
        return a;
    }

    function safeUrl(u) {
        return typeof u === 'string' && /^https:\/\//.test(u) ? u : '';
    }

    function card(r) {
        var c = el('article', 'rv-card');
        var head = el('div', 'rv-who');

        var avatar = el('span', 'rv-avatar', (r.author || '?').charAt(0).toUpperCase());
        avatar.setAttribute('aria-hidden', 'true');
        var photo = safeUrl(r.photo);
        if (photo) {
            var img = new Image();
            img.alt = '';
            img.width = 44;
            img.height = 44;
            img.loading = 'lazy';
            img.referrerPolicy = 'no-referrer';
            img.onload = function () { avatar.textContent = ''; avatar.appendChild(img); };
            img.src = photo;
        }
        head.appendChild(avatar);

        var meta = el('div', 'rv-meta');
        var name = el('p', 'rv-name');
        var authorUrl = safeUrl(r.authorUrl);
        if (authorUrl) name.appendChild(link(authorUrl, 'rv-name-link', r.author));
        else name.textContent = r.author;
        meta.appendChild(name);
        if (r.when) meta.appendChild(el('p', 'rv-when', r.when));
        head.appendChild(meta);
        c.appendChild(head);

        c.appendChild(stars(r.rating));
        c.appendChild(el('blockquote', 'rv-text', r.text));

        var src = el('p', 'rv-src');
        var reviewUrl = safeUrl(r.url);
        if (reviewUrl) src.appendChild(link(reviewUrl, 'rv-src-link', 'Read on Google', 'Read ' + r.author + "'s review on Google"));
        else src.textContent = 'Google review';
        c.appendChild(src);
        return c;
    }

    function render(root, d) {
        var heading = root.querySelector('h2');
        var reviewsUrl = safeUrl(d.reviewsUrl);
        var writeUrl = safeUrl(d.writeUrl);

        var panel = el('div', 'rv-panel');
        var score = el('div', 'rv-score');
        score.appendChild(el('p', 'rv-num display', d.rating.toFixed(1)));
        score.appendChild(stars(d.rating, 'rv-stars--lg'));
        score.appendChild(el('p', 'rv-count', d.count + (d.count === 1 ? ' Google review' : ' Google reviews')));
        panel.appendChild(score);

        var cta = el('div', 'rv-cta btns');
        if (reviewsUrl) cta.appendChild(link(reviewsUrl, 'btn btn-primary', 'Read all reviews on Google'));
        if (writeUrl) cta.appendChild(link(writeUrl, 'btn btn-ghost', 'Leave a review'));
        panel.appendChild(cta);

        var list = el('div', 'rv-list');
        d.reviews.forEach(function (r) { list.appendChild(card(r)); });

        var attrib = el('p', 'rv-attrib', 'Ratings and reviews from Google.');

        root.textContent = '';
        if (heading) root.appendChild(heading);
        var grid = el('div', 'rv-grid');
        grid.appendChild(panel);
        grid.appendChild(list);
        root.appendChild(grid);
        root.appendChild(attrib);
        root.classList.add('is-live');
    }

    fetch('/assets/data/reviews.json', { cache: 'no-cache' })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (d) {
            if (!d || !(d.rating > 0) || !(d.count > 0) || !Array.isArray(d.reviews) || !d.reviews.length) return;
            roots.forEach(function (root) { render(root, d); });
        })
        .catch(function () { /* keep the static fallback */ });
})();
