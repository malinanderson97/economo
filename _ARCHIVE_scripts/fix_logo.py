import base64
import os
import glob

with open('economo_logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')

img_tag = f'\n  <img src="data:image/png;base64,{b64_logo}" alt="Economo Logo" style="position: absolute; right: 60px; top: 50%; transform: translateY(-50%); width: 110px; height: 110px; object-fit: contain; opacity: 0.95;">'

html_files = glob.glob('FINAL DOCUMENTATION/*.html')

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Remove old logo attempt if it somehow got in
    # (My previous script looked for `<div class="logo">`, which wasn't there, so it shouldn't be)
    
    # Check if we already inserted the img tag (to make it idempotent)
    if 'alt="Economo Logo"' in html:
        print(f"Logo already in {file_path}")
        continue
        
    # Insert right after <header>
    if '<header>' in html:
        html = html.replace('<header>', '<header>' + img_tag)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Added logo to {file_path}")
    else:
        print(f"Warning: <header> not found in {file_path}")
