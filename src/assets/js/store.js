// the LAB - Dynamic Store Engine
document.addEventListener("DOMContentLoaded", async () => {
    initCart();
    initVehicleSelector();
    
    // Fetch live data from Shopify
    if (window.initShopifyCatalog) {
        await window.initShopifyCatalog();
    }
    
    if (document.getElementById("product-grid")) {
        initStore();
    }
    if (document.getElementById("pdp-container")) {
        initPDP();
    }
});

/* --- CART LOGIC --- */
let cart = JSON.parse(localStorage.getItem("lab_cart")) || [];
cart.forEach(item => {
    if (!item.cartItemId) item.cartItemId = item.id + "_default";
});

function saveCart() {
    localStorage.setItem("lab_cart", JSON.stringify(cart));
    updateCartUI();
}

function addToCart(productId, quantity = 1, customAttributes = {}) {
    const product = window.storeCatalog.find(p => p.id === productId);
    if (!product) return;

    const attrKey = Object.keys(customAttributes).length > 0 ? btoa(JSON.stringify(customAttributes)) : "default";
    const cartItemId = productId + "_" + attrKey;

    const existing = cart.find(item => item.cartItemId === cartItemId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity, customAttributes, cartItemId });
    }
    saveCart();
    openCart();
}

function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart();
}

function updateQuantity(cartItemId, delta) {
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(cartItemId);
        else saveCart();
    }
}

function initCart() {
    // Inject Cart Flyout DOM
    const flyoutHTML = `
        <div id="cart-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] hidden opacity-0 transition-opacity"></div>
        <div id="cart-flyout" class="fixed top-0 right-0 h-full w-full max-w-md bg-midnight border-l border-edge shadow-2xl z-[101] transform translate-x-full transition-transform duration-300 flex flex-col">
            <div class="p-6 border-b border-edge flex items-center justify-between">
                <h2 class="text-white font-heading font-bold text-lg uppercase tracking-widest">Your Cart</h2>
                <button onclick="closeCart()" class="text-zinc-400 hover:text-white p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div id="cart-items" class="flex-1 overflow-y-auto p-6 space-y-6"></div>
            <div class="p-6 border-t border-edge bg-void">
                <div class="flex justify-between text-white font-bold mb-4">
                    <span>Subtotal</span>
                    <span id="cart-subtotal">$0.00</span>
                </div>
                <button onclick="handleCheckout()" class="block w-full text-center bg-labBlue text-white font-extrabold uppercase tracking-widest py-4 rounded hover:bg-labCyan transition-colors">
                    Checkout Securely
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', flyoutHTML);

    const cartBtn = document.getElementById("cart-btn");
    if (cartBtn) cartBtn.addEventListener("click", openCart);
    
    document.getElementById("cart-overlay").addEventListener("click", closeCart);
    updateCartUI();
}

function openCart() {
    document.getElementById("cart-overlay").classList.remove("hidden");
    // trigger reflow
    void document.getElementById("cart-overlay").offsetWidth;
    document.getElementById("cart-overlay").classList.remove("opacity-0");
    document.getElementById("cart-flyout").classList.remove("translate-x-full");
}

function closeCart() {
    document.getElementById("cart-overlay").classList.add("opacity-0");
    document.getElementById("cart-flyout").classList.add("translate-x-full");
    setTimeout(() => document.getElementById("cart-overlay").classList.add("hidden"), 300);
}

function updateCartUI() {
    const countBadge = document.getElementById("cart-count");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countBadge) {
        countBadge.textContent = count;
        countBadge.classList.toggle("hidden", count === 0);
    }

    const itemsContainer = document.getElementById("cart-items");
    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `<p class="text-zinc-500 text-center mt-10">Your cart is empty.</p>`;
        document.getElementById("cart-subtotal").textContent = "$0.00 CAD";
        return;
    }

    let subtotal = 0;
    itemsContainer.innerHTML = cart.map(item => {
        subtotal += item.price * item.quantity;
        let attrHtml = '';
        if (item.customAttributes && Object.keys(item.customAttributes).length > 0) {
            attrHtml = Object.entries(item.customAttributes).map(([k, v]) => `<p class="text-[10px] text-zinc-500 font-mono mt-1">${k}: ${v}</p>`).join('');
        }
        return `
            <div class="flex gap-4 items-center">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded bg-void border border-edge">
                <div class="flex-1">
                    <h3 class="text-white text-xs font-bold leading-tight mb-1 line-clamp-2">${item.name}</h3>
                    ${attrHtml}
                    <p class="text-labBlue text-xs font-mono font-bold mt-1">$${item.price.toFixed(2)} CAD</p>
                    <div class="flex items-center gap-3 mt-2">
                        <button onclick="updateQuantity('${item.cartItemId}', -1)" class="text-zinc-400 hover:text-white px-2 py-1 bg-edge rounded">-</button>
                        <span class="text-white text-xs font-bold">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.cartItemId}', 1)" class="text-zinc-400 hover:text-white px-2 py-1 bg-edge rounded">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    document.getElementById("cart-subtotal").textContent = `$${subtotal.toFixed(2)} CAD`;
}

