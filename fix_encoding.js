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

const files = walk('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace the unicode replacement character sequences
    content = content.replace(/ ï¿½ /g, ' — ');
    content = content.replace(/ï¿½ /g, '— ');
    content = content.replace(/ ï¿½/g, ' —');
    content = content.replace(/ï¿½/g, '-');

    // For any remaining weirdness like amp; if present inappropriately, though leaving it alone is safer
    // But let's clean up if there is &#65533; or similar
    content = content.replace(/&#65533;/g, '-');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed encoding in:', file);
    }
});
