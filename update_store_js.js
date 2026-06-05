const fs = require('fs');
const path = require('path');

const storeJsPath = path.join(__dirname, 'src', 'assets', 'js', 'store.js');
let content = fs.readFileSync(storeJsPath, 'utf8');

// The new logic block for the vehicle selector
const vehicleSelectorLogic = `
/* --- VEHICLE SELECTOR ENGINE --- */
const V_DATA = {
    "Ram": {
        models: ["2500", "3500"],
        engines: ["6.7L Cummins"]
    },
    "Ford": {
        models: ["F-250", "F-350"],
        engines: ["6.7L Powerstroke"]
    },
    "Chevy": {
        models: ["Silverado 2500HD", "Silverado 3500HD"],
        engines: ["6.6L Duramax"]
    },
    "GMC": {
        models: ["Sierra 2500HD", "Sierra 3500HD"],
        engines: ["6.6L Duramax"]
    }
};

let activeVehicle = JSON.parse(sessionStorage.getItem('lab_active_vehicle')) || null;

function initVehicleSelector() {
    const hero = document.getElementById("vehicle-selector-hero");
    const banner = document.getElementById("active-garage-banner");
    
    // Selects
    const sYear = document.getElementById("vs-year");
    const sMake = document.getElementById("vs-make");
    const sModel = document.getElementById("vs-model");
    const sEngine = document.getElementById("vs-engine");
    const btnSubmit = document.getElementById("vs-submit");
    
    if (!hero || !sYear) return;

    // Populate Years
    if (sYear.options.length === 1) {
        for (let y = 2024; y >= 2000; y--) {
            sYear.add(new Option(y, y));
        }
    }

    sYear.addEventListener('change', () => {
        sMake.innerHTML = '<option value="">Make</option>';
        sModel.innerHTML = '<option value="">Model</option>';
        sEngine.innerHTML = '<option value="">Engine</option>';
        btnSubmit.disabled = true;
        sModel.disabled = true;
        sEngine.disabled = true;
        
        if (sYear.value) {
            Object.keys(V_DATA).forEach(make => sMake.add(new Option(make, make)));
            sMake.disabled = false;
        } else {
            sMake.disabled = true;
        }
    });

    sMake.addEventListener('change', () => {
        sModel.innerHTML = '<option value="">Model</option>';
        sEngine.innerHTML = '<option value="">Engine</option>';
        btnSubmit.disabled = true;
        sEngine.disabled = true;

        if (sMake.value) {
            V_DATA[sMake.value].models.forEach(m => sModel.add(new Option(m, m)));
            sModel.disabled = false;
        } else {
            sModel.disabled = true;
        }
    });

    sModel.addEventListener('change', () => {
        sEngine.innerHTML = '<option value="">Engine</option>';
        btnSubmit.disabled = true;

        if (sModel.value) {
            V_DATA[sMake.value].engines.forEach(e => sEngine.add(new Option(e, e)));
            sEngine.disabled = false;
        } else {
            sEngine.disabled = true;
        }
    });

    sEngine.addEventListener('change', () => {
        btnSubmit.disabled = !sEngine.value;
    });

    btnSubmit.addEventListener('click', () => {
        const vehicle = {
            year: parseInt(sYear.value),
            make: sMake.value,
            model: sModel.value,
            engine: sEngine.value
        };
        sessionStorage.setItem('lab_active_vehicle', JSON.stringify(vehicle));
        activeVehicle = vehicle;
        applyVehicleState();
        renderProducts();
    });

    const btnClear = document.getElementById("vs-clear");
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            sessionStorage.removeItem('lab_active_vehicle');
            activeVehicle = null;
            applyVehicleState();
            renderProducts();
        });
    }

    applyVehicleState();
}

function applyVehicleState() {
    const hero = document.getElementById("vehicle-selector-hero");
    const banner = document.getElementById("active-garage-banner");
    const nameStr = document.getElementById("active-vehicle-name");

    if (activeVehicle) {
        hero.classList.add("hidden");
        banner.classList.remove("hidden");
        if (nameStr) {
            nameStr.textContent = \`\${activeVehicle.year} \${activeVehicle.make} \${activeVehicle.model} \${activeVehicle.engine}\`;
        }
    } else {
        hero.classList.remove("hidden");
        banner.classList.add("hidden");
    }
}
`;

// Insert the new logic before `function initStore()`
content = content.replace(/function initStore\(\) {/, vehicleSelectorLogic + '\nfunction initStore() {');

// Add `initVehicleSelector()` call inside `initStore()`
content = content.replace(/renderProducts\(\);/, 'initVehicleSelector();\n    renderProducts();');

// Modify renderProducts to strictly apply activeVehicle limits
const newRenderProducts = `
function renderProducts() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    const filtered = window.storeCatalog.filter(p => {
        // Evaluate Sidebar Filters (Make, Category, Engine, Year)
        let makeMatch = activeFilters.makes.length === 0 || activeFilters.makes.some(m => p.makes.includes(m));
        let catMatch = activeFilters.categories.length === 0 || activeFilters.categories.includes(p.category);
        let engMatch = activeFilters.engines.length === 0 || activeFilters.engines.includes(p.engine) || p.engine === "Universal";
        let yearMatch = !activeFilters.year || (activeFilters.year >= p.years[0] && activeFilters.year <= p.years[1]);
        
        // STRICT OVERRIDE: If a vehicle is pinned in the session, override sidebar constraints for Make, Engine, Year
        if (activeVehicle) {
            // Map GMC back to Chevy constraints for catalog matching if needed
            const vMake = activeVehicle.make === "GMC" ? "Chevy" : activeVehicle.make;
            makeMatch = p.makes.includes(vMake) || p.makes.includes("Universal");
            engMatch = p.engine === activeVehicle.engine || p.engine === "Universal";
            yearMatch = activeVehicle.year >= p.years[0] && activeVehicle.year <= p.years[1];
        }

        return makeMatch && catMatch && engMatch && yearMatch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = \`
            <div class="col-span-full py-20 text-center">
                <h3 class="text-white text-xl font-bold mb-2">No products found</h3>
                <p class="text-zinc-500">Try adjusting your filters.</p>
            </div>
        \`;
        return;
    }
`;
content = content.replace(/function renderProducts\(\) \{[\s\S]*?if \(filtered\.length === 0\) \{/g, newRenderProducts + '\n    if (filtered.length === 0) {');

fs.writeFileSync(storeJsPath, content);
console.log("Updated store.js");
