const fs = require('fs');
const glob = require('fs').readdirSync;
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
            
            // Check if already injected
            if (content.includes('<!-- Official Payment Methods -->')) {
                continue;
            }

            const paymentIconsHtml = `
        <!-- Official Payment Methods -->
        <div class="mb-8 flex justify-center items-center gap-2 flex-wrap">
            <img src="/assets/payment-icons/amex.svg" alt="American Express" class="h-6 w-auto rounded opacity-70 hover:opacity-100 transition-opacity">
            <img src="/assets/payment-icons/apple_pay.svg" alt="Apple Pay" class="h-6 w-auto rounded opacity-70 hover:opacity-100 transition-opacity">
            <img src="/assets/payment-icons/diners_club.svg" alt="Diners Club" class="h-6 w-auto rounded opacity-70 hover:opacity-100 transition-opacity">
            <img src="/assets/payment-icons/discover.svg" alt="Discover" class="h-6 w-auto rounded opacity-70 hover:opacity-100 transition-opacity">
            <img src="/assets/payment-icons/google_pay.svg" alt="Google Pay" class="h-6 w-auto rounded opacity-70 hover:opacity-100 transition-opacity">
            <img src="/assets/payment-icons/mastercard.svg" alt="Mastercard" class="h-6 w-auto rounded opacity-70 hover:opacity-100 transition-opacity">
            <img src="/assets/payment-icons/shop_pay.svg" alt="Shop Pay" class="h-6 w-auto rounded opacity-70 hover:opacity-100 transition-opacity">
            <img src="/assets/payment-icons/visa.svg" alt="Visa" class="h-6 w-auto rounded opacity-70 hover:opacity-100 transition-opacity">
        </div>
`;
            
            if (content.includes('<!-- Global Compliance Mandate -->')) {
                content = content.replace('<!-- Global Compliance Mandate -->', paymentIconsHtml + '\n        <!-- Global Compliance Mandate -->');
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

processDir('src/pages');
