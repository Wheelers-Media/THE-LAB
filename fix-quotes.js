const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const target = "desc: 'Learn about THE LAB - Fort St. John's premium diesel and aesthetic vehicle shop.'";
            const replacement = "desc: 'Learn about THE LAB - Fort St. John\\'s premium diesel and aesthetic vehicle shop.'";
            if (content.includes(target)) {
                content = content.replace(target, replacement);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed', fullPath);
            }
        }
    }
}
processDir('src/pages');
