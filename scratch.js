const https = require('https');
const query = `{
  products(first: 10, query: "title:*AMDP 2022-2024 6.7L Cummins Cab & Chassis HP Tuners*") {
    edges {
      node {
        title
        vendor
        tags
      }
    }
  }
}`;

const options = {
  hostname: 'xr6pmx-y0.myshopify.com',
  path: '/api/2024-01/graphql.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': '661b1009a0d85bfadfce9c52fcb3d87f'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const products = JSON.parse(data).data.products.edges;
    console.log(JSON.stringify(products, null, 2));
  });
});
req.write(JSON.stringify({ query }));
req.end();
