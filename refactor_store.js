const fs = require('fs');
const path = require('path');

const storeIndexPath = path.join(__dirname, 'src', 'pages', 'store', 'index.html');
const catalogIndexPath = path.join(__dirname, 'src', 'pages', 'store', 'catalog', 'index.html');
const storeJsPath = path.join(__dirname, 'src', 'assets', 'js', 'store.js');

// 1. Modify Catalog Index HTML
let catalogContent = fs.readFileSync(catalogIndexPath, 'utf8');
// Remove Vehicle Selector Hero from catalog
catalogContent = catalogContent.replace(/<!-- VEHICLE SELECTOR HERO -->[\s\S]*?<!-- ACTIVE GARAGE BANNER -->/, '<!-- ACTIVE GARAGE BANNER -->');
fs.writeFileSync(catalogIndexPath, catalogContent);

// 2. Modify Store Index HTML (Landing Page)
let storeContent = fs.readFileSync(storeIndexPath, 'utf8');
// Remove Active Garage Banner and Sidebar + Grid from landing page
const valueSectionsHTML = `
    <!-- VALUE BUILDING SECTIONS -->
    <section class="py-24 px-6 bg-void relative">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-heading font-extrabold text-white uppercase tracking-tight">Shop by Category</h2>
                <div class="w-16 h-1 bg-labBlue mx-auto mt-4"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <a href="/store/catalog/?category=Tuning" class="group relative aspect-square rounded-2xl overflow-hidden border border-edge bg-[#111115] hover:border-labBlue transition-colors flex items-center justify-center p-8">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                    <div class="relative z-20 text-center translate-y-4 group-hover:translate-y-0 transition-transform">
                        <svg class="w-12 h-12 text-labBlue mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <h3 class="text-white font-bold text-lg uppercase tracking-widest">Custom Tuning</h3>
                        <p class="text-[10px] text-zinc-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">HP Tuners & EZ LYNK</p>
                    </div>
                </a>
                <a href="/store/catalog/?category=EGR" class="group relative aspect-square rounded-2xl overflow-hidden border border-edge bg-[#111115] hover:border-labBlue transition-colors flex items-center justify-center p-8">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                    <div class="relative z-20 text-center translate-y-4 group-hover:translate-y-0 transition-transform">
                        <svg class="w-12 h-12 text-labBlue mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                        <h3 class="text-white font-bold text-lg uppercase tracking-widest">EGR Solutions</h3>
                        <p class="text-[10px] text-zinc-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Delete Kits & Coolers</p>
                    </div>
                </a>
                <a href="/store/catalog/?category=Exhaust" class="group relative aspect-square rounded-2xl overflow-hidden border border-edge bg-[#111115] hover:border-labBlue transition-colors flex items-center justify-center p-8">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                    <div class="relative z-20 text-center translate-y-4 group-hover:translate-y-0 transition-transform">
                        <svg class="w-12 h-12 text-labBlue mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        <h3 class="text-white font-bold text-lg uppercase tracking-widest">Exhaust Systems</h3>
                        <p class="text-[10px] text-zinc-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Downpipes & DPF Deletes</p>
                    </div>
                </a>
                <a href="/store/catalog/?category=CCV" class="group relative aspect-square rounded-2xl overflow-hidden border border-edge bg-[#111115] hover:border-labBlue transition-colors flex items-center justify-center p-8">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                    <div class="relative z-20 text-center translate-y-4 group-hover:translate-y-0 transition-transform">
                        <svg class="w-12 h-12 text-labBlue mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <h3 class="text-white font-bold text-lg uppercase tracking-widest">CCV Reroutes</h3>
                        <p class="text-[10px] text-zinc-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Crankcase Ventilation</p>
                    </div>
                </a>
            </div>
        </div>
    </section>

    <!-- PREMIUM BRANDS -->
    <section class="py-24 px-6 border-y border-edge bg-[#050508] relative">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-heading font-extrabold text-white uppercase tracking-tight">Top Performance Brands</h2>
                <div class="w-16 h-1 bg-labBlue mx-auto mt-4"></div>
            </div>
            <div class="flex flex-wrap justify-center items-center gap-12 opacity-70">
                <img src="/assets/Polar-Diesel-Logo.webp" alt="Polar Diesel" class="h-16 object-contain grayscale hover:grayscale-0 transition-all cursor-pointer">
                <img src="/assets/EZ-Lynk-Logo.png" alt="EZ LYNK" class="h-12 object-contain grayscale hover:grayscale-0 transition-all cursor-pointer">
                <img src="/assets/HPTuners-Logo.png" alt="HP Tuners" class="h-10 object-contain grayscale hover:grayscale-0 transition-all cursor-pointer">
                <img src="/assets/AMDP-Logo.png" alt="AMDP" class="h-10 object-contain grayscale hover:grayscale-0 transition-all cursor-pointer">
            </div>
        </div>
    </section>

    <!-- THE LAB ADVANTAGE -->
    <section class="py-24 px-6 bg-void relative">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="text-center">
                <div class="w-16 h-16 rounded-full bg-labBlue/10 flex items-center justify-center text-labBlue mx-auto mb-6">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h3 class="text-white font-bold text-xl uppercase tracking-widest mb-3">Authorized Dealer</h3>
                <p class="text-zinc-500 text-sm leading-relaxed">We are official retailers for every brand we carry, guaranteeing authentic parts, full warranties, and factory support.</p>
            </div>
            <div class="text-center">
                <div class="w-16 h-16 rounded-full bg-labBlue/10 flex items-center justify-center text-labBlue mx-auto mb-6">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 class="text-white font-bold text-xl uppercase tracking-widest mb-3">Expert Support</h3>
                <p class="text-zinc-500 text-sm leading-relaxed">Our in-house master technicians install the exact same parts on customer builds daily. We know what works.</p>
            </div>
            <div class="text-center">
                <div class="w-16 h-16 rounded-full bg-labBlue/10 flex items-center justify-center text-labBlue mx-auto mb-6">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <h3 class="text-white font-bold text-xl uppercase tracking-widest mb-3">Fast Shipping</h3>
                <p class="text-zinc-500 text-sm leading-relaxed">We process and dispatch orders at lightning speed so you aren't left waiting to finish your build.</p>
            </div>
        </div>
    </section>
`;

