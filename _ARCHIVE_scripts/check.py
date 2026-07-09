with open('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'r', encoding='utf-8') as f:
    html = f.read()

defs = html.split('const SYMBOL_DEFS = {')[1].split('};')[0]
if '"' in defs:
    print("Found double quotes!")
else:
    print("No double quotes.")
