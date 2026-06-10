// Local dev server that mimics Vercel rewrites from vercel.json
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

function resolveFile(urlPath) {
    // Rewrite rule 1: /assets/* -> /src/assets/*
    if (urlPath.startsWith('/assets/')) {
        return path.join(ROOT, 'src', urlPath);
    }
    // Rewrite rule 2: /styles/* -> /src/styles/*
    if (urlPath.startsWith('/styles/')) {
        return path.join(ROOT, 'src', urlPath);
    }
    // Rewrite rule 3: everything else -> /src/pages/*
    let filePath = path.join(ROOT, 'src', 'pages', urlPath);

    // If it's a directory, try index.html inside it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    // If no extension, try .html (Vercel cleanUrls)
    if (!path.extname(filePath) && !fs.existsSync(filePath)) {
        filePath += '.html';
    }

    return filePath;
}

const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0]; // strip query params for file resolution
    const filePath = resolveFile(urlPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`<h1>404 Not Found</h1><p>${urlPath}</p><p>Tried: ${filePath}</p>`);
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n  THE LAB Dev Server running at:\n`);
    console.log(`  → http://localhost:${PORT}/`);
    console.log(`  → http://localhost:${PORT}/store/`);
    console.log(`  → http://localhost:${PORT}/store/catalog/`);
    console.log(`  → http://localhost:${PORT}/store/product/?id=test\n`);
});
