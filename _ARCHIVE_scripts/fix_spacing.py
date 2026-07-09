import re

html_file = 'islm_pc_model_v19_Open_Economy_Complete_Demo.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Add a non-breaking space before the info-icon span
html = html.replace(' <span class="info-icon"', '&nbsp;<span class="info-icon"')

# Add CSS for .info-icon if not already present
if '.info-icon {' not in html:
    css = "\n    .info-icon { margin-left: 2px; color: #4b5563; font-size: 0.95em; cursor: help; }\n"
    html = html.replace('</style>', css + '</style>')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Spacing fixed!")
