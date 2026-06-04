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
const newFooter = fs.readFileSync('src/components/GlobalFooter.html', 'utf8');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace everything from <footer to </footer> with the new footer content.
    // Also handling if there is an <!-- GLOBAL FOOTER --> comment or <!-- --- GLOBAL FOOTER --- -->
    // We can just replace <footer ... </footer> with the new footer (excluding the <!-- GLOBAL FOOTER --> comment from newFooter to avoid duplicating comments)
    
    // We'll replace the existing footer
    content = content.replace(/<!--[\s-]*GLOBAL FOOTER[\s-]*-->\s*<footer[\s\S]*?<\/footer>/g, newFooter);
    
    // If it didn't match the comment pattern, replace just the footer tag
    if (content === original) {
        content = content.replace(/<footer[\s\S]*?<\/footer>/g, newFooter);
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Injected global footer into:', file);
    }
});
