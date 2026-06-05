// the LAB - Dynamic Store Engine
document.addEventListener("DOMContentLoaded", () => {
    initCart();
    initVehicleSelector();
    if (document.getElementById("product-grid")) {
        initStore();
    }
    if (document.getElementById("pdp-container")) {
        initPDP();
    }
});

/* --- CART LOGIC --- */
let cart = JSON.parse(localStorage.getItem("lab_cart")) || [];

function saveCart() {
    localStorage.setItem("lab_cart", JSON.stringify(cart));
    updateCartUI();
}

function addToCart(productId, quantity = 1) {
    const product = window.storeCatalog.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    saveCart();
    openCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(productId);
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
                <a href="/contact/" class="block w-full text-center bg-labBlue text-white font-extrabold uppercase tracking-widest py-4 rounded hover:bg-labCyan transition-colors">
                    Checkout (Request Invoice)
                </a>
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
        return `
            <div class="flex gap-4 items-center">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded bg-void border border-edge">
                <div class="flex-1">
                    <h3 class="text-white text-xs font-bold leading-tight mb-1 line-clamp-2">${item.name}</h3>
                    <p class="text-labBlue text-xs font-mono font-bold">$${item.price.toFixed(2)} CAD</p>
                    <div class="flex items-center gap-3 mt-2">
                        <button onclick="updateQuantity('${item.id}', -1)" class="text-zinc-400 hover:text-white px-2 py-1 bg-edge rounded">-</button>
                        <span class="text-white text-xs font-bold">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)" class="text-zinc-400 hover:text-white px-2 py-1 bg-edge rounded">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    document.getElementById("cart-subtotal").textContent = `$${subtotal.toFixed(2)} CAD`;
}

/* --- STORE GRID & FILTER LOGIC --- */
let activeFilters = {
    makes: [],
    categories: [],
    engines: [],
    year: null
};


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
            nameStr.textContent = `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.engine}`;
        }
    } else {
        hero.classList.remove("hidden");
        banner.classList.add("hidden");
    }
}

function initStore() {
    const params = new URLSearchParams(window.location.search);
    const make = params.get("make");
    const category = params.get("category");

    if (make) {
        activeFilters.makes.push(make);
        const cb = document.getElementById(`filter-make-${make}`);
        if(cb) cb.checked = true;
    }
    if (category) {
        activeFilters.categories.push(category);
        const cb = document.getElementById(`filter-cat-${category}`);
        if(cb) cb.checked = true;
    }

    // Attach listener to checkboxes
    document.querySelectorAll('.store-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const val = e.target.value;
            const type = e.target.dataset.type;
            
            if (type === 'make') {
                if (e.target.checked) activeFilters.makes.push(val);
                else activeFilters.makes = activeFilters.makes.filter(m => m !== val);
            } else if (type === 'category') {
                if (e.target.checked) activeFilters.categories.push(val);
                else activeFilters.categories = activeFilters.categories.filter(c => c !== val);
            } else if (type === 'engine') {
                if (e.target.checked) activeFilters.engines.push(val);
                else activeFilters.engines = activeFilters.engines.filter(e => e !== val);
            }
            renderProducts();
        });
    });

    // Attach listener to year input
    const yearInput = document.getElementById('filter-year');
    if (yearInput) {
        yearInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            activeFilters.year = isNaN(val) ? null : val;
            renderProducts();
        });
    }

    renderProducts();
}


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
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <h3 class="text-white text-xl font-bold mb-2">No products found</h3>
                <p class="text-zinc-500">Try adjusting your filters.</p>
            </div>
        `;
        return;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <h3 class="text-white text-xl font-bold mb-2">No products found</h3>
                <p class="text-zinc-500">Try adjusting your filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="group relative bg-void border border-edge rounded-xl overflow-hidden hover:border-labBlue/50 transition-all">
            <a href="/store/product/?id=${p.id}" class="block aspect-video bg-[#111115] relative">
                ${p.isPopular ? '<span class="absolute top-2 right-2 bg-labBlue text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">Popular</span>' : ''}
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500">
            </a>
            <div class="p-6">
                <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">${p.makes.join(", ")} &bull; ${p.category}</div>
                <h3 class="text-white font-bold leading-tight mb-2 min-h-[40px]"><a href="/store/product/?id=${p.id}" class="hover:text-labBlue transition-colors">${p.name}</a></h3>
                <div class="flex items-center justify-between mt-6">
                    <span class="text-lg font-extrabold text-white">$${p.price.toFixed(2)}</span>
                    <button onclick="addToCart('${p.id}')" class="bg-edge hover:bg-labBlue text-white p-2.5 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join("");
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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto py-12 px-6">
            <div class="bg-[#111115] border border-edge rounded-2xl p-8 aspect-square flex items-center justify-center">
                <img src="${product.image}" alt="${product.name}" class="max-w-full max-h-full object-contain">
            </div>
            <div class="flex flex-col justify-center">
                <div class="text-xs font-mono text-labBlue uppercase tracking-widest mb-4">${product.makes.join(", ")} &bull; ${product.category}</div>
                <h1 class="text-3xl md:text-4xl font-heading font-extrabold text-white leading-tight mb-4">${product.name}</h1>
                <p class="text-2xl font-extrabold text-white mb-6">$${product.price.toFixed(2)} CAD</p>
                <p class="text-zinc-400 leading-relaxed mb-8">${product.description}</p>
                
                <div class="mb-8">
                    <h3 class="text-white font-bold uppercase tracking-widest text-xs mb-4">Features</h3>
                    <ul class="space-y-2">
                        ${product.features.map(f => `
                            <li class="flex items-start gap-2 text-zinc-300 text-sm">
                                <svg class="w-5 h-5 text-labBlue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                <span>${f}</span>
                            </li>
                        `).join("")}
                    </ul>
                </div>

                <div class="flex gap-4">
                    <button onclick="addToCart('${product.id}')" class="flex-1 bg-labBlue hover:bg-labCyan text-white font-extrabold uppercase tracking-widest py-4 rounded-xl transition-all shadow-oled-blue hover:shadow-oled-cyan">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}
