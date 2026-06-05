const fs = require('fs');
const path = require('path');

const storeIndexPath = path.join(__dirname, 'src', 'pages', 'store', 'index.html');
const pdpDirPath = path.join(__dirname, 'src', 'pages', 'store', 'product');
const pdpIndexPath = path.join(pdpDirPath, 'index.html');

if (!fs.existsSync(pdpDirPath)) {
    fs.mkdirSync(pdpDirPath, { recursive: true });
}

let content = fs.readFileSync(storeIndexPath, 'utf8');

const mainStart = content.indexOf('<main>');
const mainEnd = content.indexOf('</main>') + '</main>'.length;

const newMain = `<main class="min-h-[80vh] flex items-center justify-center pt-24 pb-12">
    <!-- PDP Javascript injects here -->
    <div id="pdp-container" class="w-full">
        <div class="py-20 text-center text-zinc-500">Loading product...</div>
    </div>
</main>`;

content = content.substring(0, mainStart) + newMain + content.substring(mainEnd);

// Fix title just in case
content = content.replace('<title>The Parts Store | THE LAB Performance</title>', '<title>Product | THE LAB Performance</title>');

fs.writeFileSync(pdpIndexPath, content, 'utf8');
console.log('PDP created successfully.');
