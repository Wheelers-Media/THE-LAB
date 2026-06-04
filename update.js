const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.html')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/pages').concat(walk('src/components'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Compliance badges on store product cards
    if (file.includes('store') || file.includes('index.html')) {
        const badgeHTML = `\n                            <div class="mb-3 border border-red-900/50 bg-red-900/10 p-2 rounded text-[9px] text-red-500 uppercase tracking-widest font-bold">\n                                Off-Road & Sanctioned Racing Use Only. Not legal for use on pollution-controlled vehicles.\n                            </div>`;
        
        content = content.replace(/(<h4[^>]*>.*?EGR Delete Kit.*?<\/h4>)/g, '$1' + badgeHTML);
        content = content.replace(/(<h4[^>]*>.*?Exhaust System.*?<\/h4>)/g, '$1' + badgeHTML);
        
        const overviewBadgeHTML = `\n                    <div class="mt-2 mb-3 border border-red-900/50 bg-red-900/10 p-1.5 rounded text-[8px] text-red-500 uppercase tracking-widest font-bold">\n                        Off-Road & Sanctioned Racing Use Only. Not legal for use on pollution-controlled vehicles.\n                    </div>`;
        content = content.replace(/(<h3[^>]*>EGR Delete Kits<\/h3>)/g, '$1' + overviewBadgeHTML);
        content = content.replace(/(<h3[^>]*>Exhaust Systems<\/h3>)/g, '$1' + overviewBadgeHTML);
    }

    // 2. Ceramic Coating Pricing
    if (content.includes('Standard Paint Coat')) {
        content = content.replace(/<span>Standard Paint Coat<\/span><span>\$800<\/span>/g, '<span>Standard Ceramic (Truck)</span><span>$850</span>');
        content = content.replace(/<span>Full Vehicle \+ Glass<\/span><span>\$1,400<\/span>/g, '<span>Full Vehicle (Mid-Size SUV)</span><span>$1,050</span>');
        content = content.replace(/<span>Graphene Elite<\/span><span>\$2,200<\/span>/g, '<span>Graphene Elite (Full-Size SUV)</span><span>$1,300</span>');
    }

    // 3. Logos in the footer
    if (content.includes('<footer') || content.includes('FOOTER')) {
        if (!content.includes('partner-logos')) {
            const logosHTML = `
            <div class="border-t border-edge pt-8 pb-8 partner-logos">
                <p class="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-6 text-center">Authorized Partners & Dealers</p>
                <div class="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <img src="/assets/Polar-Diesel-Logo.webp" alt="Polar Diesel" class="h-6 md:h-8 object-contain">
                    <img src="/assets/EZ-Lynk-Logo.png" alt="EZ LYNK" class="h-6 md:h-8 object-contain">
                    <img src="/assets/AMDP-Logo.png" alt="AMDP" class="h-6 md:h-8 object-contain">
                    <img src="/assets/HPTuners-Logo.png" alt="HP Tuners" class="h-6 md:h-8 object-contain">
                </div>
            </div>`;
            
            // Try to match the exact string "Certain products are for Off-Road" in the footer text
            const footerRegex = /(<div class="border-t border-edge pt-8">\s*<p[^>]*>[\s\S]*?Certain products are for Off-Road)/g;
            if (footerRegex.test(content)) {
                content = content.replace(footerRegex, logosHTML + '\n            $1');
            } else if (content.includes('&copy; 2026 THE LAB')) {
                // fallback for short footers
                content = content.replace(/(<footer[^>]*>)/, '$1' + logosHTML);
            }
        }
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
