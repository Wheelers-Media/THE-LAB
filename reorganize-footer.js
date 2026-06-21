const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

const brandsHtml = `
        <!-- Trust Signals (Partner Logos) -->
        <div class="mt-16 mb-12 flex flex-col items-center gap-8">
            <!-- Row 1: Tuning & Performance -->
            <div class="flex flex-wrap justify-center gap-x-10 gap-y-6 items-center">
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="DIESELR" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/DIESELR-Logo.png" alt="DIESELR" class="h-6 w-auto object-contain">
                </a>
                <a href="https://amdieselperformance.ca/" target="_blank" rel="noopener noreferrer" aria-label="AMDP" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/AMDP-Logo.png" alt="AMDP" class="h-7 w-auto object-contain">
                </a>
                <a href="https://www.ezlynk.com/" target="_blank" rel="noopener noreferrer" aria-label="EZ LYNK" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/EZ-Lynk-Logo.png" alt="EZ LYNK" class="h-8 w-auto object-contain">
                </a>
                <a href="https://www.hptuners.com/" target="_blank" rel="noopener noreferrer" aria-label="HP Tuners" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/HPTuners-Logo.png" alt="HP Tuners" class="h-6 w-auto object-contain">
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="GDP" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/GDP.png" alt="GDP" class="h-6 w-auto object-contain">
                </a>
                <a href="https://polardiesel.ca/" target="_blank" rel="noopener noreferrer" aria-label="Polar Diesel" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/Polar-Diesel-Logo.webp" alt="Polar Diesel" class="h-10 w-auto object-contain">
                </a>
                <a href="https://gridironmfg.ca/" target="_blank" rel="noopener noreferrer" aria-label="Gridiron Bumper" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/GRIDIRON-logo.webp" alt="Gridiron Bumper" class="h-8 w-auto object-contain">
                </a>
            </div>
            
            <!-- Row 2: Lighting & Accessories -->
            <div class="flex flex-wrap justify-center gap-x-10 gap-y-6 items-center">
                <a href="https://www.morimotohid.com/" target="_blank" rel="noopener noreferrer" aria-label="Morimoto" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/MORIMOTO-Logo.png" alt="MORIMOTO" class="h-6 w-auto object-contain">
                </a>
                <a href="https://www.diodedynamics.com/" target="_blank" rel="noopener noreferrer" aria-label="Diode Dynamics" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/DIODE DYNAMICS.png" alt="Diode Dynamics" class="h-4 w-auto object-contain">
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Baja Designs" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/baja-designs-inc-logo-vector (1).png" alt="Baja Designs" class="h-6 w-auto object-contain">
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="BMC LIGHTS" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/bmc-lights.png" alt="BMC Lights" class="h-6 w-auto object-contain">
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="SD" class="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/speed-demon.png" alt="Speed Demon" class="h-8 w-auto object-contain">
                </a>
            </div>
        </div>
`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Extract the old brand block and replace
            // The old block starts at "<!-- Trust Signals (Partner Logos) -->" and ends before "<!-- Official Payment Methods -->"
            
            const startStr = '<!-- Trust Signals (Partner Logos) -->';
            const endStr = '<!-- Official Payment Methods -->';
            
            const startIdx = content.indexOf(startStr);
            const endIdx = content.indexOf(endStr);
            
            if (startIdx !== -1 && endIdx !== -1) {
                const before = content.substring(0, startIdx);
                const after = content.substring(endIdx);
                const newContent = before + brandsHtml + '\n        ' + after;
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

processDir('src/pages');
