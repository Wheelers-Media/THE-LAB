// ═══════════════════════════════════════════════════════════════════
// THE LAB - Shopify Storefront Integration & Product Classifier
// ═══════════════════════════════════════════════════════════════════
const SHOPIFY_TOKEN = "661b1009a0d85bfadfce9c52fcb3d87f";
const STORE_URL = "https://xr6pmx-y0.myshopify.com/api/2024-01/graphql.json";

window.storeCatalog = [];

// ── Shopify GraphQL helper ──────────────────────────────────────
async function shopifyGraphQL(query, variables = {}) {
    const response = await fetch(STORE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN
        },
        body: JSON.stringify({ query, variables })
    });
    const result = await response.json();
    if (result.errors) {
        console.error("Shopify GraphQL Errors:", result.errors);
        throw new Error("Shopify API Error");
    }
    return result.data;
}

// ── Exclusion: titles/keywords that are NOT parts ───────────────
const EXCLUDED_KEYWORDS = [
    "interior detail", "de-luxx interior", "standard detail",
    "detail labor", "maintenance detail", "exterior wash",
    "mechanical shop rate", "shop rate", "shop supplies",
    "light truck rotate", "emblem wrap", "bio bombs",
    "gift card", "e-gift card",
    "ceramic tint", "suntek carbon tint", "carbon tint",
    "tint removal", "glue cleanup", "windshield brow removal",
    "rear window tint removal",
    "hoodie", "duck camo"
];

function isExcluded(title, tags) {
    const t = title.toLowerCase();
    if (EXCLUDED_KEYWORDS.some(kw => t.includes(kw))) return true;
    if (tags.some(tag => tag.toLowerCase() === "merchandise")) return true;
    return false;
}

// ── Category classifier ─────────────────────────────────────────
function classifyCategory(title, tags) {
    const t = title.toLowerCase();
    const tagStr = tags.join(" ").toLowerCase();

    // Order matters: check more specific before general

    // Bumpers & Armor (Gridiron)
    if (t.includes("bumper") || t.includes("interceptor") || t.includes("grille guard") ||
        t.includes("grill guard") || t.includes("headlight guard") || t.includes("center tub") ||
        t.includes("bumper wings") || t.includes("mounts")) {
        if (t.includes("interceptor") || t.includes("gridiron") || t.includes("bumper")) {
            return "Bumpers & Armor";
        }
    }

    // Tuning & Electronics
    if (t.includes("tuning") || t.includes("ez lynk") || t.includes("ez-lynk") ||
        t.includes("hp tuners") || t.includes("autoagent") || t.includes("auto agent") ||
        t.includes("amdp") || t.includes("sotf") || t.includes("ecm") ||
        t.includes("tuning support") || t.includes("tune file") || t.includes("custom tuning") ||
        t.includes("tuning credits") || t.includes("can bus") || t.includes("can plug") ||
        t.includes("def module") || t.includes("diagnostic plug") ||
        t.includes("insight") || t.includes("edge insight") ||
        t.includes("gdp") || t.includes("support pack") ||
        t.includes("rotary switch") || t.includes("dsp switch") || t.includes("fish tuning")) {
        return "Tuning & Electronics";
    }

    // EGR Upgrades
    if (t.includes("egr") || tagStr.includes("egr")) {
        return "EGR Upgrades";
    }

    // CCV Upgrades
    if (t.includes("ccv") || tagStr.includes("ccv")) {
        return "CCV Upgrades";
    }

    // Downpipes & Delete Pipes
    if (t.includes("downpipe") || t.includes("delete pipe")) {
        return "Downpipes";
    }

    // Exhaust Tips, Mufflers, Clamps (before full exhaust)
    if (t.includes("exhaust tip") || t.includes("exhaust clamp") || t.includes("exhaust elbow") ||
        (t.includes("muffler") && !t.includes("with muffler")) ||
        t.includes("silencer")) {
        return "Exhaust Tips & Mufflers";
    }

    // Full Exhaust Systems
    if (t.includes("exhaust") || tagStr.includes("exhaust") || tagStr.includes("full exhaust")) {
        return "Exhaust Systems";
    }

    // Lighting
    if (t.includes("light bar") || t.includes("light kit") || t.includes("rock light") ||
        t.includes("cab light") || t.includes("scene light") || t.includes("fog light") ||
        t.includes("fog lamp") || t.includes("fender light") || t.includes("tow mirror") ||
        t.includes("alpha light") || t.includes("wheel light") ||
        t.includes("led") || t.includes("headlight") ||
        t.includes("light cover") || t.includes("amber") ||
        (t.includes("wiring harness") && (t.includes("light") || t.includes("h1 ") || t.includes("h2 ") || t.includes("hp1"))) ||
        t.includes("harness splitter")) {
        return "Lighting";
    }

    // Suspension & Leveling
    if (t.includes("leveling") || t.includes("bilstein") || t.includes("shock") ||
        t.includes("air lift") || t.includes("air suspension") || t.includes("loadlifter") ||
        t.includes("side bars") || t.includes("side bar")) {
        return "Suspension & Leveling";
    }

    // Cooling & Engine
    if (t.includes("coolant") || t.includes("antifreeze") || t.includes("coolant cap") ||
        t.includes("grid heater") || t.includes("monster-ram") || t.includes("monster ram") ||
        t.includes("intake") || t.includes("cp4") || t.includes("resonator") ||
        t.includes("venturi") || t.includes("npt plug") || t.includes("egt probe") ||
        t.includes("firewall fitting") || t.includes("coolant bypass") ||
        t.includes("hdx premium")) {
        return "Cooling & Engine";
    }

    // Accessories (catch-all for parts that don't fit above)
    if (t.includes("mudflap") || t.includes("mud flap") || t.includes("kickback") ||
        t.includes("cabin air filter") || t.includes("air filter") ||
        t.includes("ventshade") || t.includes("vent visor") || t.includes("deflector") ||
        t.includes("tailgate lock") || t.includes("tail") ||
        t.includes("strut") || t.includes("gas strut") || t.includes("topper") ||
        t.includes("seat cover") || t.includes("hub bearing") || t.includes("brake") ||
        t.includes("caliper") || t.includes("bushing") ||
        t.includes("sotf harness") || t.includes("switch bracket") ||
        t.includes("install kit") || t.includes("core charge") ||
        t.includes("tow mirror cap")) {
        return "Accessories";
    }

    return "Accessories";
}

