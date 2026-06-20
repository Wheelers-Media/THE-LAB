// ═══════════════════════════════════════════════════════════════════════════
// THE LAB — MANDATE 1: "BUILD YOUR TUNE" YMM GUIDED TUNING GATEWAY
// Wires the inline Year/Make/Model/Engine selectors to the live store filter,
// drives step-dot progress, and reveals the EZ LYNK vs HP Tuners split cards.
// ═══════════════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ── Vehicle data (mirrors store.js V_DATA) ──────────────────────────────
    const BYT_VEHICLE_DATA = {
        'Ford': {
            models: ['F-250 Super Duty', 'F-350 Super Duty', 'F-450 Super Duty', 'F-150', 'Expedition'],
            engines: ['6.7L Powerstroke', '6.4L Powerstroke', '6.0L Powerstroke', '3.0L Powerstroke']
        },
        'Ram': {
            models: ['2500', '3500'],
            engines: ['6.7L Cummins', '5.9L Cummins']
        },
        'Chevy': {
            models: ['Silverado 2500HD', 'Silverado 3500HD', 'Silverado 1500', 'Colorado'],
            engines: ['6.6L Duramax', '3.0L Duramax', '2.8L Duramax']
        },
        'GMC': {
            models: ['Sierra 2500HD', 'Sierra 3500HD', 'Sierra 1500', 'Canyon'],
            engines: ['6.6L Duramax', '3.0L Duramax', '2.8L Duramax']
        },
        'Jeep': {
            models: ['Grand Cherokee', 'Gladiator'],
            engines: ['3.0L EcoDiesel']
        },
        'Nissan': {
            models: ['Titan XD'],
            engines: ['5.0L Cummins']
        }
    };

    // ── DOM refs ────────────────────────────────────────────────────────────
    const elYear    = document.getElementById('byt-year');
    const elMake    = document.getElementById('byt-make');
    const elModel   = document.getElementById('byt-model');
    const elEngine  = document.getElementById('byt-engine');
    const elFind    = document.getElementById('byt-find');
    const elClear   = document.getElementById('byt-clear');
    const elToggle  = document.getElementById('byt-toggle');
    const elBody    = document.getElementById('byt-gateway-body');
    const elPlatformSplit = document.getElementById('byt-platform-split');
    const elVehiclePill   = document.getElementById('byt-vehicle-pill');
    const elVehiclePillText = document.getElementById('byt-vehicle-pill-text');

    const dot1 = document.getElementById('byt-dot-1');
    const dot2 = document.getElementById('byt-dot-2');
    const dot3 = document.getElementById('byt-dot-3');
    const dot4 = document.getElementById('byt-dot-4');

    if (!elYear || !elMake) return; // Not on catalog page

    // ── Populate year select ────────────────────────────────────────────────
    for (let y = 2026; y >= 1990; y--) {
        elYear.add(new Option(y.toString(), y.toString()));
    }

    // ── Update step-dot progress indicators ────────────────────────────────
    function updateDots(step) {
        const dots = [dot1, dot2, dot3, dot4];
        dots.forEach((d, i) => {
            if (!d) return;
            const stepNum = i + 1;
            d.classList.remove('active', 'done');
            if (stepNum < step) d.classList.add('done');
            else if (stepNum === step) d.classList.add('active');
        });
    }

    // ── Activate a numbered badge ────────────────────────────────────────────
    function activateBadge(badgeId) {
        const el = document.getElementById(badgeId);
        if (!el) return;
        el.classList.remove('bg-edge', 'text-zinc-400');
        el.classList.add('bg-labBlue', 'text-white');
    }

    // ── Reset downstream selects ─────────────────────────────────────────────
    function resetSelect(sel, placeholder) {
        sel.innerHTML = `<option value="">${placeholder}</option>`;
        sel.disabled = true;
    }

    // ── Populate a select from an array ─────────────────────────────────────
    function populateSelect(sel, items) {
        sel.innerHTML = `<option value="">${sel.getAttribute('aria-label')}</option>`;
        items.forEach(item => sel.add(new Option(item, item)));
        sel.disabled = false;
    }

    // ── Wire Year ────────────────────────────────────────────────────────────
    elYear.addEventListener('change', () => {
        resetSelect(elMake, 'Select Make');
        resetSelect(elModel, 'Select Model');
        resetSelect(elEngine, 'Select Engine');
        elFind.disabled = true;
        elFind.classList.add('opacity-30', 'cursor-not-allowed');
        elFind.classList.remove('hover:bg-labCyan', 'cursor-pointer');
        hidePlatformSplit();

        if (elYear.value) {
            populateSelect(elMake, Object.keys(BYT_VEHICLE_DATA));
            activateBadge('byt-step2-badge');
            updateDots(2);
        } else {
            updateDots(1);
        }
    });

    // ── Wire Make ────────────────────────────────────────────────────────────
    elMake.addEventListener('change', () => {
        resetSelect(elModel, 'Select Model');
        resetSelect(elEngine, 'Select Engine');
        elFind.disabled = true;
        elFind.classList.add('opacity-30', 'cursor-not-allowed');
        hidePlatformSplit();

        if (elMake.value && BYT_VEHICLE_DATA[elMake.value]) {
            populateSelect(elModel, BYT_VEHICLE_DATA[elMake.value].models);
            activateBadge('byt-step3-badge');
            updateDots(3);
        } else {
            updateDots(2);
        }
    });

    // ── Wire Model ───────────────────────────────────────────────────────────
    elModel.addEventListener('change', () => {
        resetSelect(elEngine, 'Select Engine');
        elFind.disabled = true;
        elFind.classList.add('opacity-30', 'cursor-not-allowed');
        hidePlatformSplit();

        if (elModel.value && elMake.value && BYT_VEHICLE_DATA[elMake.value]) {
            populateSelect(elEngine, BYT_VEHICLE_DATA[elMake.value].engines);
            activateBadge('byt-step4-badge');
            updateDots(4);
        } else {
            updateDots(3);
        }
    });

    // ── Wire Engine ──────────────────────────────────────────────────────────
    elEngine.addEventListener('change', () => {
        if (elEngine.value) {
            elFind.disabled = false;
            elFind.classList.remove('opacity-30', 'cursor-not-allowed');
            elFind.classList.add('hover:bg-labCyan', 'cursor-pointer');
        } else {
            elFind.disabled = true;
            elFind.classList.add('opacity-30', 'cursor-not-allowed');
            elFind.classList.remove('hover:bg-labCyan', 'cursor-pointer');
        }
    });

    // ── "Find My Parts" button ───────────────────────────────────────────────
    elFind.addEventListener('click', () => {
        const vehicle = {
            year:   parseInt(elYear.value),
            make:   elMake.value,
            model:  elModel.value,
            engine: elEngine.value
        };

        // Persist to sessionStorage (same format as the store engine)
        sessionStorage.setItem('lab_active_vehicle', JSON.stringify(vehicle));

        // Push into store.js activeVehicle and re-render
        if (typeof window.activeVehicle !== 'undefined') {
            window.activeVehicle = vehicle;
        }
        if (typeof window.renderProducts === 'function') {
            // Sync activeFilters with vehicle
            if (window.activeFilters) {
                window.activeFilters.makes   = [vehicle.make];
                window.activeFilters.engines = [vehicle.engine];
                window.activeFilters.year    = vehicle.year;
            }
            window.activeVehicle = vehicle;
            window.renderProducts();
        }

        // Update UI state
        const pillText = `${vehicle.year} ${vehicle.make} ${vehicle.model} — ${vehicle.engine}`;
        elVehiclePillText.textContent = pillText;
        elVehiclePill.classList.remove('hidden');
        elVehiclePill.classList.add('inline-flex');

        elClear.classList.remove('hidden');
        elFind.textContent = '✓ Parts Filtered';

        // Update platform card hrefs with vehicle params
        const params = `&vmake=${encodeURIComponent(vehicle.make)}&vengine=${encodeURIComponent(vehicle.engine)}&vyear=${vehicle.year}&vmodel=${encodeURIComponent(vehicle.model)}`;
        const ezCard = document.getElementById('byt-card-ezlynk');
        const hpCard = document.getElementById('byt-card-hptuners');
        if (ezCard) ezCard.href = `/store/catalog/?category=Tuning&platform=ezlynk${params}`;
        if (hpCard) hpCard.href = `/store/catalog/?category=Tuning&platform=hptuners${params}`;

        // Reveal the platform split
        showPlatformSplit();

        // Update document title
        document.title = `Parts for ${vehicle.year} ${vehicle.make} ${vehicle.engine} | THE LAB`;
    });

    // ── "Clear Vehicle" button ───────────────────────────────────────────────
    elClear.addEventListener('click', () => {
        // Reset sessionStorage
        sessionStorage.removeItem('lab_active_vehicle');

        // Reset store engine
        if (window.activeFilters) {
            window.activeFilters.makes   = [];
            window.activeFilters.engines = [];
            window.activeFilters.year    = null;
        }
        window.activeVehicle = null;
        if (typeof window.renderProducts === 'function') window.renderProducts();

        // Reset selects
        elYear.value = '';
        resetSelect(elMake, 'Select Make');
        resetSelect(elModel, 'Select Model');
        resetSelect(elEngine, 'Select Engine');
        elFind.disabled = true;
        elFind.classList.add('opacity-30', 'cursor-not-allowed');
        elFind.textContent = 'Find My Parts';
        elFind.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Find My Parts`;

        elClear.classList.add('hidden');
        elVehiclePill.classList.add('hidden');
        elVehiclePill.classList.remove('inline-flex');

        hidePlatformSplit();
        updateDots(1);
        document.title = 'The Parts Store | THE LAB Performance';
    });

    // ── Platform split show/hide ─────────────────────────────────────────────
    function showPlatformSplit() {
        if (!elPlatformSplit) return;
        elPlatformSplit.classList.remove('hidden');
        elPlatformSplit.style.opacity = '0';
        elPlatformSplit.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
            elPlatformSplit.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            elPlatformSplit.style.opacity = '1';
            elPlatformSplit.style.transform = 'translateY(0)';
        });
    }

    function hidePlatformSplit() {
        if (!elPlatformSplit) return;
        elPlatformSplit.style.opacity = '0';
        elPlatformSplit.style.transform = 'translateY(8px)';
        setTimeout(() => elPlatformSplit.classList.add('hidden'), 350);
    }

    // ── Collapse/expand toggle ────────────────────────────────────────────────
    let isExpanded = true;
    if (elToggle && elBody) {
        elToggle.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                elBody.style.maxHeight = '900px';
                elBody.style.opacity = '1';
                document.getElementById('byt-toggle-label').textContent = 'Collapse';
                document.getElementById('byt-toggle-icon').style.transform = '';
            } else {
                elBody.style.maxHeight = '0';
                elBody.style.opacity = '0';
                document.getElementById('byt-toggle-label').textContent = 'Build Your Tune';
                document.getElementById('byt-toggle-icon').style.transform = 'rotate(180deg)';
            }
            elToggle.setAttribute('aria-expanded', String(isExpanded));
        });
    }

    // ── Restore pinned vehicle from sessionStorage ────────────────────────────
    (function restoreSession() {
        const saved = sessionStorage.getItem('lab_active_vehicle');
        if (!saved) return;
        try {
            const v = JSON.parse(saved);
            if (!v.year || !v.make || !v.engine) return;

            // Pre-fill year
            elYear.value = String(v.year);
            if (!elYear.value) return;

            // Pre-fill make
            populateSelect(elMake, Object.keys(BYT_VEHICLE_DATA));
            elMake.value = v.make;
            if (!elMake.value || !BYT_VEHICLE_DATA[v.make]) return;

            // Pre-fill model
            populateSelect(elModel, BYT_VEHICLE_DATA[v.make].models);
            elModel.value = v.model || '';

            // Pre-fill engine
            populateSelect(elEngine, BYT_VEHICLE_DATA[v.make].engines);
            elEngine.value = v.engine;

            // Activate find button
            elFind.disabled = false;
            elFind.classList.remove('opacity-30', 'cursor-not-allowed');
            elFind.classList.add('hover:bg-labCyan', 'cursor-pointer');
            elFind.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Find My Parts`;

            // Show pill + clear
            const pillText = `${v.year} ${v.make} ${v.model} — ${v.engine}`;
            elVehiclePillText.textContent = pillText;
            elVehiclePill.classList.remove('hidden');
            elVehiclePill.classList.add('inline-flex');
            elClear.classList.remove('hidden');

            activateBadge('byt-step2-badge');
            activateBadge('byt-step3-badge');
            activateBadge('byt-step4-badge');
            updateDots(4);

            // Show platform split
            showPlatformSplit();
        } catch (e) {
            // Silently ignore corrupt data
        }
    })();

}());
