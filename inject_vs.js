const fs = require('fs');
const path = require('path');

const storeIndexPath = path.join(__dirname, 'src', 'pages', 'store', 'index.html');
let content = fs.readFileSync(storeIndexPath, 'utf8');

// The new hero section
const heroHTML = `
    <!-- VEHICLE SELECTOR HERO -->
    <section id="vehicle-selector-hero" class="relative py-24 bg-[#0a0a0e] border-b border-edge overflow-hidden">
        <div class="absolute inset-0 grid-bg opacity-30"></div>
        <div class="relative max-w-5xl mx-auto px-6 z-10 text-center">
            <h1 class="text-4xl md:text-5xl font-heading font-extrabold text-white uppercase tracking-tight mb-4">Find Parts For Your Truck</h1>
            <p class="text-zinc-400 mb-10 max-w-2xl mx-auto">Select your vehicle below to filter our entire catalog of performance parts, tuning, and accessories specifically engineered for your build.</p>
            
            <div class="bg-midnight border border-edge rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
                <select id="vs-year" class="w-full bg-void border border-edge rounded-lg p-3 text-white focus:outline-none focus:border-labBlue transition-colors disabled:opacity-50 appearance-none">
                    <option value="">Year</option>
                </select>
                <select id="vs-make" class="w-full bg-void border border-edge rounded-lg p-3 text-white focus:outline-none focus:border-labBlue transition-colors disabled:opacity-50 appearance-none" disabled>
                    <option value="">Make</option>
                </select>
                <select id="vs-model" class="w-full bg-void border border-edge rounded-lg p-3 text-white focus:outline-none focus:border-labBlue transition-colors disabled:opacity-50 appearance-none" disabled>
                    <option value="">Model</option>
                </select>
                <select id="vs-engine" class="w-full bg-void border border-edge rounded-lg p-3 text-white focus:outline-none focus:border-labBlue transition-colors disabled:opacity-50 appearance-none" disabled>
                    <option value="">Engine</option>
                </select>
                <button id="vs-submit" class="w-full md:w-auto px-8 py-3 bg-labBlue hover:bg-labCyan text-white font-extrabold rounded-lg uppercase tracking-widest transition-colors shadow-oled-blue hover:shadow-oled-cyan disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap" disabled>
                    Shop Now
                </button>
            </div>
        </div>
    </section>

    <!-- ACTIVE GARAGE BANNER -->
    <section id="active-garage-banner" class="hidden bg-labBlue/10 border-b border-labBlue/30 py-4 px-6 relative z-10">
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

// Insert after <main>
content = content.replace(/<main>/, '<main>\n' + heroHTML);

// Remove the old YMM script
content = content.replace(/<script>\s*\/\*\s*YMM Find Parts.*?<\/script>/gs, '');

fs.writeFileSync(storeIndexPath, content);
console.log("Updated store/index.html");
