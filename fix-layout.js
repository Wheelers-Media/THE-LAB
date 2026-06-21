const fs = require('fs');
const path = require('path');

// 1. Rename files properly
const iconsDir = path.join('src', 'assets', 'payment-icons');
if (fs.existsSync(path.join(iconsDir, 'diners-icon-md.svg'))) {
    fs.renameSync(path.join(iconsDir, 'diners-icon-md.svg'), path.join(iconsDir, 'diners-icon-md.png'));
}
if (fs.existsSync(path.join(iconsDir, 'discover.svg'))) {
    fs.renameSync(path.join(iconsDir, 'discover.svg'), path.join(iconsDir, 'discover.png'));
}
if (fs.existsSync(path.join(iconsDir, 'shop_pay.svg'))) {
    fs.renameSync(path.join(iconsDir, 'shop_pay.svg'), path.join(iconsDir, 'shop_pay.webp'));
}

// 2. Process HTML files to fix paths and reorder footer
function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix extensions in HTML
            content = content.replace(/diners-icon-md\.svg/g, 'diners-icon-md.png');
            content = content.replace(/diners_club\.svg/g, 'diners-icon-md.png'); // Just in case
            content = content.replace(/discover\.svg/g, 'discover.png');
            content = content.replace(/shop_pay\.svg/g, 'shop_pay.webp');

            // Reorder layout
            // Extract Brands Block
            const brandsStart = '<!-- Trust Signals (Partner Logos) -->';
            const brandsEnd = '<!-- Official Payment Methods -->';
            
            let bStartIdx = content.indexOf(brandsStart);
            let bEndIdx = content.indexOf(brandsEnd);
            
            if (bStartIdx !== -1 && bEndIdx !== -1) {
                const brandsBlock = content.substring(bStartIdx, bEndIdx);
                // Remove brands block from current position
                content = content.substring(0, bStartIdx) + content.substring(bEndIdx);
                
                // Find where the column layout starts
                const columnsStart = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">';
                let colStartIdx = content.indexOf(columnsStart);
                
                if (colStartIdx !== -1) {
                    // Inject brands block right before columns
                    // Add some margin bottom to brands block
                    const adjustedBrands = brandsBlock.replace('mt-16 mb-12', 'mb-16 mt-4');
                    content = content.substring(0, colStartIdx) + adjustedBrands + content.substring(colStartIdx);
                }
            }

            fs.writeFileSync(fullPath, content);
            console.log('Processed ' + fullPath);
        }
    }
}

processDir('src/pages');
