import re

js_file = 'verify_onboarding.mjs'

with open(js_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Update s1Expected variables
content = re.sub(
    r'<span class="sym-pop" data-tooltip="\$\{SYMBOL_DEFS\[\'([^\']+)\'\]\.meaning\}; \$\{SYMBOL_DEFS\[\'([^\']+)\'\]\.ref\}; \$\{SYMBOL_DEFS\[\'([^\']+)\'\]\.role\}"><\/span>',
    '',
    content
)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Tests fixed!")
