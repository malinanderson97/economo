import base64
import re

html_file = 'islm_pc_model_v19_Open_Economy_Complete_Demo.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

match = re.search(r'src="data:image/png;base64,([^"]+)" alt="Economo mole"', html_content)
if match:
    b64_data = match.group(1)
    image_data = base64.b64decode(b64_data)
    with open('economo_logo.png', 'wb') as img_file:
        img_file.write(image_data)
    print("Logo successfully extracted to economo_logo.png")
else:
    print("Could not find the logo base64 data.")
