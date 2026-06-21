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

function addToCart(productId, quantity = 1, customAttributes = {}, variantOverride = null) {
    const product = window.storeCatalog.find(p => p.id === productId);
    if (!product) return;

    // Use override if provided (e.g., specific tune level variant), else default
    const resolvedVariantId = variantOverride?.id || product.variantId;
    const resolvedPrice    = variantOverride?.price !== undefined ? variantOverride.price : product.price;
    const resolvedTitle    = variantOverride?.title ? `${product.name} — ${variantOverride.title}` : product.name;

    // Encode custom attributes safely supporting Unicode (like em-dash)
    const encodeUnicodeBase64 = (str) => {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            // Fallback for modern environments if unescape is somehow removed
            return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
        }
    };

    const attrKey = Object.keys(customAttributes).length > 0 ? encodeUnicodeBase64(JSON.stringify(customAttributes)) : "default";
    const cartItemId = resolvedVariantId + "_" + attrKey;

    const existing = cart.find(item => item.cartItemId === cartItemId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            ...product,
            name: resolvedTitle,
            variantId: resolvedVariantId,
            price: resolvedPrice,
            quantity,
            customAttributes,
            cartItemId
        });
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
        document.getElementById("cart-subtotal").innerHTML = `<span data-price-cad="0.00">$0.00 CAD</span>`;
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
                    <p class="text-labBlue text-xs font-mono font-bold mt-1" data-price-cad="${item.price}">$${item.price.toFixed(2)} CAD</p>
                    <div class="flex items-center gap-3 mt-2">
                        <button onclick="updateQuantity('${item.cartItemId}', -1)" class="text-zinc-400 hover:text-white px-2 py-1 bg-edge rounded">-</button>
                        <span class="text-white text-xs font-bold">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.cartItemId}', 1)" class="text-zinc-400 hover:text-white px-2 py-1 bg-edge rounded">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Append Upsells (Customers Also Purchased)
    const upsells = getCartUpsells();
    if (upsells.length > 0) {
        itemsContainer.innerHTML += `
            <div class="mt-8 border-t border-edge pt-6">
                <h4 class="text-white font-bold text-sm uppercase tracking-wider mb-4">Customers Also Purchased</h4>
                <div class="space-y-4">
                    ${upsells.map(u => `
                        <div class="flex gap-3 items-center bg-[#0D0D12] p-3 rounded-lg border border-edge/50">
                            <img src="${u.image}" alt="${u.name}" class="w-12 h-12 object-cover rounded bg-void">
                            <div class="flex-1">
                                <h5 class="text-white text-[10px] font-bold leading-tight line-clamp-2 uppercase tracking-wide">${u.name}</h5>
                                <div class="text-labBlue text-xs font-mono font-bold mt-1" data-price-cad="${u.price}">$${u.price.toFixed(2)} CAD</div>
                            </div>
                            <button onclick="addToCart('${u.id}')" class="px-3 py-1.5 bg-labBlue/10 hover:bg-labBlue/20 text-labBlue border border-labBlue/30 hover:border-labBlue/50 text-[10px] font-bold uppercase tracking-wider rounded transition-colors min-h-[32px] min-w-[48px]">
                                Add
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    document.getElementById("cart-subtotal").innerHTML = `<span data-price-cad="${subtotal.toFixed(2)}">$${subtotal.toFixed(2)} CAD</span>`;
    
    // Apply currency format to cart items
    if (window.setCurrency) {
        window.setCurrency(localStorage.getItem('theLab_currency') || 'CAD');
    }
}

