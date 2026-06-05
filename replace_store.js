const fs = require('fs');
const path = require('path');

const storeIndexPath = path.join(__dirname, 'src', 'pages', 'store', 'index.html');
let content = fs.readFileSync(storeIndexPath, 'utf8');

const mainStart = content.indexOf('<main>');
const mainEnd = content.indexOf('</main>') + '</main>'.length;

const newMain = `<main>
    <section class="py-12 px-6">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
            <!-- Sidebar Filters -->
            <aside class="w-full md:w-64 flex-shrink-0">
                <div class="sticky top-28 bg-[#111115] border border-edge rounded-xl p-6">
                    <h2 class="text-white font-bold uppercase tracking-widest text-sm mb-6 border-b border-edge pb-2">Filter Parts</h2>
                    
                    <div class="mb-6">
                        <h3 class="text-xs font-mono text-labBlue uppercase tracking-widest mb-3">Make</h3>
                        <label class="flex items-center gap-3 mb-2 cursor-pointer group">
                            <input type="checkbox" value="Ford" data-type="make" id="filter-make-Ford" class="store-filter w-4 h-4 bg-void border border-edge rounded text-labBlue focus:ring-labBlue focus:ring-opacity-50">
                            <span class="text-sm text-zinc-400 group-hover:text-white transition-colors">Ford</span>
                        </label>
                        <label class="flex items-center gap-3 mb-2 cursor-pointer group">
                            <input type="checkbox" value="Ram" data-type="make" id="filter-make-Ram" class="store-filter w-4 h-4 bg-void border border-edge rounded text-labBlue focus:ring-labBlue focus:ring-opacity-50">
                            <span class="text-sm text-zinc-400 group-hover:text-white transition-colors">Ram</span>
                        </label>
                        <label class="flex items-center gap-3 mb-2 cursor-pointer group">
                            <input type="checkbox" value="Chevy" data-type="make" id="filter-make-Chevy" class="store-filter w-4 h-4 bg-void border border-edge rounded text-labBlue focus:ring-labBlue focus:ring-opacity-50">
                            <span class="text-sm text-zinc-400 group-hover:text-white transition-colors">Chevy / GMC</span>
                        </label>
                    </div>

                    <div>
                        <h3 class="text-xs font-mono text-labBlue uppercase tracking-widest mb-3">Category</h3>
                        <label class="flex items-center gap-3 mb-2 cursor-pointer group">
                            <input type="checkbox" value="EGR" data-type="category" id="filter-cat-EGR" class="store-filter w-4 h-4 bg-void border border-edge rounded text-labBlue focus:ring-labBlue focus:ring-opacity-50">
                            <span class="text-sm text-zinc-400 group-hover:text-white transition-colors">EGR Solutions</span>
                        </label>
                        <label class="flex items-center gap-3 mb-2 cursor-pointer group">
                            <input type="checkbox" value="Exhaust" data-type="category" id="filter-cat-Exhaust" class="store-filter w-4 h-4 bg-void border border-edge rounded text-labBlue focus:ring-labBlue focus:ring-opacity-50">
                            <span class="text-sm text-zinc-400 group-hover:text-white transition-colors">Exhaust Systems</span>
                        </label>
                        <label class="flex items-center gap-3 mb-2 cursor-pointer group">
                            <input type="checkbox" value="Tuning" data-type="category" id="filter-cat-Tuning" class="store-filter w-4 h-4 bg-void border border-edge rounded text-labBlue focus:ring-labBlue focus:ring-opacity-50">
                            <span class="text-sm text-zinc-400 group-hover:text-white transition-colors">Custom Tuning</span>
                        </label>
                        <label class="flex items-center gap-3 mb-2 cursor-pointer group">
                            <input type="checkbox" value="CCV" data-type="category" id="filter-cat-CCV" class="store-filter w-4 h-4 bg-void border border-edge rounded text-labBlue focus:ring-labBlue focus:ring-opacity-50">
                            <span class="text-sm text-zinc-400 group-hover:text-white transition-colors">CCV Reroutes</span>
                        </label>
                    </div>
                </div>
            </aside>

            <!-- Product Grid -->
            <div class="flex-1">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-heading font-extrabold text-white uppercase">The Parts Store</h1>
                    <span class="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">Performance Parts & Tuning</span>
                </div>
                <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Javascript populates products here -->
                </div>
            </div>
        </div>
    </section>
</main>`;

content = content.substring(0, mainStart) + newMain + content.substring(mainEnd);

// Inject scripts before </body>
if (!content.includes('products.js')) {
    content = content.replace('</body>', '    <script src="/assets/js/products.js"></script>\n    <script src="/assets/js/store.js"></script>\n</body>');
}

fs.writeFileSync(storeIndexPath, content, 'utf8');
console.log('Store index updated successfully.');
