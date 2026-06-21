const fs = require('fs');
const path = require('path');

let fixCount = 0;

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            processFile(fullPath);
        }
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // The old string pattern (we will match the beginning to find it reliably)
    const functionStart = "window.setCurrency=function(c){";
    const functionEnd = "};";

    // Since the content of setCurrency varies slightly (some have .toFixed(0)), we will replace it via regex or substring
    const startIndex = content.indexOf(functionStart);
    if (startIndex !== -1) {
        let endIndex = content.indexOf("};", startIndex);
        if (endIndex !== -1) {
            // Find if there's a setTimeout following immediately to include it or just replace the function body
            let oldFunc = content.substring(startIndex, endIndex + 2);
            
            // New minified function with Affirm support
            let newFunc = "window.setCurrency=function(c){var r=0.74,ac='text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-labBlue text-white transition-all',ic='text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider text-zinc-500 hover:text-white transition-all';var cb=document.getElementById('btn-cad'),ub=document.getElementById('btn-usd');if(cb)cb.className=(c==='CAD')?ac:ic;if(ub)ub.className=(c==='USD')?ac:ic;localStorage.setItem('theLab_currency',c);document.querySelectorAll('[data-price-cad]').forEach(function(el){var cad=parseFloat(el.getAttribute('data-price-cad'));if(!isNaN(cad))el.textContent=c==='USD'?'$'+(cad*r).toFixed(2)+' USD':'$'+cad.toFixed(2)+' CAD';});document.querySelectorAll('[data-price-from-cad]').forEach(function(el){var cad=parseFloat(el.getAttribute('data-price-from-cad'));if(!isNaN(cad))el.textContent=c==='USD'?'From $'+(cad*r).toFixed(2)+' USD':'From $'+cad.toFixed(2)+' CAD';});document.querySelectorAll('[data-affirm-cad-total]').forEach(function(el){var cad=parseFloat(el.getAttribute('data-affirm-cad-total'));if(!isNaN(cad))el.textContent=c==='USD'?'Pay in monthly installments as low as $'+((cad/18)*r).toFixed(2)+'/mo with':'Pay in monthly installments as low as $'+(cad/18).toFixed(2)+'/mo with';});};";

            if (oldFunc !== newFunc) {
                content = content.replace(oldFunc, newFunc);
                changed = true;
            }
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
        fixCount++;
    }
}

processDir('src');
console.log(`\nDone. Fixed ${fixCount} files.`);
