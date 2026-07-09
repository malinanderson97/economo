import re

html_file = 'islm_pc_model_v19_Open_Economy_Complete_Demo.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace all occurrences of ℹ with ⓘ
html = html.replace('ℹ', 'ⓘ')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Icons replaced!")
