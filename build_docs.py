import base64
import re

# 1. Extract the base64 logo
with open('economo_logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')

logo_html = f'''<div class="logo-container" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <img src="data:image/png;base64,{b64_logo}" alt="Economo mole" style="width: 48px; height: 48px; object-fit: contain; display: block;">
      <div class="logo" style="margin-bottom: 0;">Economo</div>
    </div>'''

# 2. Modify existing HTMLs
def update_existing_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    if 'logo-container' not in html:
        # Replace <div class="logo">Economo</div> with the new logo_html
        html = re.sub(r'<div class="logo">Economo</div>', logo_html, html)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Updated {filepath}")
    else:
        print(f"Logo already in {filepath}")

update_existing_html('FINAL DOCUMENTATION/Instructor_Manual.html')
update_existing_html('FINAL DOCUMENTATION/Tool_Overview_OnePage.html')

# 3. Create the HTML for License Agreement
license_text = """
<h2 id="software-licence-agreement">Software Licence Agreement</h2>
<h3>IS-LM-PC Macroeconomics Teaching Tool</h3>
<p>This Agreement is made between [Your full name] (“the Licensor”) and the purchaser identified below (“the Licensee”).</p>
<p><strong>Licensee:</strong> [name / institution]&nbsp;&nbsp;&nbsp;&nbsp;<strong>Date:</strong> [____________]&nbsp;&nbsp;&nbsp;&nbsp;<strong>Fee:</strong> [£______]</p>

<h3>1. Grant of Licence</h3>
<p>On payment of the fee, the Licensor grants the Licensee a non-exclusive, non-transferable licence to use the Software for [delete as appropriate: a single named educator / all staff and students of one named institution] for educational and teaching purposes only. The scope of use is: [e.g. one named module / department-wide / institution-wide], for a period of [one year / perpetual].</p>

<h3>2. Permitted Use</h3>
<p>The Licensee may install and run the Software, and make it available to enrolled students for use within the licensed teaching context (including hosting on the institution’s secure virtual learning environment where access is restricted to enrolled students and staff).</p>

<h3>3. Restrictions</h3>
<p>The Licensee may NOT, without the Licensor’s prior written consent: (a) copy, redistribute, sell, sublicense, rent, or share the Software outside the licensed scope; (b) modify, adapt, or create derivative works from it; (c) reverse-engineer, decompile, or extract its source code, logic, or structure for reuse; (d) make it publicly accessible or available to anyone outside the licensed institution; or (e) remove or alter any copyright, ownership, or licence notice.</p>

<h3>4. Ownership</h3>
<p>The Software, including its source code, user interface, structure, and original implementation, remains the intellectual property of the Licensor at all times. This Agreement grants a licence to use only and transfers no ownership. The underlying economic model is drawn from published academic work (Blanchard, Macroeconomics, 9th ed.) and is not claimed as the Licensor’s property; this licence concerns the original software and its implementation.</p>

<h3>5. Fees and Refunds</h3>
<p>The licence fee is payable in full before access is granted. Refund terms: [state your policy, e.g. no refunds once access has been provided].</p>

<h3>6. Warranty and Liability</h3>
<p>The Software is provided “as is”, without warranty of any kind. The Licensor does not warrant that it is error-free or fit for any particular purpose. To the fullest extent permitted by law, the Licensor’s total liability under this Agreement shall not exceed the fee paid, and the Licensor shall not be liable for any indirect or consequential loss.</p>

<h3>7. Termination</h3>
<p>This licence terminates automatically if the Licensee breaches any term. On termination the Licensee must cease all use and delete all copies of the Software.</p>

<h3>8. Governing Law</h3>
<p>This Agreement is governed by the laws of [England and Wales].</p>

<br>
<p><strong>Signed:</strong></p>
<p>________________________  (Licensor) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ________________________  (Licensee)</p>

<p><em>This template is provided as a starting point and is not legal advice. Have it reviewed by an IP solicitor before commercial use, and confirm ownership rights (including any university or co-author claim) before signing.</em></p>
"""

# Extract base HTML structure from Instructor_Manual
with open('FINAL DOCUMENTATION/Instructor_Manual.html', 'r', encoding='utf-8') as f:
    base_html = f.read()

# We'll split the base_html at `<main class="doc-content">`
header_part = base_html.split('<main class="doc-content">')[0]
footer_part = base_html.split('</main>')[1]

# Now let's build the complete License HTML
license_html = header_part + '<main class="doc-content">\n' + license_text + '\n</main>' + footer_part

# Adjust the title and subtitle in the header
license_html = re.sub(r'<h1>.*?</h1>', '<h1>Software Licence Agreement</h1>', license_html)
license_html = re.sub(r'<p class="subtitle">.*?</p>', '<p class="subtitle">IS-LM-PC Macroeconomics Teaching Tool</p>', license_html)

with open('FINAL DOCUMENTATION/Software_Licence_Agreement.html', 'w', encoding='utf-8') as f:
    f.write(license_html)
print("Created Software_Licence_Agreement.html")
