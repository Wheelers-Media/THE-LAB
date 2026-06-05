const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src');

const replacements = [
    { regex: /\/store\/ford\/?/g, replacement: '/store/?make=Ford' },
    { regex: /\/store\/ram\/?/g, replacement: '/store/?make=Ram' },
    { regex: /\/store\/chevy\/?/g, replacement: '/store/?make=Chevy' },
    { regex: /\/store\/egr\/?/g, replacement: '/store/?category=EGR' },
    { regex: /\/store\/exhaust\/?/g, replacement: '/store/?category=Exhaust' },
    { regex: /\/store\/tuning\/?/g, replacement: '/store/?category=Tuning' },
    { regex: /\/store\/ccv\/?/g, replacement: '/store/?category=CCV' },
    { regex: /\/store\/#ford/g, replacement: '/store/?make=Ford' },
    { regex: /\/store\/#ram/g, replacement: '/store/?make=Ram' },
    { regex: /\/store\/#chevy/g, replacement: '/store/?make=Chevy' },
    { regex: /\/store\/#egr/g, replacement: '/store/?category=EGR' },
    { regex: /\/store\/#exhaust/g, replacement: '/store/?category=Exhaust' },
    { regex: /\/store\/#tuning/g, replacement: '/store/?category=Tuning' },
    { regex: /\/store\/#ccv/g, replacement: '/store/?category=CCV' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            for (const r of replacements) {
                // To avoid breaking the actual query params if they are already replaced
                // We should be careful. But global replace is fine since we use exact match of the old URL.
                content = content.replace(r.regex, r.replacement);
            }
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated links in ${fullPath}`);
            }
        }
    }
}

processDirectory(targetDir);
console.log('Link updates complete.');
