// Builds a real page for every part and every parts category, so Google can
// find them, and adds them to the sitemap.
//
// The catalog on the site loads products in the browser, which leaves Google
// nothing to list. This script loads the same catalog the same way (it runs
// src/assets/js/products.js, so the exclusions and categories match the store)
// and writes, from src/pages/store/product/index.html:
//   src/pages/store/parts/<handle>/index.html   one per part
//   src/pages/store/<category>/index.html        egr, exhaust, ccv, accessories
//   src/assets/js/parts-index.js                 which parts have a page
//   src/pages/sitemap.xml                        the fixed pages plus all of the above
//
// Vercel runs it on every deploy (vercel.json buildCommand). If Shopify cannot
// be reached it changes nothing and exits 0, so a Shopify outage never blocks
// a deploy. The generated files are gitignored.
//
//   node tools/build_parts.mjs                    live Shopify
//   node tools/build_parts.mjs --fixture f.json   a saved Storefront response, for testing
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PAGES = path.join(ROOT, "src", "pages");
const SITE = "https://thelabfsj.ca";
const TEMPLATE = path.join(PAGES, "store", "product", "index.html");
const PARTS_DIR = path.join(PAGES, "store", "parts");
const INDEX_JS = path.join(ROOT, "src", "assets", "js", "parts-index.js");
const SITEMAP = path.join(PAGES, "sitemap.xml");

// The category pages. `cats` are the store's own categories (products.js).
export const CATEGORIES = [
  {
    slug: "egr",
    filter: "EGR",
    name: "EGR Solutions",
    title: "EGR Kits for Diesel Trucks | THE LAB Parts Store",
    h1: "EGR SOLUTIONS.",
    intro:
      "EGR kits and coolers for Duramax, Cummins and Powerstroke trucks, shipped from Fort St. John, BC across Canada. Off-road and sanctioned racing use only.",
    cats: ["EGR Upgrades"],
  },
  {
    slug: "exhaust",
    filter: "Exhaust",
    name: "Exhaust Systems",
    title: "Diesel Exhaust Systems | THE LAB Parts Store",
    h1: "EXHAUST SYSTEMS.",
    intro:
      "Diesel exhaust systems, downpipes, tips and mufflers for Duramax, Cummins and Powerstroke trucks, shipped from Fort St. John, BC across Canada.",
    cats: ["Exhaust Systems", "Downpipes", "Exhaust Tips & Mufflers"],
  },
  {
    slug: "ccv",
    filter: "CCV",
    name: "CCV Solutions",
    title: "CCV Reroute Kits for Diesel Trucks | THE LAB Parts Store",
    h1: "CCV SOLUTIONS.",
    intro:
      "CCV reroute kits and crankcase ventilation upgrades for diesel trucks, shipped from Fort St. John, BC across Canada.",
    cats: ["CCV Upgrades"],
  },
  {
    slug: "accessories",
    filter: "Accessories",
    name: "Bumpers & Accessories",
    title: "Truck Bumpers & Accessories | THE LAB Parts Store",
    h1: "BUMPERS & ACCESSORIES.",
    intro:
      "Steel bumpers, lighting and truck accessories, installed at THE LAB in Fort St. John, BC or shipped across Canada.",
    cats: ["Bumpers & Armor", "Accessories", "Lighting"],
  },
];

// ── text helpers ────────────────────────────────────────────────
export const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const plain = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/** A meta description: whole words, at most `max` characters. */
export const clip = (s, max = 155) => {
  const t = plain(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s]+$/, "") + "…";
};

/** Shopify's description HTML without anything that runs or embeds. */
export const safeHtml = (html) =>
  String(html ?? "")
    .replace(/<(script|style|iframe|object|embed|form)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed|link|meta)\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "$1=$2#$2");

/** A safe folder name for a Shopify handle; null when it cannot be one. */
export const slugOf = (handle) => {
  const s = String(handle ?? "").toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,150}$/.test(s) ? s : null;
};

const money = (n) =>
  `$${Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** "2017-2025 · Chevy, GMC · 6.6L Duramax" from what the store worked out. */
export const fitmentLine = (p) => {
  const makes = (p.makes || []).filter((m) => m !== "Universal");
  const years =
    Array.isArray(p.years) && p.years[0] > 1990 && p.years[1] < 2100
      ? p.years[0] === p.years[1]
        ? String(p.years[0])
        : `${p.years[0]}-${p.years[1]}`
      : "";
  const engine = p.engine && p.engine !== "Universal" ? p.engine : "";
  const bits = [years, makes.join(", "), engine].filter(Boolean);
  return bits.length ? bits.join(" · ") : "Universal fit";
};

export const partUrl = (slug) => `${SITE}/store/parts/${slug}/`;

// ── loading the catalog the way the site does ───────────────────
export const loadCatalog = async (fixture) => {
  const code = fs.readFileSync(path.join(ROOT, "src", "assets", "js", "products.js"), "utf8");
  const fakeFetch = async () => ({ json: async () => fixture });
  const sandbox = {
    window: {},
    console: { log() {}, warn() {}, error: console.error },
    fetch: fixture ? fakeFetch : fetch,
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "products.js" });
  await sandbox.window.initShopifyCatalog();
  return sandbox.window.storeCatalog || [];
};

// ── page building ───────────────────────────────────────────────
const setHead = (html, { title, description, url, image, jsonLd, noindex }) => {
  let s = html;
  const rep = (re, val) => {
    s = s.replace(re, val);
  };
  rep(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  rep(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  rep(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  rep(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  rep(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  rep(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  if (image) {
    rep(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(image)}$2`);
    rep(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${esc(image)}$2`);
  }
  const extra = [
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    noindex ? `<meta name="robots" content="noindex">` : "",
    `<link rel="stylesheet" href="/assets/css/parts.css">`,
    jsonLd
      ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`
      : "",
  ]
    .filter(Boolean)
    .map((l) => "    " + l)
    .join("\n");
  return s.replace(/(<meta name="twitter:image"[^>]*>\n)/, `$1${extra}\n`);
};

