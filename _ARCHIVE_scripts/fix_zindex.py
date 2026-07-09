import re

html_file = 'islm_pc_model_v19_Open_Economy_Complete_Demo.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix connector overlay z-index
html = html.replace(
    '#connector-overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: visible; }',
    '#connector-overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5; overflow: visible; }'
)

# Add z-index to #svg-tooltip
if '#svg-tooltip { z-index: 2147483647 !important;' not in html:
    html = html.replace(
        '#svg-tooltip { display: none; }',
        '#svg-tooltip { display: none; z-index: 2147483647 !important; }'
    )

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Z-indexes updated successfully!")
