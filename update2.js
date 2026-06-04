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

const files = walk('src/pages');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const polarBadge = '<div class="absolute top-3 right-3 bg-black/60 p-2 rounded-lg border border-zinc-800/80 backdrop-blur-md flex items-center justify-center"><img src="/assets/Polar-Diesel-Logo.webp" alt="Polar Diesel" class="h-4 opacity-90 object-contain"></div>';
    
    // Replace the specific Polar Diesel span
    content = content.replace(/<span class="absolute top-3 right-3 bg-labBlue\/10 border border-labBlue\/30 text-labBlue text-\[10px\] px-2 py-1 uppercase tracking-widest font-bold rounded">Polar Diesel<\/span>/g, polarBadge);

    // Replace <p class="text-white font-heading font-bold text-sm">Authorized Polar Diesel Dealer</p> in index.html
    const polarTitleBadge = '<div class="flex items-center gap-3"><img src="/assets/Polar-Diesel-Logo.webp" alt="Polar Diesel" class="h-6 object-contain"><p class="text-white font-heading font-bold text-sm">Authorized Dealer</p></div>';
    content = content.replace(/<p class="text-white font-heading font-bold text-sm">Authorized Polar Diesel Dealer<\/p>/g, polarTitleBadge);

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
