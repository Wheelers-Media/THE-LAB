import os
import glob
import re

dir_path = r'f:\The LAB\THE LAB BUILD\src'
for filepath in glob.glob(os.path.join(dir_path, '**/*.html'), recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to find cases where there is a dollar sign, some numbers, maybe .00, and CAD
    # e.g. `$308 CAD`
    # and we want to replace it with `<span data-price-cad="308">$308 CAD</span>`
    # BUT only if it is NOT already inside a tag with `data-price-cad` (or is it okay to nest?)
    # Actually, we should just find cases of `\$(\d+(?:\.\d{2})?)\s+CAD` that are not inside quotes or tags.
    
    def repl(m):
        price = m.group(1)
        # If it doesn't have decimals, add .00 for the attribute
        price_attr = price if '.' in price else price + ".00"
        return f'<span data-price-cad="{price_attr}">${price} CAD</span>'

    # Simple regex, but skip if it's already inside a data-price-cad span
    # We can just do a two pass: first remove all data-price-cad spans (unwrap them), then wrap everything.
    # Actually, the user's issue might be specifically on the index page and store overview page.
    
    # We can just do a manual replace for the specific strings found in `src/pages/index.html` and `src/pages/store/index.html`
    
    new_content = content.replace("Starting at $308 CAD", 'Starting at <span data-price-cad="308">308 CAD</span>') # Wait, setCurrency adds the $ sign.
    # Ah, setCurrency sets textContent to `$228 USD`.
    # So we should wrap the whole thing: `<span data-price-cad="308">$308 CAD</span>`
    new_content = new_content.replace("Starting at $308 CAD", 'Starting at <span data-price-cad="308">$308 CAD</span>')
    new_content = new_content.replace("Starting at $966 CAD", 'Starting at <span data-price-cad="966">$966 CAD</span>')
    new_content = new_content.replace("Starting at $189 CAD", 'Starting at <span data-price-cad="189">$189 CAD</span>')

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')