storeContent = storeContent.replace(/<!-- ACTIVE GARAGE BANNER -->[\s\S]*?<\/section>/, valueSectionsHTML);
fs.writeFileSync(storeIndexPath, storeContent);


// 3. Modify store.js
let jsContent = fs.readFileSync(storeJsPath, 'utf8');

// Modify the submit button click in initVehicleSelector
const newSubmitCode = `
    btnSubmit.addEventListener('click', () => {
        const vehicle = {
            year: parseInt(sYear.value),
            make: sMake.value,
            model: sModel.value,
            engine: sEngine.value
        };
        sessionStorage.setItem('lab_active_vehicle', JSON.stringify(vehicle));
        activeVehicle = vehicle;
        
        // Redirect to catalog page
        if (!window.location.pathname.includes('/catalog')) {
            window.location.href = '/store/catalog/';
        } else {
            applyVehicleState();
            renderProducts();
        }
    });

    const btnClear = document.getElementById("vs-clear");
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            sessionStorage.removeItem('lab_active_vehicle');
            activeVehicle = null;
            // Redirect back to store landing page
            window.location.href = '/store/';
        });
    }
`;
jsContent = jsContent.replace(/btnSubmit\.addEventListener\('click', \(\) => \{[\s\S]*?btnClear\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);\n    \}/, newSubmitCode);

// Add logic to auto-check checkboxes in initStore
const autoCheckLogic = `
    // Auto-check filters based on activeVehicle
    if (activeVehicle) {
        activeFilters.makes.push(activeVehicle.make);
        activeFilters.engines.push(activeVehicle.engine);
        activeFilters.year = activeVehicle.year;

        const makeCb = document.getElementById(\`filter-make-\${activeVehicle.make === "GMC" ? "Chevy" : activeVehicle.make}\`);
        if (makeCb) makeCb.checked = true;

        // Note: engine checkbox IDs aren't currently bound to exact string matches easily via ID, 
        // but we can query them by value
        const engCb = document.querySelector(\`input[data-type="engine"][value="\${activeVehicle.engine}"]\`);
        if (engCb) engCb.checked = true;

        const yrInput = document.getElementById('filter-year');
        if (yrInput) yrInput.value = activeVehicle.year;
    }
`;
jsContent = jsContent.replace(/const category = params\.get\("category"\);/, 'const category = params.get("category");\n' + autoCheckLogic);

fs.writeFileSync(storeJsPath, jsContent);
console.log("Updated HTML files and store.js");
