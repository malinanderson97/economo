import re

file_path = 'unpacked_temp/word/document.xml'
with open(file_path, 'r', encoding='utf-8') as f:
    xml = f.read()

# 1. System name & 2. stages count
xml = xml.replace('IS-LM-PC system — closed and open economy, goods market through government debt',
                  'IS-LM-PC-UIP system — closed and open economy, goods market through Phillips curve')
xml = xml.replace('The five teaching stages</w:t>', 'The four teaching stages</w:t>')

# 3. Browser text
xml = re.sub(
    r'(<w:t[^>]*>)(It runs in any browser)(</w:t>)',
    r'\g<1>It runs in any desktop browser (the HTML isn\'t built for small mobile screens)\g<3>',
    xml
)

# 4. Sidebar grouping
xml = xml.replace('the main sliders: G, T, the policy rate i, the MPC c₁, and (once unlocked) the open-economy and Phillips-curve parameters.', 
                  'the main sliders: G, T, the policy rate i, and (once unlocked) the open-economy variables.')

xml = xml.replace('price-flexibility (medium-run speed), expectations anchoring (θ), and the Taylor rule.',
                  'price-flexibility (medium-run speed), expectations anchoring (θ), allow de-anchoring toggle, and the Taylor rule.')

xml = xml.replace('the cost-push slider and a one-click oil-shock button.',
                  'the structural markup, structural wage-push, and a transitory cost-push shock slider.')

# 5. Insert Help Mode BEFORE The three charts
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
charts_heading_regex = r'(<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading2"/>.*?>The three charts</w:t>\s*</w:r>\s*</w:p>)'
xml = re.sub(charts_heading_regex, help_mode_xml + r'\1', xml)

# 6. Scenarios
xml = xml.replace('why φ &gt; 1 stabilises inflation and φ &lt; 1 lets it spiral.', 
                  'Taylor rule ON with φ = 1.5 and partially-anchored expectations (θ=0.25), so expectations can actually move. Apply the oil shock and step: with φ = 1.5 the bank responds more than one-for-one and inflation comes smoothly back to the 2% target within the medium run. Then—without resetting—lower φ to 0.5 and shock again. Now the bank is too passive: the rate is cut to the ZLB floor and pinned there for several periods, expectations de-anchor (watch the warning chip), and the return to target takes far longer and oscillates. The contrast between the two φ settings is the Taylor principle.')

xml = xml.replace('a persistent cost-push shock with low credibility; πᵉ drifts and the shock compounds.',
                  'Twin experiment, part 1 — identical to preset 2b in every field except θ. θ = 0.15: expectations are mostly adaptive. A transitory supply shock (z_pulse = +5%) hits: inflation spikes to 7% and πᵉ chases it upward. The central bank now fights a moving target: rates go higher for longer, inflation stays elevated for roughly twice as long as in 2b, and the cumulative output loss is about 1.5× larger.')

xml = xml.replace('the same shock with θ = 1; credibility holds πᵉ at target and the adjustment is far smoother. Run side-by-side with scenario 2.',
                  'Twin experiment, part 2 — identical to preset 2a in every field except θ. θ = 1: credibility is absolute and πᵉ stays nailed to 2% no matter what inflation does. The same +5% transitory supply shock produces a sharper but brief slump: one decisive hike, inflation is back near target within a couple of periods, and the episode is over by around t = 12. Central-bank credibility is itself a policy tool.')

xml = xml.replace('using the exchange-rate channel to bring inflation down.',
                  'Taylor OFF, expectations mostly anchored (θ=0.7). Cut the policy rate to 1%. UIP triggers a nominal depreciation; net exports surge and Y rises above Yₙ. Over time prices climb relative to foreign, the real exchange rate appreciates, and Y drifts back.')

xml = xml.replace('a fiscal expansion feeding the current account and the real exchange rate.',
                  'Taylor OFF, expectations mostly anchored (θ=0.7). A modest fiscal expansion (G raised from 20 to 22) with no monetary offset drives up domestic prices. The real exchange rate appreciates, crowding out net exports until Y returns to Yₙ and inflation returns to 2% — leaving ε permanently higher.')

xml = xml.replace('a rise in the foreign rate i* transmitting through UIP.',
                  'Foreign rates jump to 6%. UIP wants a weaker domestic currency unless the CB matches the hike. With Taylor ON, the domestic rule sees the inflationary depreciation and hikes i. Because the rule anchors to the structurally computed neutral rate, the economy converges cleanly: i settles at the new world rate (6%).')

