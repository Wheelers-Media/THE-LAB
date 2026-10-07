// ═══════════════════════════════════════════════════════
// THE LAB – Shared Global Search Engine
// Loaded on every page. Handles the overlay search bar,
// smart vehicle-make keyword routing, and live suggestions.
// ═══════════════════════════════════════════════════════

(function () {
    'use strict';

    // Site-wide content index
    const SITE_PAGES = [
        { title: 'Window Tinting', desc: 'Ceramic & carbon film tinting services for cars and trucks.', url: '/boutique/tinting/', tags: ['tinting', 'window', 'ceramic', 'film', 'heat', 'uv', 'boutique', 'service'] },
        { title: 'Ceramic Coatings', desc: 'Nano-ceramic paint protection. Coming soon.', url: '/boutique/coatings/', tags: ['ceramic', 'coating', 'paint', 'protection', 'nano', 'hydrophobic', 'boutique', 'service'] },
        { title: 'Premium Detailing', desc: 'Full decontamination, paint correction, and concours-level finish restoration.', url: '/boutique/detailing/', tags: ['detailing', 'detail', 'paint', 'correction', 'polish', 'wash', 'boutique', 'service'] },
        { title: 'Paint Protection Film (PPF)', desc: 'Self-healing TPU film against chips and road debris. Coming soon.', url: '/boutique/ppf/', tags: ['ppf', 'paint', 'protection', 'film', 'clear', 'bra', 'chip', 'boutique', 'service'] },
        { title: 'Custom Lighting', desc: 'Morimoto headlights, LED upgrades, and custom truck lighting packages.', url: '/boutique/lighting/', tags: ['lighting', 'lights', 'led', 'headlight', 'morimoto', 'diode', 'boutique', 'service'] },
        { title: 'SxS Services', desc: 'Side-by-side and ATV detailing, wrapping, and upgrade services.', url: '/boutique/sxs/', tags: ['sxs', 'side by side', 'atv', 'utv', 'polaris', 'can-am', 'boutique'] },
        { title: 'The Boutique', desc: 'All vehicle aesthetics and protection services - tinting, coatings, detailing, PPF, lighting.', url: '/boutique/', tags: ['boutique', 'service', 'booking', 'appointment'] },
        { title: 'EGR Delete Kits', desc: 'EGR delete block-off kits for Powerstroke, Cummins, and Duramax diesels.', url: '/store/catalog/?category=EGR', tags: ['egr', 'delete', 'kit', 'powerstroke', 'cummins', 'duramax', 'diesel', 'parts'] },
        { title: 'Exhaust Systems', desc: 'Mandrel-bent stainless steel DPF-back and turbo-back exhaust systems.', url: '/store/catalog/?category=Exhaust', tags: ['exhaust', 'dpf', 'turbo', 'back', 'stainless', 'diesel', 'parts', 'polar'] },
        { title: 'CCV Solutions', desc: 'Crankcase ventilation upgrades and catch can systems for diesel trucks.', url: '/store/catalog/?category=CCV', tags: ['ccv', 'crankcase', 'catch can', 'vent', 'diesel', 'parts'] },
        { title: 'Custom Tuning', desc: 'EZ LYNK, HP Tuners, and AMDP platform-specific diesel tuning packages.', url: '/store/tuning/', tags: ['tuning', 'tune', 'ez lynk', 'hp tuners', 'amdp', 'diesel', 'power', 'efilive'] },
        { title: 'Bumpers & Accessories', desc: 'Gridiron steel bumpers, mud flaps, off-road lighting, and truck accessories.', url: '/store/catalog/?category=Accessories', tags: ['bumper', 'accessories', 'gridiron', 'mud flap', 'off-road', 'truck'] },
        { title: 'Gridiron Bumpers', desc: 'Gridiron steel bumpers for Ram, Ford, Chevrolet and GMC trucks. Sold and installed at THE LAB.', url: '/gridiron/', tags: ['gridiron', 'bumper', 'bumpers', 'steel', 'winch', 'prerunner', 'full tube', 'base', 'ram', 'ford', 'super duty', 'chevy', 'gmc', 'front bumper', 'rear bumper'] },
        { title: 'Gift Certificates', desc: 'THE LAB gift cards from $50 to $400, bought online.', url: 'https://xr6pmx-y0.myshopify.com/products/the-lab-gift-card', tags: ['gift', 'gift card', 'gift certificate', 'certificate', 'present'] },
        { title: 'Custom Installs & Extra Services', desc: 'Mud flap installs, decal removal, rim and full truck polishing, and custom parts at $125/hr.', url: '/contact/?service=Other%20%2F%20Custom%20Install#form', tags: ['install', 'installation', 'mud flap', 'mudflap', 'decal', 'decals', 'rim', 'rims', 'polish', 'polishing', 'fender flare', 'flares', 'custom', 'labour', 'shop rate', 'boutique', 'service'] },
        { title: 'Transmission Tuning', desc: 'Aisin and 68RFE transmission tuning for Cummins trucks.', url: '/store/catalog/?search=transmission', tags: ['transmission', 'trans', 'tcm', 'aisin', '68rfe', 'tune', 'tuning', 'cummins', 'shift'] },
        { title: 'Grid Heater Upgrades', desc: 'Grid heater upgrade kits for Cummins trucks.', url: '/store/catalog/?search=grid%20heater', tags: ['grid heater', 'heater', 'cold start', 'cummins', 'upgrade', 'parts'] },
        { title: 'Contact & Book a Service', desc: 'Book a boutique service or performance build request at THE LAB in Fort St. John.', url: '/contact/', tags: ['contact', 'book', 'booking', 'appointment', 'service', 'phone', 'call', 'email'] },
        { title: 'About THE LAB', desc: "Learn about THE LAB - Fort St. John's premium diesel and aesthetic vehicle shop.", url: '/about/', tags: ['about', 'lab', 'story', 'team', 'fort st john'] },
        { title: 'Shipping & Returns', desc: 'Shipping policy, return policy, and order tracking information.', url: '/shipping/', tags: ['shipping', 'returns', 'policy', 'tracking', 'order'] },
    ];

    // Vehicle make keyword map - ensures make-specific queries route correctly
    const MAKE_KEYWORD_MAP = {
        duramax: 'Chevy', lbz: 'Chevy', lly: 'Chevy', lmm: 'Chevy', lml: 'Chevy', l5p: 'Chevy',
        chevy: 'Chevy', chevrolet: 'Chevy', silverado: 'Chevy',
        gmc: 'GMC', sierra: 'GMC',
        cummins: 'Ram', ram: 'Ram', dodge: 'Ram',
        powerstroke: 'Ford', ford: 'Ford', f250: 'Ford', f350: 'Ford',
        ecodiesel: 'Ram',
        sprinter: 'Mercedes',
        nissan: 'Nissan', titan: 'Nissan',
    };

    window.globalSearch = function (rawQuery) {
        if (!rawQuery || !rawQuery.trim()) return;
        const q = rawQuery.toLowerCase().trim();
        const tokens = q.split(/\s+/);

        // Score site pages
        const scored = SITE_PAGES.map(page => {
            let score = 0;
            tokens.forEach(token => {
                if (page.title.toLowerCase().includes(token)) score += 10;
                if (page.desc.toLowerCase().includes(token)) score += 5;
                if (page.tags.some(t => t.includes(token) || token.includes(t))) score += 8;
            });
            return { ...page, score };
        }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

        // Detect vehicle make keyword in query
        let detectedMake = null;
        for (const token of tokens) {
            if (MAKE_KEYWORD_MAP[token]) { detectedMake = MAKE_KEYWORD_MAP[token]; break; }
        }

        if (scored.length > 0) {
            let bestUrl = scored[0].url;
            if (detectedMake && (bestUrl.includes('/store/catalog/') || bestUrl.includes('/store/tuning/'))) {
                const u = new URL(bestUrl, window.location.origin);
                if (!u.searchParams.has('make')) u.searchParams.set('make', detectedMake);
                u.searchParams.set('search', rawQuery.trim());
                bestUrl = u.pathname + u.search;
            }
            window.location.href = bestUrl;
        } else {
            const u = new URL('/store/catalog/', window.location.origin);
            u.searchParams.set('search', rawQuery.trim());
            if (detectedMake) u.searchParams.set('make', detectedMake);
            window.location.href = u.pathname + u.search;
        }
    };

    window.renderSearchSuggestions = function (query) {
        const suggestEl = document.getElementById('global-search-suggestions');
        if (!suggestEl) return;
        if (!query || query.length < 2) { suggestEl.innerHTML = ''; suggestEl.classList.add('hidden'); return; }
        const q = query.toLowerCase();
        const tokens = q.split(/\s+/);
        const matches = SITE_PAGES.map(page => {
            let score = 0;
            tokens.forEach(token => {
                if (page.title.toLowerCase().includes(token)) score += 10;
                if (page.tags.some(t => t.includes(token) || token.includes(t))) score += 8;
                if (page.desc.toLowerCase().includes(token)) score += 3;
            });
            return { ...page, score };
        }).filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

        if (matches.length === 0) { suggestEl.innerHTML = ''; suggestEl.classList.add('hidden'); return; }
        suggestEl.classList.remove('hidden');
        suggestEl.innerHTML = matches.map(m => `
            <a href="${m.url}" class="site-search-item" role="option"><b>${m.title}</b><span>${m.desc}</span></a>
        `).join('');
    };

    let opener = null;
    window.toggleGlobalSearch = function () {
        const el = document.getElementById('global-search-overlay');
        if (!el) return;
        const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!el.classList.contains('is-open')) {
            opener = document.activeElement;
            el.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => { el.classList.add('is-visible'); const i = document.getElementById('global-search-input'); if (i) i.focus(); });
        } else {
            el.classList.remove('is-visible');
            document.body.style.overflow = '';
            setTimeout(() => el.classList.remove('is-open'), calm ? 0 : 200);
            if (opener && opener.focus) opener.focus();
        }
    };

    function wireOverlay() {
        const submitBtn = document.getElementById('global-search-submit');
        const input = document.getElementById('global-search-input');
        if (submitBtn) submitBtn.addEventListener('click', () => { if (input?.value) window.globalSearch(input.value); });
        if (input) {
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.globalSearch(e.target.value); });
            input.addEventListener('input', (e) => window.renderSearchSuggestions(e.target.value));
        }
    }

    document.addEventListener('keydown', (e) => {
        const el = document.getElementById('global-search-overlay');
        if (e.key === 'Escape' && el && el.classList.contains('is-open')) window.toggleGlobalSearch();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireOverlay);
    } else {
        wireOverlay();
    }
})();
