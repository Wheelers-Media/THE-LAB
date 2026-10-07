// Intake forms. On submit the site emails the request to Eric (Web3Forms), then the
// form is replaced by a confirmation with the matching Google Calendar booking page embedded. The customer sends nothing.
// Mount with <div data-intake="boutique|build">.
(function () {
    const SHOP_PHONE = '(250) 261-9502';
    const TEXT_TO = '+12502619502';  // shop number; only shown as a call/text fallback if sending fails
    // Web3Forms public key (safe in client code). Submissions go to the email it was registered with.
    const WEB3FORMS_KEY = '947b4a0a-5af7-480b-9aca-5f81e25e834e';
    // Google Calendar appointment schedule links. detailing = the Detailing Bay team; eric = everything Eric does himself
    // (tint, lighting, tuning, the whole Build Request form).
    const BOOKING = { detailing: 'https://calendar.app.google/xqP3H8QFGh7AKuGv6', eric: 'https://calendar.app.google/9FUs5TMTG7aPKhdt6' };
    // Cal.com booking pages (same two routes). When set they replace the Google links above, and the customer's
    // name, email, phone and full request are pre-filled so they land in the calendar event. Leave '' to keep Google.
    const CAL = { detailing: 'https://cal.com/eric-wheeler-5w6xqv/detailing-drop-off', eric: 'https://cal.com/eric-wheeler-5w6xqv/eric-services' };
    function bookingUrl(route, c) {
        if (!CAL[route]) return { url: BOOKING[route], prefilled: false };
        const q = new URLSearchParams({ embed: 'true', name: c.name, email: c.email, phone: c.phone, attendeePhoneNumber: c.phone, notes: c.notes.slice(0, 1200) });
        return { url: `${CAL[route]}${CAL[route].includes('?') ? '&' : '?'}${q}`, prefilled: true };
    }

    const messageBody = (title, rows) => [`THE LAB - New ${title}`, ...rows.map(([l, v]) => `${l}: ${v}`)].join('\n');
    const textDisplay = TEXT_TO.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

    const SMS_CONSENT = 'I agree to receive promotional and marketing text messages from Luxx Automotive Boutique Inc. (THE LAB). Msg &amp; data rates may apply. Reply STOP to unsubscribe. See our <a href="/terms/" target="_blank" rel="noopener">Privacy Policy</a>.';
    const OFFROAD = 'I acknowledge that certain performance products (including DPF, DEF, and EGR modifications) are designed and intended strictly for Off-Road and Sanctioned Racing Use Only. They are not legal for use on pollution-controlled vehicles driven on public roads or highways. The purchaser assumes all legal liability for compliance with federal and provincial emissions regulations, including the Clean Air Act. THE LAB does not advise on or authorize the illegal bypass of automotive emissions infrastructure.';

    // type: text | email | tel | textarea | select | multi | radio | check.  when: [fieldId, [values]] = show if any value selected.
    const f = (id, label, type, o = {}) => ({ id, label, type, ...o });
    const TUNE = ['Custom Tuning', 'EGR Solutions'];
    const svc = (...v) => ['service', v];

    const FORMS = {
        boutique: {
            title: 'Boutique Quote Request',
            submit: 'Get my quote',
            fields: [
                f('category', 'Vehicle Category', 'multi', { opts: ['Standard Car', 'Van', 'SUV', 'Truck', 'Side-by-Side (SxS) / Off-Road'] }),
                f('year', 'Vehicle Year', 'text', { req: 1, ph: '2019', half: 1 }),
                f('make', 'Vehicle Make', 'text', { req: 1, ph: 'Ford', half: 1 }),
                f('model', 'Vehicle Model', 'text', { req: 1, ph: 'F-350 Super Duty' }),
                f('service', 'Primary Service Requested', 'select', { req: 1, opts: ['Premium Detailing', 'Window Tinting', 'Custom Lighting', 'Custom Tuning', 'Other / Custom Install'] }),
                f('tint_shade', 'Tint Shade Preference', 'select', { when: ['service', ['Window Tinting']], opts: ['5% (Limo)', '18', '25', '35', 'Not sure yet - need a recommendation'] }),
                f('tint_pref', 'Window Tint Preference', 'radio', { when: ['service', ['Window Tinting']], opts: ['Standard Carbon Tint (Front Roll-Ups)', 'Premium Ceramic Tint (Front Roll-Ups)', 'Full Vehicle (Carbon Tint)', 'Full Vehicle (Premium Ceramic)', 'Off-Road SxS & Equipment Film'] }),
                f('tint_addons', 'Tint Add-Ons & Glass Coverage', 'multi', { when: ['service', ['Window Tinting']], opts: ['Windshield Brow (1-Piece Custom Cut)', 'Panoramic Roof', 'Full Windshield', 'Rear Glass Standard'] }),
                // package names mirror the detailing page; prices live only on that page so they can never disagree
                f('detail_pkg', 'Detailing Package', 'select', { req: 1, when: ['service', ['Premium Detailing']], opts: ['As chosen in my walkthrough (see summary)', 'Interior: Standard', 'Interior: De-Luxx', 'Exterior: Standard', 'Exterior: De-Luxx', 'Complete: Standard Signature', 'Complete: De-Luxx Signature', 'Membership: The Monthly Signature', 'Membership: The LAB Syndicate'] }),
                f('drop_note', 'Drop-off', 'note', { when: ['service', ['Premium Detailing']], html: '<strong>Detailing drop-off is 8:00 to 9:00 AM, Monday to Friday.</strong> We take 2 details per day, so spots fill up. Need a different time? Just let us know and Eric will confirm.' }),
                f('lighting', 'Custom Lighting Upgrades', 'multi', { when: ['service', ['Custom Lighting']], opts: ['Morimoto Headlight/Taillight Assemblies', 'Off-Road & Auxiliary (Baja Designs / BMC)', 'Accent & Replacement Bulbs (Diode Dynamics)', 'Starlight Headliner Installation'] }),
                f('protection', 'Detailing Add-Ons', 'multi', { when: ['service', ['Premium Detailing']], opts: ['Heavy Pet Hair Extraction Clean', 'Odor Neutralizing Ozone Air Cleansing', 'Engine Bay Detail & Component Dressing', 'Paint Pore Clay Bar Finish Treatment', 'Headlight Restoration', 'Single-Stage Machine Gloss Polish', 'Decal Removal', 'Rim Polishing', 'Full Truck Polish'] }),
                f('other_notes', 'What do you need?', 'textarea', { req: 1, when: ['service', ['Other / Custom Install']], ph: 'e.g., mud flap install, fender flares or other custom parts, gift certificate question' }),
                f('first', 'First Name', 'text', { req: 1, ph: 'Enter your first name', half: 1 }),
                f('last', 'Last Name', 'text', { req: 1, ph: 'Enter your last name', half: 1 }),
                f('phone', 'Phone', 'tel', { req: 1, ph: '+1 (555) 000-0000', half: 1 }),
                f('email', 'Email', 'email', { req: 1, ph: 'your@email.com', half: 1 }),
                f('consent', 'SMS consent', 'check', { req: 1, html: SMS_CONSENT }),
            ],
        },
        build: {
            title: 'Build Request',
            submit: 'Send build request',
            fields: [
                f('vin', 'Vehicle Identification Number (VIN)', 'text', { req: 1, ph: '17 Digit VIN number', minlength: 17, maxlength: 17 }),
                f('year', 'Vehicle Year', 'text', { req: 1, ph: '2019', half: 1 }),
                f('make', 'Vehicle Make', 'text', { req: 1, ph: 'Ford', half: 1 }),
                f('model', 'Vehicle Model', 'text', { req: 1, ph: 'F-350 Super Duty' }),
                f('engine', 'Engine Type', 'text', { ph: '(e.g. 6.7L Powerstroke)' }),
                f('service', 'Service Requested', 'multi', { req: 1, opts: ['Custom Tuning', 'EGR Solutions', 'Exhaust Systems', 'CCV Reroutes', 'Bumpers & Accessories', 'Head Lights', 'Lift Kits'] }),
                f('deleted', 'Is the vehicle currently deleted?', 'radio', { when: svc(...TUNE, 'Exhaust Systems'), opts: ['Yes', 'No', 'Unsure'] }),
                f('hp', 'Desired Horsepower', 'multi', { when: svc(...TUNE), opts: ['Towing/Economy', 'Street/Daily', 'Max Effort'] }),
                f('idle', 'Desired Idle Type', 'multi', { when: svc(...TUNE), opts: ['Factory', 'Hiss', 'Choppy/Lope'] }),
                f('straight', 'Exhaust: Straight Pipe?', 'radio', { when: svc(...TUNE, 'Exhaust Systems'), opts: ['Yes', 'No', 'I need muffler', 'Unsure'] }),
                f('diameter', 'Exhaust: Diameter Size', 'select', { when: svc('Exhaust Systems'), opts: ['Full 3"', 'Full 4"', 'Full 5"'] }),
                f('tip', 'Exhaust Tip: Aesthetic Goal', 'radio', { when: svc('Exhaust Systems'), opts: ['Aggressive', 'Large', 'Axle Dump', 'OEM'] }),
                f('accessories', 'Bumpers & Accessories Requested', 'textarea', { when: svc('Bumpers & Accessories', 'Head Lights', 'Lift Kits'), ph: "e.g., gridiron bumpers, custom lighting, mirrors, lift kits, or anything accessories-related. Please explain what you're looking for." }),
                f('goals', 'Overall Vehicle Goals', 'textarea', { req: 1, when: svc(...TUNE, 'Exhaust Systems', 'Bumpers & Accessories', 'Head Lights', 'Lift Kits'), ph: 'More information the better we can help bring your goals to the road' }),
                f('notes', 'Additional Notes', 'textarea', { when: svc(...TUNE, 'Exhaust Systems', 'Bumpers & Accessories', 'Head Lights', 'Lift Kits', 'CCV Reroutes') }),
                f('name', 'Full Name', 'text', { req: 1, ph: 'Enter your full name', half: 1 }),
                f('phone', 'Phone', 'tel', { req: 1, ph: '+1 (555) 000-0000', half: 1 }),
                f('email', 'Email', 'email', { req: 1, ph: 'your@email.com' }),
                f('offroad', 'Off-road disclaimer', 'check', { req: 1, when: svc(...TUNE), html: OFFROAD }),
                f('consent', 'SMS consent', 'check', { req: 1, html: SMS_CONSENT }),
            ],
        },
    };

    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    // browser autofill hints, so phones fill name, phone and email in one tap
    const AUTO = { first: 'given-name', last: 'family-name', name: 'name', phone: 'tel', email: 'email' };
    const fid = (key, id) => `f-${key}-${id}`;

    function control(d, key) {
        const id = fid(key, d.id);
        const attrs = `id="${id}" name="${d.id}"${d.req ? ' required aria-required="true"' : ''}`;
        if (d.type === 'textarea') return `<textarea ${attrs} rows="3" placeholder="${esc(d.ph || '')}" class="lf-input"></textarea>`;
        if (d.type === 'select') return `<select ${attrs} class="lf-input lf-select"><option value="">Select…</option>${d.opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
        if (d.type === 'multi' || d.type === 'radio') {
            const t = d.type === 'multi' ? 'checkbox' : 'radio';
            return `<div class="lf-opts">${d.opts.map((o) => `<label class="lf-opt"><input type="${t}" name="${d.id}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>`;
        }
        if (d.type === 'note') return `<div class="lf-note">${d.html}</div>`;
        if (d.type === 'check') return `<label class="lf-consent"><input type="checkbox" name="${d.id}" ${d.req ? 'required' : ''}><span>${d.html}</span></label>`;
        const extra = (d.type === 'tel' ? ' pattern="[0-9\\s\\(\\)+.\\-]{10,}" title="Enter a 10-digit phone number" inputmode="tel"' : '')
            + (d.type === 'email' ? ' inputmode="email" autocapitalize="off"' : '')
            + (AUTO[d.id] ? ` autocomplete="${AUTO[d.id]}"` : '')
            + (d.minlength ? ` minlength="${d.minlength}" maxlength="${d.maxlength}"` : '');
        return `<input type="${d.type}" ${attrs} placeholder="${esc(d.ph || '')}"${extra} class="lf-input">`;
    }

    function field(d, key) {
        const req = d.req ? ' <span class="lf-req" aria-hidden="true">*</span>' : '';
        const text = `${esc(d.label)}${req}`;
        let inner;
        if (d.type === 'check' || d.type === 'note') inner = control(d, key);
        else if (d.type === 'multi' || d.type === 'radio') inner = `<fieldset class="lf-group"><legend class="lf-label">${text}</legend>${control(d, key)}</fieldset>`;
        else inner = `<label class="lf-label" for="${fid(key, d.id)}">${text}</label>${control(d, key)}`;
        return `<div data-field="${d.id}" class="lf-field${d.half ? ' lf-field--half' : ''}"${d.when ? ' hidden' : ''}>${inner}</div>`;
    }

    function mount(el, key) {
        const cfg = FORMS[key];
        el.innerHTML = `<form novalidate class="lf" autocomplete="on" aria-label="${cfg.title}">
            <div data-recap hidden class="lf-field lf-recap">
                <p class="lf-label">Your walkthrough choices (sent to Eric)</p>
                <p data-recap-text></p>
                <a data-recap-edit href="#">Change my choices</a>
            </div>
            ${cfg.fields.map((d) => field(d, key)).join('')}
            <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0">
            <div class="lf-field">
                <p data-msg role="alert" class="lf-msg" hidden></p>
                <button type="submit" class="btn btn-primary lf-submit">${cfg.submit}</button>
            </div>
        </form>`;
        const form = el.querySelector('form');
        const box = (id) => form.querySelector(`[data-field="${id}"]`);
        const val = (id) => [...form.querySelectorAll(`[name="${id}"]`)]
            .filter((e) => (e.type !== 'checkbox' && e.type !== 'radio') || e.checked)
            .map((e) => e.value.trim())
            .filter(Boolean);

        function refresh() {
            cfg.fields.forEach((d) => {
                if (d.when) {
                    const on = val(d.when[0]).some((v) => d.when[1].includes(v));
                    const b = box(d.id);
                    b.hidden = !on;
                    b.querySelectorAll('input,select,textarea').forEach((e) => (e.disabled = !on));
                }
                // a required checkbox group needs only one box ticked
                if (d.type === 'multi' && d.req) {
                    const any = val(d.id).length > 0;
                    box(d.id).querySelectorAll('input').forEach((e) => (e.required = !any));
                }
            });
        }
        form.addEventListener('change', refresh);
        refresh();

        // vehicle typed in a service-page walkthrough: fill it in so the customer never types it twice
        try {
            const veh = JSON.parse(sessionStorage.getItem('labVehicle') || 'null');
            if (veh) ['year', 'make', 'model'].forEach((k) => { const f = form.elements[k]; if (f && veh[k] && !f.value) f.value = veh[k]; });
        } catch (err) { /* storage unavailable */ }

        const pre = new URLSearchParams(location.search).get('service');
        const sel = form.elements.service;
        if (pre && sel && sel.tagName === 'SELECT' && [...sel.options].some((o) => o.value === pre)) { sel.value = pre; refresh(); }

        // choices made in a service-page walkthrough (wizard.js labHandoff): tick the matching options, show the recap
        function saved() {
            let h = null;
            try { h = JSON.parse(sessionStorage.getItem('labForm') || 'null'); } catch (err) { /* storage unavailable */ }
            return h && val('service').includes(h.service) ? h : null;
        }
        function handoff() {
            const h = saved();
            form.querySelector('[data-recap]').hidden = !h;
            if (!h) return;
            form.querySelector('[data-recap-text]').textContent = h.summary;
            form.querySelector('[data-recap-edit]').href = h.url;
            Object.entries(h.set || {}).forEach(([id, v]) => {
                const want = [].concat(v);
                form.querySelectorAll(`[name="${id}"]`).forEach((c) => {
                    if (c.tagName === 'SELECT') { const o = [...c.options].find((x) => want.includes(x.value)); if (o) c.value = o.value; }
                    else c.checked = want.includes(c.value);
                });
            });
            refresh();
        }
        form.addEventListener('change', (e) => { if (e.target.name === 'service') handoff(); });
        handoff();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.checkValidity()) return form.reportValidity();
            if (form.elements.website.value) return; // honeypot: bots fill the hidden field

            const v = {};
            cfg.fields.forEach((d) => { if (!box(d.id).hidden) v[d.id] = d.type === 'check' ? 'Yes' : val(d.id).join(', '); });
            const rows = [];
            const add = (l, x) => x && rows.push([l, x]);
            const name = (v.name || `${v.first || ''} ${v.last || ''}`).trim();
            add('Name', name);
            add('Phone', v.phone); add('Email', v.email);
            add('Vehicle', [v.year, v.make, v.model].filter(Boolean).join(' '));
            add('VIN', v.vin);
            cfg.fields.forEach((d) => {
                if (['name', 'first', 'last', 'phone', 'email', 'year', 'make', 'model', 'vin', 'consent', 'offroad'].includes(d.id)) return;
                add(d.label, v[d.id]);
            });
            const h = saved();
            if (h) add('Walkthrough summary', h.summary);
            add('Off-road disclaimer agreed', v.offroad); add('SMS consent', v.consent);

            const btn = form.querySelector('button[type=submit]');
            const msg = form.querySelector('[data-msg]');
            btn.disabled = true; btn.textContent = 'Sending…'; msg.hidden = true;
            try {
                const r = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: `THE LAB: New ${cfg.title} - ${name}`, from_name: 'THE LAB Website', name, email: v.email, phone: v.phone, message: messageBody(cfg.title, rows) }),
                });
                const j = await r.json();
                if (!j.success) throw new Error(j.message);
                done(el, v.service === 'Premium Detailing' ? 'detailing' : 'eric', {
                    name, email: v.email, phone: v.phone,
                    notes: rows.filter(([l]) => !['Name', 'Phone', 'Email', 'SMS consent'].includes(l)).map(([l, x]) => `${l}: ${x}`).join('\n'),
                });
            } catch (err) {
                msg.innerHTML = `We couldn't send that. Please call or text us at <a href="tel:${TEXT_TO}">${textDisplay}</a> or try again.`;
                msg.hidden = false;
                btn.disabled = false; btn.textContent = cfg.submit;
            }
        });
    }

    // Replaces the form once Eric has the request. The booking calendar is embedded right here, no redirect.
    function done(el, route, c) {
        const { url, prefilled } = bookingUrl(route, c);
        const drop = route === 'detailing';
        el.innerHTML = `<div class="lf-done" role="status" tabindex="-1">
            <p class="lf-done-h"><strong>Got it!</strong> Eric has your request.</p>
            <p>Eric will reply within one business day with your price. ${url ? `Ready to lock it in? Pick ${drop ? 'your drop-off' : 'a'} time below. ` : ''}He will text you a $50 deposit link to hold your spot (100% credited to your final invoice).</p>
            ${url && !prefilled ? `<p class="lf-note">Book under <strong>${esc(c.name)}</strong> and <strong>${esc(c.email)}</strong> (same as above) so Eric can match your time to your request.</p>` : ''}
            ${drop ? '<p class="lf-fine">Drop-off is 8:00 to 9:00 AM, Monday to Friday (Fort St. John time).</p>' : ''}
            ${url ? `<iframe src="${esc(url)}" title="Pick a time" loading="lazy" class="lf-cal"></iframe>
            <a class="lf-fallback" href="${esc(url)}" target="_blank" rel="noopener">Calendar not loading? Open it in a new tab</a>` : ''}
            <p class="lf-fine">Questions? Call or text <a href="tel:${TEXT_TO}">${textDisplay}</a>.</p>
        </div>`;
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
        const d = el.querySelector('.lf-done'); if (d) d.focus({ preventScroll: true });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-intake]').forEach((el) => mount(el, el.dataset.intake));
    });
})();
