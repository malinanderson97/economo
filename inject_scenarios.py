import os

file_path = 'unpacked_inst_man/word/document.xml'
with open(file_path, 'r', encoding='utf-8') as f:
    xml = f.read()

# The 3 missing scenarios to append:
scenarios = [
    ("3. Exchange-Rate Disinflation", " — Taylor OFF, expectations mostly anchored (θ=0.7). Cut the policy rate to 1%. UIP triggers a nominal depreciation; net exports surge and Y rises above Yₙ. Over time prices climb relative to foreign, the real exchange rate appreciates, and Y drifts back."),
    ("4. Twin Deficits & Real Appreciation", " — Taylor OFF, expectations mostly anchored (θ=0.7). A modest fiscal expansion (G raised from 20 to 22) with no monetary offset drives up domestic prices. The real exchange rate appreciates, crowding out net exports until Y returns to Yₙ and inflation returns to 2% — leaving ε permanently higher."),
    ("5. Global Rate Hike Spillover", " — Foreign rates jump to 6%. UIP wants a weaker domestic currency unless the CB matches the hike. With Taylor ON, the domestic rule sees the inflationary depreciation and hikes i. Because the rule anchors to the structurally computed neutral rate, the economy converges cleanly: i settles at the new world rate (6%).")
]

scenario_xml_template = """    <w:p>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:numPr>
          <w:ilvl w:val="0"/>
          <w:numId w:val="3"/>
        </w:numPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Hanken Grotesk" w:cs="Hanken Grotesk" w:eastAsia="Hanken Grotesk" w:hAnsi="Hanken Grotesk"/>
          <w:b/>
          <w:bCs/>
          <w:color w:val="0A2540"/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
        <w:t xml:space="preserve">{title}</w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Hanken Grotesk" w:cs="Hanken Grotesk" w:eastAsia="Hanken Grotesk" w:hAnsi="Hanken Grotesk"/>
          <w:color w:val="425466"/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
        <w:t xml:space="preserve">{desc}</w:t>
      </w:r>
    </w:p>
"""

new_xml_blocks = ""
for title, desc in scenarios:
    # Escape ampersands for XML
    title = title.replace('&', '&amp;')
    desc = desc.replace('&', '&amp;')
    new_xml_blocks += scenario_xml_template.format(title=title, desc=desc)

# We need to find the end of the 2b block.
# We know the text:
t_end_2b = '<w:t xml:space="preserve"> — the same shock with θ = 1; credibility holds πᵉ at target and the adjustment is far smoother. Central-bank credibility is itself a policy tool.</w:t>\n      </w:r>\n    </w:p>\n'
if t_end_2b in xml:
    xml = xml.replace(t_end_2b, t_end_2b + new_xml_blocks)
else:
    print("Could not find end of 2b block!")

# Also, we missed the desktop browser replacement earlier. Let's fix it by replacing the whole string.
t_browser_old = '<w:t xml:space="preserve">It runs in any browser with no install, no login, and no internet connection. Project it in a lecture, embed it in your VLE, or email the file to students.</w:t>'
t_browser_new = '<w:t xml:space="preserve">It runs in any desktop browser (the HTML isn\'t built for small mobile screens) with no install, no login, and no internet connection. Project it in a lecture, embed it in your VLE, or email the file to students.</w:t>'
xml = xml.replace(t_browser_old, t_browser_new)

# Help Mode insertion
t_help_mode = """    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading3"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Hanken Grotesk" w:cs="Hanken Grotesk" w:eastAsia="Hanken Grotesk" w:hAnsi="Hanken Grotesk"/>
          <w:b/>
          <w:bCs/>
          <w:color w:val="0A2540"/>
          <w:sz w:val="26"/>
          <w:szCs w:val="26"/>
        </w:rPr>
        <w:t>Help mode</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Hanken Grotesk" w:cs="Hanken Grotesk" w:eastAsia="Hanken Grotesk" w:hAnsi="Hanken Grotesk"/>
          <w:color w:val="425466"/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
        <w:t xml:space="preserve">Click the </w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Hanken Grotesk" w:cs="Hanken Grotesk" w:eastAsia="Hanken Grotesk" w:hAnsi="Hanken Grotesk"/>
          <w:b/>
          <w:bCs/>
          <w:color w:val="0A2540"/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
        <w:t>Help Mode</w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Hanken Grotesk" w:cs="Hanken Grotesk" w:eastAsia="Hanken Grotesk" w:hAnsi="Hanken Grotesk"/>
          <w:color w:val="425466"/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
        <w:t xml:space="preserve"> button at the bottom of the sidebar to toggle it on. When active, hovering over any symbol on the charts or equations will display its definition.</w:t>
      </w:r>
    </w:p>
"""
t_charts_heading = '<w:t xml:space="preserve">4. The three charts</w:t>'
# Find the exact <w:p> that contains the charts heading and insert the help mode before it.
import re
charts_regex = r'(<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading2"/>.*?' + re.escape(t_charts_heading) + r'.*?</w:p>)'
if re.search(charts_regex, xml, re.DOTALL):
    xml = re.sub(charts_regex, t_help_mode + r'\1', xml, flags=re.DOTALL)
else:
    print("Could not find charts heading for Help Mode")

# Change Six ready-to-run to Six preset
t_six_old = '<w:t xml:space="preserve">Three ready-to-run scenarios load a parameter set and a teaching narrative. Use them as lecture set-pieces or seminar prompts.</w:t>'
t_six_new = '<w:t xml:space="preserve">Six preset scenarios load a parameter set and a teaching narrative. Use them as lecture set-pieces or seminar prompts.</w:t>'
xml = xml.replace(t_six_old, t_six_new)

# Note: The πᵉ slider FAQ was never in unpacked_inst_man/word/document.xml because it was successfully deleted previously?
# Wait! In the previous session I didn't delete it! Let me check if it exists in unpacked_inst_man.
# Wait, I will just delete it if it's there.
faq_text = '<w:t xml:space="preserve">The πᵉ slider does nothing.</w:t>'
if faq_text in xml:
    print("FAQ found! Removing it.")
    faq_regex = r'<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading3"/>.*?' + re.escape(faq_text) + r'.*?</w:p>\s*<w:p>.*?</w:p>'
    xml = re.sub(faq_regex, '', xml, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(xml)

print("Scenarios and UI fixes injected into unpacked_inst_man!")
