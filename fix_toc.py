import re

with open('FINAL DOCUMENTATION/Model_Textbook_Correspondence.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Identify where <main> starts and find the content inside
main_start = html.find('<main>') + 6
main_end = html.find('</main>')

main_content = html[main_start:main_end]

# 2. The DOCX conversion generated a hardcoded "Contents" block.
# We need to strip it out. It starts with "<h2>Contents</h2>" or "<p>Contents</p>" or similar.
# Let's see what it exactly looks like.
# It should be everything from "Contents" until the first real <h2> which is "1. Scope and anchoring"
# Let's find the first <h2> that starts with a number.
h2_matches = list(re.finditer(r'<h2>(\d+)\.\s*(.*?)</h2>', main_content))

if h2_matches:
    first_h2_start = h2_matches[0].start()
    # Remove everything before the first <h2>, which is the hardcoded TOC
    main_content = main_content[first_h2_start:]

# 3. Add ids to all <h2> tags and collect them for the new TOC
toc_links = []
def replace_h2(match):
    num = match.group(1)
    title = match.group(2)
    # Generate a simple id
    tag_id = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    
    # Strip the leading number from the title for the TOC display,
    # because the CSS adds it automatically.
    toc_links.append(f'<li><a href="#{tag_id}">{title}</a></li>')
    
    # Return the <h2> with the id added, keeping the number in the actual heading
    return f'<h2 id="{tag_id}"><span class="num">{num}</span> {title}</h2>'

# Also strip the old "1. " from the <h2> output because we want to use <span class="num"> for styling
main_content = re.sub(r'<h2>(\d+)\.\s*(.*?)</h2>', replace_h2, main_content)

# 4. Construct the new TOC
toc_html = '''
  <div class="toc">
    <div class="eyebrow">Contents</div>
    <ol>
      ''' + '\n      '.join(toc_links) + '''
    </ol>
  </div>
'''

# 5. Prepend TOC to main content
main_content = '\n' + toc_html + '\n' + main_content

# 6. Reassemble the HTML
new_html = html[:main_start] + main_content + html[main_end:]

with open('FINAL DOCUMENTATION/Model_Textbook_Correspondence.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("TOC fixed.")