xml = xml.replace('<w:t xml:space="preserve">The Taylor Principle</w:t>', '<w:t xml:space="preserve">1. The Taylor Principle</w:t>')
xml = xml.replace('<w:t xml:space="preserve">Exchange-Rate Disinflation</w:t>', '<w:t xml:space="preserve">3. Exchange-Rate Disinflation</w:t>')
xml = xml.replace('<w:t xml:space="preserve">Twin Deficits &amp; Real Appreciation</w:t>', '<w:t xml:space="preserve">4. Twin Deficits &amp; Real Appreciation</w:t>')
xml = xml.replace('<w:t xml:space="preserve">Global Rate Hike Spillover</w:t>', '<w:t xml:space="preserve">5. Global Rate Hike Spillover</w:t>')

# 7. Remove "A note on what changed"
note_pattern = r'<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading3"/>\s*</w:pPr>\s*<w:r>.*?<w:t xml:space="preserve">A NOTE ON WHAT CHANGED</w:t>.*?</w:p>.*?<w:p>.*?The un-unified v16.*?<w:t>.</w:t>\s*</w:r>\s*</w:p>'
match_note = re.search(note_pattern, xml, flags=re.DOTALL)
if match_note:
    xml = xml.replace(match_note.group(0), '')
else:
    print("Could not find A NOTE ON WHAT CHANGED")

# 8. Remove Debt row from the table
debt_row_pattern = r'<w:tr(?: [^>]+)?>\s*<w:tc(?: [^>]+)?>.*?<w:t xml:space="preserve">4</w:t>.*?<w:t xml:space="preserve">\+ Government Debt</w:t>.*?</w:tr>'
match_row = re.search(debt_row_pattern, xml, flags=re.DOTALL)
if match_row:
    xml = xml.replace(match_row.group(0), '')
else:
    print("Could not find Debt row")

# 9. Remove Debt blocks from charts and controls
debt_chart_pattern = r'<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading3"/>\s*</w:pPr>\s*<w:r>.*?<w:t xml:space="preserve">Government debt</w:t>.*?</w:p>.*?<w:p>\s*<w:r>.*?<w:t xml:space="preserve"> — a starting-debt slider and a trend-growth slider for debt-sustainability work.</w:t>\s*</w:r>\s*</w:p>'
match_chart = re.search(debt_chart_pattern, xml, flags=re.DOTALL)
if match_chart:
    xml = xml.replace(match_chart.group(0), '')
else:
    print("Could not find Debt chart block")

debt_control_pattern = r'<w:p>\s*<w:pPr>\s*<w:pStyle w:val="ListParagraph"/>.*?</w:pPr>\s*<w:r>.*?<w:t xml:space="preserve">Government debt</w:t>.*?</w:p>'
match_control = re.search(debt_control_pattern, xml, flags=re.DOTALL)
if match_control:
    xml = xml.replace(match_control.group(0), '')
else:
    print("Could not find Debt control block")

# 10. Remove FAQ "The πᵉ slider does nothing"
faq_pattern = r'<w:p>\s*<w:pPr>\s*<w:pStyle w:val="Heading3"/>\s*</w:pPr>\s*<w:r>.*?<w:t xml:space="preserve">The πᵉ slider does nothing.</w:t>.*?</w:p>\s*<w:p>\s*<w:r>.*?<w:t>That is correct before stage 2. Expected inflation has no effect until the Phillips curve unlocks — by design.</w:t>\s*</w:r>\s*</w:p>'
match_faq = re.search(faq_pattern, xml, flags=re.DOTALL)
if match_faq:
    xml = xml.replace(match_faq.group(0), '')
else:
    print("Could not find FAQ")

# Remove g enters the debt accounting
g_debt_pattern = r'<w:p>\s*<w:pPr>\s*<w:pStyle w:val="ListParagraph"/>.*?</w:pPr>\s*<w:r>.*?<w:t xml:space="preserve">g</w:t>.*?<w:t xml:space="preserve"> enters the debt accounting only.*?</w:p>'
match_g_debt = re.search(g_debt_pattern, xml, flags=re.DOTALL)
if match_g_debt:
    xml = xml.replace(match_g_debt.group(0), '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(xml)

print("Updated unpacked_temp/word/document.xml")
