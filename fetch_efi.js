const SHOPIFY_TOKEN = '661b1009a0d85bfadfce9c52fcb3d87f';
const STORE_URL = 'https://xr6pmx-y0.myshopify.com/api/2024-01/graphql.json';
const q = '{ products(first: 10, query: "title:EFI Live VIN License") { edges { node { id title variants(first: 5) { edges { node { id title price { amount } } } } } } } }';

async function fetchProducts() {
    const response = await fetch(STORE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN },
        body: JSON.stringify({ query: q })
    });
    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}
fetchProducts();
