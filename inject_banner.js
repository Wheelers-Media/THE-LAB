const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const bannerHTML = `
    <!-- ACTIVE GARAGE BANNER -->
    <section id="active-garage-banner" class="hidden bg-labBlue/10 border-b border-labBlue/30 py-4 px-6 relative z-10 shadow-xl backdrop-blur-md">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-labBlue/20 flex items-center justify-center text-labBlue">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-labBlue uppercase tracking-widest">Active Vehicle</p>
                    <p id="active-vehicle-name" class="text-white font-heading font-extrabold text-lg">2018 Ram 2500 6.7L Cummins</p>
                </div>
            </div>
            <button id="vs-clear" class="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest border border-edge hover:border-zinc-500 rounded px-4 py-2 transition-all">
                Change Vehicle
            </button>
        </div>
    </section>
`;

const scriptTag = `<script src="/assets/js/global-banner.js"></script>`;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Remove existing banner if it exists anywhere
            const bannerRegex = /<!-- ACTIVE GARAGE BANNER -->[\s\S]*?<\/section>/g;
            if (bannerRegex.test(content)) {
                content = content.replace(bannerRegex, '');
                modified = true;
            }

            // Inject the banner right before the closing </div> of the sticky header
            // The sticky header starts with <div class="sticky top-0 z-50"> and ends with </div> right before <main>
            // We can target `</header>\n    </div>`
            const headerEndRegex = /(<\/header>\s*)(<\/div>)/;
            if (headerEndRegex.test(content) && !content.includes('id="active-garage-banner"')) {
                content = content.replace(headerEndRegex, `$1${bannerHTML}\n$2`);
                modified = true;
            }

            // Inject script tag before </body>
            if (!content.includes('global-banner.js') && content.includes('</body>')) {
                content = content.replace(/<\/body>/, `    ${scriptTag}\n</body>`);
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(pagesDir);
console.log('Injection complete.');
