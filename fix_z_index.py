import re

with open('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'r', encoding='utf-8') as f:
    html = f.read()

# find .sym-pop block
html = re.sub(
    r'(\.sym-pop\s*\{[^}]*?)(z-index:\s*\d+;)?([^}]*?\})', 
    r'\1 z-index: 9999; \3', 
    html, 
    flags=re.DOTALL
)

with open('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Regex replace complete.")