function handleCheckout() {
    if (cart.length === 0) return alert("Your cart is empty.");
    
    const btn = document.querySelector("#cart-flyout button[onclick='handleCheckout()']");
    if (btn) btn.textContent = "Connecting to Shopify...";
    
    window.createShopifyCheckout(cart);
}

/* --- STORE GRID & FILTER LOGIC --- */
let activeFilters = {
    makes: [],
    categories: [],
    engines: [],
    brands: [],
    year: null,
    searchQuery: ""
};

// Helper for matching selected vehicle/dropdown engines to product engine specifications
function enginesMatch(selected, product) {
    if (product === "Universal") return true;
    if (!selected) return true;
    
    const selLower = selected.toLowerCase();
    const prodLower = product.toLowerCase();
    
    const getSpecs = (str) => {
        const displacementMatch = str.match(/(\d+\.\d+)l?/i);
        const brandMatch = str.match(/(cummins|powerstroke|duramax|ecodiesel)/i);
        return {
            displacement: displacementMatch ? displacementMatch[1] : null,
            brand: brandMatch ? brandMatch[1].toLowerCase() : null
        };
    };
    
    const selSpecs = getSpecs(selLower);
    const prodSpecs = getSpecs(prodLower);
    
    if (!selSpecs.brand || !prodSpecs.brand) {
        return selLower.includes(prodLower) || prodLower.includes(selLower);
    }
    
    if (selSpecs.brand !== prodSpecs.brand) return false;
    
    if (selSpecs.displacement && prodSpecs.displacement) {
        return selSpecs.displacement === prodSpecs.displacement;
    }
    
    return true;
}


/* --- VEHICLE SELECTOR ENGINE --- */
const V_DATA = {
    "Ram": {
        models: ["2500", "3500"],
        engines: ["6.7L Cummins"]
    },
    "Ford": {
        models: ["F-250", "F-350", "F-150", "Expedition"],
        engines: ["6.7L Powerstroke", "6.4L Powerstroke", "6.0L Powerstroke", "3.0L Powerstroke"]
    },
    "Chevy": {
        models: ["Silverado 2500HD", "Silverado 3500HD", "Colorado"],
        engines: ["6.6L Duramax", "3.0L Duramax", "2.8L Duramax"]
    },
    "GMC": {
        models: ["Sierra 2500HD", "Sierra 3500HD", "Canyon"],
        engines: ["6.6L Duramax", "3.0L Duramax", "2.8L Duramax"]
    },
    "Jeep": {
        models: ["Grand Cherokee", "Gladiator"],
        engines: ["3.0L EcoDiesel"]
    },
    "Nissan": {
        models: ["Titan XD"],
        engines: ["5.0L Cummins"]
    }
};

let activeVehicle = JSON.parse(sessionStorage.getItem('lab_active_vehicle')) || null;

function initVehicleSelector() {
    const hero = document.getElementById("vehicle-selector-hero");
    const sYear = document.getElementById("vs-year");
    const sMake = document.getElementById("vs-make");
    const sModel = document.getElementById("vs-model");
    const sEngine = document.getElementById("vs-engine");
    const btnSubmit = document.getElementById("vs-submit");
    
    if (!hero || !sYear) return;

    if (sYear.options.length === 1) {
        for (let y = 2026; y >= 1990; y--) {
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
        window.location.href = './catalog/';
    });
}

