import glob
import re

html_files = glob.glob('FINAL DOCUMENTATION/*.html')

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update CSS to add overflow: hidden to header
    # Let's match the exact string or just ensure overflow:hidden is there.
    if 'overflow:hidden' not in html and 'overflow: hidden' not in html:
        html = re.sub(
            r'header\{position:relative;background:var\(--navy-900\);color:#fff;padding:38px 48px 34px;\}',
            r'header{position:relative;overflow:hidden;background:var(--navy-900);color:#fff;padding:38px 48px 34px;}',
            html
        )
    
    # 2. Update the img tag
    # The current one has: style="position: absolute; right: 60px; top: 50%; transform: translateY(-50%); width: 110px; height: 110px; object-fit: contain; opacity: 0.95;"
    old_style = 'style="position: absolute; right: 60px; top: 50%; transform: translateY(-50%); width: 110px; height: 110px; object-fit: contain; opacity: 0.95;"'
    new_style = 'style="position: absolute; right: -40px; bottom: -60px; width: 320px; height: 320px; object-fit: contain; opacity: 0.5;"'
    
    html = html.replace(old_style, new_style)
    
    # Just in case, if the replacement failed because of formatting:
    # use regex
    html = re.sub(
        r'style="position: absolute; right: 60px; top: 50%; transform: translateY\(-50%\); width: 110px; height: 110px; object-fit: contain; opacity: 0.95;"',
        new_style,
        html
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated {file_path}")
