// Step-by-step walkthrough engine used on the service pages.
// Markup: <section data-wz> with .wz-step children plus [data-wz-back] / [data-wz-next] buttons and optional
// [data-wz-bar] (progress), [data-wz-n], [data-wz-total], [data-wz-title]. Fires "wz:enter" on the section each time a step is shown.
(function () {
    const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hands a walkthrough's choices to the booking form (intake.js reads sessionStorage.labForm).
    // set = { formFieldId: 'option label' | ['option label', ...] }. est = { total: 'from $379 CAD', lines: [{ label, price }] } is the price shown on the form. An empty summary clears this service's hand-off.
    window.labHandoff = function (service, summary, set, est) {
        try {
            const old = JSON.parse(sessionStorage.getItem('labForm') || 'null');
            if (summary) sessionStorage.setItem('labForm', JSON.stringify({ service, summary, set, est: est || null, url: location.pathname + '#build' }));
            else if (old && old.service === service) sessionStorage.removeItem('labForm');
        } catch (e) { /* storage unavailable */ }
    };

    document.querySelectorAll('[data-wz]').forEach((root) => {
        const steps = [...root.querySelectorAll('.wz-step')];
        const back = root.querySelector('[data-wz-back]');
        const next = root.querySelector('[data-wz-next]');
        const bar = root.querySelector('[data-wz-bar]');
        const n = root.querySelector('[data-wz-n]');
        const total = root.querySelector('[data-wz-total]');
        const title = root.querySelector('[data-wz-title]');
        let i = 0;

        function go(k, byUser) {
            i = Math.max(0, Math.min(steps.length - 1, k));
            steps.forEach((s, j) => { s.hidden = j !== i; });
            if (bar) bar.style.transform = 'scaleX(' + ((i + 1) / steps.length) + ')';
            if (n) n.textContent = i + 1;
            if (total) total.textContent = steps.length;
            if (title) title.textContent = steps[i].dataset.title || '';
            root.toggleAttribute('data-last', i === steps.length - 1);
            if (back) back.hidden = i === 0;
            if (next) { next.hidden = i === steps.length - 1; next.disabled = false; }
            root.dispatchEvent(new CustomEvent('wz:enter', { detail: { index: i, step: steps[i] } }));
            if (byUser) {
                root.scrollIntoView({ block: 'start', behavior: calm() ? 'auto' : 'smooth' });
                const h = steps[i].querySelector('.wz-h');
                if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
            }
        }

        if (next) next.addEventListener('click', () => go(i + 1, true));
        if (back) back.addEventListener('click', () => go(i - 1, true));
        root.addEventListener('wz:goto', (e) => go(e.detail, true));
        root.wz = { go, get index() { return i; }, setNext(on) { if (next) next.disabled = !on; } };
        go(0, false);
    });
})();
