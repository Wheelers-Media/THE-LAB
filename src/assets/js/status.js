// Customer job status page (/status/?t=<token>). Reads the CRM's job_status function and shows where the job is,
// the drop-off time, the services and what is due. Everything from the server is added as text, never as HTML.
(function () {
    'use strict';
    var API = 'https://mxoqwwdpclfkoydfofug.supabase.co/functions/v1/job_status';
    var SHOP_TEL = '(250) 261-9502';
    var STEPS = ['Booked', 'In the shop', 'Ready for pickup', 'Picked up'];
    var INDEX = { received: -1, booked: 0, in_shop: 1, ready: 2, picked_up: 3 };

    var root = document.getElementById('status-root');
    if (!root) return;

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }
    function money(n) { return n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }); }
    function when(iso) {
        return new Date(iso).toLocaleString('en-CA', {
            timeZone: 'America/Dawson_Creek', weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
        }) + ' (Fort St. John time)';
    }
    function headline(s) {
        if (s.step === 'received') return 'We have your request';
        if (s.step === 'booked') return "You're booked in";
        if (s.step === 'in_shop') return s.waitingOnParts ? 'In the shop, waiting on parts' : 'Your vehicle is in the shop';
        if (s.step === 'ready') return 'Ready for pickup';
        return 'All done. Thanks for choosing THE LAB';
    }
    function card(title) {
        var c = el('section', 'st-card');
        c.appendChild(el('h2', 'st-card-h', title));
        return c;
    }
    function contactLine(text) {
        var p = el('p', 'st-note', text + ' ');
        var a = el('a', null, 'Call or text ' + SHOP_TEL);
        a.href = 'tel:+12502619502';
        p.appendChild(a);
        return p;
    }

    function show(s) {
        root.textContent = '';
        var head = el('header', 'st-head');
        head.appendChild(el('p', 'pg-kick', (s.firstName ? 'Hi ' + s.firstName + ' · ' : '') + (s.vehicle || 'Your job')));
        head.appendChild(el('h1', 'display pg-h1 st-h1', headline(s)));
        root.appendChild(head);

        var current = INDEX[s.step];
        var ol = el('ol', 'st-steps');
        ol.setAttribute('aria-label', 'Progress');
        STEPS.forEach(function (label, i) {
            var li = el('li', 'st-step' + (i < current ? ' is-done' : i === current ? ' is-now' : ''));
            if (i === current) li.setAttribute('aria-current', 'step');
            li.appendChild(el('span', 'st-dot'));
            li.appendChild(el('span', 'st-step-t', label));
            ol.appendChild(li);
        });
        root.appendChild(ol);

        if (s.waitingOnParts) {
            root.appendChild(el('p', 'st-note', "We're still waiting on parts for your job. We'll text you as soon as they arrive."));
        }

        if (s.appointment) {
            var a = card('Drop-off');
            a.appendChild(el('p', 'st-big', when(s.appointment.startAt)));
            a.appendChild(el('p', 'st-note', 'THE LAB, 10219 95 Ave, Fort St. John.'));
            root.appendChild(a);
        }

        var w = card('The work');
        var ul = el('ul', 'st-list');
        s.services.forEach(function (name) { ul.appendChild(el('li', null, name)); });
        w.appendChild(ul);
        root.appendChild(w);

        if (s.balance && /^https:\/\//.test(s.balance.url)) {
            var b = card('Payment');
            b.appendChild(el('p', 'st-big', money(s.balance.dueNow) + ' due now, plus tax'));
            if (s.balance.mode === 'parts' && s.balance.dueAtPickup > 0) {
                b.appendChild(el('p', 'st-note', 'This covers the parts so we can order them. The labour (' + money(s.balance.dueAtPickup) + ', plus tax) is paid when you pick up.'));
            }
            var pay = el('a', 'btn btn-primary st-pay', 'Pay securely');
            pay.href = s.balance.url;
            pay.rel = 'noopener noreferrer';
            b.appendChild(pay);
            root.appendChild(b);
        }
        root.appendChild(contactLine('Questions?'));
    }

    function fail(text) {
        root.textContent = '';
        var head = el('header', 'st-head');
        head.appendChild(el('p', 'pg-kick', 'Job status'));
        head.appendChild(el('h1', 'display pg-h1 st-h1', "We can't find that job"));
        root.appendChild(head);
        root.appendChild(contactLine(text));
    }

    var token = new URLSearchParams(location.search).get('t') || '';
    var valid = /^[0-9a-f]{32}$/.test(token);
    var shown = false;
    function load() {
        if (!valid) { fail('Check the link in your text, or ask us for a new one.'); return; }
        fetch(API + '?t=' + token, { cache: 'no-store' })
            .then(function (r) {
                if (r.status === 404) { fail('The link may be out of date. Ask us for a new one.'); return null; }
                if (!r.ok) throw new Error('status ' + r.status);
                return r.json();
            })
            .then(function (s) { if (s) { show(s); shown = true; } })
            .catch(function () { if (!shown) fail('Something went wrong loading your status.'); });
    }
    load();
    // Coming back to the tab (or the phone waking) shows the latest
    document.addEventListener('visibilitychange', function () { if (!document.hidden && valid) load(); });
})();
