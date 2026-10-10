// Intake forms. On submit the site emails the request to the team (Web3Forms). A quote request ends on a confirmation that
// says the team will email a quote; a booking request embeds the booking calendar. Mount with <div data-intake="boutique|build">.
(function () {
    const SHOP_PHONE = '(250) 261-9502';
    const TEXT_TO = '+12502619502';  // shop number; only shown as a call/text fallback if sending fails
    // Web3Forms public key (safe in client code). Submissions go to the email it was registered with.
    const WEB3FORMS_KEY = '947b4a0a-5af7-480b-9aca-5f81e25e834e';
    // THE LAB CRM: each request is also filed as a contact and deal (lead_intake edge function).
    // Sent after the email succeeds and never blocks the customer; if it fails, Eric still has the email.
    const CRM_LEADS_URL = 'https://mxoqwwdpclfkoydfofug.supabase.co/functions/v1/lead_intake';
    function sendToCrm(lead) {
        try {
            fetch(CRM_LEADS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead),
                keepalive: true,
            }).catch(() => { /* the email already reached the shop */ });
        } catch (err) { /* older browsers without keepalive */ }
    }
    // Google Calendar appointment schedule links. detailing = the Detailing Bay team; eric = everything the team prices to the vehicle
    // (tint, lighting, tuning, the whole Build Request form).
    const BOOKING = { detailing: 'https://calendar.app.google/xqP3H8QFGh7AKuGv6', eric: 'https://calendar.app.google/9FUs5TMTG7aPKhdt6' };
    // Cal.com booking pages (same two routes). When set they replace the Google links above, and the customer's
    // name, email, phone and full request are pre-filled so they land in the calendar event. Leave '' to keep Google.
    const CAL = { detailing: 'https://cal.com/the-lab/detailing-drop-off', eric: 'https://cal.com/the-lab/eric-services' };
    function bookingUrl(route, c) {
        if (!CAL[route]) return { url: BOOKING[route], prefilled: false };
        const q = new URLSearchParams({ embed: 'true', name: c.name, email: c.email, phone: c.phone, attendeePhoneNumber: c.phone, notes: c.notes.slice(0, 1200) });
        return { url: `${CAL[route]}${CAL[route].includes('?') ? '&' : '?'}${q}`, prefilled: true };
    }

    // 10 digits (or 1 + 10) -> (250) 261-9502; anything else is left as typed
    const phoneOk = (s) => /^1?\d{10}$/.test(String(s).replace(/\D/g, ''));
    const fmtPhone = (s) => { const d = String(s).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''); return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(s).trim(); };
    // capitalise the first letter of each name part, leave the rest as typed (McDonald stays McDonald)
    const cap = (s) => String(s || '').trim().replace(/(^|[\s'-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
    const textDisplay = TEXT_TO.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

    const SMS_CONSENT = 'I agree to receive promotional and marketing text messages from Luxx Automotive Boutique Inc. (THE LAB). Msg &amp; data rates may apply. Reply STOP to unsubscribe. See our <a href="/terms/" target="_blank" rel="noopener">Privacy Policy</a>.';
    const OFFROAD = 'I acknowledge that certain performance products (including DPF, DEF, and EGR modifications) are designed and intended strictly for Off-Road and Sanctioned Racing Use Only. They are not legal for use on pollution-controlled vehicles driven on public roads or highways. The purchaser assumes all legal liability for compliance with federal and provincial emissions regulations, including the Clean Air Act. THE LAB does not advise on or authorize the illegal bypass of automotive emissions infrastructure.';

    // type: text | email | tel | textarea | select | multi | radio | check.  when: [fieldId, [values]] = show if any value selected.
    const f = (id, label, type, o = {}) => ({ id, label, type, ...o });
    const TUNE = ['Custom Tuning', 'EGR Solutions'];
    const svc = (...v) => ['service', v];
    // priced services let the customer choose; everything else is priced to the vehicle, so it is always a quote first
    const INTENT = { quote: 'Get a quote by email, no booking yet', book: 'Book now: pick a time and pay the $50 deposit' };
    const PRICED = ['Premium Detailing', 'Window Tinting'];

    const FORMS = {
        boutique: {
            title: 'Boutique Quote and Booking',
            submit: 'Request my quote',
            // one group of fields per screen; contact details come last. A step with nothing to show is skipped.
            steps: [
                { title: 'What do you need?', ids: ['service'] },
                { title: 'Build your quote', ids: [], quote: 0 },
                { title: 'Your quote', ids: [], quote: 1 },
                { title: 'Your options', ids: ['tint_shade', 'tint_pref', 'tint_addons', 'detail_pkg', 'drop_note', 'lighting', 'protection', 'other_notes'], skipWhenHandoff: true },
                { title: 'Your vehicle', ids: ['year', 'make', 'model'] },
                { title: 'Your details', ids: ['intent', 'quote_note', 'first', 'last', 'phone', 'email', 'consent'] },
            ],
            fields: [
                f('year', 'Vehicle Year', 'text', { req: 1, ph: '2019', half: 1 }),
                f('make', 'Vehicle Make', 'text', { req: 1, ph: 'Ford', half: 1 }),
                f('model', 'Vehicle Model', 'text', { req: 1, ph: 'F-350 Super Duty' }),
                f('service', 'Primary Service Requested', 'select', { req: 1, opts: ['Premium Detailing', 'Window Tinting', 'Custom Lighting', 'Other / Custom Install'], tiles: [
                    { v: 'Premium Detailing', t: 'Premium detailing', d: 'Interior, exterior or complete', b: 'Starting prices shown' },
                    { v: 'Window Tinting', t: 'Window tint', d: 'Carbon or ceramic for cars, trucks and side-by-sides', b: 'Starting prices shown' },
                    { v: 'Custom Lighting', t: 'Custom lighting', d: 'Morimoto, Baja Designs, BMC, Diode Dynamics, starlight headliners', b: 'Quoted by our team' },
                    { v: 'Other / Custom Install', t: 'Installs and other', d: 'Mud flaps, bumpers, polishing, decal removal, custom parts', b: 'Quoted by our team' },
                    // tuning needs the VIN, goals and off-road acknowledgement, so it opens the parts form instead of a thin copy of it
                    { v: 'Custom Tuning', t: 'Tuning, exhaust and parts', d: 'EZ LYNK, HP Tuners and AMDP tunes, EGR, exhaust, CCV, lift kits', b: 'Opens the parts form', route: 'build' },
                ] }),
                f('tint_shade', 'Tint Shade Preference', 'select', { when: ['service', ['Window Tinting']], opts: ['5% (Limo)', '18%', '25%', '35%', 'Not sure yet - need a recommendation'] }),
                f('tint_pref', 'Window Tint Preference', 'radio', { when: ['service', ['Window Tinting']], opts: ['Standard Carbon Tint (Front Roll-Ups)', 'Premium Ceramic Tint (Front Roll-Ups)', 'Full Vehicle (Carbon Tint)', 'Full Vehicle (Premium Ceramic)', 'Off-Road SxS & Equipment Film'] }),
                f('tint_addons', 'Tint Add-Ons & Glass Coverage', 'multi', { when: ['service', ['Window Tinting']], opts: ['Windshield Brow (1-Piece Custom Cut)', 'Windshield Brow (2-Piece)', 'Full Windshield', 'Sunroof', 'Panoramic Roof', 'Rear Side Windows', 'Quarter Glass', 'Rear Glass Standard'] }),
                // package names mirror the detailing page; prices live only on that page so they can never disagree
                f('detail_pkg', 'Detailing Package', 'select', { req: 1, when: ['service', ['Premium Detailing']], opts: ['As chosen in my walkthrough (see summary)', 'Interior: Standard', 'Interior: De-Luxx', 'Exterior: Standard', 'Exterior: De-Luxx', 'Complete: Standard Signature', 'Complete: De-Luxx Signature', 'Refresh: Exterior Wash', 'Refresh: Maintenance Detail', 'Membership: The Monthly Signature', 'Membership: The LAB Syndicate'] }),
                f('drop_note', 'Drop-off', 'note', { when: ['service', ['Premium Detailing']], html: '<strong>Detailing drop-off is 8:00 to 9:00 AM, Monday to Friday.</strong> We take 2 details per day, so spots fill up. Need a different time? Just let us know and we will confirm.' }),
                f('lighting', 'Custom Lighting Upgrades', 'multi', { when: ['service', ['Custom Lighting']], opts: ['Morimoto Headlight/Taillight Assemblies', 'Off-Road & Auxiliary (Baja Designs / BMC)', 'Accent & Replacement Bulbs (Diode Dynamics)', 'Starlight Headliner Installation'] }),
                f('protection', 'Detailing Add-Ons', 'multi', { when: ['service', ['Premium Detailing']], opts: ['Heavy Pet Hair Extraction Clean', 'Engine Bay Detail & Component Dressing', 'Paint Pore Clay Bar Finish Treatment', 'Headlight Restoration', 'Single-Stage Machine Gloss Polish', 'Decal Removal', 'Rim Polishing', 'Full Truck Polish', 'Bio Bomb Vehicle Deodorization', 'Extra Detailing Time (30 min)'] }),
                f('other_notes', 'What do you need?', 'textarea', { req: 1, when: ['service', ['Other / Custom Install']], ph: 'e.g., mud flap install, fender flares or other custom parts, gift certificate question' }),
                f('intent', 'What would you like to do?', 'radio', { req: 1, when: svc(...PRICED), opts: [INTENT.quote, INTENT.book] }),
                f('quote_note', 'Quote', 'note', { when: svc('Custom Lighting', 'Other / Custom Install'), html: '<strong>We price this to your vehicle.</strong> Send your request and our team will email you a quote. Book a time once you are happy with the price.' }),
                f('first', 'First Name', 'text', { req: 1, ph: 'Enter your first name', half: 1 }),
                f('last', 'Last Name', 'text', { req: 1, ph: 'Enter your last name', half: 1 }),
                f('phone', 'Phone', 'tel', { req: 1, ph: '(250) 555-0123', half: 1 }),
                f('email', 'Email', 'email', { req: 1, ph: 'your@email.com', half: 1 }),
                f('consent', 'SMS consent', 'check', { req: 1, html: SMS_CONSENT }),
            ],
        },
        build: {
            title: 'Build Request',
            submit: 'Request my quote',
            steps: [
                { title: 'What do you need?', ids: ['service'] },
                { title: 'Your truck', ids: ['vin', 'year', 'make', 'model', 'engine', 'trans', 'km'] },
                { title: 'How you use it', ids: ['usage', 'tow', 'tires', 'gears'] },
                { title: "What's on it now", ids: ['prev_tune', 'device', 'mods'] },
                { title: 'Your options', ids: ['deleted', 'hp', 'trans_tune', 'sotf', 'idle', 'straight', 'diameter', 'tip', 'accessories'] },
                { title: 'Your goals', ids: ['goals', 'notes'] },
                { title: 'Budget and timing', ids: ['install', 'budget', 'timeline', 'pay_note'] },
                { title: 'Your details', ids: ['name', 'phone', 'email', 'offroad', 'consent'] },
            ],
            fields: [
                f('vin', 'Vehicle Identification Number (VIN)', 'text', { req: 1, ph: '17 Digit VIN number', minlength: 17, maxlength: 17 }),
                f('year', 'Vehicle Year', 'text', { req: 1, ph: '2019', half: 1 }),
                f('make', 'Vehicle Make', 'text', { req: 1, ph: 'Ford', half: 1 }),
                f('model', 'Vehicle Model', 'text', { req: 1, ph: 'F-350 Super Duty' }),
                f('engine', 'Engine Type', 'text', { ph: '(e.g. 6.7L Powerstroke)' }),
                // What a tuner needs before a quote is accurate: what's already on the truck, how it's used, and gearing
                f('trans', 'Transmission', 'select', { when: svc(...TUNE, 'Exhaust Systems', 'CCV Reroutes'), opts: ['Automatic (stock)', 'Automatic (built or upgraded)', 'Manual', 'Not sure'] }),
                f('km', 'Approximate mileage (km)', 'text', { ph: 'e.g. 145,000' }),
                f('service', 'Service Requested', 'multi', { req: 1, opts: ['Custom Tuning', 'EGR Solutions', 'Exhaust Systems', 'CCV Reroutes', 'Bumpers & Accessories', 'Head Lights', 'Lift Kits'] }),
                f('usage', 'How do you use the truck?', 'multi', { when: svc(...TUNE, 'Exhaust Systems', 'Lift Kits'), opts: ['Daily driver', 'Work truck', 'Hot shot / commercial hauling', 'Weekend / show truck', 'Off-road'] }),
                f('tow', 'Do you tow?', 'radio', { req: 1, when: svc(...TUNE), opts: ['No', 'Light (under 10,000 lb)', 'Heavy (10,000 lb and up)', 'Gooseneck / 5th wheel'] }),
                f('tires', 'Tire size', 'text', { when: svc(...TUNE, 'Lift Kits'), ph: 'e.g. 35x12.50R20 or 295/70R18' }),
                f('gears', 'Axle gear ratio (if you know it)', 'text', { when: svc(...TUNE), ph: 'e.g. 3.73 or 4.10, or "not sure"' }),
                f('prev_tune', 'Has the truck been tuned before?', 'radio', { when: svc(...TUNE), opts: ['No, factory tune', 'Yes', 'Not sure'] }),
                f('device', 'Tuning device you already own', 'radio', { when: svc(...TUNE), opts: ['None', 'EZ LYNK', 'HP Tuners', 'EFILive', 'Other / not sure'] }),
                f('mods', 'Mods already on the truck', 'multi', { when: svc(...TUNE, 'Exhaust Systems', 'CCV Reroutes'), opts: ["None, it's stock", 'DPF / EGR / DEF removed', 'Aftermarket exhaust', 'Cold air intake', 'Upgraded turbo', 'Upgraded injectors', 'Lift pump', 'Built transmission', 'Lift or level kit'] }),
                f('deleted', 'Is the vehicle currently deleted?', 'radio', { when: svc(...TUNE, 'Exhaust Systems'), opts: ['Yes', 'No', 'Unsure'] }),
                f('hp', 'Desired Horsepower', 'multi', { when: svc(...TUNE), opts: ['Towing/Economy', 'Street/Daily', 'Max Effort'] }),
                f('trans_tune', 'Do you want a transmission tune too?', 'radio', { when: svc('Custom Tuning'), opts: ['Yes', 'No', 'Not sure, recommend one'] }),
                f('sotf', 'Switch-on-the-fly (change power levels from the cab)?', 'radio', { when: svc('Custom Tuning'), opts: ['Yes', 'No, one tune is fine', 'Not sure'] }),
                f('idle', 'Desired Idle Type', 'multi', { when: svc(...TUNE), opts: ['Factory', 'Hiss', 'Choppy/Lope'] }),
                f('straight', 'Exhaust: Straight Pipe?', 'radio', { when: svc(...TUNE, 'Exhaust Systems'), opts: ['Yes', 'No', 'I need muffler', 'Unsure'] }),
                f('diameter', 'Exhaust: Diameter Size', 'select', { when: svc('Exhaust Systems'), opts: ['Full 3"', 'Full 4"', 'Full 5"'] }),
                f('tip', 'Exhaust Tip: Aesthetic Goal', 'radio', { when: svc('Exhaust Systems'), opts: ['Aggressive', 'Large', 'Axle Dump', 'OEM'] }),
                f('accessories', 'Bumpers & Accessories Requested', 'textarea', { when: svc('Bumpers & Accessories', 'Head Lights', 'Lift Kits'), ph: "e.g., gridiron bumpers, custom lighting, mirrors, lift kits, or anything accessories-related. Please explain what you're looking for." }),
                f('goals', 'Overall Vehicle Goals', 'textarea', { req: 1, when: svc(...TUNE, 'Exhaust Systems', 'Bumpers & Accessories', 'Head Lights', 'Lift Kits'), ph: 'More information the better we can help bring your goals to the road' }),
                f('notes', 'Additional Notes', 'textarea', { when: svc(...TUNE, 'Exhaust Systems', 'Bumpers & Accessories', 'Head Lights', 'Lift Kits', 'CCV Reroutes') }),
                f('install', 'Install', 'radio', { req: 1, opts: ['Install at THE LAB', 'Ship the parts to me'] }),
                f('budget', 'Rough budget', 'select', { opts: ['Under $1,500', '$1,500 to $3,000', '$3,000 to $6,000', '$6,000 and up', 'Not sure yet'] }),
                f('timeline', 'When do you want it done?', 'radio', { opts: ['As soon as possible', 'Within a month', "I'm flexible"] }),
                f('pay_note', 'How paying works', 'note', { html: "Your quote comes with a secure link to pay. Pay for the parts up front so we can order them and the labour at pickup, or pay it all at once. Everything is under your name." }),
                f('name', 'Full Name', 'text', { req: 1, ph: 'Enter your full name', half: 1 }),
                f('phone', 'Phone', 'tel', { req: 1, ph: '(250) 555-0123', half: 1 }),
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
        if (d.type === 'select' && d.tiles) {
            return `<div class="lf-tiles" role="radiogroup" aria-label="${esc(d.label)}">${d.tiles.map((t) => `<button type="button" role="radio" aria-checked="false" class="lf-tile" data-tile="${esc(t.v)}"${t.route ? ` data-route="${t.route}"` : ''}><strong class="display">${esc(t.t)}</strong><span>${esc(t.d)}</span><em>${esc(t.b)}</em></button>`).join('')}</div>`
                + '<p data-tile-msg class="lf-msg" role="alert" hidden>Pick one to continue.</p>'
                + `<select ${attrs} class="lf-input lf-select lf-hide" tabindex="-1" aria-hidden="true"><option value=""></option>${d.opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
        }
        if (d.type === 'select') return `<select ${attrs} class="lf-input lf-select"><option value="">Select…</option>${d.opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
        if (d.type === 'multi' || d.type === 'radio') {
            const t = d.type === 'multi' ? 'checkbox' : 'radio';
            return `<div class="lf-opts">${d.opts.map((o) => `<label class="lf-opt"><input type="${t}" name="${d.id}" value="${esc(o)}"${t === 'radio' && d.req ? ' required' : ''}><span>${esc(o)}</span></label>`).join('')}</div>`;
        }
        if (d.type === 'note') return `<div class="lf-note">${d.html}</div>`;
        if (d.type === 'check') return `<label class="lf-consent"><input type="checkbox" name="${d.id}" ${d.req ? 'required' : ''}><span>${d.html}</span></label>`;
        const extra = (d.type === 'tel' ? ' title="Enter a 10-digit phone number" inputmode="tel"' : '')
            + (d.type === 'email' ? ' inputmode="email" autocapitalize="off"' : '')
            + (AUTO[d.id] ? ` autocomplete="${AUTO[d.id]}"` : '')
            + (d.minlength ? ` minlength="${d.minlength}" maxlength="${d.maxlength}"` : '');
        return `<input type="${d.type}" ${attrs} placeholder="${esc(d.ph || '')}"${extra} class="lf-input">`;
    }

    function field(d, key, step) {
        const req = d.req ? ' <span class="lf-req" aria-hidden="true">*</span>' : '';
        const text = `${esc(d.label)}${req}`;
        let inner;
        if (d.type === 'check' || d.type === 'note') inner = control(d, key);
        else if (d.type === 'multi' || d.type === 'radio') inner = `<fieldset class="lf-group"><legend class="lf-label">${text}</legend>${control(d, key)}</fieldset>`;
        else inner = `<label class="lf-label${d.tiles ? ' lf-sr' : ''}" for="${fid(key, d.id)}">${text}</label>${control(d, key)}`;
        return `<div data-field="${d.id}" data-step="${step}" class="lf-field${d.half ? ' lf-field--half' : ''}"${d.when ? ' hidden' : ''}>${inner}</div>`;
    }

    // a tile that belongs to the other form: switch to it on the contact page, or open it from any other page
    function route(to, service) {
        const other = document.querySelector(`[data-intake="${to}"] form`);
        if (other && window.switchForm) { window.switchForm(to); other.dispatchEvent(new CustomEvent('lab:preset', { detail: { service } })); }
        else location.href = `/contact/?form=${to}&service=${encodeURIComponent(service)}#form`;
    }

    function mount(el, key) {
        const cfg = FORMS[key];
        const last = cfg.steps.length - 1;
        const stepOf = {};
        cfg.steps.forEach((s, i) => s.ids.forEach((id) => { stepOf[id] = i; }));
        cfg.fields.forEach((d) => { if (stepOf[d.id] === undefined) console.warn('[intake] field is in no step:', d.id); });
        // the step title is an H3 under a section H2, or the page's first H2 when nothing above the form is one (contact)
        const lvl = [...document.querySelectorAll('h2')].some((h) => h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) ? 'h3' : 'h2';
        el.innerHTML = `<form novalidate class="lf" autocomplete="on" aria-label="${cfg.title}">
            <div class="lf-steps-head" tabindex="-1"><p class="lf-steps-count" aria-live="polite"></p><${lvl} class="display lf-steps-title"></${lvl}><div class="lf-bar" aria-hidden="true"><i></i></div></div>
            <p data-recap-mini data-step="${last}" hidden class="lf-note"></p>
            <p data-veh-note data-step="${stepOf.year}" hidden class="lf-fine">Filled in from what you picked earlier. Change anything that is not right.</p>
            <p data-me data-step="${last}" hidden class="lf-fine">Filled in from your last request on this device. <a href="#" data-me-clear>Not you? Clear</a></p>
            <div data-recap data-step="0" hidden class="lf-field lf-recap">
                <p class="lf-label">Your walkthrough choices (sent to our team)</p>
                <p data-recap-text></p>
                <div data-recap-est hidden class="lf-est">
                    <p class="lf-label">Your estimate</p>
                    <p class="lf-est-total" data-recap-total></p>
                    <ul class="lf-est-lines" data-recap-lines></ul>
                    <p class="lf-fine">Starting prices in CAD.</p>
                </div>
                <a data-recap-edit href="#">Change my choices</a>
            </div>
            ${cfg.steps.map((s, i) => (s.quote === undefined ? '' : `<div data-quote="${s.quote}" data-step="${i}" data-ready="0" class="lf-field lq"></div>`)).join('')}
            ${cfg.fields.map((d) => field(d, key, stepOf[d.id])).join('')}
            <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0">
            <div class="lf-field">
                <p data-msg role="alert" class="lf-msg" hidden></p>
                <div class="lf-nav">
                    <button type="button" class="btn btn-ghost lf-back" hidden>Back</button>
                    <button type="button" class="btn btn-primary lf-next">Next</button>
                    <button type="submit" class="btn btn-primary lf-submit" hidden>${cfg.submit}</button>
                </div>
            </div>
        </form>`;
        const form = el.querySelector('form');
        const box = (id) => form.querySelector(`[data-field="${id}"]`);
        const val = (id) => [...form.querySelectorAll(`[name="${id}"]`)]
            .filter((e) => (e.type !== 'checkbox' && e.type !== 'radio') || e.checked)
            .map((e) => e.value.trim())
            .filter(Boolean);

        try { const h0 = JSON.parse(sessionStorage.getItem('labForm') || 'null'); if (h0 && h0.src === 'quote') sessionStorage.removeItem('labForm'); } catch (err) { /* storage unavailable */ }

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
        // a phone number must be 10 digits; tidy it into (250) 261-9502 when the customer leaves the box
        form.querySelectorAll('input[type=tel]').forEach((t) => {
            const check = () => t.setCustomValidity(!t.value || phoneOk(t.value) ? '' : 'Enter a 10-digit phone number, like (250) 261-9502');
            t.addEventListener('input', check);
            t.addEventListener('blur', () => { if (phoneOk(t.value)) t.value = fmtPhone(t.value); check(); });
        });

        // everything the customer already told us: the truck picked in the store, the vehicle typed in a walkthrough, and the
        // details from their last request on this device. Fill it in so nothing is typed twice.
        const read = (store, k) => { try { return JSON.parse(store.getItem(k) || 'null') || {}; } catch (err) { return {}; } };
        const me = read(localStorage, 'labCustomer');
        const seen = Object.assign({}, read(sessionStorage, 'lab_active_vehicle'), read(sessionStorage, 'labVehicle'));
        const put = (id, v) => { const c = form.elements[id]; if (c && c.tagName && v && !c.value) { c.value = String(v); return true; } return false; };
        // a returning customer's saved vehicle is only a fallback behind what they picked this session
        const gotVeh = [...['year', 'make', 'model', 'engine'].map((k) => put(k, seen[k])), ...['year', 'make', 'model'].map((k) => put(k, (me.veh || {})[k]))].some(Boolean);
        const gotMe = ['first', 'last', 'name', 'phone', 'email'].map((k) => put(k, me[k])).some(Boolean);
        form.querySelector('[data-veh-note]').hidden = !gotVeh;
        form.querySelector('[data-me]').hidden = !gotMe;
        form.querySelector('[data-me-clear]').addEventListener('click', (e) => {
            e.preventDefault();
            try { localStorage.removeItem('labCustomer'); } catch (err) { /* storage unavailable */ }
            ['first', 'last', 'name', 'phone', 'email'].forEach((k) => { const c = form.elements[k]; if (c && c.tagName) c.value = ''; });
            form.querySelector('[data-me]').hidden = true;
        });

        const pre = new URLSearchParams(location.search).get('service');
        const sel = form.elements.service;
        // pick the service(s) named by a link (?service=a,b) or by a route tile on the other form; true if something matched
        function preset(list) {
            const want = String(list || '').split(',').map((s) => s.trim()).filter(Boolean);
            if (!want.length || !sel) return false;
            if (sel.tagName === 'SELECT') {
                const o = [...sel.options].find((x) => want.includes(x.value));
                if (!o) return false;
                sel.value = o.value;
            } else {
                const hit = [...sel].filter((c) => want.includes(c.value));
                if (!hit.length) return false;
                hit.forEach((c) => { c.checked = true; });
            }
            refresh();
            return true;
        }
        const picked = preset(pre);
        // ?intent=quote|book (from a "Get a quote" or "Book" link) preselects the choice for priced services
        const want = INTENT[new URLSearchParams(location.search).get('intent')];
        const wantBox = want && [...form.querySelectorAll('[name="intent"]')].find((c) => c.value === want);
        if (wantBox) wantBox.checked = true;
        // quote = the team emails a price first; book = pick a time and pay the deposit now
        const intentOf = () => (key === 'build' || !box('intent') || box('intent').hidden || val('intent')[0] !== INTENT.book ? 'quote' : 'book');
        const submitLabel = () => (intentOf() === 'book' ? 'Send and pick a time' : 'Request my quote');

        // choices made in a service-page walkthrough (wizard.js labHandoff): tick the matching options, show the recap
        function saved() {
            let h = null;
            try { h = JSON.parse(sessionStorage.getItem('labForm') || 'null'); } catch (err) { /* storage unavailable */ }
            return h && val('service').includes(h.service) ? h : null;
        }
        function handoff() {
            const h = saved();
            form.querySelector('[data-recap]').hidden = !h || h.src === 'quote';
            if (!h) return;
            const est = h.est;
            form.querySelector('[data-recap-text]').textContent = est ? h.summary.replace(/\.?\s*Estimate .*$/, '') : h.summary;
            form.querySelector('[data-recap-est]').hidden = !est;
            if (est) {
                form.querySelector('[data-recap-total]').textContent = est.total;
                const ul = form.querySelector('[data-recap-lines]');
                ul.textContent = '';
                est.lines.forEach((l) => { const li = document.createElement('li'); const a = document.createElement('span'); const b = document.createElement('span'); a.textContent = l.label; b.textContent = l.price; li.append(a, b); ul.appendChild(li); });
            }
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

        // step-by-step: show one group of fields at a time. Same fields, same validation, same submit.
        const head = form.querySelector('.lf-steps-head');
        const mini = form.querySelector('[data-recap-mini]');
        const back = form.querySelector('.lf-back'), next = form.querySelector('.lf-next'), sub = form.querySelector('.lf-submit');
        let cur = 0;
        const controls = (i) => [...form.querySelectorAll(`[data-step="${i}"]:not([hidden]) :is(input,select,textarea)`)].filter((c) => !c.disabled);
        const invalid = (i) => {
            const q = form.querySelector(`[data-quote][data-step="${i}"]`);
            if (q) {
                return q.dataset.ready === '0' ? { reportValidity() { const m = q.querySelector('.lq-hint'); if (m) m.hidden = false; const f = q.querySelector('button, input'); if (f) f.focus({ preventScroll: true }); } } : undefined;
            }
            const bad = controls(i).find((c) => !c.checkValidity());
            if (bad && bad.classList.contains('lf-hide')) {
                return { reportValidity() { const m = form.querySelector('[data-tile-msg]'); if (m) m.hidden = false; const t = form.querySelector('.lf-tile'); if (t) t.focus({ preventScroll: true }); } };
            }
            return bad;
        };
        const syncTiles = () => { const sv = val('service')[0]; form.querySelectorAll('[data-tile]').forEach((t) => t.setAttribute('aria-checked', String(t.dataset.tile === sv))); };
        // steps worth showing: the first and last always, the rest only if they have a visible field. After a
        // walkthrough the options are already filled in, so that step is skipped unless something there is missing.
        const live = () => cfg.steps.map((s, i) => i).filter((i) => {
            const s = cfg.steps[i];
            if (i === 0 || i === last) return true;
            if (s.quote !== undefined) { const lq = window.labQuote, h = saved(); return !!(lq && lq.steps(val('service')[0]) > s.quote && (!h || h.src === 'quote')); }
            if (!s.ids.some((id) => !box(id).hidden)) return false;
            return !(s.skipWhenHandoff && saved() && !invalid(i));
        });
        function render() {
            syncTiles();
            const L = live();
            if (!L.includes(cur)) { const n = L.find((i) => i > cur); cur = n === undefined ? L[L.length - 1] : n; }
            const pos = L.indexOf(cur), final = pos === L.length - 1;
            form.querySelectorAll('[data-step]').forEach((b) => b.classList.toggle('lf-step-off', +b.dataset.step !== cur));
            let t = cfg.steps[cur].title;
            if (cur === 0 && !form.querySelector('[data-recap]').hidden) t = 'Your estimate';
            if (cfg.steps[cur].quote !== undefined && window.labQuote) t = window.labQuote.title(val('service')[0], cfg.steps[cur].quote);
            // before a service is chosen the number of steps is not known yet
            head.querySelector('.lf-steps-count').textContent = cfg.steps.some((s) => s.quote !== undefined) && !val('service')[0] ? 'Step 1' : `Step ${pos + 1} of ${L.length}`;
            head.querySelector('.lf-steps-title').textContent = t;
            head.querySelector('.lf-bar i').style.transform = `scaleX(${(pos + 1) / L.length})`;
            back.hidden = pos === 0; next.hidden = final; sub.hidden = !final; sub.textContent = submitLabel();
            const h = saved();
            mini.hidden = !(h && h.est);
            mini.textContent = h && h.est ? `Your estimate: ${h.est.total} (starting price).` : '';
        }
        // a quote step draws its own controls (quote.js), fresh each time it opens
        function enterQuote() {
            const q = cfg.steps[cur].quote;
            if (q === undefined || !window.labQuote) return;
            window.labQuote.render(form.querySelector(`[data-quote="${q}"]`), val('service')[0], q);
        }
        function go(dir) {
            const L = live(), j = L.indexOf(cur) + dir;
            if (j < 0 || j >= L.length) return;
            if (dir > 0) { const bad = invalid(cur); if (bad) { bad.reportValidity(); return; } }
            cur = L[j];
            render();
            enterQuote();
            if (window.labStepIn) window.labStepIn(form.querySelectorAll('[data-step]:not(.lf-step-off):not([hidden])'));
            if (window.labScrollTo) window.labScrollTo(head);
            else { head.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
            head.focus({ preventScroll: true });
        }
        // e.detail > 1 is the second click of a double-click: ignore it so a step is never skipped
        back.addEventListener('click', (e) => { if (e.detail < 2) go(-1); });
        next.addEventListener('click', (e) => { if (e.detail < 2) go(1); });
        form.addEventListener('change', render);
        form.addEventListener('lab:handoff', () => { handoff(); render(); });
        form.addEventListener('lab:preset', (e) => {
            if (!preset(e.detail.service)) return;
            cur = 0; render(); go(1);
        });
        form.addEventListener('click', (e) => {
            const t = e.target.closest('[data-tile]');
            if (!t) return;
            if (t.dataset.route) return route(t.dataset.route, t.dataset.tile);
            sel.value = t.dataset.tile;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            form.querySelector('[data-tile-msg]').hidden = true;
            if (window.labQuote) window.labQuote.prefetch(t.dataset.tile);
            go(1);
        });
        // arriving from a "Get a quote" button with the service already chosen: open straight on its next step
        if (picked && !saved()) { const L0 = live(); if (L0.length > 1) cur = L0[1]; }
        render();
        enterQuote();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const L = live();
            if (cur !== L[L.length - 1]) return go(1); // Enter on an earlier step just moves on
            for (const i of L) { const bad = invalid(i); if (bad) { cur = i; render(); bad.reportValidity(); return; } }
            if (form.elements.website.value) return; // honeypot: bots fill the hidden field

            const v = {};
            cfg.fields.forEach((d) => { if (!box(d.id).hidden) v[d.id] = d.type === 'check' ? 'Yes' : val(d.id).join(', '); });
            const intent = intentOf();
            const title = key === 'build' ? 'Parts and Tuning Quote Request' : intent === 'book' ? 'Booking Request' : 'Quote Request';
            const rows = [];
            const add = (l, x) => x && rows.push([l, x]);
            add('Request type', intent === 'book' ? 'BOOKING: customer is picking a time and paying the $50 deposit now' : 'QUOTE ONLY: customer wants a price before booking. Email them a quote.');
            if (v.first) v.first = cap(v.first);
            if (v.last) v.last = cap(v.last);
            const name = cap(v.name || `${v.first || ''} ${v.last || ''}`);
            v.phone = fmtPhone(v.phone);
            add('Name', name);
            add('Phone', v.phone); add('Email', v.email);
            add('Vehicle', [v.year, v.make, v.model].filter(Boolean).join(' '));
            add('VIN', v.vin);
            cfg.fields.forEach((d) => {
                if (['name', 'first', 'last', 'phone', 'email', 'year', 'make', 'model', 'vin', 'consent', 'offroad', 'intent', 'quote_note'].includes(d.id)) return;
                add(d.label, v[d.id]);
            });
            const h = saved();
            if (h) add('Walkthrough summary', h.summary);
            if (h && h.est) add('Starting price shown to customer', h.est.total);
            add('Off-road disclaimer agreed', v.offroad); add('SMS consent', v.consent);

            // The email Eric reads: name, phone and email come from the Web3Forms header, so the body holds only what is new.
            const choices = rows.filter(([l]) => !['Request type', 'Name', 'Phone', 'Email', 'Vehicle', 'VIN', 'Primary Service Requested', 'Service Requested', 'Starting price shown to customer', 'Walkthrough summary', 'Off-road disclaimer agreed', 'SMS consent'].includes(l));
            const est = h && h.est;
            const when = new Date().toLocaleString('en-CA', { timeZone: 'America/Dawson_Creek', dateStyle: 'medium', timeStyle: 'short' }) + ' (Fort St. John time)';
            const vehicle = [v.year, v.make, v.model].filter(Boolean).join(' ');
            const calName = v.service === 'Premium Detailing' ? 'Detailing Drop-off' : 'Eric Services';
            const mail = [
                intent === 'book' ? 'BOOKING: the customer is picking a time and paying the $50 deposit now.' : 'QUOTE ONLY: the customer wants a price before booking. Email them a quote.',
                `REQUEST: ${v.service}`,
                vehicle && `VEHICLE: ${vehicle}${v.vin ? ` (VIN ${v.vin})` : ''}`,
                est && `ESTIMATE: ${est.total} (starting price)\n${est.lines.map((l) => `  ${l.label}: ${l.price}`).join('\n')}`,
                choices.length && `CHOICES\n${choices.map(([l, x]) => `  ${l}: ${x}`).join('\n')}`,
                h && `WALKTHROUGH SUMMARY: ${h.summary}`,
                intent === 'book'
                    ? `NEXT: the customer is picking a time on the Cal.com "${calName}" page now. A Cal.com booking email means they booked, and the $50 deposit is paid in that step. No booking email yet means they have not booked.`
                    : 'NEXT: reply to the customer with a quote. They have not picked a time and will book by replying to your email.',
                `CAME FROM: ${!h ? 'the form only (no walkthrough or quote tool used)' : h.src === 'quote' ? 'the instant quote tool on the contact page' : `the walkthrough on ${(h.url || '').split('#')[0] || 'a service page'}`}`,
                `SENT: ${when}`,
                v.offroad && 'OFF-ROAD DISCLAIMER: agreed',
                v.consent && `SMS CONSENT: Yes, agreed ${when}`,
            ].filter(Boolean).join('\n\n');
            const SHORT = { 'Premium Detailing': 'Detailing', 'Window Tinting': 'Tint', 'Custom Lighting': 'Lighting', 'Other / Custom Install': 'Install' };
            const subject = [intent === 'book' ? 'Booking' : 'Quote', SHORT[v.service] || v.service, vehicle, est && est.total.replace(/\s*CAD$/, ''), name].filter(Boolean).join(' | ');

            const btn = form.querySelector('button[type=submit]');
            const msg = form.querySelector('[data-msg]');
            btn.disabled = true; btn.textContent = 'Sending…'; msg.hidden = true;
            try {
                const r = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, from_name: 'THE LAB Website', name, email: v.email, phone: v.phone, message: mail }),
                });
                const j = await r.json();
                if (!j.success) throw new Error(j.message);
                sendToCrm({
                    form: key, intent, name, first: v.first, last: v.last,
                    email: v.email, phone: v.phone,
                    year: v.year, make: v.make, model: v.model, vin: v.vin,
                    service: v.service,
                    // the priced lines, choices and walkthrough summary go on the job in the CRM
                    estimate: est ? { total: est.total, lines: (est.lines || []).map((l) => ({ label: l.label, price: l.price })) } : null,
                    details: choices.map(([l, x]) => `${l}: ${x}`).join('\n'),
                    choices: choices.map(([l, x]) => ({ label: l, value: String(x) })),
                    summary: h ? h.summary : '',
                    source: !h ? 'form' : h.src === 'quote' ? 'quote' : 'walkthrough',
                    sms_consent: v.consent === 'Yes',
                    page: location.pathname,
                });
                // remember them for next time: contact details on this device, the vehicle for the rest of this visit
                try {
                    const [first, ...rest] = name.split(/\s+/);
                    const veh = { year: v.year, make: v.make, model: v.model };
                    localStorage.setItem('labCustomer', JSON.stringify({ first: v.first || first, last: v.last || rest.join(' '), name, phone: v.phone, email: v.email, veh }));
                    sessionStorage.setItem('labVehicle', JSON.stringify(veh));
                } catch (err) { /* storage unavailable */ }
                done(el, v.service === 'Premium Detailing' ? 'detailing' : 'eric', {
                    intent, name, email: v.email, phone: v.phone,
                    est: (saved() || {}).est || null,
                    notes: rows.filter(([l]) => !['Name', 'Phone', 'Email', 'SMS consent'].includes(l)).map(([l, x]) => `${l}: ${x}`).join('\n'),
                });
            } catch (err) {
                msg.innerHTML = `We couldn't send that. Please call or text us at <a href="tel:${TEXT_TO}">${textDisplay}</a> or try again.`;
                msg.hidden = false;
                btn.disabled = false; btn.textContent = submitLabel();
            }
        });
    }

    // Replaces the form once the team has the request. A quote request ends here; a booking embeds the calendar, no redirect.
    function done(el, route, c) {
        const call = `<p class="lf-fine">Questions? Call or text <a href="tel:${TEXT_TO}">${textDisplay}</a>.</p>`;
        if (c.intent !== 'book') {
            el.innerHTML = `<div class="lf-done" role="status" tabindex="-1">
            <p class="lf-done-h"><strong>Got it!</strong> Your quote request is in.</p>
            ${c.est ? `<p class="lf-est-done">Your starting price: <strong>${esc(c.est.total)}</strong>.</p>` : ''}
            <p>Our team will review your request and email your quote to <strong>${esc(c.email)}</strong>. When you are ready to book, just reply to that email.</p>
            ${call}
        </div>`;
        } else {
            const { url, prefilled } = bookingUrl(route, c);
            const drop = route === 'detailing';
            el.innerHTML = `<div class="lf-done" role="status" tabindex="-1">
            <p class="lf-done-h"><strong>Got it!</strong> Our team has your request.</p>
            ${c.est ? `<p class="lf-est-done">Your estimate: <strong>${esc(c.est.total)}</strong> (starting price).</p>` : ''}
            <p>${url ? `Pick ${drop ? 'your drop-off' : 'a'} time below. ` : ''}Pay the $50 deposit in the booking form to lock in your spot (100% credited to your final invoice).</p>
            ${url && !prefilled ? `<p class="lf-note">Book under <strong>${esc(c.name)}</strong> and <strong>${esc(c.email)}</strong> (same as above) so we can match your time to your request.</p>` : ''}
            ${drop ? '<p class="lf-fine">Drop-off is 8:00 to 9:00 AM, Monday to Friday (Fort St. John time).</p>' : ''}
            ${url ? `<iframe src="${esc(url)}" title="Pick a time" loading="lazy" class="lf-cal"></iframe>
            <a class="lf-fallback" href="${esc(url)}" target="_blank" rel="noopener">Calendar not loading? Open it in a new tab</a>` : ''}
            ${call}
        </div>`;
        }
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
        const d = el.querySelector('.lf-done'); if (d) d.focus({ preventScroll: true });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-intake]').forEach((el) => mount(el, el.dataset.intake));
    });
})();
