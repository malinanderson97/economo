import re

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the legends
# Replace ALL legends with the correct one
correct_legend = """
      <div class="legend">
        <span><i class="dot is"></i>IS Block (Goods)</span>
        <span><i class="dot mp"></i>LM/MP Block (Money)</span>
        <span><i class="dot pc"></i>PC Block (Inflation)</span>
        <span><i class="dot uip"></i>UIP Block (Exchange)</span>
        <span><i class="dot eps"></i>Real Exchange (ε)</span>
        <span><i class="edge-key"></i>causal link</span>
        <span><i class="edge-key fb"></i>policy feedback</span>
      </div>
"""

# Replace any block that looks like a legend with the correct one
html = re.sub(r'<div class="legend">.*?</div>', correct_legend, html, flags=re.DOTALL)

# Let's adjust the node layouts to prevent overlapping.
# CLOSED GRAPH
closed_nodes = """const closedNodes = [
  { id:'G',  label:'G',  x:60,  y:140, kind:'is' },
  { id:'T',  label:'T',  x:60,  y:220, kind:'is' },
  { id:'r',  label:'r',  x:200, y:120, kind:'is' },
  { id:'pe', label:'πᵉ', x:120, y:360, kind:'pc' },
  { id:'Y',  label:'Y',  x:240, y:220, kind:'is' },
  { id:'Yn', label:'Yₙ', x:340, y:280, kind:'pc' },
  { id:'mz', label:'m,z', x:440, y:340, kind:'pc' },
  { id:'pi', label:'π',  x:360, y:400, kind:'pc' },
  { id:'i',  label:'i',  x:380, y:160, kind:'mp' },
  { id:'MP', label:'M/P', x:320, y:80,  kind:'mp' },
];"""

closed_edges = """const closedEdges = [
  { from:'G',  to:'Y' },
  { from:'T',  to:'Y' },
  { from:'r',  to:'Y' },
  { from:'i',  to:'r', fb:true, curve:-20 },
  { from:'pe', to:'r' },
  { from:'Y',  to:'pi' },
  { from:'pe', to:'pi', curve:20 },
  { from:'Yn', to:'pi' },
  { from:'mz', to:'Yn' },
  { from:'pi', to:'i', fb:true, curve:-40 },
  { from:'Y',  to:'i', fb:true, curve:20 },
  { from:'Y',  to:'MP' },
  { from:'i',  to:'MP' },
  { from:'Yn', to:'i', fb:true, curve:20 },
  { from:'mz', to:'pi', curve: -20 },
];"""

html = re.sub(r'const closedNodes = \[.*?\];', closed_nodes, html, flags=re.DOTALL)
html = re.sub(r'const closedEdges = \[.*?\];', closed_edges, html, flags=re.DOTALL)

# OPEN GRAPH
open_nodes = """const openNodes = [
  { id:'G',   label:'G',   x:55,  y:120, kind:'is' },
  { id:'T',   label:'T',   x:55,  y:190, kind:'is' },
  { id:'Ys',  label:'Y*',  x:55,  y:260, kind:'is' },
  { id:'m1',  label:'m₁',  x:55,  y:330, kind:'is' },
  { id:'r',   label:'r',   x:185, y:100, kind:'is' },
  { id:'pe',  label:'πᵉ', x:120, y:430, kind:'pc' },
  { id:'Y',   label:'Y',   x:225, y:230, kind:'is' },
  { id:'Yn',  label:'Yₙ', x:340, y:350, kind:'pc' },
  { id:'mz',  label:'m,z', x:440, y:400, kind:'pc' },
  { id:'pi',  label:'π',   x:270, y:460, kind:'pc' },
  { id:'i',   label:'i',   x:360, y:120, kind:'mp' },
  { id:'eps', label:'ε',   x:330, y:250, kind:'eps' },
  { id:'E',   label:'E',   x:420, y:190, kind:'uip' },
  { id:'Ee',  label:'Eᵉ', x:350, y:50,  kind:'uip' },
  { id:'is',  label:'i*',  x:450, y:110, kind:'uip' },
  { id:'P',   label:'P',   x:420, y:280, kind:'uip' },
  { id:'Ps',  label:'P*',  x:330, y:320, kind:'uip' },
];"""

open_edges = """const openEdges = [
  { from:'G',  to:'Y' },
  { from:'T',  to:'Y' },
  { from:'r',  to:'Y' },
  { from:'i',  to:'r', fb:true, curve:-16 },
  { from:'pe', to:'r', curve:40 },
  { from:'m1', to:'Y' },
  { from:'Ys', to:'Y' },
  { from:'eps','to':'Y' },
  { from:'Y',  to:'pi' },
  { from:'pe', to:'pi', curve:26 },
  { from:'Yn', to:'pi' },
  { from:'mz', to:'Yn' },
  { from:'pi', to:'i', fb:true, curve:-80 },
  { from:'Y',  to:'i', fb:true, curve:20 },
  { from:'Ee', to:'E' },
  { 'from':'i',  'to':'E' },
  { 'from':'is', 'to':'E' },
  { 'from':'E',  'to':'eps' },
  { 'from':'P',  'to':'eps' },
  { 'from':'Ps', 'to':'eps' },
  { from:'Yn', to:'i', fb:true, curve:20 },
  { from:'mz', to:'pi', curve: -40 },
];"""

html = re.sub(r'const openNodes = \[.*?\];', open_nodes, html, flags=re.DOTALL)
html = re.sub(r'const openEdges = \[.*?\];', open_edges, html, flags=re.DOTALL)

with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Graph layout and legend fixed.")
