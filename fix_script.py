import glob

for filepath in glob.glob('src/pages/**/index.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    new_lines = []
    i = 0
    changed = False
    while i < len(lines):
        line = lines[i]
        if '<script>' in line and i + 5 < len(lines):
            if 'GLOBAL SEARCH' in lines[i+2] and '<script src="/assets/js/global-search.js"></script>' in lines[i+4] and '});' in lines[i+5]:
                new_lines.append('<!-- GLOBAL SEARCH -->\n')
                new_lines.append('<script src="/assets/js/global-search.js"></script>\n')
                new_lines.append('<script>\n')
                i += 6
                changed = True
                continue
        
        new_lines.append(line)
        i += 1
        
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f'FIXED: {filepath}')