// ── Make/Vehicle classifier ─────────────────────────────────────
function classifyMakes(title, tags) {
    const t = title.toLowerCase();
    const tagStr = tags.join(" ").toLowerCase();
    const makes = new Set();

    // Ford / Powerstroke
    if (t.includes("ford") || t.includes("powerstroke") || t.includes("power stroke") ||
        t.includes("f250") || t.includes("f-250") || t.includes("f350") || t.includes("f-350") ||
        t.includes("f550") || t.includes("f-550") || t.includes("f150") || t.includes("f-150") ||
        t.includes("super duty") || t.includes("superduty") || t.includes("expedition") ||
        tagStr.includes("powerstroke")) {
        makes.add("Ford");
    }

    // Ram / Cummins
    if (t.includes("ram ") || t.includes("ram\u00A0") || t.includes("cummins") ||
        tagStr.includes("cummins")) {
        makes.add("Ram");
    }

    // Chevy
    if (t.includes("chevy") || t.includes("chevrolet") || t.includes("silverado") ||
        t.includes("colorado")) {
        makes.add("Chevy");
    }

    // GMC
    if (t.includes("gmc") || t.includes("sierra") || t.includes("canyon")) {
        makes.add("GMC");
    }

    // Duramax (could be Chevy or GMC)
    if (t.includes("duramax") || tagStr.includes("duramax")) {
        if (!makes.has("Chevy") && !makes.has("GMC")) {
            makes.add("Chevy");
            makes.add("GMC");
        }
    }

    // Jeep
    if (t.includes("jeep") || t.includes("grand cherokee") || t.includes("gladiator")) {
        makes.add("Jeep");
    }

    // Nissan
    if (t.includes("titan") || t.includes("nissan")) {
        makes.add("Nissan");
    }

    // Mercedes Sprinter
    if (t.includes("sprinter") || t.includes("mercedes")) {
        makes.add("Mercedes");
    }

    if (makes.size === 0) makes.add("Universal");
    return Array.from(makes);
}

