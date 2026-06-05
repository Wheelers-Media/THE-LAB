const fs = require('fs');
const path = require('path');

const boutiqueDir = path.join(__dirname, 'src', 'pages', 'boutique');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Remove breadcrumb nav
            const breadcrumbRegex = /[ \t]*<nav class="flex items-center gap-2 text-xs text-zinc-600 mb-12 font-mono">[\s\S]*?<\/nav>\s*/g;
            if (breadcrumbRegex.test(content)) {
                content = content.replace(breadcrumbRegex, '');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(boutiqueDir);
console.log('Breadcrumb removal complete.');
