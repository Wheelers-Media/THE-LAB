import os
import glob

def replace_links(dir_path):
    for filepath in glob.glob(os.path.join(dir_path, '**/*.html'), recursive=True):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content.replace('/store/catalog/?category=Tuning&amp;platform=ezlynk', '/store/tuning/?platform=ezlynk')
        new_content = new_content.replace('/store/catalog/?category=Tuning&platform=ezlynk', '/store/tuning/?platform=ezlynk')
        new_content = new_content.replace('/store/catalog/?category=Tuning&amp;platform=hptuners', '/store/tuning/?platform=hptuners')
        new_content = new_content.replace('/store/catalog/?category=Tuning&platform=hptuners', '/store/tuning/?platform=hptuners')
        new_content = new_content.replace('/store/catalog/?category=Tuning', '/store/tuning/')
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")

replace_links(r"f:\The LAB\THE LAB BUILD\src")