const setMain = (html, inner) =>
  html.replace(/<main id="main"[^>]*>[\s\S]*?<\/main>/, `<main id="main" class="lab-page lab-parts" style="min-height:100svh">\n${inner}\n</main>`);

const categoryOf = (p) => CATEGORIES.find((c) => c.cats.includes(p.category));

export const productJsonLd = (p, slug) => {
  const offers = (p.variants || []).filter((v) => v.price > 0);
  const lowest = offers.length ? Math.min(...offers.map((v) => v.price)) : p.price;
  const highest = offers.length ? Math.max(...offers.map((v) => v.price)) : p.price;
  const available = offers.length ? offers.some((v) => v.available) : true;
  const availability = available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const offer =
    lowest !== highest
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "CAD",
          lowPrice: lowest.toFixed(2),
          highPrice: highest.toFixed(2),
          offerCount: offers.length,
          availability,
        }
      : {
          "@type": "Offer",
          priceCurrency: "CAD",
          price: Number(lowest).toFixed(2),
          availability,
          url: partUrl(slug),
          seller: { "@type": "Organization", name: "THE LAB" },
        };
  const images = (p.images || []).filter((u) => /^https:\/\//.test(u)).slice(0, 5);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plain(p.name),
    description: clip(p.description, 500) || plain(p.name),
    ...(images.length ? { image: images } : {}),
    ...(p.vendor ? { brand: { "@type": "Brand", name: plain(p.vendor) } } : {}),
    url: partUrl(slug),
    ...(lowest > 0 ? { offers: offer } : {}),
  };
};

export const productPage = (template, p, slug) => {
  const cat = categoryOf(p);
  const fit = fitmentLine(p);
  const title = `${plain(p.name)} | THE LAB Parts Store`;
  const description = clip(p.description) || clip(`${plain(p.name)}. ${fit}. Shipped from Fort St. John, BC across Canada.`);
  const image = /^https:\/\//.test(p.image) ? p.image : "";
  const priceText = p.price > 0 ? `${money(p.price)} CAD` : "Contact us for pricing";
  const crumbs = cat
    ? `<a href="/store/catalog/">All parts</a> / <a href="/store/${cat.slug}/">${esc(cat.name)}</a>`
    : `<a href="/store/catalog/">All parts</a>`;
  // What a visitor (and Google) sees before the store's script renders the full
  // product page with the cart and the fitment check over it.
  const inner = `    <div class="wrap pdp-crumb">${crumbs}</div>
    <div id="pdp-container" class="w-full" data-product-id="${esc(p.id)}">
        <article class="wrap part-static">
            ${image ? `<img class="part-static-img" src="${esc(image)}" alt="${esc(plain(p.name))}" width="600" height="600">` : ""}
            <div class="part-static-body">
                <p class="part-static-kick">${esc(p.category || "Parts")} · ${esc(fit)}</p>
                <h1 class="part-static-h1">${esc(plain(p.name))}</h1>
                <p class="part-static-price">${esc(priceText)}</p>
                ${p.vendor ? `<p class="part-static-meta">Brand: ${esc(plain(p.vendor))}</p>` : ""}
                <div class="part-static-desc">${safeHtml(p.descriptionHtml) || `<p>${esc(p.description)}</p>`}</div>
                <p class="part-static-meta">Ships from THE LAB in Fort St. John, BC. Install available at the shop. Questions: <a href="tel:+12502619502">(250) 261-9502</a>.</p>
            </div>
        </article>
    </div>`;
  return setMain(
    setHead(template, { title, description, url: partUrl(slug), image, jsonLd: productJsonLd(p, slug) }),
    inner,
  );
};