// ═══════════════════════════════════════════════════════════════
// DYNAMIC SIDEBAR POPULATION
// ═══════════════════════════════════════════════════════════════
function buildFilterCheckbox(value, dataType, label, count) {
    const id = `filter-${dataType}-${value.replace(/[\s\/&.]+/g, '-')}`;
    return `
        <label class="flex items-center gap-3 px-1 py-1.5 cursor-pointer group rounded-lg hover:bg-white/5 transition-colors" for="${id}">
            <input type="checkbox" value="${value}" data-type="${dataType}" id="${id}"
                class="store-filter w-4 h-4 bg-void border border-edge rounded text-labBlue focus:ring-labBlue focus:ring-opacity-50 accent-[#0066FF] flex-shrink-0">
            <span class="text-sm text-zinc-400 group-hover:text-white transition-colors flex-1">${label}</span>
            <span class="text-[10px] text-zinc-600 font-mono">${count}</span>
        </label>`;
}

function populateSidebarFilters() {
    const opts = window.catalogFilterOptions;
    if (!opts) return;

    let catalog = window.storeCatalog;

    // Strict override: if a vehicle is pinned, only count products that fit it
    if (activeVehicle) {
        const vMake = activeVehicle.make === "GMC" ? "Chevy" : activeVehicle.make;
        catalog = catalog.filter(p => {
            const makeMatch = p.makes.includes(vMake) || p.makes.includes("Universal");
            const engMatch = enginesMatch(activeVehicle.engine, p.engine);
            const yearMatch = activeVehicle.year >= p.years[0] && activeVehicle.year <= p.years[1];
            return makeMatch && engMatch && yearMatch;
        });
    }

    // Count products per filter value
    function countBy(field, value) {
        if (field === 'makes') {
            return catalog.filter(p => p.makes.includes(value)).length;
        }
        return catalog.filter(p => p[field] === value).length;
    }

    // Categories
    const catGroup = document.getElementById('filter-category-group');
    if (catGroup) {
        catGroup.innerHTML = opts.categories
            .map(c => buildFilterCheckbox(c, 'category', c, countBy('category', c)))
            .join('');
    }

    // Makes
    const makeGroup = document.getElementById('filter-make-group');
    if (makeGroup) {
        makeGroup.innerHTML = opts.makes
            .filter(m => m !== 'Universal')
            .map(m => buildFilterCheckbox(m, 'make', m, countBy('makes', m)))
            .join('');
    }

    // Engines
    const engGroup = document.getElementById('filter-engine-group');
    if (engGroup) {
        engGroup.innerHTML = opts.engines
            .map(e => buildFilterCheckbox(e, 'engine', e, countBy('engine', e)))
            .join('');
    }

    // Brands
    const brandGroup = document.getElementById('filter-brand-group');
    if (brandGroup) {
        brandGroup.innerHTML = opts.brands
            .map(b => buildFilterCheckbox(b, 'brand', b, countBy('brand', b)))
            .join('');
    }
}

