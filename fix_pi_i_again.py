import re

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change it to 140 so it bows a lot to the right and clears both eps and E.
new_html = html.replace("{ from:'pi', to:'i', fb:true, curve:120 }", "{ from:'pi', to:'i', fb:true, curve:140 }")
# Just in case they meant the Closed graph, wait "pi to i in closed graph" was mentioned previously!
# "move the line from i to pi right a bit so it doesnt go through e"
# "e" must mean E or eps in the OPEN graph, since closed graph doesn't have an 'e'.

with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
print("Adjusted to 140.")