function getCartUpsells() {
    if (!window.storeCatalog || window.storeCatalog.length === 0 || cart.length === 0) return [];
    
    const cartIds = new Set(cart.map(item => item.id));
    let candidates = window.storeCatalog.filter(p => !cartIds.has(p.id) && p.available !== false);
    
    const isTuningCart = cart.some(item => item.category === 'Tuning & Electronics' || item.name.toLowerCase().includes('tune'));
    
    // Identify target vehicle from activeVehicle or guess from cart items
    let targetMake = window.activeVehicle ? window.activeVehicle.make : null;
    let targetEngine = window.activeVehicle ? window.activeVehicle.engine : null;
    
    if (!targetMake && cart[0].makes && cart[0].makes.length > 0) {
        targetMake = cart[0].makes[0];
    }
    
    // Filter candidates by fitment if we have a target
    if (targetMake) {
        candidates = candidates.filter(p => {
            if (p.makes && p.makes.length > 0 && !p.makes.includes(targetMake)) return false;
            // Simplified engine matching
            if (targetEngine && p.engines && p.engines.length > 0) {
                const engMatch = p.engines.some(e => e.toLowerCase().includes(targetEngine.toLowerCase().split(' ')[0])); // e.g., "6.7L"
                if (!engMatch) return false;
            }
            return true;
        });
    }

    let upsells = [];
    
    if (isTuningCart) {
        // Priority 1: Edge CTS3 Monitor
        const cts3 = candidates.find(p => p.name.includes('CTS3'));
        if (cts3) { upsells.push(cts3); candidates = candidates.filter(p => p.id !== cts3.id); }
        
        // Priority 2: Exhausts
        const exhausts = candidates.filter(p => p.category === 'Exhaust Systems' || p.name.toLowerCase().includes('exhaust'));
        upsells = upsells.concat(exhausts.slice(0, 3 - upsells.length));
    }
    
    // Fallback: If still under 3, pick from same category as first item
    if (upsells.length < 3) {
        const firstCategory = cart[0].category;
        const related = candidates.filter(p => p.category === firstCategory);
        upsells = upsells.concat(related.slice(0, 3 - upsells.length));
    }
    
    return upsells.slice(0, 3);
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

window.setActiveVehicle = function(vehicle) {
    activeVehicle = vehicle;
};

/* --- ROBUST GLOBAL CURRENCY TOGGLE --- */
window.setCurrency = function(c) {
    const r = 0.74;
    const ac = 'text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-labBlue text-white transition-all';
    const ic = 'text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider text-zinc-500 hover:text-white transition-all';
    
    document.querySelectorAll('#btn-cad').forEach(cb => cb.className = (c === 'CAD') ? ac : ic);
    document.querySelectorAll('#btn-usd').forEach(ub => ub.className = (c === 'USD') ? ac : ic);
    
    localStorage.setItem('theLab_currency', c);
    
    document.querySelectorAll('[data-price-cad]').forEach(function(el) {
        const cad = parseFloat(el.getAttribute('data-price-cad'));
        if (!isNaN(cad)) {
            el.textContent = c === 'USD' ? '$' + (cad * r).toFixed(2) + ' USD' : '$' + cad.toFixed(2) + ' CAD';
        }
    });
    
    document.querySelectorAll('[data-price-from-cad]').forEach(function(el) {
        const cad = parseFloat(el.getAttribute('data-price-from-cad'));
        if (!isNaN(cad)) {
            el.textContent = c === 'USD' ? 'From $' + (cad * r).toFixed(2) + ' USD' : 'From $' + cad.toFixed(2) + ' CAD';
        }
    });
    
    // Removed updateCartUI() call to prevent infinite loop.
    // setCurrency already updates [data-price-cad] elements, which the cart uses.
};

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
            let modelMatch = true;
            if (activeVehicle.model) {
                const pModels = p.models || [];
                modelMatch = pModels.includes(activeVehicle.model) || pModels.includes("Universal") || pModels.length === 0;
            }
            return makeMatch && engMatch && yearMatch && modelMatch;
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

    const params = new URLSearchParams(window.location.search);
    const urlMake = params.get("make");
    let urlCategory = params.get("category");
    if (window.isTuningPortal) urlCategory = "Tuning & Electronics";
    let urlBrand = params.get("brand");
    const urlPlatform = params.get("platform");

    if (urlPlatform) {
        if (urlPlatform.toLowerCase() === 'ezlynk') urlBrand = "EZ LYNK";
        if (urlPlatform.toLowerCase() === 'hptuners') urlBrand = "HP Tuners";
        if (urlPlatform.toLowerCase() === 'mm3') urlBrand = "MM3";
        if (urlPlatform.toLowerCase() === 'efilive') urlBrand = "EFI Live";
        if (urlPlatform.toLowerCase() === 'sct') urlBrand = "SCT";
        if (urlPlatform.toLowerCase() === 'gdp') urlBrand = "GDP Products";
    }

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
    if (urlCategory) {
        const catMap = {
            'EGR': ['EGR Upgrades'],
            'CCV': ['CCV Upgrades'],
            'Exhaust': ['Exhaust Systems'],
            'Tuning': ['Tuning & Electronics'],
            'Accessories': ['Bumpers & Armor', 'Accessories']
        };
        const mappedCats = catMap[urlCategory] || [urlCategory];
        mappedCats.forEach(mapped => {
            if (!activeFilters.categories.includes(mapped)) {
                activeFilters.categories.push(mapped);
                const cb = document.getElementById(`filter-category-${mapped.replace(/[\s\/&.]+/g, '-')}`);
                if (cb) cb.checked = true;
            }
        });
    }
    if (urlBrand && !activeFilters.brands.includes(urlBrand)) {
        activeFilters.brands.push(urlBrand);
        const cb = document.getElementById(`filter-brand-${urlBrand.replace(/[\s\/&.]+/g, '-')}`);
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
    const searchBtn = document.getElementById('store-search-btn');
    
    function triggerSearch() {
        if (!searchInput) return;
        activeFilters.searchQuery = searchInput.value.trim();
        renderProducts();
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', triggerSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                triggerSearch();
            }
        });
        
        // Allow clearing search instantly when user deletes all text
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === '') {
                activeFilters.searchQuery = '';
                renderProducts();
            }
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
        
        // If a platform is set in activeFilters but didn't match exactly, try fuzzy matching
        if (!brandMatch && activeFilters.brands.length > 0) {
            const bUpper = p.brand.toUpperCase();
            if (activeFilters.brands.includes("EZ LYNK") && (bUpper.includes("EZ LYNK") || bUpper.includes("EZ-LYNK"))) {
                brandMatch = true;
            }
            if (activeFilters.brands.includes("HP Tuners") && (bUpper.includes("HP TUNER") || bUpper.includes("HPTUNER"))) {
                brandMatch = true;
            }
        }

        // Year
        let yearMatch = !activeFilters.year || (activeFilters.year >= p.years[0] && activeFilters.year <= p.years[1]);
        
        let modelMatch = true;
        
        // STRICT OVERRIDE: If a vehicle is pinned in the session
        if (activeVehicle) {
            makeMatch = p.makes.includes(activeVehicle.make) || p.makes.includes("Universal");
            if (activeVehicle.make === "GMC" || activeVehicle.make === "Chevy") {
                makeMatch = makeMatch || p.makes.includes("GMC") || p.makes.includes("Chevy");
            }
            engMatch = enginesMatch(activeVehicle.engine, p.engine);
            yearMatch = activeVehicle.year >= p.years[0] && activeVehicle.year <= p.years[1];
            if (activeVehicle.model) {
                const pModels = p.models || [];
                modelMatch = pModels.includes(activeVehicle.model) || pModels.includes("Universal") || pModels.length === 0;
                
                if (!modelMatch) {
                    if (activeVehicle.model.includes("Sierra")) {
                        modelMatch = pModels.includes(activeVehicle.model.replace("Sierra", "Silverado"));
                    } else if (activeVehicle.model.includes("Silverado")) {
                        modelMatch = pModels.includes(activeVehicle.model.replace("Silverado", "Sierra"));
                    }
                }
            }
        }

        // Tuning Portal Exclusion Logic
        if (window.isTuningPortal) {
            const titleLower = p.name.toLowerCase();
            // Exclude oddball non-tuning parts
            if (titleLower.includes('switch') || 
                titleLower.includes('bracket') || 
                titleLower.includes('can bus') || 
                titleLower.includes('def module')) {
                return false;
            }
        }

        return searchMatch && makeMatch && catMatch && engMatch && brandMatch && yearMatch && modelMatch;
    });

    // Sort products: Specific Fitment first, Universal second
    filtered.sort((a, b) => {
        const aIsUniversal = a.makes.includes("Universal") || a.engine === "Universal" || (a.models && a.models.includes("Universal"));
        const bIsUniversal = b.makes.includes("Universal") || b.engine === "Universal" || (b.models && b.models.includes("Universal"));
        
        if (aIsUniversal && !bIsUniversal) return 1;
        if (!aIsUniversal && bIsUniversal) return -1;
        
        // Secondary sort: Popular first
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        
        return 0;
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

    grid.innerHTML = filtered.map(p => {
        let productUrl = `/store/product/?id=${p.id}`;
        if (activeVehicle) {
            productUrl += `&vmake=${encodeURIComponent(activeVehicle.make)}&vengine=${encodeURIComponent(activeVehicle.engine)}&vyear=${activeVehicle.year}&vmodel=${encodeURIComponent(activeVehicle.model)}`;
        }
        return `
        <div class="group relative bg-void border border-edge rounded-xl overflow-hidden hover:border-labBlue/50 transition-all">
            <a href="${productUrl}" class="block aspect-video bg-[#111115] relative">
                ${p.isPopular ? '<span class="absolute top-2 right-2 bg-labBlue text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">Popular</span>' : ''}
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" loading="lazy">
            </a>
            <div class="p-6">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span class="text-[10px] font-mono text-labBlue uppercase tracking-widest">${p.brand}</span>
                    <span class="text-[10px] text-zinc-600">•</span>
                    <span class="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">${p.category}</span>
                </div>
                <h3 class="text-white font-bold leading-tight mb-2 min-h-[40px] line-clamp-2"><a href="${productUrl}" class="hover:text-labBlue transition-colors">${p.name}</a></h3>
                <div class="text-[10px] text-zinc-600 font-mono mb-4">${p.makes.filter(m => m !== 'Universal').join(', ') || 'Universal Fit'}${p.engine !== 'Universal' ? ' • ' + p.engine : ''}</div>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-extrabold text-white" data-price-cad="${p.price}">$${p.price.toFixed(2)} CAD</span>
                    ${p.category === 'Tuning & Electronics' 
                        ? `<a href="${productUrl}" title="Configure VIN" class="bg-edge hover:bg-labBlue text-white p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                           </a>`
                        : `<button onclick="addToCart('${p.id}')" class="bg-edge hover:bg-labBlue text-white p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                           </button>`
                    }
                </div>
            </div>
        </div>
    `}).join("");

    // Scroll to top of grid on filter change
    if (!window.isInitialRender) {
        const gridContainer = grid.parentElement;
        if (gridContainer) {
            // Wait slightly for any other layout shifts
            setTimeout(() => {
                const y = gridContainer.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
            }, 50);
        }
    }
    
    // Apply currency format to newly rendered prices
    if (window.setCurrency) {
        window.setCurrency(localStorage.getItem('theLab_currency') || 'CAD');
    }
}

/* --- PDP LOGIC --- */
function initPDP() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const vmake = params.get("vmake");
    const vengine = params.get("vengine");
    const vyear = params.get("vyear");
    const vmodel = params.get("vmodel");

    const product = window.storeCatalog.find(p => p.id === id);
    const container = document.getElementById("pdp-container");

    if (!product) {
        container.innerHTML = `<div class="py-20 text-center text-white text-xl">Product not found. <a href="/store/" class="text-labBlue hover:underline mt-4 block">Return to Store</a></div>`;
        return;
    }

    // Set page title
    document.title = `${product.name} | THE LAB`;

    let fitmentBadge = "";
    if (vmake && vengine && vyear) {
        // Normalize GMC to Chevy where compatible
        const normalizedMake = vmake === "GMC" ? "Chevy" : vmake;
        const productMakesNormalized = product.makes.map(m => m === "GMC" ? "Chevy" : m);
        const makeMatch = product.makes.includes("Universal") || productMakesNormalized.includes(normalizedMake);
        
        const parsedYear = parseInt(vyear);
        const yearMatch = parsedYear >= product.years[0] && parsedYear <= product.years[1];
        
        const engMatch = enginesMatch(vengine, product.engine);
        
        let modelMatch = true;
        let inferredModel = vmodel;
        if (!inferredModel) {
            const engLower = vengine.toLowerCase();
            if (vmake === "Ram") {
                if (engLower.includes("ecodiesel")) inferredModel = "Ram 1500";
                else if (engLower.includes("cummins")) inferredModel = "2500";
            } else if (vmake === "Ford") {
                if (engLower.includes("expedition")) inferredModel = "Expedition";
                else if (engLower.includes("3.0l powerstroke") || engLower.includes("3.0l") || engLower.includes("f-150") || engLower.includes("f150")) inferredModel = "F-150";
                else inferredModel = "F-250";
            } else if (vmake === "Chevy") {
                if (engLower.includes("2.8l") || engLower.includes("lwn")) inferredModel = "Colorado";
                else if (engLower.includes("3.0l") || engLower.includes("lm2") || engLower.includes("lz0")) inferredModel = "Silverado 1500";
                else if (engLower.includes("cruze")) inferredModel = "Cruze";
                else if (engLower.includes("equinox")) inferredModel = "Equinox";
                else inferredModel = "Silverado 2500HD";
            } else if (vmake === "GMC") {
                if (engLower.includes("2.8l") || engLower.includes("lwn")) inferredModel = "Canyon";
                else if (engLower.includes("3.0l") || engLower.includes("lm2") || engLower.includes("lz0")) inferredModel = "Sierra 1500";
                else if (engLower.includes("terrain")) inferredModel = "Terrain";
                else inferredModel = "Sierra 2500HD";
            } else if (vmake === "Nissan") {
                inferredModel = "Titan XD";
            }
        }
        
        if (inferredModel && product.models && product.models.length > 0 && !product.models.includes("Universal")) {
            modelMatch = product.models.includes(inferredModel);
        }
        
        const fits = makeMatch && yearMatch && engMatch && modelMatch;
        
        if (fits) {
            fitmentBadge = `<div class="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 font-bold uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-lg mb-4"><svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Guaranteed Fitment for ${vyear} ${vmake} ${vengine}</div>`;
        } else {
            fitmentBadge = `<div class="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-lg mb-4"><svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg> Does Not Fit Your ${vyear} ${vmake} ${vengine}</div>`;
        }
    }

    // Shop Pay Installments Logic
    let shopPayMessaging = "";
    if (product.price >= 50 && product.price < 1000) {
        shopPayMessaging = `Pay in 4 interest-free installments of <strong>$${(product.price / 4).toFixed(2)}</strong> with`;
    } else if (product.price >= 1000) {
        shopPayMessaging = `Pay in monthly installments as low as <strong>$${(product.price / 24).toFixed(2)}/mo</strong> with`;
    }

    // Tuning Platform Logic
    const pTitleLower = product.name.toLowerCase();
    const isTransmissionTuning = pTitleLower.includes('transmission tune') || pTitleLower.includes('tcm tune') || (product.variants && product.variants.some(v => v.title.toLowerCase().includes('transmission tuning')));
    const isTunePackage = pTitleLower.includes('support package') || pTitleLower.includes('tune') || pTitleLower.includes('tuning') || pTitleLower.includes('sotf') || (product.variants && product.variants.some(v => v.title.toLowerCase().includes('tune')));
    const isCredit = pTitleLower.includes('credit');
    const isHardwareDevice = pTitleLower.includes('autoagent') || pTitleLower.includes('mpvi') || isCredit || pTitleLower.includes('autocal') || pTitleLower.includes('x4') || pTitleLower.includes('bdx') || pTitleLower.includes('commander');
    
    const isEZ = product.vendor?.toUpperCase().includes('EZ LYNK') || pTitleLower.includes('ez lynk');
    const isHP = product.vendor?.toUpperCase().includes('HP TUNER') || pTitleLower.includes('hp tuner');
    const isMM3 = product.vendor?.toUpperCase().includes('MM3') || pTitleLower.includes('mm3');
    const isEFILive = product.vendor?.toUpperCase().includes('EFI LIVE') || pTitleLower.includes('efi live') || pTitleLower.includes('autocal');
    const isSCT = product.vendor?.toUpperCase().includes('SCT') || product.vendor?.toUpperCase().includes('BULLY DOG') || pTitleLower.includes('sct') || pTitleLower.includes('bully dog');
    const isGDP = product.vendor?.toUpperCase().includes('GDP') || pTitleLower.includes('commander');
    
    const showHardwareBlock = product.category === 'Tuning & Electronics' && isTunePackage && !isHardwareDevice && (isEZ || isHP || isMM3 || isEFILive || isSCT || isGDP);
    const isSOTF = pTitleLower.includes('sotf') || (product.variants && product.variants.some(v => v.title.toLowerCase().includes('sotf')));
    const isCummins2018Plus = (product.makes.includes('Ram') || product.makes.includes('Dodge')) && product.years[1] >= 2018 && pTitleLower.includes('cummins');
    
    // Hardware IDs for Auto-AddToCart
    const hwEZ_ID = 'gid://shopify/ProductVariant/42912460537950'; // EZ LYNK AutoAgent 3
    const hwHP_ID = 'gid://shopify/ProductVariant/42912449265758'; // Wait, let me just add MPVI4 logic directly if we have the ID, else we just add standard device
    // Since we don't have MPVI4 ID, we will just add the base product, or we can fetch it dynamically from storeCatalog later.
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
                    ${fitmentBadge}
                    <div class="mb-8">
                        <p class="text-2xl font-extrabold text-white" data-price-cad="${product.price}">$${product.price.toFixed(2)} CAD</p>
                        ${shopPayMessaging ? `
                        <div class="flex items-center gap-2 mt-3 text-[13px] text-zinc-300 bg-[#1a1a24] border border-edge rounded-lg py-2 px-3 inline-flex">
                            <span>${shopPayMessaging}</span>
                            <img src="/assets/affirm-logo.png" alt="Affirm" class="h-4 w-auto object-contain flex-shrink-0">
                        </div>
                        ` : ''}
                    </div>

                    ${product.category === 'Tuning & Electronics' ? `
                    <!-- ═══════════════════════════════════════════════════════ -->
                    <!-- MANDATE 2: OLED VARIANT INPUT LOGIC                     -->
                    <!-- ═══════════════════════════════════════════════════════ -->
                    <div class="space-y-5 mb-6">

                        <!-- 2.0 POWER / TUNE LEVEL SELECTOR (Shopify Variants) -->
                        ${product.variants && product.variants.filter(v => v.title && v.title !== 'Default Title').length > 0 ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4" id="pdp-tune-level-wrap">
                            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                Power Level
                                <span class="text-red-500 ml-1" aria-label="required">*</span>
                            </label>
                            <div class="space-y-2" role="radiogroup" aria-label="Select tune power level">
                                ${product.variants.filter(v => v.available !== false).map((variant, i) => `
                                <button type="button"
                                    class="pdp-tune-card w-full flex items-center justify-between gap-4 p-4 rounded-lg border border-[#1E1E28] text-left transition-all duration-200 hover:border-labBlue/50 hover:bg-labBlue/5 focus:outline-none focus:ring-2 focus:ring-labBlue min-h-[56px]"
                                    data-variant-id="${variant.id}"
                                    data-variant-price="${variant.price}"
                                    data-variant-title="${variant.title.replace(/"/g, '&quot;')}"
                                    aria-pressed="false"
                                    role="radio">
                                    <div class="flex items-center gap-3">
                                        <div class="w-5 h-5 rounded-full border-2 border-[#1E1E28] bg-[#000000] flex items-center justify-center flex-shrink-0 tune-radio-indicator">
                                            <div class="w-2.5 h-2.5 rounded-full bg-labCyan opacity-0 tune-radio-dot transition-opacity"></div>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-white leading-tight">${variant.title}</p>
                                        </div>
                                    </div>
                                    <span class="text-labBlue font-extrabold text-sm font-mono flex-shrink-0" data-price-cad="${variant.price}">$${parseFloat(variant.price).toFixed(2)} CAD</span>
                                </button>
                                `).join('')}
                            </div>
                            <p id="pdp-tune-level-error" class="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 hidden" role="alert">
                                ✕ Please select a power level before adding to cart.
                            </p>
                        </div>
                        ` : ''}

                        ${isTransmissionTuning ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4" id="pdp-transmission-wrap">
                            <label for="pdp-transmission" class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                Transmission Strategy
                            </label>
                            <div class="relative">
                                <select id="pdp-transmission"
                                    aria-label="Select transmission strategy"
                                    class="w-full appearance-none bg-[#000000] border border-[#1E1E28] text-white rounded-lg p-4 pr-10 text-sm font-semibold min-h-[48px] outline-none cursor-pointer transition-all duration-200"
                                    style="box-shadow:none;"
                                    onfocus="this.style.borderColor='#0066FF';this.style.boxShadow='0 0 0 2px rgba(0,102,255,0.2), 0 0 16px rgba(0,102,255,0.12)'"
                                    onblur="this.style.borderColor='#1E1E28';this.style.boxShadow='none'">
                                    <option value="">Select Shift Strategy</option>
                                    <option value="Standard">Standard Shift Points — Factory Timing</option>
                                    <option value="Raised">Raised Shift Points — Performance Oriented</option>
                                    <option value="High">High Shift Points — Maximum Power Band</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                            <p class="text-[10px] text-zinc-600 mt-2 uppercase tracking-wider">Determines when your transmission changes gears under load.</p>
                        </div>
                        ` : ''}

                        <!-- 2B. HARDWARE REQUIREMENT RADIO BUTTONS -->
                        ${showHardwareBlock ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4" id="pdp-hardware-wrap" data-hw-ez="${hwEZ_ID}" data-hw-hp="${hwHP_ID}" data-is-hp="${isHP}" data-is-ez="${isEZ}">
                            <fieldset>
                                <legend class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Hardware Requirement</legend>
                                <div class="space-y-3">

                                    <!-- Option 1: Need the Device -->
                                    <label for="hw-need" class="flex items-start gap-4 p-4 rounded-lg border border-[#1E1E28] cursor-pointer transition-all duration-200 hover:border-[#0066FF]/50 hover:bg-labBlue/5 group"
                                        id="hw-need-label">
                                        <div class="relative flex-shrink-0 mt-0.5">
                                            <input type="radio" id="hw-need" name="pdp-hardware" value="need_device"
                                                class="sr-only peer" aria-describedby="hw-need-desc">
                                            <div class="w-5 h-5 rounded-full border-2 border-[#1E1E28] bg-[#000000] flex items-center justify-center transition-all peer-checked:border-labCyan group-hover:border-zinc-500"
                                                id="hw-need-indicator">
                                                <div class="w-2.5 h-2.5 rounded-full bg-labCyan opacity-0 transition-opacity peer-checked:opacity-100" id="hw-need-dot"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-white mb-0.5">
                                                ${isHP ? 'I need the HP Tuners Interface' : isMM3 ? 'I need the MM3 Display' : isEFILive ? 'I need the EFI Live AutoCal' : isSCT ? 'I need an SCT Device' : isGDP ? 'I need the GDP Commander' : 'I need the EZ LYNK AutoAgent 3'}
                                            </p>
                                            <p class="text-[10px] text-zinc-500 uppercase tracking-wider" id="hw-need-desc">
                                                ${isHP ? 'Include the MPVI interface with my tune order. Universal Credits are required to flash.' : isMM3 ? 'Include MM3 hardware device with my tune order.' : 'Include hardware device with my tune order.'}
                                            </p>
                                        </div>
                                    </label>

                                    <!-- Option 2: Already Own -->
                                    <label for="hw-own" class="flex items-start gap-4 p-4 rounded-lg border border-[#1E1E28] cursor-pointer transition-all duration-200 hover:border-[#0066FF]/50 hover:bg-labBlue/5 group"
                                        id="hw-own-label">
                                        <div class="relative flex-shrink-0 mt-0.5">
                                            <input type="radio" id="hw-own" name="pdp-hardware" value="own_device"
                                                class="sr-only peer" aria-describedby="hw-own-desc">
                                            <div class="w-5 h-5 rounded-full border-2 border-[#1E1E28] bg-[#000000] flex items-center justify-center transition-all peer-checked:border-labBlue group-hover:border-zinc-500"
                                                id="hw-own-indicator">
                                                <div class="w-2.5 h-2.5 rounded-full bg-labBlue opacity-0 transition-opacity peer-checked:opacity-100" id="hw-own-dot"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-white mb-0.5">I already own a device</p>
                                            <p class="text-[10px] text-zinc-500 uppercase tracking-wider" id="hw-own-desc">Tune files only — I have my own ${isHP ? 'HP Tuners' : isMM3 ? 'MM3' : isEFILive ? 'EFI Live' : isSCT ? 'SCT' : isGDP ? 'GDP' : 'EZ LYNK'} interface.</p>
                                        </div>
                                    </label>

                                </div>
                            </fieldset>
                        </div>
                        ` : ''}

                        <!-- 2C. PRIMARY IDENTIFIER INPUT -->
                        ${isSCT ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4 mt-5" id="pdp-sct-wrap">
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                ECU Strategy Code <span class="text-red-500 ml-1">*</span>
                            </label>
                            <input type="text" id="pdp-sct-ecu" placeholder="e.g. VXA1234" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm mb-3" aria-required="true">
                            
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                TCU Strategy Code <span class="text-zinc-500 ml-1 font-normal lowercase">(Optional)</span>
                            </label>
                            <input type="text" id="pdp-sct-tcu" placeholder="If applicable" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm">
                        </div>
                        ` : isGDP && !isCredit ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4 mt-5" id="pdp-gdp-wrap">
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                ECU Serial Number <span class="text-red-500 ml-1">*</span>
                            </label>
                            <input type="text" id="pdp-gdp-ecu" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm mb-3" aria-required="true">
                            
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                TCU Serial Number <span class="text-zinc-500 ml-1 font-normal lowercase">(Must start with '59')</span>
                            </label>
                            <input type="text" id="pdp-gdp-tcu" placeholder="59..." class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm">
                        </div>
                        ` : (isEZ || isMM3 || isTunePackage) ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4 relative overflow-hidden mt-5" id="pdp-vin-wrap">
                            <div class="absolute top-0 left-0 w-1 h-full bg-labBlue rounded-l-xl"></div>
                            <label for="pdp-vin-input" class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1 pl-2">
                                Vehicle Identification Number (VIN)
                                <span class="text-red-500 ml-1" aria-label="required">*</span>
                            </label>
                            <p class="text-[10px] text-zinc-500 mb-3 pl-2 uppercase tracking-wider">A 17-digit VIN is strictly required to configure this tuning product.</p>
                            <input
                                type="text"
                                id="pdp-vin-input"
                                maxlength="17"
                                minlength="17"
                                placeholder="ENTER 17-DIGIT VIN"
                                autocomplete="off"
                                autocapitalize="characters"
                                spellcheck="false"
                                aria-required="true"
                                class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-4 text-white outline-none font-mono uppercase text-sm tracking-widest min-h-[48px] transition-all duration-200"
                                style="letter-spacing:0.15em;"
                                oninput="this.value=this.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'');">
                        </div>
                        ` : ''}

                        <!-- 2D. SECONDARY AUTHENTICATION / SERIALS -->
                        ${isEFILive ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4 mt-5" id="pdp-efi-wrap">
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                Device Serial Number <span class="text-red-500 ml-1">*</span>
                            </label>
                            <input type="text" id="pdp-efi-serial" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm mb-3" aria-required="true">
                            
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                Authentication Code (20 Chars) <span class="text-red-500 ml-1">*</span>
                            </label>
                            <input type="text" id="pdp-efi-auth" maxlength="20" placeholder="e.g. ABC123DEF456GHI789JK" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm" aria-required="true">
                        </div>
                        ` : isCredit ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4 mt-5" id="pdp-credit-wrap">
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                Device Serial Number <span class="text-red-500 ml-1">*</span>
                            </label>
                            <input type="text" id="pdp-credit-serial" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm mb-3" aria-required="true">
                        </div>
                        ` : `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4 relative overflow-hidden hidden mt-5" id="pdp-serial-wrap">
                            <label for="pdp-serial-input" class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                Device Serial Number
                                <span class="text-zinc-500 ml-1 font-normal lowercase tracking-normal">(Optional)</span>
                            </label>
                            <p class="text-[10px] text-zinc-500 mb-3 uppercase tracking-wider">Link this tune to your existing hardware device.</p>
                            <input type="text" id="pdp-serial-input" placeholder="e.g. 1234567890" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm transition-all duration-200">
                        </div>
                        `}

                        <!-- 2E. VEHICLE MODIFICATIONS / TIRE SIZE -->
                        ${isMM3 ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4 mt-5" id="pdp-mm3-mods-wrap">
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">Tire Size <span class="text-red-500 ml-1">*</span></label>
                            <input type="text" id="pdp-mm3-tire" placeholder="e.g. 35x12.50R20" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-mono uppercase text-sm mb-3" aria-required="true">
                            
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">STOCK.MM3 File Upload <span class="text-red-500 ml-1">*</span></label>
                            <input type="file" id="pdp-mm3-file" accept=".mm3" class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-zinc-400 text-sm mb-3" aria-required="true">
                            
                            <label class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">Vehicle Modifications</label>
                            <textarea id="pdp-mods-input" rows="2" placeholder="Injectors, Turbo..." class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-body text-sm resize-y"></textarea>
                        </div>
                        ` : isEZ || isTunePackage ? `
                        <div class="bg-[#000000] border border-[#1E1E28] rounded-xl p-4 mt-5" id="pdp-mods-wrap">
                            <label for="pdp-mods-input" class="block text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                Vehicle Modifications
                            </label>
                            <p class="text-[10px] text-zinc-500 mb-3 uppercase tracking-wider">List all performance modifications (e.g., Injectors, Turbo, Exhaust) so our tuners can build your file accurately.</p>
                            <textarea id="pdp-mods-input" rows="3" placeholder="Stock Turbo, 100% over Injectors, etc..." class="w-full bg-[#000000] border border-[#1E1E28] rounded-lg p-3 text-white font-body text-sm resize-y"></textarea>
                        </div>
                        ` : ''}


                    </div>
                    <!-- /MANDATE 2 -->

                    <!-- ═══════════════════════════════════════════════════════ -->
                    <!-- MANDATE 3: UNSKIPPABLE COMPLIANCE GATE                  -->
                    <!-- ═══════════════════════════════════════════════════════ -->
                    <div id="pdp-compliance-gate"
                         class="bg-[#0D0D12] border rounded-xl p-4 mb-5"
                         style="border-color:rgba(127,29,29,0.5);"
                         role="group"
                         aria-labelledby="compliance-gate-title">
                        <!-- Header bar -->
                        <div class="flex items-center gap-2 mb-3">
                            <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <p id="compliance-gate-title" class="text-[9px] font-black text-red-500 uppercase tracking-widest">Mandatory Compliance Acknowledgement</p>
                        </div>
                        <!-- Checkbox row -->
                        <label for="pdp-compliance-check" class="flex items-start gap-3 cursor-pointer group">
                            <div class="relative flex-shrink-0 mt-0.5">
                                <input type="checkbox" id="pdp-compliance-check"
                                    aria-required="true"
                                    aria-describedby="compliance-text"
                                    class="sr-only peer">
                                <!-- Custom OLED checkbox -->
                                <div class="w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center"
                                     id="pdp-compliance-box"
                                     style="border-color:rgba(239,68,68,0.6); background:#000000;">
                                    <svg id="pdp-compliance-check-icon" class="w-3 h-3 text-white hidden" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                            <p id="compliance-text" class="text-[10px] text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                                <strong class="text-white">MANDATORY COMPLIANCE:</strong> By checking this box, I confirm this product is for
                                <strong class="text-red-400">Off-Road and Sanctioned Racing Use Only</strong>, and is not legal for use on
                                pollution-controlled vehicles. I release <strong class="text-white">THE LAB</strong> from any liability regarding
                                Clean Air Act compliance.
                            </p>
                        </label>
                    </div>
                    <!-- /MANDATE 3 -->

                    ` : ''}

                    <!-- ═══════════════════════════════════════════════════════ -->
                    <!-- CROSS-SELLS                                             -->
                    <!-- ═══════════════════════════════════════════════════════ -->
                    ${isSOTF ? `
                    <div class="mb-5 bg-[#111115] border border-[#1E1E28] rounded-xl p-4 flex items-center justify-between hover:border-[#0066FF]/50 transition-colors">
                        <label for="upsell-sotf" class="flex items-center gap-3 cursor-pointer flex-1">
                            <div class="relative flex-shrink-0">
                                <input type="checkbox" id="upsell-sotf" class="sr-only peer upsell-checkbox" data-price="65.00" data-name="SOTF Switch & Bracket">
                                <div class="w-5 h-5 rounded border-2 border-[#1E1E28] bg-[#000000] peer-checked:border-[#0066FF] peer-checked:bg-[#0066FF] flex items-center justify-center transition-all">
                                    <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white mb-0.5">Add SOTF Switch & Bracket</p>
                                <p class="text-[10px] text-zinc-500 uppercase tracking-wider">Required to change power levels on the fly.</p>
                            </div>
                        </label>
                        <span class="text-sm font-bold text-[#0066FF]">+$65.00</span>
                    </div>
                    ` : ''}

                    ${isCummins2018Plus ? `
                    <div class="mb-5 bg-[#111115] border border-[#1E1E28] rounded-xl p-4 flex items-center justify-between hover:border-[#0066FF]/50 transition-colors">
                        <label for="upsell-sgm" class="flex items-center gap-3 cursor-pointer flex-1">
                            <div class="relative flex-shrink-0">
                                <input type="checkbox" id="upsell-sgm" class="sr-only peer upsell-checkbox" data-price="70.00" data-name="Cummins SGM Bypass Cable">
                                <div class="w-5 h-5 rounded border-2 border-[#1E1E28] bg-[#000000] peer-checked:border-[#0066FF] peer-checked:bg-[#0066FF] flex items-center justify-center transition-all">
                                    <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white mb-0.5">Add Security Bypass Cable</p>
                                <p class="text-[10px] text-zinc-500 uppercase tracking-wider">Mandatory for flashing 2018+ Cummins.</p>
                            </div>
                        </label>
                        <span class="text-sm font-bold text-[#0066FF]">+$70.00</span>
                    </div>
                    ` : ''}

                    <div class="flex gap-4">
                        <button id="pdp-add-btn"
                            class="flex-1 bg-labBlue hover:bg-labCyan text-white font-extrabold uppercase tracking-widest py-4 rounded-xl transition-all shadow-oled-blue hover:shadow-oled-cyan min-h-[56px] focus:outline-none focus:ring-2 focus:ring-labBlue focus:ring-offset-2 focus:ring-offset-black">
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
                        <div class="mb-4">
                            <input type="text" id="fitment-search" placeholder="Search your vehicle (e.g., 2018 Ford 6.7L)..." class="w-full bg-void border border-edge rounded-lg p-3 text-white text-sm focus:outline-none focus:border-labBlue transition-colors">
                        </div>
                        <ul class="space-y-3 bg-[#111115] p-5 rounded-lg border border-edge h-64 overflow-y-auto" id="fitment-list">
                            ${product.makes.filter(m => m !== 'Universal').length === 0 ? `<li class="text-zinc-400 text-sm">Universal Fitment</li>` : ''}
                            ${product.makes.filter(m => m !== 'Universal').map(make => `
                                <li>
                                    <h4 class="text-white font-bold text-sm uppercase tracking-wider mb-2 border-b border-edge pb-2">${make}</h4>
                                    <ul class="pl-4 space-y-1">
                                        <li class="text-zinc-400 text-sm flex items-center gap-2" data-min-year="${product.years[0]}" data-max-year="${product.years[1]}">
                                            <div class="w-1.5 h-1.5 rounded-full bg-labBlue"></div>
                                            ${product.years[0]} - ${product.years[1] === 2026 ? 'Present' : product.years[1]} ${make} ${product.engine !== 'Universal' ? product.engine : 'All Engines'}
                                        </li>
                                    </ul>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Shipping Accordion -->
                <div class="border-b border-edge">
                    <button class="pdp-accordion-btn w-full flex items-center justify-between py-6 text-left group transition-all" data-target="pdp-shipping">
                        <span class="text-lg font-heading font-extrabold text-[#FFFFFF] uppercase tracking-wider group-hover:text-[#00E5FF] transition-colors duration-300">Shipping & Returns</span>
                        <svg class="w-5 h-5 text-[#A0A0AB] group-hover:text-[#00E5FF] transform transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    <div id="pdp-shipping" class="hidden">
                        <div class="pb-6 font-body text-[#A0A0AB] space-y-6 text-sm leading-relaxed">
                            ${(() => {
                                const t = product.tags || [];
                                const lowerT = t.map(x => x.toLowerCase().trim());
                                const isOversized = lowerT.some(x => x.includes('exhaust') || x.includes('delete pipe'));
                                const isEmissions = lowerT.some(x => ['dpf', 'def', 'egr', 'delete pipe', 'exhaust', 'tune', 'tuner', 'tuning'].some(k => x.includes(k)));
                                
                                let html = '<div class="space-y-2"><h4 class="text-[#FFFFFF] font-bold uppercase tracking-widest text-xs mb-3">Shipping Rates</h4>';
                                
                                if (isOversized) {
                                    html += `
                                        <div class="space-y-4">
                                            <p class="text-[#FFFFFF] font-bold">Oversized Freight Rules Apply:</p>
                                            <ul class="space-y-2 pl-5 list-disc marker:text-[#0066FF]">
                                                <li><span class="text-[#FFFFFF] font-bold">Canada:</span> $80 CAD/Full System or $65 CAD/Delete Pipe <span class="italic text-xs text-[#A0A0AB]">(10+ pieces ship skid freight free)</span>.</li>
                                                <li><span class="text-[#FFFFFF] font-bold">US:</span> $111 USD/Full System or $74 USD/Delete Pipe <span class="italic text-xs text-[#A0A0AB]">(10+ pieces: $500 USD first skid, $250 USD additional)</span>.</li>
                                            </ul>
                                            <p class="italic text-xs">Remote locations are subject to manual freight adjustments.</p>
                                        </div>
                                    `;
                                } else {
                                    html += `
                                        <div class="space-y-2">
                                            <p><span class="text-[#FFFFFF] font-bold">Canadian Orders:</span> $20 CAD flat rate (Free over $1000 CAD).</p>
                                            <p><span class="text-[#FFFFFF] font-bold">North American Orders:</span> $37 USD flat rate.</p>
                                            <p class="italic text-xs">Remote locations are subject to manual freight adjustments prior to fulfillment.</p>
                                        </div>
                                    `;
                                }
                                
                                html += `</div>
                                    <div class="bg-[#1E1E28] p-4 rounded-lg border border-[#1E1E28]/50 mt-6">
                                        <p class="text-[#FFFFFF] text-xs leading-relaxed">
                                            <span class="font-bold text-[#0066FF] uppercase tracking-wider block mb-1">International Duties</span>
                                            Shipments outside of Canada may incur <span class="text-[#FFFFFF] font-bold">TARIFFS</span> and <span class="text-[#FFFFFF] font-bold">TAXES</span>. THE LAB does not collect these prior to shipping. All cross-border import duties are strictly the responsibility of the consumer.
                                        </p>
                                    </div>
                                `;
                                
                                if (isEmissions) {
                                    html += `
                                        <div class="pt-4 border-t border-[#1E1E28]">
                                            <p class="italic text-[#A0A0AB] text-[11px] leading-relaxed">
                                                NOTICE: These products are for Off-Road and Sanctioned Racing Use Only. They are not legal for use on pollution-controlled vehicles. The purchaser assumes all legal liability for Clean Air Act compliance. THE LAB does not advise on or authorize the illegal bypass of emissions testing.
                                            </p>
                                        </div>
                                    `;
                                }
                                
                                return html;
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // ── MANDATE 2: Power Level selector interactivity ───────────────────────
    let selectedVariant = null;
    
    // Helper to calculate total price
    const updateTotalPrice = () => {
        let basePrice = product.price;
        if (selectedVariant) basePrice = selectedVariant.price;
        
        let hwPrice = 0;
        const hardware = document.querySelector('input[name="pdp-hardware"]:checked');
        if (hardware && hardware.value === 'need_device') {
            const hwWrap = document.getElementById('pdp-hardware-wrap');
            if (hwWrap) {
                const isEZ = hwWrap.dataset.isEz === 'true';
                const isHP = hwWrap.dataset.isHp === 'true';
                let hwProduct = null;
                const searchId = isEZ ? hwWrap.dataset.hwEz : (isHP ? hwWrap.dataset.hwHp : null);
                if (searchId) {
                    hwProduct = window.storeCatalog.find(p => p.variants && p.variants.some(v => v.id === searchId));
                }
                
                // Fallback to name search if variant not found
                if (!hwProduct) {
                    if (isEZ) hwProduct = window.storeCatalog.find(p => p.name.toLowerCase().includes('autoagent') && p.name.toLowerCase().includes('3'));
                    if (isHP) hwProduct = window.storeCatalog.find(p => p.name.toLowerCase().includes('mpvi'));
                }
                
                if (hwProduct) hwPrice = hwProduct.price;
            }
        }
        
        let upsellPrice = 0;
        document.querySelectorAll('.upsell-checkbox:checked').forEach(cb => {
            upsellPrice += parseFloat(cb.dataset.price || 0);
        });
        
        const total = basePrice + hwPrice + upsellPrice;
        
        const priceEl = document.querySelector('#pdp-container .text-2xl.font-extrabold');
        if (priceEl) {
            priceEl.dataset.priceCad = total;
            priceEl.textContent = `$${total.toFixed(2)} CAD`;
            if (window.setCurrency) {
                window.setCurrency(localStorage.getItem('theLab_currency') || 'CAD');
            }
        }
    };
    
    // Listen to upsell checkboxes
    document.querySelectorAll('.upsell-checkbox').forEach(cb => {
        cb.addEventListener('change', updateTotalPrice);
    });
    
    // Listen to hardware radios
    document.querySelectorAll('input[name="pdp-hardware"]').forEach(radio => {
        radio.addEventListener('change', updateTotalPrice);
    });

    if (product.category === 'Tuning & Electronics') {
        const tuneCards = document.querySelectorAll('.pdp-tune-card');
        
        tuneCards.forEach(card => {
            card.addEventListener('click', () => {
                // Deselect all
                tuneCards.forEach(c => {
                    c.style.borderColor = '#1E1E28';
                    c.style.backgroundColor = '';
                    c.setAttribute('aria-pressed', 'false');
                    const dot = c.querySelector('.tune-radio-dot');
                    const ring = c.querySelector('.tune-radio-indicator');
                    if (dot) dot.classList.add('opacity-0');
                    if (ring) ring.style.borderColor = '#1E1E28';
                });
                // Select this card
                card.style.borderColor = 'rgba(0,229,255,0.5)';
                card.style.backgroundColor = 'rgba(0,229,255,0.04)';
                card.setAttribute('aria-pressed', 'true');
                const dot = card.querySelector('.tune-radio-dot');
                const ring = card.querySelector('.tune-radio-indicator');
                if (dot) dot.classList.remove('opacity-0');
                if (ring) ring.style.borderColor = '#00E5FF';

                // Update selected variant state
                selectedVariant = {
                    id:    card.dataset.variantId,
                    price: parseFloat(card.dataset.variantPrice),
                    title: card.dataset.variantTitle
                };

                updateTotalPrice();

                // Clear error
                const lvlErr = document.getElementById('pdp-tune-level-error');
                if (lvlErr) lvlErr.classList.add('hidden');
            });
        });

        // Auto-select first available variant if only one exists
        if (tuneCards.length === 1) tuneCards[0].click();

        // Radio button custom styling (hardware)
        document.querySelectorAll('input[name="pdp-hardware"]').forEach(radio => {
            radio.addEventListener('change', () => {
                // Reset all radio visuals
                document.querySelectorAll('input[name="pdp-hardware"]').forEach(r => {
                    const label = r.closest('label');
                    const indicator = label.querySelector('[id$="-indicator"]');
                    const dot = label.querySelector('[id$="-dot"]');
                    if (indicator) { indicator.style.borderColor = '#1E1E28'; }
                    if (dot) dot.classList.add('opacity-0');
                    if (label) label.style.borderColor = '#1E1E28';
                });
                // Apply active state
                const activeLabel = radio.closest('label');
                const activeDot = activeLabel.querySelector('[id$="-dot"]');
                const activeIndicator = activeLabel.querySelector('[id$="-indicator"]');
                const isNeed = radio.id === 'hw-need';
                const isOwn = radio.id === 'hw-own';
                if (activeIndicator) activeIndicator.style.borderColor = isNeed ? '#00E5FF' : '#0066FF';
                if (activeDot) activeDot.classList.remove('opacity-0');
                if (activeLabel) activeLabel.style.borderColor = isNeed ? 'rgba(0,229,255,0.4)' : 'rgba(0,102,255,0.4)';
                
                // Toggle Serial Number input visibility
                const serialWrap = document.getElementById('pdp-serial-wrap');
                if (serialWrap) {
                    if (isOwn) {
                        serialWrap.classList.remove('hidden');
                    } else {
                        serialWrap.classList.add('hidden');
                        const serialInput = document.getElementById('pdp-serial-input');
                        if (serialInput) serialInput.value = '';
                    }
                }

                updateTotalPrice();
            });
        });
    }

    // ── MANDATE 3: Compliance checkbox custom styling ───────────────────────
    const complianceCheck = document.getElementById('pdp-compliance-check');
    const complianceBox   = document.getElementById('pdp-compliance-box');
    const complianceIcon  = document.getElementById('pdp-compliance-check-icon');
    const complianceGate  = document.getElementById('pdp-compliance-gate');

    if (complianceCheck && complianceBox) {
        complianceCheck.addEventListener('change', () => {
            if (complianceCheck.checked) {
                complianceBox.style.backgroundColor = '#0066FF';
                complianceBox.style.borderColor = '#0066FF';
                complianceIcon.classList.remove('hidden');
                complianceGate.style.borderColor = 'rgba(0,102,255,0.3)';
            } else {
                complianceBox.style.backgroundColor = '#000000';
                complianceBox.style.borderColor = 'rgba(239,68,68,0.6)';
                complianceIcon.classList.add('hidden');
                complianceGate.style.borderColor = 'rgba(127,29,29,0.5)';
            }
        });
    }

    // ── Add to Cart — full validation gate ──────────────────────────────────
    document.getElementById("pdp-add-btn").addEventListener("click", () => {
        const isTuning = product.category === 'Tuning & Electronics';
        const customAttributes = {};
        let validationFailed = false;

        if (isTuning) {
            // — Power Level / Tune Level check (Variants) —
            const tuneCards = document.querySelectorAll('.pdp-tune-card');
            const hasVariants = tuneCards.length > 0;
            const selectedTuneCard = document.querySelector('.pdp-tune-card[aria-pressed="true"]');

            if (hasVariants && !selectedTuneCard) {
                const lvlErr = document.getElementById('pdp-tune-level-error');
                if (lvlErr) lvlErr.classList.remove('hidden');
                const wrap = document.getElementById('pdp-tune-level-wrap');
                if (wrap) {
                    wrap.style.borderColor = 'rgba(239,68,68,0.6)';
                    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => { if (wrap && !selectedTuneCard) wrap.style.borderColor = '#1E1E28'; }, 1500);
                }
                validationFailed = true;
            }

            // Build variantOverride from selected tune card
            const variantOverride = selectedTuneCard ? {
                id:    selectedTuneCard.dataset.variantId,
                price: parseFloat(selectedTuneCard.dataset.variantPrice),
                title: selectedTuneCard.dataset.variantTitle
            } : null;

            // — Compliance gate check (Mandate 3) —
            const compliance = document.getElementById("pdp-compliance-check");
            if (!compliance || !compliance.checked) {
                const gate = document.getElementById('pdp-compliance-gate');
                if (gate) {
                    gate.style.borderColor = 'rgba(239,68,68,0.8)';
                    gate.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.2)';
                    gate.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Flash effect
                    setTimeout(() => {
                        if (gate && compliance && !compliance.checked) {
                            gate.style.boxShadow = 'none';
                        }
                    }, 1500);
                }
                validationFailed = true;
            }

            // — VIN check (Mandate 2C) —
            const vinWrap = document.getElementById("pdp-vin-wrap");
            if (vinWrap) {
                const vin = document.getElementById("pdp-vin-input");
                const vinError = document.getElementById("pdp-vin-error");
                const vinVal = vin ? vin.value.trim().toUpperCase() : '';
                if (vinVal.length !== 17) {
                    if (vinError) vinError.classList.remove("hidden");
                    if (vin) { vin.style.borderColor = '#ef4444'; vin.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.2)'; }
                    validationFailed = true;
                } else {
                    if (vinError) vinError.classList.add("hidden");
                    if (vin) { vin.style.borderColor = '#1E1E28'; vin.style.boxShadow = 'none'; }
                    customAttributes["VIN"] = vinVal;
                }
            }

            // — SCT Strategy Codes —
            const sctWrap = document.getElementById("pdp-sct-wrap");
            if (sctWrap) {
                const ecu = document.getElementById("pdp-sct-ecu");
                if (ecu && ecu.value.trim() === "") {
                    ecu.style.borderColor = '#ef4444';
                    validationFailed = true;
                } else if (ecu) {
                    ecu.style.borderColor = '#1E1E28';
                    customAttributes["ECU Strategy Code"] = ecu.value.trim().toUpperCase();
                }
                const tcu = document.getElementById("pdp-sct-tcu");
                if (tcu && tcu.value.trim() !== "") {
                    customAttributes["TCU Strategy Code"] = tcu.value.trim().toUpperCase();
                }
            }

            // — GDP Serial Numbers —
            const gdpWrap = document.getElementById("pdp-gdp-wrap");
            if (gdpWrap) {
                const ecu = document.getElementById("pdp-gdp-ecu");
                if (ecu && ecu.value.trim() === "") {
                    ecu.style.borderColor = '#ef4444';
                    validationFailed = true;
                } else if (ecu) {
                    ecu.style.borderColor = '#1E1E28';
                    customAttributes["ECU Serial Number"] = ecu.value.trim().toUpperCase();
                }
                const tcu = document.getElementById("pdp-gdp-tcu");
                if (tcu && tcu.value.trim() !== "") {
                    customAttributes["TCU Serial Number"] = tcu.value.trim().toUpperCase();
                }
            }

            // — EFI Live Device & Auth —
            const efiWrap = document.getElementById("pdp-efi-wrap");
            if (efiWrap) {
                const serial = document.getElementById("pdp-efi-serial");
                const auth = document.getElementById("pdp-efi-auth");
                if (serial && serial.value.trim() === "") {
                    serial.style.borderColor = '#ef4444';
                    validationFailed = true;
                } else if (serial) {
                    serial.style.borderColor = '#1E1E28';
                    customAttributes["Device Serial Number"] = serial.value.trim().toUpperCase();
                }
                
                if (auth && auth.value.trim().length !== 20) {
                    auth.style.borderColor = '#ef4444';
                    validationFailed = true;
                } else if (auth) {
                    auth.style.borderColor = '#1E1E28';
                    customAttributes["Authentication Code"] = auth.value.trim().toUpperCase();
                }
            }

            // — GDP / HP Tuners Credits Serial —
            const creditWrap = document.getElementById("pdp-credit-wrap");
            if (creditWrap) {
                const serial = document.getElementById("pdp-credit-serial");
                if (serial && serial.value.trim() === "") {
                    serial.style.borderColor = '#ef4444';
                    validationFailed = true;
                } else if (serial) {
                    serial.style.borderColor = '#1E1E28';
                    customAttributes["Device Serial Number"] = serial.value.trim().toUpperCase();
                }
            }

            // — Transmission strategy (Mandate 2A) —
            const transmission = document.getElementById("pdp-transmission");
            if (transmission && transmission.value) {
                customAttributes["Transmission Strategy"] = transmission.options[transmission.selectedIndex].text;
            }

            // — Hardware requirement (Mandate 2B) —
            const hardware = document.querySelector('input[name="pdp-hardware"]:checked');
            let hwToAdd = null;
            if (hardware) {
                const isNeed = hardware.value === 'need_device';
                if (isNeed) {
                    const hwWrap = document.getElementById('pdp-hardware-wrap');
                    if (hwWrap) {
                        const isEZ = hwWrap.dataset.isEz === 'true';
                        const isHP = hwWrap.dataset.isHp === 'true';
                        
                        const searchId = isEZ ? hwWrap.dataset.hwEz : (isHP ? hwWrap.dataset.hwHp : null);
                        if (searchId) {
                            hwToAdd = window.storeCatalog.find(p => p.variants && p.variants.some(v => v.id === searchId));
                        }
                        
                        if (!hwToAdd) {
                            if (isEZ) hwToAdd = window.storeCatalog.find(p => p.name.toLowerCase().includes('autoagent') && p.name.toLowerCase().includes('3'));
                            if (isHP) hwToAdd = window.storeCatalog.find(p => p.name.toLowerCase().includes('mpvi'));
                        }
                    }
                    customAttributes["Hardware"] = hwWrap.dataset.isHp === 'true' ? 'HP Tuners MPVI Required' : 'EZ LYNK AutoAgent 3 Required';
                } else {
                    customAttributes["Hardware"] = 'Customer Owns Device';
                }
            }

            // — Device Serial Number (Optional, for own device) —
            const serialWrap = document.getElementById("pdp-serial-wrap");
            if (serialWrap && !serialWrap.classList.contains("hidden")) {
                const serialInput = document.getElementById("pdp-serial-input");
                if (serialInput && serialInput.value.trim() !== "") {
                    customAttributes["Device Serial Number"] = serialInput.value.trim().toUpperCase();
                }
            }

            // — Vehicle Modifications —
            const modsWrap = document.getElementById("pdp-mods-wrap");
            if (modsWrap) {
                const modsInput = document.getElementById("pdp-mods-input");
                if (modsInput && modsInput.value.trim() !== "") {
                    customAttributes["Vehicle Modifications"] = modsInput.value.trim();
                } else {
                    customAttributes["Vehicle Modifications"] = "None/Stock";
                }
            }
            
            // — Upsell Checkboxes —
            const checkedUpsells = [];
            document.querySelectorAll('.upsell-checkbox:checked').forEach(cb => {
                checkedUpsells.push(cb.dataset.name);
            });
            if (checkedUpsells.length > 0) {
                customAttributes["Added Upgrades"] = checkedUpsells.join(', ');
            }

            if (validationFailed) return;

            addToCart(product.id, 1, customAttributes, variantOverride);
            
            // Add hardware to cart synchronously and robustly
            try {
                if (hwToAdd && hwToAdd.id) {
                    let hwVariantOverride = null;
                    const hwWrap = document.getElementById('pdp-hardware-wrap');
                    if (hwWrap) {
                        const isEZ = hwWrap.dataset.isEz === 'true';
                        const isHP = hwWrap.dataset.isHp === 'true';
                        const searchId = isEZ ? hwWrap.dataset.hwEz : (isHP ? hwWrap.dataset.hwHp : null);
                        if (searchId && hwToAdd.variants) {
                            const exactVariant = hwToAdd.variants.find(v => v.id === searchId);
                            if (exactVariant) {
                                hwVariantOverride = { id: exactVariant.id, price: exactVariant.price, title: exactVariant.title };
                            }
                        }
                    }
                    if (!hwVariantOverride && hwToAdd.variants && hwToAdd.variants.length > 0) {
                        hwVariantOverride = { id: hwToAdd.variants[0].id, price: hwToAdd.variants[0].price, title: hwToAdd.variants[0].title };
                    }
                    addToCart(hwToAdd.id, 1, { "Add-On To": product.name }, hwVariantOverride);
                } else {
                    if (document.querySelector('input[name="pdp-hardware"]:checked')?.value === 'need_device') {
                        console.error("[THE LAB] hwToAdd is null but device was requested!");
                        alert("Debug Info: The device was checked but hwToAdd is null. ID not found in storeCatalog.");
                    }
                }
            } catch (err) {
                alert("Debug Error in Hardware cart logic: " + err.message);
            }
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

    // Fitment Search Logic
    const fitmentSearch = document.getElementById('fitment-search');
    if (fitmentSearch) {
        fitmentSearch.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);
            const searchYear = yearMatch ? parseInt(yearMatch[1]) : null;
            const textQuery = q.replace(/\b(19\d{2}|20\d{2})\b/g, '').trim().split(/\s+/);

            document.querySelectorAll('#fitment-list > li').forEach(makeLi => {
                if (makeLi.querySelector('h4')) {
                    let hasVisibleChild = false;
                    makeLi.querySelectorAll('ul > li').forEach(childLi => {
                        const minYear = parseInt(childLi.getAttribute('data-min-year'));
                        const maxYear = parseInt(childLi.getAttribute('data-max-year'));
                        const text = childLi.textContent.toLowerCase();
                        
                        let matchesYear = true;
                        if (searchYear) {
                            matchesYear = searchYear >= minYear && searchYear <= maxYear;
                        }
                        
                        let matchesText = true;
                        if (textQuery.length > 0 && textQuery[0] !== '') {
                            matchesText = textQuery.every(term => text.includes(term));
                        }
                        
                        if (matchesYear && matchesText) {
                            childLi.style.display = 'flex';
                            hasVisibleChild = true;
                        } else {
                            childLi.style.display = 'none';
                        }
                    });
                    makeLi.style.display = hasVisibleChild ? 'block' : 'none';
                } else if (makeLi.textContent.includes('Universal Fitment')) {
                    makeLi.style.display = q === '' ? 'block' : 'none'; 
                }
            });
        });
    }

    // Apply currency format to newly rendered PDP elements
    if (window.setCurrency) {
        window.setCurrency(localStorage.getItem('theLab_currency') || 'CAD');
    }
}
