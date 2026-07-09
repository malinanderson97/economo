import re

html_file = 'islm_pc_model_v19_Open_Economy_Complete_Demo.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace("SYMBOL_DEFS['E'e']", 'SYMBOL_DEFS["E\'e"]')
html = html.replace("SYMBOL_DEFS['Y'T']", 'SYMBOL_DEFS["Y\'T"]')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Syntax errors in findSymbols fixed!")
