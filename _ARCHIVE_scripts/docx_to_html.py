import xml.etree.ElementTree as ET
import re

def docx_to_html(xml_file):
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        html_content = []
        
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        for p in root.findall('.//w:p', namespaces=ns):
            # Check style
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
                    
            # Basic formatting translation
            if p_text.strip() == "":
                continue
                
            if style == "Heading1":
                html_content.append(f"<h2>{p_text}</h2>")
            elif style == "Heading2":
                html_content.append(f"<h3>{p_text}</h3>")
            elif style == "Heading3":
                html_content.append(f"<h4>{p_text}</h4>")
            elif style == "ListParagraph":
                html_content.append(f"<ul><li>{p_text}</li></ul>")
            else:
                html_content.append(f"<p>{p_text}</p>")
                
        return '\n'.join(html_content)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    content = docx_to_html('unpacked_correspondence/word/document.xml')
    
    # Extract base HTML structure from Instructor_Manual
    with open('FINAL DOCUMENTATION/Instructor_Manual.html', 'r', encoding='utf-8') as f:
        base_html = f.read()

    header_part = base_html.split('<main class="doc-content">')[0]
    footer_part = base_html.split('</main>')[1]

    # Adjust title and subtitle
    header_part = re.sub(r'<h1>.*?</h1>', '<h1>Model Textbook Correspondence</h1>', header_part)
    header_part = re.sub(r'<p class="subtitle">.*?</p>', '<p class="subtitle">Detailed mapping to Blanchard Macroeconomics (9th ed.)</p>', header_part)

    final_html = header_part + '<main class="doc-content">\n' + content + '\n</main>' + footer_part

    with open('FINAL DOCUMENTATION/Model_Textbook_Correspondence.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Created Model_Textbook_Correspondence.html")
