const fs = require('fs');

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

    // Remove the extra partner-logos block I added earlier
    const addedLogosRegex = /<div class="border-t border-edge pt-8 pb-8 partner-logos">[\s\S]*?<\/div>\s*<\/div>\n?\s*/;
    content = content.replace(addedLogosRegex, '');

    // Now, let's replace the text spans in the Trust Signals block with actual image logos where we have them.
    // The Trust Signals block contains spans like:
    // <span class="... grayscale">EZ LYNK</span>
    // <span class="... grayscale">HPTUNERS</span>
    // <span class="... grayscale">AMDP</span>
    
    const ezLynkImg = `<img src="/assets/EZ-Lynk-Logo.png" alt="EZ LYNK" class="h-6 object-contain opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">`;
    const hpTunersImg = `<img src="/assets/HPTuners-Logo.png" alt="HP Tuners" class="h-6 object-contain opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">`;
    const amdpImg = `<img src="/assets/AMDP-Logo.png" alt="AMDP" class="h-6 object-contain opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">`;
    const polarDieselImg = `<img src="/assets/Polar-Diesel-Logo.webp" alt="Polar Diesel" class="h-6 object-contain opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">`;
    
    // Replace EZ LYNK span
    content = content.replace(/<span[^>]*>EZ LYNK<\/span>/g, ezLynkImg);
    
    // Replace HPTUNERS span
    content = content.replace(/<span[^>]*>HPTUNERS<\/span>/g, hpTunersImg);
    
    // Replace AMDP span
    content = content.replace(/<span[^>]*>AMDP<\/span>/g, amdpImg);

    // If it's a footer trust signal block, we can also inject Polar Diesel right after SUNTEK or at the start
    // Let's replace SUNTEK with Polar Diesel + SUNTEK
    if (content.includes('alt="EZ LYNK"') && !content.includes('alt="Polar Diesel"')) {
        content = content.replace(/(<span[^>]*>SUNTEK<\/span>)/g, polarDieselImg + '\n                $1');
    }

    // Now let's look for text mentions like "EZ LYNK · HP Tuners · AMDP" 
    // Example: <span class="text-[10px] font-mono text-labBlue uppercase tracking-widest block mb-3">EZ LYNK · HP Tuners · AMDP</span>
    // In store/index.html and index.html
    const tuningLogosBlock = `
        <div class="flex gap-4 items-center mb-3">
            <img src="/assets/EZ-Lynk-Logo.png" alt="EZ LYNK" class="h-4 object-contain grayscale hover:grayscale-0 transition-all">
            <img src="/assets/HPTuners-Logo.png" alt="HP Tuners" class="h-4 object-contain grayscale hover:grayscale-0 transition-all">
            <img src="/assets/AMDP-Logo.png" alt="AMDP" class="h-4 object-contain grayscale hover:grayscale-0 transition-all">
        </div>`;
    content = content.replace(/<span[^>]*>EZ LYNK · HP Tuners · AMDP<\/span>/g, tuningLogosBlock);

    // Also the text mentions in bulleted lists (boutique pages)
    // <li>EZ LYNK</li>
    // <li>HP Tuners</li>
    // We can leave these as text, as they are part of a standard text list "Partners" in a sidebar, 
    // or we can replace them. The user said "where we have text for the brands we should put the logos too".
    // So let's replace them in the <li> lists.
    const ezLynkLi = `<li><img src="/assets/EZ-Lynk-Logo.png" alt="EZ LYNK" class="h-4 object-contain grayscale hover:grayscale-0 transition-all inline-block"></li>`;
    const hpTunersLi = `<li><img src="/assets/HPTuners-Logo.png" alt="HP Tuners" class="h-4 object-contain grayscale hover:grayscale-0 transition-all inline-block"></li>`;
    content = content.replace(/<li>EZ LYNK<\/li>/g, ezLynkLi);
    content = content.replace(/<li>HP Tuners<\/li>/g, hpTunersLi);

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
