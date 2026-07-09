import glob
import re

html_files = glob.glob('FINAL DOCUMENTATION/*.html')

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # The current one has: opacity: 0.5;
    old_style = 'opacity: 0.5;'
    new_style = 'opacity: 0.25;'
    
    html = html.replace(old_style, new_style)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated {file_path}")