// ── Model classifier ────────────────────────────────────────────
function classifyModels(title, tags) {
    const t = title.toLowerCase();
    const tagStr = tags.join(" ").toLowerCase();
    const models = new Set();

    // Ford
    if (t.includes("f250") || t.includes("f-250")) models.add("F-250");
    if (t.includes("f350") || t.includes("f-350")) models.add("F-350");
    if (t.includes("f450") || t.includes("f-450")) models.add("F-450");
    if (t.includes("f550") || t.includes("f-550")) models.add("F-550");
    if (t.includes("f150") || t.includes("f-150")) models.add("F-150");
    if (t.includes("super duty") || t.includes("superduty") || tagStr.includes("superduty")) {
        models.add("F-250");
        models.add("F-350");
    }
    if (t.includes("expedition")) models.add("Expedition");

    // Ram
    if (t.includes("2500") && (t.includes("ram") || tagStr.includes("ram") || tagStr.includes("cummins") || t.includes("cummins"))) models.add("2500");
    if (t.includes("3500") && (t.includes("ram") || tagStr.includes("ram") || tagStr.includes("cummins") || t.includes("cummins"))) models.add("3500");

    // GM
    const isChevy = t.includes("chevy") || t.includes("chevrolet");
    const isGMC = t.includes("gmc");
    if (t.includes("silverado") || (isChevy && (t.includes("1500") || t.includes("2500") || t.includes("3500")))) {
        if (t.includes("1500")) models.add("Silverado 1500");
        if (t.includes("2500")) models.add("Silverado 2500HD");
        if (t.includes("3500")) models.add("Silverado 3500HD");
        if (!t.includes("1500") && !t.includes("2500") && !t.includes("3500")) {
            models.add("Silverado 2500HD");
            models.add("Silverado 3500HD");
        }
    }
    if (t.includes("sierra") || (isGMC && (t.includes("1500") || t.includes("2500") || t.includes("3500")))) {
        if (t.includes("1500")) models.add("Sierra 1500");
        if (t.includes("2500")) models.add("Sierra 2500HD");
        if (t.includes("3500")) models.add("Sierra 3500HD");
        if (!t.includes("1500") && !t.includes("2500") && !t.includes("3500")) {
            models.add("Sierra 2500HD");
            models.add("Sierra 3500HD");
        }
    }
    if (t.includes("colorado")) models.add("Colorado");
    if (t.includes("canyon")) models.add("Canyon");

    // Jeep
    if (t.includes("grand cherokee")) models.add("Grand Cherokee");
    if (t.includes("gladiator")) models.add("Gladiator");

    // Nissan
    if (t.includes("titan xd") || t.includes("titan")) models.add("Titan XD");

    if (models.size === 0) models.add("Universal");
    return Array.from(models);
}

// ── Engine classifier ───────────────────────────────────────────
function classifyEngine(title, tags) {
    const t = title.toLowerCase();
    const tagStr = tags.join(" ").toLowerCase();

    if (t.includes("6.7") && (t.includes("cummins") || tagStr.includes("cummins"))) return "6.7L Cummins";
    if (t.includes("5.9") && (t.includes("cummins") || tagStr.includes("cummins"))) return "5.9L Cummins";
    if (t.includes("5.0") && (t.includes("cummins") || t.includes("titan"))) return "5.0L Cummins";
    if (t.includes("6.7") && (t.includes("powerstroke") || tagStr.includes("powerstroke"))) return "6.7L Powerstroke";
    if (t.includes("6.4") && (t.includes("powerstroke") || tagStr.includes("powerstroke"))) return "6.4L Powerstroke";
    if (t.includes("6.0") && (t.includes("powerstroke") || tagStr.includes("powerstroke"))) return "6.0L Powerstroke";
    if (t.includes("3.0") && (t.includes("powerstroke") || (t.includes("f150") && t.includes("powerstroke")))) return "3.0L Powerstroke";
    if (t.includes("6.6") && (t.includes("duramax") || tagStr.includes("duramax"))) return "6.6L Duramax";
    if (t.includes("3.0") && (t.includes("duramax") || t.includes("lm2") || tagStr.includes("lm2"))) return "3.0L Duramax";
    if (t.includes("2.8") && (t.includes("duramax") || tagStr.includes("duramax"))) return "2.8L Duramax";
    if (t.includes("ecodiesel") || t.includes("eco diesel") || t.includes("eco-diesel") || tagStr.includes("ecodiesel")) return "3.0L EcoDiesel";
    if (t.includes("sprinter") && t.includes("3.0")) return "3.0L Sprinter";

    return "Universal";
}

