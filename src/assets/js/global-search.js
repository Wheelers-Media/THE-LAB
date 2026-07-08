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
        { title: 'Ceramic Coatings', desc: 'Industry-leading nano-ceramic paint protection and coating services.', url: '/boutique/coatings/', tags: ['ceramic', 'coating', 'paint', 'protection', 'nano', 'hydrophobic', 'boutique', 'service'] },
        { title: 'Premium Detailing', desc: 'Full decontamination, paint correction, and concours-level finish restoration.', url: '/boutique/detailing/', tags: ['detailing', 'detail', 'paint', 'correction', 'polish', 'wash', 'boutique', 'service'] },
        { title: 'Paint Protection Film (PPF)', desc: 'Self-healing TPU film invisible armor against chips and road debris.', url: '/boutique/ppf/', tags: ['ppf', 'paint', 'protection', 'film', 'clear', 'bra', 'chip', 'boutique', 'service'] },
        { title: 'Custom Lighting', desc: 'Morimoto headlights, LED upgrades, and custom truck lighting packages.', url: '/boutique/lighting/', tags: ['lighting', 'lights', 'led', 'headlight', 'morimoto', 'diode', 'boutique', 'service'] },
        { title: 'SxS Services', desc: 'Side-by-side and ATV detailing, wrapping, and upgrade services.', url: '/boutique/sxs/', tags: ['sxs', 'side by side', 'atv', 'utv', 'polaris', 'can-am', 'boutique'] },
        { title: 'The Boutique', desc: 'All vehicle aesthetics and protection services - tinting, coatings, detailing, PPF, lighting.', url: '/boutique/', tags: ['boutique', 'service', 'booking', 'appointment'] },
        { title: 'EGR Delete Kits', desc: 'EGR delete block-off kits for Powerstroke, Cummins, and Duramax diesels.', url: '/store/catalog/?category=EGR', tags: ['egr', 'delete', 'kit', 'powerstroke', 'cummins', 'duramax', 'diesel', 'parts'] },
        { title: 'Exhaust Systems', desc: 'Mandrel-bent stainless steel DPF-back and turbo-back exhaust systems.', url: '/store/catalog/?category=Exhaust', tags: ['exhaust', 'dpf', 'turbo', 'back', 'stainless', 'diesel', 'parts', 'polar'] },
        { title: 'CCV Solutions', desc: 'Crankcase ventilation upgrades and catch can systems for diesel trucks.', url: '/store/catalog/?category=CCV', tags: ['ccv', 'crankcase', 'catch can', 'vent', 'diesel', 'parts'] },
        { title: 'Custom Tuning', desc: 'EZ LYNK, HP Tuners, and AMDP platform-specific diesel tuning packages.', url: '/store/tuning/', tags: ['tuning', 'tune', 'ez lynk', 'hp tuners', 'amdp', 'diesel', 'power', 'efilive'] },
        { title: 'Bumpers & Accessories', desc: 'Gridiron steel bumpers, mud flaps, off-road lighting, and truck accessories.', url: '/store/catalog/?category=Accessories', tags: ['bumper', 'accessories', 'gridiron', 'mud flap', 'off-road', 'truck'] },
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
            <a href="${m.url}" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-edge/40 last:border-0">
                <svg class="w-4 h-4 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <div><div class="text-white text-sm font-bold">${m.title}</div><div class="text-zinc-500 text-xs">${m.desc}</div></div>
            </a>
        `).join('');
    };

    window.toggleGlobalSearch = function () {
        const el = document.getElementById('global-search-overlay');
        if (!el) return;
        const isHidden = el.classList.contains('hidden') || el.style.display === 'none' || el.style.display === '';
        if (isHidden) {
            el.classList.remove('hidden');
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            setTimeout(() => { el.classList.remove('opacity-0'); document.getElementById('global-search-input')?.focus(); }, 10);
            document.body.style.overflow = 'hidden';
        } else {
            el.classList.add('opacity-0');
            setTimeout(() => { el.classList.add('hidden'); el.style.display = 'none'; document.body.style.overflow = ''; }, 300);
        }
    };

    function wireOverlay() {
        const submitBtn = document.getElementById('global-search-submit');
        const input = document.getElementById('global-search-input');
        if (submitBtn) submitBtn.addEventListener('click', () => { if (input?.value) window.globalSearch(input.value); });
        if (input) {
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.globalSearch(e.target.value); });
            input.addEventListener('input', (e) => window.renderSearchSuggestions(e.target.value));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireOverlay);
    } else {
        wireOverlay();
    }
})();
