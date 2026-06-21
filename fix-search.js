const fs = require('fs');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = dir + '/' + file;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const oldFunc = /function toggleGlobalSearch\(\)\s*\{[\s\S]*?\}\s*document\.getElementById\('global-search-submit'\)/;
            const newFunc = `function toggleGlobalSearch() {
    const el = document.getElementById('global-search-overlay');
    if (!el) return;
    if (el.classList.contains('hidden') || el.style.display === 'none' || el.style.display === '') {
        el.classList.remove('hidden');
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        setTimeout(() => { el.classList.remove('opacity-0'); document.getElementById('global-search-input')?.focus(); }, 10);
        document.body.style.overflow = 'hidden';
    } else {
        el.classList.add('opacity-0');
        setTimeout(() => { el.classList.add('hidden'); el.style.display = 'none'; document.body.style.overflow = ''; }, 300);
    }
}
document.getElementById('global-search-submit')`;
            if (oldFunc.test(content)) {
                content = content.replace(oldFunc, newFunc);
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

processDir('src/pages');