// ── Brand classifier ────────────────────────────────────────────
function classifyBrand(title, vendor) {
    const t = title.toLowerCase();
    const v = (vendor || "").toLowerCase();

    if (v.includes("polar diesel") || t.includes("polar")) return "Polar Diesel";
    if (v.includes("speed demon") || t.includes("speeddemon") || t.includes("speed demon")) return "Speed Demon";
    if (v.includes("gridiron")) return "Gridiron";
    if (v.includes("diamond led") || t.includes("diamond led")) return "Diamond LED";
    if (v.includes("boost auto") || t.includes("boost auto")) return "Boost Auto";
    if (v.includes("dirty diesel") || t.includes("dirty diesel")) return "Dirty Diesel Customs";
    if (v.includes("bmc light") || t.includes("bmc light")) return "BMC Lights";
    if (v.includes("trigger") || t.includes("trigger")) return "Trigger Industries";
    if (v.includes("canadian light truck")) return "Canadian Light Truck";
    if (t.includes("amdp")) return "AMDP";
    if (t.includes("ez lynk") || t.includes("ez-lynk")) return "EZ LYNK";
    if (t.includes("hp tuners")) return "HP Tuners";
    if (t.includes("bilstein")) return "Bilstein";
    if (t.includes("edge ") || t.includes("edge insight")) return "Edge Products";
    if (t.includes("banks ")) return "Banks Power";
    if (t.includes("baja designs")) return "Baja Designs";
    if (v.includes("napa")) return "NAPA";
    if (v.includes("s360")) return "S360 / AMDP";
    if (v === "the lab") return "Aftermarket";

    return vendor || "Other";
}

// ── Year range extractor ────────────────────────────────────────
function extractYears(title) {
    // Match patterns like "2017-2025", "2019+", "2023-2026", "2019-2022.5"
    const rangeMatch = title.match(/(\d{4})[\.\d]*\s*[-–]\s*(\d{4})[\.\d]*/);
    if (rangeMatch) {
        return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
    }
    const plusMatch = title.match(/(\d{4})\+/);
    if (plusMatch) {
        return [parseInt(plusMatch[1]), 2026];
    }
    const singleMatch = title.match(/\b(19|20)\d{2}\b/);
    if (singleMatch) {
        const y = parseInt(singleMatch[0]);
        return [y, y];
    }
    return [1990, 2026];
}

// ── Popularity flag ─────────────────────────────────────────────
function isPopular(tags) {
    const tagLower = tags.map(t => t.toLowerCase());
    return tagLower.includes("featured products") || tagLower.includes("new releases");
}

