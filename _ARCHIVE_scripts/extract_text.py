import xml.etree.ElementTree as ET
import sys

def extract_text(xml_file):
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        text_content = []
        
        # Word namespaces
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        for p in root.findall('.//w:p', namespaces=ns):
            p_text = ""
            for t in p.findall('.//w:t', namespaces=ns):
                if t.text:
                    p_text += t.text
            if p_text:
                text_content.append(p_text)
                
        return '\n'.join(text_content)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    text = extract_text('unpacked_license/word/document.xml')
    with open('license_text.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Extracted license text.")
