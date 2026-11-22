// Which country a visitor is in, from Vercel's edge (x-vercel-ip-country). chrome.js asks once, on a first visit,
// to start US visitors in USD. Nothing is stored or logged; the answer is just the two-letter country code.
module.exports = (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Type', 'application/json');
    const c = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
    res.end(JSON.stringify({ country: /^[A-Z]{2}$/.test(c) ? c : '' }));
};
