import os
import glob
import re

dir_path = r'f:\The LAB\THE LAB BUILD\src'
for filepath in glob.glob(os.path.join(dir_path, '**/*.html'), recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    content = re.sub(r'\s+data-price-cad="[^"]+"', '', original)
    content = re.sub(r'\s+data-price-from-cad="[^"]+"', '', content)

    content = re.sub(r'(<[^>]+?)>\s*\$(\d+(?:\.\d{2})?)\s+CAD\s*<', lambda m: f'{m.group(1)} data-price-cad="{m.group(2) if "." in m.group(2) else m.group(2)+".00"}">${m.group(2)} CAD<', content)
    
    content = re.sub(r'(<[^>]+?)>\s*From\s+\$(\d+(?:\.\d{2})?)\s+CAD\s*<', lambda m: f'{m.group(1)} data-price-from-cad="{m.group(2) if "." in m.group(2) else m.group(2)+".00"}">From ${m.group(2)} CAD<', content)

    def wrap_embedded(m):
        price = m.group(1)
        price_attr = price if '.' in price else price + ".00"
        return f'<span data-price-cad="{price_attr}">${price} CAD</span>'
    
    content = re.sub(r'(?<![>"])\$(\d+(?:\.\d{2})?)\s+CAD', wrap_embedded, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
