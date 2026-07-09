import re

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Shift Open nodes right by 8 to center them perfectly
def shift_open_right(match):
    x_val = int(match.group(1))
    return f"x:{x_val + 8}"

open_block_match = re.search(r'(const openNodes = \[.*?\];)', html, flags=re.DOTALL)

if open_block_match:
    open_block = open_block_match.group(1)
    new_open_block = re.sub(r'x:(\d+)', shift_open_right, open_block)
    
    html = html.replace(open_block, new_open_block)
    
    with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Shifted open nodes right by 8.")
else:
    print("Block not found")
