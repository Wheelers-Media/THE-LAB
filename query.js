const https = require('https');
const data = JSON.stringify({
    query: `
        query {
            products(first: 50, query: "title:*Edge* OR title:*Exhaust* OR title:*CTS3*") {
                edges {
                    node { title, productType, tags }
                }
            }
        }
    `
});

const options = {
    hostname: 'xr6pmx-y0.myshopify.com',
    path: '/api/2024-01/graphql.json',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': '661b1009a0d85bfadfce9c52fcb3d87f',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(JSON.parse(body).data.products.edges.map(e => e.node.title)));
});
req.write(data);
req.end();
