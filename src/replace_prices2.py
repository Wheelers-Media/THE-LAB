import os
import glob
import re

dir_path = r'f:\The LAB\THE LAB BUILD\src'
for filepath in glob.glob(os.path.join(dir_path, '**/*.html'), recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Temporarily remove all existing data-price-cad wrappers from text content
    # e.g., `<span data-price-cad="249">$249 CAD</span>` -> `$249 CAD`
    # We will ONLY do this for spans we added that look exactly like that, to be safe.
    # Actually, simpler: let's just find `data-price-cad="..."` and `data-price-from-cad="..."` attributes 
    # that are already on spans or ps and ignore them, or strip them and re-add.
    # Given the small number of files, let's just use regex to wrap any `$XXX CAD` that isn't already inside `>...<`.
    # Actually, let's use a function that checks if the match is inside a tag attribute.

    def replace_price(m):
        price = m.group(1)
        full_match = m.group(0)
        # if it already has data-price-cad in the immediate vicinity, don't double wrap.
        price_attr = price if '.' in price else price + ".00"
        return f'<span data-price-cad="{price_attr}">{full_match}</span>'

    # Find $ digits CAD that are not preceded by `data-price-cad="...` and not inside HTML tags.
    # We can just remove the old `data-price-cad` from the text and regenerate it.
    # First remove the ones we just added:
    content = re.sub(r'<span data-price-cad="[^"]+">(\$\d+(?:\.\d{2})?\s+CAD)</span>', r'\1', content)
    content = re.sub(r'<span data-price-from-cad="[^"]+">(From\s+\$\d+(?:\.\d{2})?\s+CAD)</span>', r'\1', content)

    # Now find all instances of `$XX CAD` and `From $XX CAD`
    # that are text content (i.e. not inside HTML tags like `<... $XX CAD ...>`)
    # HTML tag content matches `>...<`.
    
    # Let's just do a careful search and replace on the text.
    # Because we removed the spans we added, the remaining `$XX CAD` are either:
    # 1. Plain text (like in `<p>... $189 CAD.</p>`)
    # 2. Already inside an element that HAS `data-price-cad` (like `<span data-price-cad="180">$180 CAD</span>` -> wait, we just stripped those!)
    # But wait, in the boutique pages, they have:
    # `<span class="text-white font-extrabold font-mono text-sm" data-price-cad="180">$180 CAD</span>`
    # So `content = re.sub(r'data-price-cad="[^"]+"', '', content)` ? No, we don't want to lose the classes!
    
    # Better approach:
    # Find all elements that have `data-price-cad` attribute and remove the attribute.
    content = re.sub(r'\s+data-price-cad="[^"]+"', '', content)
    content = re.sub(r'\s+data-price-from-cad="[^"]+"', '', content)

    # Now NO elements have `data-price-cad`.
    # Now we find all instances of `>\s*\$(\d+(?:\.\d{2})?)\s+CAD\s*<` and add `data-price-cad="X"` to the opening tag!
    content = re.sub(r'(<[^>]+?)>\s*\$(\d+(?:\.\d{2})?)\s+CAD\s*<', lambda m: f'{m.group(1)} data-price-cad="{m.group(2) if "." in m.group(2) else m.group(2)+".00"}">${m.group(2)} CAD<', content)
    
    # Same for `From $XX CAD`
    content = re.sub(r'(<[^>]+?)>\s*From\s+\$(\d+(?:\.\d{2})?)\s+CAD\s*<', lambda m: f'{m.group(1)} data-price-from-cad="{m.group(2) if "." in m.group(2) else m.group(2)+".00"}">From ${m.group(2)} CAD<', content)

    # Now, what about the ones that are embedded in text like `<p>Starting at $308 CAD.</p>`?
    # They won't match `>\s*\$...\s*<`.
    # Let's find those specifically and wrap them.
    # Look for `$XX CAD` preceded by a space or something, not `>`.
    def wrap_embedded(m):
        price = m.group(1)
        price_attr = price if '.' in price else price + ".00"
        return f'<span data-price-cad="{price_attr}">${price} CAD</span>'
    
    # Exclude those that are preceded by `>` (since we already handled them) or `"` (in an attribute)
    content = re.sub(r'(?<![>"])\$(\d+(?:\.\d{2})?)\s+CAD', wrap_embedded, content)

    if content != f.read() if os.path.exists(filepath) else '':
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