// ═══════════════════════════════════════════════════════════════
// ACCORDION COLLAPSE
// ═══════════════════════════════════════════════════════════════
function initAccordions() {
    document.querySelectorAll('.filter-accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (!target) return;

            const isHidden = target.classList.contains('hidden');
            target.classList.toggle('hidden', !isHidden);
            
            const chevron = btn.querySelector('svg');
            if (chevron) {
                chevron.style.transform = isHidden ? '' : 'rotate(-90deg)';
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════
// ACTIVE FILTER CHIPS
// ═══════════════════════════════════════════════════════════════
function updateActiveChips() {
    const bar = document.getElementById('active-filters-bar');
    if (!bar) return;

    const allActive = [
        ...activeFilters.makes.map(v => ({ type: 'make', value: v })),
        ...activeFilters.categories.map(v => ({ type: 'category', value: v })),
        ...activeFilters.engines.map(v => ({ type: 'engine', value: v })),
        ...activeFilters.brands.map(v => ({ type: 'brand', value: v })),
        ...(activeFilters.year ? [{ type: 'year', value: String(activeFilters.year) }] : [])
    ];

    if (allActive.length === 0) {
        bar.classList.add('hidden');
        bar.classList.remove('flex');
        bar.innerHTML = '';
        return;
    }

    bar.classList.remove('hidden');
    bar.classList.add('flex');
    bar.innerHTML = allActive.map(chip => `
        <button data-chip-type="${chip.type}" data-chip-value="${chip.value}"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-labBlue/15 text-labBlue border border-labBlue/30 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30 transition-all min-h-[32px]">
            ${chip.value}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
    `).join('');

    // Bind chip removal
    bar.querySelectorAll('button[data-chip-type]').forEach(chip => {
        chip.addEventListener('click', () => {
            const type = chip.dataset.chipType;
            const val = chip.dataset.chipValue;

            if (type === 'make') activeFilters.makes = activeFilters.makes.filter(v => v !== val);
            if (type === 'category') activeFilters.categories = activeFilters.categories.filter(v => v !== val);
            if (type === 'engine') activeFilters.engines = activeFilters.engines.filter(v => v !== val);
            if (type === 'brand') activeFilters.brands = activeFilters.brands.filter(v => v !== val);
            if (type === 'year') { activeFilters.year = null; const yi = document.getElementById('filter-year'); if (yi) yi.value = ''; }

            // Uncheck the matching sidebar checkbox
            const cbId = `filter-${type}-${val.replace(/[\s\/&.]+/g, '-')}`;
            const cb = document.getElementById(cbId);
            if (cb) cb.checked = false;

            renderProducts();
        });
    });
}

// ═══════════════════════════════════════════════════════════════
// INIT STORE (master wiring function)
// ═══════════════════════════════════════════════════════════════
function initStore() {
    // 1. Populate sidebar from catalog data
    populateSidebarFilters();
    initAccordions();

    // 2. Read URL params
    const params = new URLSearchParams(window.location.search);
    const urlMake = params.get("make");
    const urlCategory = params.get("category");

    // 3. Pre-check from active vehicle
    if (activeVehicle) {
        const vMake = activeVehicle.make;
        if (!activeFilters.makes.includes(vMake)) activeFilters.makes.push(vMake);
        if (!activeFilters.engines.includes(activeVehicle.engine)) activeFilters.engines.push(activeVehicle.engine);
        activeFilters.year = activeVehicle.year;

        const makeCbId = `filter-make-${vMake.replace(/[\s\/&.]+/g, '-')}`;
        const makeCb = document.getElementById(makeCbId);
        if (makeCb) makeCb.checked = true;

        document.querySelectorAll('input[data-type="engine"]').forEach(cb => {
            if (enginesMatch(activeVehicle.engine, cb.value)) {
                cb.checked = true;
            }
        });

        const yrInput = document.getElementById('filter-year');
        if (yrInput) yrInput.value = activeVehicle.year;
    }

    // 4. Pre-check from URL query params
    if (urlMake && !activeFilters.makes.includes(urlMake)) {
        activeFilters.makes.push(urlMake);
        const cb = document.getElementById(`filter-make-${urlMake.replace(/[\s\/&.]+/g, '-')}`);
        if (cb) cb.checked = true;
    }
    if (urlCategory && !activeFilters.categories.includes(urlCategory)) {
        // Map old URL category names to new ones
        const catMap = {
            'EGR': 'EGR Upgrades',
            'CCV': 'CCV Upgrades',
            'Exhaust': 'Exhaust Systems',
            'Tuning': 'Tuning & Electronics',
            'Accessories': 'Accessories'
        };
        const mapped = catMap[urlCategory] || urlCategory;
        activeFilters.categories.push(mapped);
        const cb = document.getElementById(`filter-category-${mapped.replace(/[\s\/&.]+/g, '-')}`);
        if (cb) cb.checked = true;
    }

    // 5. Wire up all sidebar checkboxes (dynamically generated)
    document.querySelectorAll('.store-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const val = e.target.value;
            const type = e.target.dataset.type;

            if (type === 'make') {
                if (e.target.checked) { if (!activeFilters.makes.includes(val)) activeFilters.makes.push(val); }
                else activeFilters.makes = activeFilters.makes.filter(m => m !== val);
            } else if (type === 'category') {
                if (e.target.checked) { if (!activeFilters.categories.includes(val)) activeFilters.categories.push(val); }
                else activeFilters.categories = activeFilters.categories.filter(c => c !== val);
            } else if (type === 'engine') {
                if (e.target.checked) { if (!activeFilters.engines.includes(val)) activeFilters.engines.push(val); }
                else activeFilters.engines = activeFilters.engines.filter(x => x !== val);
            } else if (type === 'brand') {
                if (e.target.checked) { if (!activeFilters.brands.includes(val)) activeFilters.brands.push(val); }
                else activeFilters.brands = activeFilters.brands.filter(b => b !== val);
            }
            renderProducts();
        });
    });

    // 6. Year input
    const yearInput = document.getElementById('filter-year');
    if (yearInput) {
        yearInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            activeFilters.year = isNaN(val) ? null : val;
            renderProducts();
        });
    }

    // 7. Search input
    const searchInput = document.getElementById('store-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeFilters.searchQuery = e.target.value.trim();
            renderProducts();
        });
    }

    // 8. Reset button
    const resetBtn = document.getElementById('filter-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeFilters = { makes: [], categories: [], engines: [], brands: [], year: null, searchQuery: "" };
            activeVehicle = null;
            sessionStorage.removeItem('lab_active_vehicle');
            document.querySelectorAll('.store-filter').forEach(cb => cb.checked = false);
            const yi = document.getElementById('filter-year');
            if (yi) yi.value = '';
            const si = document.getElementById('store-search-input');
            if (si) si.value = '';
            renderProducts();
        });
    }

    // 9. Initial render
    window.isInitialRender = true;
    renderProducts();
    window.isInitialRender = false;
}