// ═══════════════════════════════════════════════════════════════════
// MAIN: Fetch all products and build the classified catalog
// ═══════════════════════════════════════════════════════════════════
window.initShopifyCatalog = async function () {
    const PRODUCTS_QUERY = `
    query ($cursor: String) {
      products(first: 250, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            productType
            vendor
            tags
            images(first: 5) {
              edges { node { url altText } }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price { amount currencyCode }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }`;

    try {
        let allProducts = [];
        let hasNextPage = true;
        let cursor = null;

        while (hasNextPage) {
            const data = await shopifyGraphQL(PRODUCTS_QUERY, { cursor });
            const page = data.products;
            allProducts.push(...page.edges.map(e => e.node));
            hasNextPage = page.pageInfo.hasNextPage;
            cursor = page.pageInfo.endCursor;
        }

        console.log(`[THE LAB] Fetched ${allProducts.length} total products from Shopify`);

        // Filter out excluded products and classify the rest
        const classified = [];
        let excluded = 0;

        for (const node of allProducts) {
            if (isExcluded(node.title, node.tags)) {
                excluded++;
                continue;
            }

            const years = extractYears(node.title);
            const makes = classifyMakes(node.title, node.tags);
            const models = classifyModels(node.title, node.tags);
            const engine = classifyEngine(node.title, node.tags);
            const category = classifyCategory(node.title, node.tags);
            const brand = classifyBrand(node.title, node.vendor);
            
            // Generate some fake features for now if description is long
            const features = [];
            const sentences = (node.description || "").split(/[.!?]+/).filter(s => s.trim().length > 10);
            if (sentences.length > 0) features.push(sentences[0].trim() + ".");
            if (sentences.length > 1) features.push(sentences[1].trim() + ".");
            if (sentences.length > 2) features.push(sentences[2].trim() + ".");
            if (features.length === 0) features.push("High-performance premium construction.", "Direct fit replacement for OEM.", "Built to withstand extreme conditions.");

            classified.push({
                id: node.id,
                handle: node.handle,
                name: node.title,
                description: node.description || "",
                descriptionHtml: node.descriptionHtml || "",
                makes: makes,
                models: models,
                category: category,
                engine: engine,
                brand: brand,
                years: years,
                price: parseFloat(node.variants.edges[0]?.node?.price?.amount || 0),
                variantId: node.variants.edges[0]?.node?.id,
                variantTitle: node.variants.edges[0]?.node?.title || "",
                variants: node.variants.edges.map(v => ({
                    id: v.node.id,
                    title: v.node.title,
                    price: parseFloat(v.node.price?.amount || 0),
                    available: v.node.availableForSale
                })),
                image: node.images.edges[0]?.node?.url || "https://placehold.co/600x400/0D0D12/1E1E28?text=No+Image",
                images: node.images.edges.map(e => e.node.url),
                tags: node.tags,
                vendor: node.vendor,
                isPopular: isPopular(node.tags),
                features: [] // Shopify doesn't have a native features field
            });
        }

        window.storeCatalog = classified;
        console.log(`[THE LAB] Catalog ready: ${classified.length} parts (${excluded} services/tint/detail excluded)`);

        // Build dynamic filter options for the sidebar
        window.catalogFilterOptions = buildFilterOptions(classified);

    } catch (e) {
        console.error("[THE LAB] Failed to load Shopify catalog:", e);
        window.storeCatalog = [];
    }
};

// ── Build unique filter options from actual data ────────────────
function buildFilterOptions(catalog) {
    const categories = new Set();
    const makes = new Set();
    const engines = new Set();
    const brands = new Set();

    catalog.forEach(p => {
        categories.add(p.category);
        p.makes.forEach(m => makes.add(m));
        if (p.engine !== "Universal") engines.add(p.engine);
        brands.add(p.brand);
    });

    return {
        categories: [...categories].sort(),
        makes: [...makes].sort(),
        engines: [...engines].sort(),
        brands: [...brands].sort()
    };
}

// ── Checkout via Shopify Storefront API ─────────────────────────
window.createShopifyCheckout = async function (cartItems) {
    if (!cartItems || cartItems.length === 0) return;

    const lines = cartItems.map(item => {
        const line = {
            merchandiseId: item.variantId,
            quantity: item.quantity
        };
        if (item.customAttributes && Object.keys(item.customAttributes).length > 0) {
            line.attributes = Object.entries(item.customAttributes).map(([key, value]) => ({ key, value }));
        }
        return line;
    });

    const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }`;

    try {
        const data = await shopifyGraphQL(query, { input: { lines } });
        if (data.cartCreate.userErrors.length > 0) {
            console.error(data.cartCreate.userErrors);
            alert("Error creating checkout. Please try again.");
            return;
        }
        window.location.href = data.cartCreate.cart.checkoutUrl;
    } catch (e) {
        console.error("Checkout creation failed:", e);
        alert("Failed to connect to checkout. Please try again.");
    }
};
