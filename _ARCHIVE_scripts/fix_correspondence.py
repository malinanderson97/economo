import xml.etree.ElementTree as ET
import re

def parse_p(p, ns):
    style = "Normal"
    pPr = p.find('.//w:pPr', namespaces=ns)
    if pPr is not None:
        pStyle = pPr.find('.//w:pStyle', namespaces=ns)
        if pStyle is not None:
            style = pStyle.get('{' + ns['w'] + '}val')
            
    p_text = ""
    for t in p.findall('.//w:t', namespaces=ns):
        if t.text:
            p_text += t.text
            
    if p_text.strip() == "":
        return ""
        
    if style == "Heading1":
        return f"<h2>{p_text}</h2>"
    elif style == "Heading2":
        return f"<h3>{p_text}</h3>"
    elif style == "Heading3":
        return f"<h4>{p_text}</h4>"
    elif style == "ListParagraph":
        return f"<ul><li>{p_text}</li></ul>"
    else:
        return f"<p>{p_text}</p>"

def docx_to_html(xml_file):
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        html_content = []
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        body = root.find('.//w:body', namespaces=ns)
        
        skip_mode = False
        
        for elem in body:
            tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
            
            if tag == 'p':
                html_snippet = parse_p(elem, ns)
                if html_snippet:
                    # Check for sections to skip
                    # Sections 8 and 9 are "Implementation prompt" and "Roadmap"
                    if "<h2>8. Implementation prompt" in html_snippet or "<h2>9. Roadmap" in html_snippet:
                        skip_mode = True
                        
                    if not skip_mode:
                        html_content.append(html_snippet)
                    
            elif tag == 'tbl' and not skip_mode:
                html_content.append('<div style="overflow-x:auto;">')
                html_content.append('<table style="border-collapse: collapse; margin: 16px 0; width: 100%; text-align: left; border: 1px solid var(--rule);">')
                
                for tr in elem.findall('.//w:tr', namespaces=ns):
                    html_content.append('  <tr>')
                    for tc in tr.findall('.//w:tc', namespaces=ns):
                        tc_text = ""
                        for p in tc.findall('.//w:p', namespaces=ns):
                            p_text = ""
                            for t in p.findall('.//w:t', namespaces=ns):
                                if t.text:
                                    p_text += t.text
                            if p_text.strip():
                                tc_text += p_text + "<br>"
                        if tc_text.endswith("<br>"):
                            tc_text = tc_text[:-4]
                        
                        html_content.append(f'    <td style="border: 1px solid var(--rule); padding: 8px 12px;">{tc_text}</td>')
                    html_content.append('  </tr>')
                html_content.append('</table>')
                html_content.append('</div>')
                
        return '\n'.join(html_content)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    content = docx_to_html('unpacked_correspondence/word/document.xml')
    
    with open('FINAL DOCUMENTATION/Instructor_Manual.html', 'r', encoding='utf-8') as f:
        base_html = f.read()

    # Split precisely before <main>
    # In Instructor_Manual.html, it's just `<main>`
    header_part = base_html.split('<main>')[0]
    footer_part = base_html.split('</main>')[1]

    header_part = re.sub(r'<div class="doc-title">.*?</div>', '<div class="doc-title">Model Textbook Correspondence</div>', header_part)
    header_part = re.sub(r'<div class="doc-sub">.*?</div>', '<div class="doc-sub">Detailed mapping to Blanchard Macroeconomics (9th ed.)</div>', header_part)

    final_html = header_part + '<main>\n' + content + '\n</main>' + footer_part

    with open('FINAL DOCUMENTATION/Model_Textbook_Correspondence.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Fixed Model_Textbook_Correspondence.html")
