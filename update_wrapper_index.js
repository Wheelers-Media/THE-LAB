const fs = require('fs');
let content = fs.readFileSync('src/pages/index.html', 'utf8');

const targetStr = '<div class="w-full relative">\n                <!-- If the widget has a white background by default';
const replacement = '<div class="w-full relative rounded-2xl p-6 md:p-8 border border-edge" style="background-color:#0D0D12; box-shadow:0 0 30px rgba(0,102,255,0.1);">\n                <!-- If the widget has a white background by default';

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync('src/pages/index.html', content);
    console.log('Successfully updated src/pages/index.html');
} else {
    // try a more generic replace
    content = content.replace('<!-- GHL Reviews Widget Wrapper -->\n            <div class="w-full relative">', '<!-- GHL Reviews Widget Wrapper -->\n            <div class="w-full relative rounded-2xl p-6 md:p-8 border border-edge" style="background-color:#0D0D12; box-shadow:0 0 30px rgba(0,102,255,0.1);">');
    fs.writeFileSync('src/pages/index.html', content);
    console.log('Fall back update src/pages/index.html');
}
