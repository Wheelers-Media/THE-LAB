const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'src/pages/store/catalog/index.html');
const tuningPath = path.join(__dirname, 'src/pages/store/tuning/index.html');

let catalogHTML = fs.readFileSync(catalogPath, 'utf8');
let tuningHTML = fs.readFileSync(tuningPath, 'utf8');

// The block to replace in catalog (Regex to handle whitespace)
const catalogRegex = /<div class="flex justify-between items-center mb-6">\s*<div class="flex items-center gap-4">\s*<h1 class="text-3xl font-heading font-extrabold text-white uppercase">The Parts Store<\/h1>\s*<span data-product-count class="text-xs font-mono text-zinc-500 bg-edge px-3 py-1 rounded-full hidden sm:inline-block">Loading\.\.\.<\/span>\s*<\/div>\s*<span class="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">Performance Parts & Tuning<\/span>\s*<\/div>/g;

const catalogReplace = `<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div class="flex items-center gap-4">
                        <button onclick="window.toggleFilters()" id="toggle-filters-btn" class="hidden md:flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-colors bg-[#111115] border border-edge rounded-lg px-4 py-2 hover:border-zinc-500 whitespace-nowrap min-h-[44px]">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                            <span id="toggle-filters-text">Hide Filters</span>
                        </button>
                        <h1 class="text-2xl md:text-3xl font-heading font-extrabold text-white uppercase">The Parts Store</h1>
                        <span data-product-count class="text-xs font-mono text-zinc-500 bg-edge px-3 py-1 rounded-full hidden lg:inline-block">Loading...</span>
                    </div>
                    <div class="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
                        <span class="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:block whitespace-nowrap">Sort By:</span>
                        <select id="sort-select" onchange="window.applySort(this.value)" class="bg-[#111115] border border-edge rounded-lg pl-4 pr-10 py-2.5 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-labBlue transition-colors cursor-pointer appearance-none w-full sm:w-auto" style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A1A1AA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat, repeat; background-position: right .7em top 50%, 0 0; background-size: .65em auto, 100%;">
                            <option value="featured">Featured / Popular</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </div>
                </div>`;

// The block to replace in tuning
const tuningRegex = /<div class="flex justify-between items-center mb-6">\s*<div class="flex items-center gap-4">\s*<h1 class="text-3xl font-heading font-extrabold text-white uppercase">Tuning Packages<\/h1>\s*<span data-product-count class="text-xs font-mono text-zinc-500 bg-edge px-3 py-1 rounded-full hidden sm:inline-block">Loading\.\.\.<\/span>\s*<\/div>\s*<span class="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">Custom Hardware & Software<\/span>\s*<\/div>/g;

const tuningReplace = `<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div class="flex items-center gap-4">
                        <h1 class="text-2xl md:text-3xl font-heading font-extrabold text-white uppercase">Tuning Packages</h1>
                        <span data-product-count class="text-xs font-mono text-zinc-500 bg-edge px-3 py-1 rounded-full hidden lg:inline-block">Loading...</span>
                    </div>
                    <div class="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
                        <span class="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:block whitespace-nowrap">Sort By:</span>
                        <select id="sort-select" onchange="window.applySort(this.value)" class="bg-[#111115] border border-edge rounded-lg pl-4 pr-10 py-2.5 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-labBlue transition-colors cursor-pointer appearance-none w-full sm:w-auto" style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A1A1AA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat, repeat; background-position: right .7em top 50%, 0 0; background-size: .65em auto, 100%;">
                            <option value="featured">Featured / Popular</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </div>
                </div>`;

if (catalogRegex.test(catalogHTML)) {
    catalogHTML = catalogHTML.replace(catalogRegex, catalogReplace);
    fs.writeFileSync(catalogPath, catalogHTML, 'utf8');
    console.log('Updated catalog');
} else {
    console.log('Could not find exact block in catalog');
}

if (tuningRegex.test(tuningHTML)) {
    tuningHTML = tuningHTML.replace(tuningRegex, tuningReplace);
    fs.writeFileSync(tuningPath, tuningHTML, 'utf8');
    console.log('Updated tuning');
} else {
    console.log('Could not find exact block in tuning');
}