function renderProducts() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    // Update active chips
    updateActiveChips();

    const filtered = window.storeCatalog.filter(p => {
        // Search
        let searchMatch = true;
        if (activeFilters.searchQuery) {
            const queryTokens = activeFilters.searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
            
            // For a product to match, every word in the search query must be found *somewhere* in the product's data
            searchMatch = queryTokens.every(token => {
                return p.name.toLowerCase().includes(token) ||
                       p.description.toLowerCase().includes(token) ||
                       p.category.toLowerCase().includes(token) ||
                       p.brand.toLowerCase().includes(token) ||
                       p.engine.toLowerCase().includes(token) ||
                       p.makes.some(m => m.toLowerCase().includes(token)) ||
                       (p.tags && p.tags.some(t => t.toLowerCase().includes(token)));
            });
        }

        // Make
        let makeMatch = activeFilters.makes.length === 0 || activeFilters.makes.some(m => p.makes.includes(m));

        // Category
        let catMatch = activeFilters.categories.length === 0 || activeFilters.categories.includes(p.category);

        // Engine
        let engMatch = activeFilters.engines.length === 0 || activeFilters.engines.some(e => enginesMatch(e, p.engine)) || p.engine === "Universal";

        // Brand
        let brandMatch = activeFilters.brands.length === 0 || activeFilters.brands.includes(p.brand);

        // Year
        let yearMatch = !activeFilters.year || (activeFilters.year >= p.years[0] && activeFilters.year <= p.years[1]);
        
        // STRICT OVERRIDE: If a vehicle is pinned in the session
        if (activeVehicle) {
            const vMake = activeVehicle.make;
            makeMatch = p.makes.includes(vMake) || p.makes.includes("Universal");
            engMatch = enginesMatch(activeVehicle.engine, p.engine);
            yearMatch = activeVehicle.year >= p.years[0] && activeVehicle.year <= p.years[1];
        }

        return searchMatch && makeMatch && catMatch && engMatch && brandMatch && yearMatch;
    });

    // Update product count
    const countEl = document.querySelector('[data-product-count]');
    if (countEl) countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        const garageWarning = activeVehicle 
            ? `<div class="mt-6 p-4 bg-labBlue/10 border border-labBlue/30 rounded-lg text-labBlue text-sm max-w-md mx-auto text-left">
                 <div class="flex gap-3">
                     <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                     <div>
                         <p class="font-bold mb-1">Garage Filter Active</p>
                         <p class="opacity-80">You are only seeing parts that fit your <strong>${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.engine}</strong>. To search the entire store, clear your garage.</p>
                         <button onclick="document.getElementById('filter-reset-btn').click()" class="mt-3 font-bold text-white hover:text-labCyan underline">Clear Garage</button>
                     </div>
                 </div>
               </div>`
            : '';

        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <svg class="w-16 h-16 text-zinc-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <h3 class="text-white text-xl font-bold mb-2">No products found</h3>
                <p class="text-zinc-500 mb-6">Try adjusting your filters or search terms.</p>
                <button onclick="document.getElementById('filter-reset-btn').click()" class="text-labBlue hover:text-labCyan text-sm font-bold uppercase tracking-wider">Clear All Filters →</button>
                ${garageWarning}
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="group relative bg-void border border-edge rounded-xl overflow-hidden hover:border-labBlue/50 transition-all">
            <a href="/store/product/?id=${p.id}" class="block aspect-video bg-[#111115] relative">
                ${p.isPopular ? '<span class="absolute top-2 right-2 bg-labBlue text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">Popular</span>' : ''}
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" loading="lazy">
            </a>
            <div class="p-6">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span class="text-[10px] font-mono text-labBlue uppercase tracking-widest">${p.brand}</span>
                    <span class="text-[10px] text-zinc-600">•</span>
                    <span class="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">${p.category}</span>
                </div>
                <h3 class="text-white font-bold leading-tight mb-2 min-h-[40px] line-clamp-2"><a href="/store/product/?id=${p.id}" class="hover:text-labBlue transition-colors">${p.name}</a></h3>
                <div class="text-[10px] text-zinc-600 font-mono mb-4">${p.makes.filter(m => m !== 'Universal').join(', ') || 'Universal Fit'}${p.engine !== 'Universal' ? ' • ' + p.engine : ''}</div>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-extrabold text-white">$${p.price.toFixed(2)}</span>
                    ${p.category === 'Tuning & Electronics' 
                        ? `<a href="/store/product/?id=${p.id}" title="Configure VIN" class="bg-edge hover:bg-labBlue text-white p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                           </a>`
                        : `<button onclick="addToCart('${p.id}')" class="bg-edge hover:bg-labBlue text-white p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                           </button>`
                    }
                </div>
            </div>
        </div>
    `).join("");

    // Scroll to top of grid on filter change
    if (!window.isInitialRender) {
        const gridContainer = grid.parentElement;
        if (gridContainer) {
            // Offset by ~120px to account for the sticky header
            const y = gridContainer.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }
    }
}

/* --- PDP LOGIC --- */
function initPDP() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const product = window.storeCatalog.find(p => p.id === id);
    const container = document.getElementById("pdp-container");

    if (!product) {
        container.innerHTML = `<div class="py-20 text-center text-white text-xl">Product not found. <a href="/store/" class="text-labBlue hover:underline mt-4 block">Return to Store</a></div>`;
        return;
    }

    // Set page title
    document.title = `${product.name} | THE LAB`;

    container.innerHTML = `
        <div class="max-w-6xl mx-auto py-12 px-6">
            <!-- Top Config Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <!-- Left: Image -->
                <div class="bg-[#111115] border border-edge rounded-2xl p-8 aspect-square flex items-center justify-center lg:sticky lg:top-24">
                    <img src="${product.image}" alt="${product.name}" class="max-w-full max-h-full object-contain">
                </div>
                
                <!-- Right: Config & Cart -->
                <div class="flex flex-col justify-start pt-4">
                    <div class="text-xs font-mono text-labBlue uppercase tracking-widest mb-4">${product.makes.filter(m => m !== 'Universal').join(", ") || 'Universal Fit'} &bull; ${product.category}</div>
                    <h1 class="text-3xl md:text-4xl font-heading font-extrabold text-white leading-tight mb-4">${product.name}</h1>
                    <p class="text-2xl font-extrabold text-white mb-8">$${product.price.toFixed(2)} CAD</p>

                    ${product.category === 'Tuning & Electronics' ? `
                    <div class="mb-8 bg-[#1a1a24] p-5 border border-edge rounded-xl relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-1 h-full bg-labBlue"></div>
                        <label for="pdp-vin-input" class="block text-white font-extrabold uppercase tracking-widest text-xs mb-2">Vehicle Identification Number (VIN) <span class="text-red-500">*</span></label>
                        <p class="text-[11px] text-zinc-400 mb-3 uppercase tracking-wider">A 17-digit VIN is strictly required to configure this tuning product.</p>
                        <input type="text" id="pdp-vin-input" maxlength="17" placeholder="ENTER 17-DIGIT VIN" class="w-full bg-void border border-edge rounded-lg p-4 text-white focus:outline-none focus:border-labBlue transition-colors font-mono uppercase text-sm tracking-widest">
                        <p id="pdp-vin-error" class="text-red-500 text-xs mt-2 hidden font-bold">Please enter a valid 17-digit VIN.</p>
                    </div>
                    ` : ''}

                    <div class="flex gap-4">
                        <button id="pdp-add-btn" class="flex-1 bg-labBlue hover:bg-labCyan text-white font-extrabold uppercase tracking-widest py-4 rounded-xl transition-all shadow-oled-blue hover:shadow-oled-cyan">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            <!-- Bottom Info Section -->
            <div class="max-w-3xl">
                <!-- Description Accordion -->
                <div class="border-b border-edge">
                    <button class="pdp-accordion-btn w-full flex items-center justify-between py-6 text-left group" data-target="pdp-desc">
                        <span class="text-lg font-heading font-extrabold text-white uppercase tracking-wider group-hover:text-labBlue transition-colors">Description</span>
                        <svg class="w-5 h-5 text-zinc-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    <div id="pdp-desc" class="pb-6 text-zinc-400 prose prose-invert prose-p:leading-relaxed prose-a:text-labBlue max-w-none">
                        ${product.descriptionHtml || `<p>${product.description}</p>`}
                    </div>
                </div>

                <!-- Fitment Accordion -->
                <div class="border-b border-edge">
                    <button class="pdp-accordion-btn w-full flex items-center justify-between py-6 text-left group" data-target="pdp-fitment">
                        <span class="text-lg font-heading font-extrabold text-white uppercase tracking-wider group-hover:text-labBlue transition-colors">Vehicle Fitment</span>
                        <svg class="w-5 h-5 text-zinc-500 transform transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    <div id="pdp-fitment" class="pb-6 hidden">
                        <div class="bg-void border border-edge rounded-lg overflow-hidden">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-edge text-zinc-400 uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th class="px-6 py-3 font-medium">Makes</th>
                                        <th class="px-6 py-3 font-medium">Engine</th>
                                        <th class="px-6 py-3 font-medium">Years</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-edge text-zinc-300">
                                    <tr>
                                        <td class="px-6 py-4">${product.makes.filter(m => m !== 'Universal').join(', ') || 'Universal Fit'}</td>
                                        <td class="px-6 py-4">${product.engine}</td>
                                        <td class="px-6 py-4">${product.years[0]} - ${product.years[1] === 2026 ? 'Present' : product.years[1]}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Shipping Accordion -->
                <div class="border-b border-edge">
                    <button class="pdp-accordion-btn w-full flex items-center justify-between py-6 text-left group" data-target="pdp-shipping">
                        <span class="text-lg font-heading font-extrabold text-white uppercase tracking-wider group-hover:text-labBlue transition-colors">Shipping & Returns</span>
                        <svg class="w-5 h-5 text-zinc-500 transform transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    <div id="pdp-shipping" class="pb-6 text-zinc-400 text-sm leading-relaxed hidden">
                        <p class="mb-4">All orders ship directly from our facility or authorized distributor network. Most orders are processed and shipped within 1-2 business days.</p>
                        <p class="mb-4"><strong>Free Shipping:</strong> Available on eligible orders over $250 CAD.</p>
                        <p><strong>Returns:</strong> We accept returns on unused, uninstalled products in their original packaging within 30 days of delivery. Tuning products, electronic modules, and customized items are final sale.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("pdp-add-btn").addEventListener("click", () => {
        if (product.category === 'Tuning & Electronics') {
            const vin = document.getElementById("pdp-vin-input").value.trim().toUpperCase();
            if (vin.length !== 17) {
                document.getElementById("pdp-vin-error").classList.remove("hidden");
                return;
            }
            document.getElementById("pdp-vin-error").classList.add("hidden");
            addToCart(product.id, 1, { "VIN": vin });
        } else {
            addToCart(product.id);
        }
    });

    // Accordion Logic
    document.querySelectorAll('.pdp-accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            const icon = btn.querySelector('svg');
            
            if (target.classList.contains('hidden')) {
                target.classList.remove('hidden');
                icon.style.transform = '';
            } else {
                target.classList.add('hidden');
                icon.style.transform = 'rotate(-180deg)';
            }
        });
    });
}
