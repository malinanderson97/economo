import re

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Colors update for IS and PC
# IS: rgba(226,89,80,0.1) -> rgba(226,89,80,0.05) (less opaque, distinct)
# PC: rgba(224,64,142,0.1) -> rgba(224,64,142,0.2) (more opaque pink)
html = html.replace("background:rgba(226,89,80,0.1)", "background:rgba(226,89,80,0.06)")
html = html.replace("fill:rgba(226,89,80,0.1)", "fill:rgba(226,89,80,0.06)")

html = html.replace("background:rgba(224,64,142,0.1)", "background:rgba(224,64,142,0.22)")
html = html.replace("fill:rgba(224,64,142,0.1)", "fill:rgba(224,64,142,0.22)")

# 2. Fix the titles
html = re.sub(r'<div class="fig-tag">v16 .*?</div>', '', html)
html = re.sub(r'<div class="fig-title">Closed IS-LM-PC</div>', '<div class="fig-title">IS-LM-PC</div>', html)

html = re.sub(r'<div class="fig-tag">v19 .*?</div>', '', html)
html = re.sub(r'<div class="fig-title">Open IS-MP-UIP-PC</div>', '<div class="fig-title">IS-LM-PC-UIP</div>', html)

# 3. Fix the crossings
# Closed graph fix:
# pi -> i went through Yn because curve:-40 went left. Change to curve:40
# Let's replace the whole closed_edges
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
  { from:'pi', to:'i', fb:true, curve:60 },
  { from:'Y',  to:'i', fb:true, curve:20 },
  { from:'Y',  to:'MP' },
  { from:'i',  to:'MP' },
  { from:'Yn', to:'i', fb:true, curve:-20 },
  { from:'mz', to:'pi', curve: -20 },
];"""
html = re.sub(r'const closedEdges = \[.*?\];', closed_edges, html, flags=re.DOTALL)

# Let's adjust Yn->i curve to -20 so it goes left of the straight line, since pi->i goes right.

# Open graph fix:
# Ps and Yn overlap.
# Let's replace openNodes and openEdges entirely.
open_nodes = """const openNodes = [
  { id:'G',   label:'G',   x:55,  y:120, kind:'is' },
  { id:'T',   label:'T',   x:55,  y:190, kind:'is' },
  { id:'Ys',  label:'Y*',  x:55,  y:260, kind:'is' },
  { id:'m1',  label:'m₁',  x:55,  y:330, kind:'is' },
  { id:'r',   label:'r',   x:185, y:100, kind:'is' },
  { id:'pe',  label:'πᵉ', x:120, y:430, kind:'pc' },
  { id:'Y',   label:'Y',   x:225, y:230, kind:'is' },
  { id:'Yn',  label:'Yₙ', x:270, y:360, kind:'pc' },
  { id:'mz',  label:'m,z', x:360, y:430, kind:'pc' },
  { id:'pi',  label:'π',   x:220, y:480, kind:'pc' },
  { id:'i',   label:'i',   x:360, y:120, kind:'mp' },
  { id:'eps', label:'ε',   x:330, y:250, kind:'eps' },
  { id:'E',   label:'E',   x:420, y:190, kind:'uip' },
  { id:'Ee',  label:'Eᵉ', x:350, y:50,  kind:'uip' },
  { id:'is',  label:'i*',  x:450, y:110, kind:'uip' },
  { id:'P',   label:'P',   x:420, y:280, kind:'uip' },
  { id:'Ps',  label:'P*',  x:420, y:350, kind:'uip' },
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
  { from:'Yn', to:'pi', curve:-30 },
  { from:'mz', to:'Yn' },
  { from:'pi', to:'i', fb:true, curve:60 },
  { from:'Y',  to:'i', fb:true, curve:-40 },
  { from:'Ee', to:'E' },
  { 'from':'i',  'to':'E' },
  { 'from':'is', 'to':'E' },
  { 'from':'E',  'to':'eps' },
  { 'from':'P',  'to':'eps' },
  { 'from':'Ps', 'to':'eps' },
  { from:'Yn', to:'i', fb:true, curve:-40 },
  { from:'mz', to:'pi', curve: 30 },
];"""

html = re.sub(r'const openNodes = \[.*?\];', open_nodes, html, flags=re.DOTALL)
html = re.sub(r'const openEdges = \[.*?\];', open_edges, html, flags=re.DOTALL)

with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Graph layout fixed.")
