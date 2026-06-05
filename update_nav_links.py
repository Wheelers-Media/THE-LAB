import glob
import re

replacements = [
    (
        r'<button([^>]*)>([\s\n]*The Boutique[\s\n]*<svg[^>]*>[\s\S]*?</svg>[\s\n]*)</button>',
        r'<a href="/boutique/"\1>\2</a>'
    ),
    (
        r'<button([^>]*)>([\s\n]*The Parts Store[\s\n]*<svg[^>]*>[\s\S]*?</svg>[\s\n]*)</button>',
        r'<a href="/store/"\1>\2</a>'
    ),
    (
        r'<p([^>]*class="[^"]*text-\[10px\][^"]*"[^>]*)>([\s\n]*The Boutique[\s\n]*)</p>',
        r'<a href="/boutique/" class="block text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest font-bold px-1 pb-2 transition-colors">\2</a>'
    ),
    (
        r'<p([^>]*class="[^"]*text-\[10px\][^"]*"[^>]*)>([\s\n]*The Parts Store[\s\n]*)</p>',
        r'<a href="/store/" class="block text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest font-bold px-1 pb-2 transition-colors">\2</a>'
    )
]

for path in glob.glob('src/**/*.html', recursive=True):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated links in {path}')