export const categoryPage = (template, cat, items) => {
  const url = `${SITE}/store/${cat.slug}/`;
  const cards = items
    .map(({ p, slug }) => {
      const img = /^https:\/\//.test(p.image) ? p.image : "";
      return `            <li class="pcard">
                <a class="pcard-img" href="/store/parts/${slug}/" tabindex="-1" aria-hidden="true">${img ? `<img src="${esc(img)}" alt="" loading="lazy" width="400" height="300">` : ""}</a>
                <div class="pcard-body">
                    <p class="pcard-meta"><span>${esc(p.brand || p.vendor || p.category)}</span></p>
                    <h2 class="pcard-name"><a href="/store/parts/${slug}/">${esc(plain(p.name))}</a></h2>
                    <p class="pcard-fit">${esc(fitmentLine(p))}</p>
                    <div class="pcard-foot"><span class="pcard-price">${p.price > 0 ? esc(money(p.price)) : "Ask"}</span></div>
                </div>
            </li>`;
    })
    .join("\n");
  const list = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.name,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 100).map(({ p, slug }, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: partUrl(slug),
        name: plain(p.name),
      })),
    },
  };
  const inner = `    <section class="wrap pg-head" aria-labelledby="cat-h1">
        <p class="pg-kick"><a href="/store/catalog/">The Parts Store</a></p>
        <h1 id="cat-h1" class="display pg-h1">${esc(cat.h1)}</h1>
        <p class="pg-meta">${esc(cat.intro)}</p>
        <p class="pg-meta"><a href="/store/catalog/?category=${encodeURIComponent(cat.filter)}">Filter by your truck</a></p>
    </section>
    <section class="wrap part-cat" aria-label="${esc(cat.name)}">
        ${items.length ? `<ul class="pgrid part-cat-grid">\n${cards}\n        </ul>` : `<p class="pg-meta"><a href="/store/catalog/?category=${encodeURIComponent(cat.filter)}">See all ${esc(cat.name.toLowerCase())}</a>, or <a href="/contact/">ask us</a> and we will find the right part.</p>`}
    </section>`;
  return setMain(
    setHead(template, {
      title: cat.title,
      description: clip(cat.intro),
      url,
      jsonLd: list,
      noindex: items.length === 0,
    }),
    inner,
  );
};

/** The committed sitemap's fixed pages, with the generated ones replaced. */
export const buildSitemap = (committed, generatedUrls, today) => {
  // A second run replaces what the first one added
  const current = committed.replace(/\s*<!-- Generated by tools\/build_parts\.mjs -->[\s\S]*?(?=<\/urlset>)/, "\n");
  const fixed = [...current.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => !u.includes("/store/parts/") && !CATEGORIES.some((c) => u === `${SITE}/store/${c.slug}/`));
  const entry = (loc, freq, pri) =>
    `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`;
  const fixedBlock = current.replace(/\s*<\/urlset>\s*$/, "");
  const extra = generatedUrls
    .filter((u) => !fixed.includes(u.loc))
    .map((u) => entry(u.loc, u.freq, u.pri))
    .join("\n");
  return `${fixedBlock}\n  <!-- Generated by tools/build_parts.mjs -->\n${extra}\n</urlset>\n`;
};

const writeCategories = (template, built) => {
  for (const cat of CATEGORIES) {
    const items = built.filter(({ p }) => cat.cats.includes(p.category));
    const dir = path.join(PAGES, "store", cat.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), categoryPage(template, cat, items));
  }
};

// ── run ─────────────────────────────────────────────────────────
const main = async () => {
  const at = process.argv.indexOf("--fixture");
  const fixture = at > 0 ? JSON.parse(fs.readFileSync(process.argv[at + 1], "utf8")) : null;

  const template = fs.readFileSync(TEMPLATE, "utf8");
  let catalog = [];
  try {
    catalog = await loadCatalog(fixture);
  } catch (error) {
    console.warn(`[build_parts] Shopify not reachable: ${error.message}`);
  }
  if (!catalog.length) {
    // The menus link to the category pages, so they must exist: without the
    // catalog each one points to the store's filtered list and stays out of Google
    writeCategories(template, []);
    console.warn("[build_parts] No products; category pages point to the catalog, part pages left as they are.");
    return;
  }

  fs.rmSync(PARTS_DIR, { recursive: true, force: true });

  const seen = new Set();
  const built = [];
  for (const p of catalog) {
    const slug = slugOf(p.handle);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const dir = path.join(PARTS_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), productPage(template, p, slug));
    built.push({ p, slug });
  }

  writeCategories(template, built);

  const map = Object.fromEntries(built.map(({ p, slug }) => [p.id, slug]));
  fs.writeFileSync(
    INDEX_JS,
    `// Generated by tools/build_parts.mjs on deploy: Shopify id -> /store/parts/<slug>/\nwindow.LAB_PART_PAGES = ${JSON.stringify(map)};\n`,
  );

  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...CATEGORIES.map((c) => ({ loc: `${SITE}/store/${c.slug}/`, freq: "weekly", pri: "0.8" })),
    ...built.map(({ slug }) => ({ loc: partUrl(slug), freq: "weekly", pri: "0.6" })),
  ];
  fs.writeFileSync(SITEMAP, buildSitemap(fs.readFileSync(SITEMAP, "utf8"), urls, today));

  console.log(`[build_parts] ${built.length} part pages, ${CATEGORIES.length} category pages, sitemap updated.`);
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    // Never block a deploy over the parts pages
    console.warn(`[build_parts] failed, pages left as they are: ${error.stack || error}`);
  });
}
