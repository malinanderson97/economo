import re

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Shift Closed nodes left by 20
def shift_closed(match):
    x_val = int(match.group(1))
    return f"x:{x_val - 20}"

# Shift Open nodes left by 30
def shift_open(match):
    x_val = int(match.group(1))
    return f"x:{x_val - 30}"

# Find the blocks
closed_block_match = re.search(r'(const closedNodes = \[.*?\];)', html, flags=re.DOTALL)
open_block_match = re.search(r'(const openNodes = \[.*?\];)', html, flags=re.DOTALL)

if closed_block_match and open_block_match:
    closed_block = closed_block_match.group(1)
    open_block = open_block_match.group(1)
    
    new_closed_block = re.sub(r'x:(\d+)', shift_closed, closed_block)
    new_open_block = re.sub(r'x:(\d+)', shift_open, open_block)
    
    html = html.replace(closed_block, new_closed_block)
    html = html.replace(open_block, new_open_block)
    
    with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Shifted nodes successfully.")
else:
    print("Blocks not found")
