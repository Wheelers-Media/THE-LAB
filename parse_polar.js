const fs = require('fs');

const mdPath = 'C:\\Users\\Nate_\\.gemini\\antigravity-ide\\brain\\63d1dd87-1578-4cc4-b32c-ee8e4af4cfae\\.system_generated\\steps\\467\\content.md';
const content = fs.readFileSync(mdPath, 'utf8');

// Looking for shopify product cards in the HTML dump
const products = [];
// A regex to match product titles from Shopify grid
// Usually inside `<a href="/collections/all/products/... " class="full-unstyled-link">Product Name</a>`
const regex = /<a[^>]*href="\/collections\/[^\/]+\/products\/[^"]+"[^>]*class="full-unstyled-link"[^>]*>([\s\S]*?)<\/a>/g;

let match;
while ((match = regex.exec(content)) !== null) {
    let name = match[1].trim().replace(/<[^>]+>/g, '').trim();
    if (name && !products.find(p => p.name === name)) {
        products.push({
            id: 'pd-' + Math.random().toString(36).substr(2, 6),
            name: name,
            makes: ["Ram", "Ford", "Chevy"], // Defaulting to Universal for now
            category: "EGR", // Default placeholder
            engine: "Universal",
            years: [2000, 2024],
            price: 199.99, // We'll set a default price as price parsing requires more complex DOM reading
            image: "https://placehold.co/600x400/0D0D12/1E1E28?text=Polar+Diesel+Part",
            description: "Genuine Polar Diesel performance component.",
            features: ["High quality construction", "Direct fitment"],
            isPopular: false
        });
    }
}

console.log(JSON.stringify(products, null, 2));
