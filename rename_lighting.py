import os
import glob
import re

for path in glob.glob('src/**/*.html', recursive=True):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the link
    new_content = content.replace('/boutique/morimoto/', '/boutique/lighting/')
    # Replace "Morimoto Lighting" text
    new_content = new_content.replace('>Morimoto Lighting<', '>Custom Lighting<')
    new_content = new_content.replace('"Morimoto Lighting"', '"Custom Lighting"')
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {path}')
