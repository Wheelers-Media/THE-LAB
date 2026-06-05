import os
import glob
import re

keep_files = {
    os.path.normpath('src/pages/store/index.html'),
    os.path.normpath('src/pages/store/catalog/index.html'),
    os.path.normpath('src/pages/store/product/index.html')
}

pattern = re.compile(r'\s*<!-- ACTIVE GARAGE BANNER -->\s*<section id="active-garage-banner".*?</section>', re.DOTALL)

for path in glob.glob('src/**/*.html', recursive=True):
    norm_path = os.path.normpath(path)
    if norm_path in keep_files:
        continue

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = pattern.sub('', content)

    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Removed banner from {path}')
