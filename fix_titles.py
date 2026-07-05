import re

def update_title(filepath, new_title):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    html = re.sub(r'<title>.*?</title>', f'<title>{new_title}</title>', html)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated title for {filepath}")

update_title('FINAL DOCUMENTATION/Model_Textbook_Correspondence.html', 'Economo — Model Textbook Correspondence')
update_title('FINAL DOCUMENTATION/Software_Licence_Agreement.html', 'Economo — Software Licence Agreement')
