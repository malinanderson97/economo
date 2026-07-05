import glob
import re

html_files = glob.glob('FINAL DOCUMENTATION/*.html')

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # The current one has: right: -70px; bottom: -70px;
    old_style = 'right: -70px; bottom: -70px;'
    new_style = 'right: -77px; bottom: -77px;'
    
    html = html.replace(old_style, new_style)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated {file_path}")
