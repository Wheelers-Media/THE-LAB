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

    const messageBody = (title, rows) => [`THE LAB - New ${title}`, ...rows.map(([l, v]) => `${l}: ${v}`)].join('\n');
    const textDisplay = TEXT_TO.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

    const SMS_CONSENT = 'I agree to receive promotional and marketing text messages from Luxx Automotive Boutique Inc. (THE LAB). Msg &amp; data rates may apply. Reply STOP to unsubscribe. See our <a href="/terms/" target="_blank" class="text-labBlue hover:underline">Privacy Policy</a>.';
    const OFFROAD = 'I acknowledge that certain performance products (including DPF, DEF, and EGR modifications) are designed and intended strictly for Off-Road and Sanctioned Racing Use Only. They are not legal for use on pollution-controlled vehicles driven on public roads or highways. The purchaser assumes all legal liability for compliance with federal and provincial emissions regulations, including the Clean Air Act. THE LAB does not advise on or authorize the illegal bypass of automotive emissions infrastructure.';

    // type: text | email | tel | textarea | select | multi | radio | check.  when: [fieldId, [values]] = show if any value selected.
    const f = (id, label, type, o = {}) => ({ id, label, type, ...o });
    const TUNE = ['Custom Tuning', 'EGR Solutions'];
    const svc = (...v) => ['service', v];

    const FORMS = {
        boutique: {
            title: 'Boutique Booking',
            submit: 'Book Service Date',
            fields: [
                f('category', 'Vehicle Category', 'multi', { opts: ['Standard Car', 'Van', 'SUV', 'Truck', 'Side-by-Side (SxS) / Off-Road'] }),
                f('year', 'Vehicle Year', 'text', { req: 1, ph: '2019', half: 1 }),
                f('make', 'Vehicle Make', 'text', { req: 1, ph: 'Ford', half: 1 }),
                f('model', 'Vehicle Model', 'text', { req: 1, ph: 'F-350 Super Duty' }),
                f('service', 'Primary Service Requested', 'select', { req: 1, opts: ['Premium Detailing', 'Window Tinting', 'Custom Lighting', 'Custom Tuning'] }),
                f('tint_shade', 'Tint Shade Preference', 'select', { when: ['service', ['Window Tinting']], opts: ['5% (Limo)', '18', '25', '35', 'Not sure yet - need a recommendation'] }),
                f('tint_pref', 'Window Tint Preference', 'radio', { when: ['service', ['Window Tinting']], opts: ['Standard Carbon Tint (Front Roll-Ups) - $180 CAD', 'Premium Ceramic Tint (Front Roll-Ups) - $260 CAD', 'Full Vehicle (Carbon Tinting) - $180 to $800 CAD', 'Full Vehicle (Premium Ceramic) - $260 to $1,300 CAD', 'Off-Road SxS & Equipment Film - Starts at $25 CAD'] }),
                f('tint_addons', 'Tint Add-Ons & Glass Coverage', 'multi', { when: ['service', ['Window Tinting']], opts: ['Windshield Brow (1-Piece Custom Cut) - +$180 CAD', 'Panoramic Roof Absolute Shield - +$350 CAD', 'Full Windshield', 'Rear Glass Standard'] }),
                f('detail_pkg', 'Detailing Package', 'select', { req: 1, when: ['service', ['Premium Detailing']], opts: ['Standard Detail (Starts at $149 CAD)', 'De-Luxx Signature Interior (Starts at $279 CAD)', 'De-Luxx Signature Ultimate (Starts at $499 CAD)', 'The Monthly Signature (Starts at $249 CAD Per Month)', 'The LAB Syndicate Bi-Weekly (Starts at $349 CAD Per Month)'] }),
                f('drop_note', 'Drop-off', 'note', { when: ['service', ['Premium Detailing']], html: '<strong class="text-white">Detailing drop-off is 8:00 to 9:00 AM, Monday to Friday.</strong> We take 2 details per day, so spots fill up. Need a different time? Just let us know and Eric will confirm.' }),
                f('lighting', 'Custom Lighting Upgrades', 'multi', { when: ['service', ['Custom Lighting']], opts: ['Morimoto Headlight/Taillight Assemblies', 'Off-Road & Auxiliary (Baja Designs / BMC)', 'Accent & Replacement Bulbs (Diode Dynamics)', 'Starlight Headliner Installation'] }),
                f('protection', 'Additional Protection', 'multi', { when: ['service', ['Premium Detailing', 'Window Tinting']], opts: ['Windshield Brow (1-Piece Custom Cut) - +$180 CAD', 'Panoramic Roof Absolute Shield - +$350 CAD', 'Heavy Pet Hair Extraction Clean - +$50 CAD', 'Odor Neutralizing Ozone Air Cleansing - +$75 CAD', 'Engine Bay Detail & Component Dressing - +$80 CAD', 'Paint Pore Clay Bar Finish Treatment - +$60 CAD', 'Headlight Restoration - +$150 CAD', 'Single-Stage Machine Gloss Polish - +$200 CAD'] }),
                f('first', 'First Name', 'text', { req: 1, ph: 'Enter your first name', half: 1 }),
                f('last', 'Last Name', 'text', { req: 1, ph: 'Enter your last name', half: 1 }),
                f('phone', 'Phone', 'tel', { req: 1, ph: '+1 (555) 000-0000', half: 1 }),
                f('email', 'Email', 'email', { req: 1, ph: 'your@email.com', half: 1 }),
                f('consent', 'SMS consent', 'check', { req: 1, html: SMS_CONSENT }),
            ],
        },
        build: {
            title: 'Build Request',
            submit: 'Book Service Date',
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

    const INPUT = 'w-full bg-void text-signal placeholder-zinc-600 p-3.5 rounded-xl border border-edge focus:outline-none focus:border-labBlue focus:ring-1 focus:ring-labBlue transition-colors';
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

    function control(d) {
        const attrs = `name="${d.id}"${d.req ? ' required' : ''}`;
        if (d.type === 'textarea') return `<textarea ${attrs} rows="3" placeholder="${esc(d.ph || '')}" class="${INPUT}"></textarea>`;
        if (d.type === 'select') return `<select ${attrs} class="${INPUT} appearance-none cursor-pointer"><option value="">Select…</option>${d.opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
        if (d.type === 'multi' || d.type === 'radio') {
            const t = d.type === 'multi' ? 'checkbox' : 'radio';
            return `<div class="space-y-2">${d.opts.map((o) => `<label class="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer"><input type="${t}" name="${d.id}" value="${esc(o)}" class="mt-1 accent-[#0066FF]"><span>${esc(o)}</span></label>`).join('')}</div>`;
        }
        if (d.type === 'note') return `<div class="rounded-xl border border-labBlue/40 bg-labBlue/10 p-4 text-sm text-zinc-200 leading-relaxed">${d.html}</div>`;
        if (d.type === 'check') return `<label class="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="${d.id}" ${d.req ? 'required' : ''} class="mt-1 accent-[#0066FF] flex-shrink-0"><span class="text-[11px] text-zinc-500 leading-relaxed">${d.html}</span></label>`;
        const extra = (d.type === 'tel' ? ' pattern="[0-9\\s()+.\\-]{10,}" title="Enter a 10-digit phone number" autocomplete="tel"' : '') + (d.minlength ? ` minlength="${d.minlength}" maxlength="${d.maxlength}"` : '');
        return `<input type="${d.type}" ${attrs} placeholder="${esc(d.ph || '')}"${extra} class="${INPUT}">`;
    }

    function field(d) {
        const label = d.type === 'check' ? '' : `<span class="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">${esc(d.label)}${d.req ? ' <span class="text-labBlue">*</span>' : ''}</span>`;
        return `<div data-field="${d.id}" class="${d.half ? '' : 'sm:col-span-2'}"${d.when ? ' hidden' : ''}>${label}${control(d)}</div>`;
    }

    function mount(el, key) {
        const cfg = FORMS[key];
        el.innerHTML = `<form novalidate class="grid sm:grid-cols-2 gap-5" autocomplete="on">
            ${cfg.fields.map(field).join('')}
            <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0">
            <div class="sm:col-span-2">
                <p data-msg role="alert" class="text-sm text-red-400 mb-3" hidden></p>
                <button type="submit" class="w-full bg-signal text-void font-extrabold text-[15px] tracking-wide min-h-[52px] rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all uppercase disabled:opacity-60">${cfg.submit}</button>
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
            // set by the tinting page estimator (tint-builder.js) so Eric sees which windows they tapped
            const EST = { 'Window Tinting': ['labTint', 'Tint estimate'], 'Premium Detailing': ['labDetail', 'Detailing estimate'], 'Custom Lighting': ['labLighting', 'Lighting wish list'], 'Custom Tuning': [] };
            try { const e = EST[v.service]; const t = e && e[0] && sessionStorage.getItem(e[0]); if (t) add(e[1], t); } catch (err) { /* storage unavailable */ }
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
                done(el, v.service === 'Premium Detailing' ? 'detailing' : 'eric');
            } catch (err) {
                msg.innerHTML = `We couldn't send that. Please call or text us at <a class="underline" href="tel:${TEXT_TO}">${textDisplay}</a> or try again.`;
                msg.hidden = false;
                btn.disabled = false; btn.textContent = cfg.submit;
            }
        });
    }

    // Replaces the form once Eric has the request. The booking calendar is embedded right here, no redirect.
    function done(el, route) {
        const url = BOOKING[route];
        const drop = route === 'detailing';
        el.innerHTML = `<div class="text-center">
            <p class="text-white text-lg leading-snug mb-2"><strong class="font-heading font-extrabold uppercase">Got it!</strong> Eric has your request.</p>
            <p class="text-zinc-400 text-sm mb-5">${url ? `Pick ${drop ? 'your drop-off' : 'a'} time below. ` : ''}Eric will confirm and text you a $50 deposit link to lock in your spot (100% credited to your final invoice).</p>
            ${drop ? '<p class="text-zinc-300 text-xs mb-4">Drop-off is 8:00 to 9:00 AM, Monday to Friday (Fort St. John time).</p>' : ''}
            ${url ? `<iframe src="${esc(url)}" title="Pick a time" loading="lazy" class="w-full rounded-xl bg-white" style="height:720px;border:0"></iframe>
            <a href="${esc(url)}" target="_blank" rel="noopener" class="inline-block text-labBlue hover:underline text-xs mt-3">Calendar not loading? Open it in a new tab</a>` : ''}
            <p class="text-zinc-500 text-[11px] mt-4">Questions? Call or text ${textDisplay}.</p>
        </div>`;
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-intake]').forEach((el) => mount(el, el.dataset.intake));
    });
})();
