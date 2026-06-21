const fs = require('fs');
const files = ['src/pages/index.html', 'src/pages/boutique/index.html', 'src/pages/store/index.html'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Attempt multiple possible whitespace variations
    const searchRegex = /<div class="w-full relative">\s*<script type='text\/javascript' src='https:\/\/reputationhub\.site\/reputation\/assets\/review-widget\.js'><\/script>/g;
    
    const replacement = `<div class="w-full relative rounded-2xl p-6 md:p-8 border border-edge" style="background-color:#0D0D12; box-shadow:0 0 30px rgba(0,102,255,0.1);">
                    <script type='text/javascript' src='https://reputationhub.site/reputation/assets/review-widget.js'></script>`;
    
    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, replacement);
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    } else {
        console.log('Target not found in ' + file);
    }
});
