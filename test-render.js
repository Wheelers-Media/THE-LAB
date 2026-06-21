const fs = require('fs');

async function testProducts() {
    const jsContent = fs.readFileSync('src/assets/js/store.js', 'utf8');

    // Fetch from Shopify just like products.js does
    const SHOPIFY_DOMAIN = "xr6pmx-y0.myshopify.com";
    const STOREFRONT_ACCESS_TOKEN = "e87f2ff8e7b97cd75b922a0f8bf95155";
    const GRAPHQL_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

    const query = `
    {
      products(first: 250) {
        edges {
          node {
            id
            title
            descriptionHtml
            vendor
            productType
            images(first: 1) { edges { node { url } } }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price { amount }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({ query })
    });
    const { data } = await response.json();
    const rawProducts = data.products.edges.map(e => e.node);

    // Mock processing logic from products.js
    const storeCatalog = rawProducts.map(p => {
        return {
            id: p.id,
            name: p.title,
            vendor: p.vendor,
            category: p.productType || 'Tuning & Electronics',
            makes: ['Ford'], // mock
            years: [2010, 2026],
            engine: 'Universal',
            brand: p.vendor,
            price: parseFloat(p.variants.edges[0]?.node.price.amount || "0"),
            image: p.images.edges[0]?.node.url || '',
            descriptionHtml: p.descriptionHtml,
            variants: p.variants.edges.map(v => ({
                id: v.node.id,
                title: v.node.title,
                price: parseFloat(v.node.price.amount),
                available: v.node.availableForSale
            }))
        };
    });

    console.log(`Fetched ${storeCatalog.length} products`);
    const tuningProducts = storeCatalog.filter(p => p.category === 'Tuning & Electronics' || p.category.includes('Tune'));
    console.log(`Testing ${tuningProducts.length} tuning products`);

    // Read the renderProductDetails function content
    const match = jsContent.match(/function renderProductDetails\(id\) \{([\s\S]*?)\}\n\n\/\//);
    if (!match) {
        console.log('Could not find renderProductDetails function');
        return;
    }
    const funcBody = match[1];

    let errors = [];
    tuningProducts.forEach(product => {
        try {
            const urlParams = new URLSearchParams('');
            const container = { innerHTML: '' };
            const id = product.id;
            
            const document = {
                getElementById: () => null,
                querySelector: () => null,
                querySelectorAll: () => []
            };

            const testFunc = new Function('id', 'product', 'container', 'document', 'window', funcBody);
            
            testFunc(id, product, container, document, { storeCatalog: storeCatalog });
        } catch (e) {
            errors.push(`ID: ${product.id} - ${product.name} => ${e.message}`);
        }
    });

    if (errors.length > 0) {
        console.log(`Found ${errors.length} errors:`);
        console.log(errors.join('\n'));
    } else {
        console.log("No errors found when rendering products.");
    }
}

testProducts();
