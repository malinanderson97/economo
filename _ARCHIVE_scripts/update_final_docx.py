import re

# We will modify unpacked_inst_man/word/document.xml
file_path = 'unpacked_inst_man/word/document.xml'

with open(file_path, 'r', encoding='utf-8') as f:
    xml = f.read()

# 1. Update system name
xml = xml.replace('IS-LM-PC system', 'IS-LM-PC-UIP system')
xml = xml.replace('goods market through government debt', 'goods market through Phillips curve')

# 2. Update browser text
xml = re.sub(
    r'(<w:t[^>]*>)(It runs in any browser)(</w:t>)',
    r'\g<1>It runs in any desktop browser (the HTML isn\'t built for small mobile screens)\g<3>',
    xml
)

# 3. Sidebar grouping - this is a bit trickier, let's just replace the exact text in the tags.
xml = xml.replace('the main sliders: G, T, the policy rate i, the MPC c₁, and (once unlocked) the open-economy and Phillips-curve parameters.', 
                  'the main sliders: G, T, the policy rate i, and (once unlocked) the open-economy variables.')

xml = xml.replace('price-flexibility (medium-run speed), expectations anchoring (θ), and the Taylor rule.',
                  'price-flexibility (medium-run speed), expectations anchoring (θ), allow de-anchoring toggle, and the Taylor rule.')

xml = xml.replace('the cost-push slider and a one-click oil-shock button.',
                  'the structural markup, structural wage-push, and a transitory cost-push shock slider.')

# 4. Help mode section
help_mode_xml = """
    <w:p>
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
          <w:color w:val="425466"/>
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

# Insert help mode before `<w:p>...<w:t>Every slider has an editable value...` wait no, insert it before `<w:h2 id="charts">` or `The three charts`.
# Let's find "The three charts" heading and insert before it.
charts_heading_regex = r'(<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading2"/>.*?>The three charts</w:t>\s*</w:r>\s*</w:p>)'
xml = re.sub(charts_heading_regex, help_mode_xml + r'\1', xml)

# 5. Get the 6 scenarios from the unpacked_temp and replace the 3 scenarios in unpacked_inst_man
with open('unpacked_temp/word/document.xml', 'r', encoding='utf-8') as ft:
    xml_temp = ft.read()

# We need to extract the 6 scenarios from xml_temp.
# They start after "Six ready-to-run scenarios load a parameter set..."
# and end before "Teaching with Economo".
scenarios_pattern = r'(<w:p>\s*<w:pPr>\s*<w:pStyle w:val="ListParagraph"/>.*?)(<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading2"/>.*?>Teaching with Economo</w:t>\s*</w:r>\s*</w:p>)'
match_temp = re.search(scenarios_pattern, xml_temp, flags=re.DOTALL)
if match_temp:
    six_scenarios_xml = match_temp.group(1)
else:
    print("Could not find 6 scenarios in temp XML.")

# Now replace the 3 scenarios in the target XML
match_target = re.search(scenarios_pattern, xml, flags=re.DOTALL)
if match_target:
    xml = xml.replace(match_target.group(1), six_scenarios_xml)
else:
    print("Could not find 3 scenarios in target XML.")

# Replace "Three ready-to-run" with "Six preset"
xml = xml.replace('Three ready-to-run scenarios', 'Six preset scenarios')
xml = xml.replace('Six ready-to-run scenarios', 'Six preset scenarios')

# Update the texts for the 6 scenarios!
# The easiest way is to use regex to replace the text inside the <w:t> tags for each scenario.
xml = xml.replace('why φ &gt; 1 stabilises inflation and φ &lt; 1 lets it spiral.', 
                  'Taylor rule ON with φ = 1.5 and partially-anchored expectations (θ=0.25), so expectations can actually move. Apply the oil shock and step: with φ = 1.5 the bank responds more than one-for-one and inflation comes smoothly back to the 2% target within the medium run. Then—without resetting—lower φ to 0.5 and shock again. Now the bank is too passive: the rate is cut to the ZLB floor and pinned there for several periods, expectations de-anchor (watch the warning chip), and the return to target takes far longer and oscillates. The contrast between the two φ settings is the Taylor principle.')

xml = xml.replace('a persistent cost-push shock with low credibility; πᵉ drifts and the shock compounds.',
                  'Twin experiment, part 1 — identical to preset 2b in every field except θ. θ = 0.15: expectations are mostly adaptive. A transitory supply shock (z_pulse = +5%) hits: inflation spikes to 7% and πᵉ chases it upward. The central bank now fights a moving target: rates go higher for longer, inflation stays elevated for roughly twice as long as in 2b, and the cumulative output loss is about 1.5× larger.')

xml = xml.replace('the same shock with θ = 1; credibility holds πᵉ at target and the adjustment is far smoother. Run side-by-side with scenario 2a to show credibility as a policy tool.',
                  'Twin experiment, part 2 — identical to preset 2a in every field except θ. θ = 1: credibility is absolute and πᵉ stays nailed to 2% no matter what inflation does. The same +5% transitory supply shock produces a sharper but brief slump: one decisive hike, inflation is back near target within a couple of periods, and the episode is over by around t = 12. Central-bank credibility is itself a policy tool.')

xml = xml.replace('Run side-by-side with scenario 2.', 'Central-bank credibility is itself a policy tool.')

# wait, the original text for 3,4,5 in the XML:
xml = xml.replace('using the exchange-rate channel to bring inflation down.',
                  'Taylor OFF, expectations mostly anchored (θ=0.7). Cut the policy rate to 1%. UIP triggers a nominal depreciation; net exports surge and Y rises above Yₙ. Over time prices climb relative to foreign, the real exchange rate appreciates, and Y drifts back.')

xml = xml.replace('a fiscal expansion feeding the current account and the real exchange rate.',
                  'Taylor OFF, expectations mostly anchored (θ=0.7). A modest fiscal expansion (G raised from 20 to 22) with no monetary offset drives up domestic prices. The real exchange rate appreciates, crowding out net exports until Y returns to Yₙ and inflation returns to 2% — leaving ε permanently higher.')

xml = xml.replace('a rise in the foreign rate i* transmitting through UIP.',
                  'Foreign rates jump to 6%. UIP wants a weaker domestic currency unless the CB matches the hike. With Taylor ON, the domestic rule sees the inflationary depreciation and hikes i. Because the rule anchors to the structurally computed neutral rate, the economy converges cleanly: i settles at the new world rate (6%).')

# We need to change "The Taylor Principle" to "1. The Taylor Principle"
xml = xml.replace('<w:t xml:space="preserve">The Taylor Principle</w:t>', '<w:t xml:space="preserve">1. The Taylor Principle</w:t>')

# 6. Remove the FAQ
faq_pattern = r'<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading3"/>\s*</w:pPr>\s*<w:r>.*?<w:t>The πᵉ slider does nothing.</w:t>.*?</w:p>.*?<w:p>.*?</w:p>'
# Wait, "The πᵉ slider does nothing."
match_faq = re.search(faq_pattern, xml, flags=re.DOTALL)
if match_faq:
    xml = xml.replace(match_faq.group(0), '')
else:
    print("FAQ not found via regex, doing manual check")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(xml)

print("Finished updating document.xml")
