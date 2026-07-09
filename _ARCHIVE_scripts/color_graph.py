import re

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update CSS for new kinds
new_css = """
  .dot{width:13px;height:13px;border-radius:50%;border:1.5px solid}
  .dot.is{background:rgba(226,89,80,0.1);border-color:var(--curve-is)}
  .dot.mp{background:rgba(99,91,255,0.1);border-color:var(--curve-mp)}
  .dot.pc{background:rgba(224,64,142,0.1);border-color:var(--curve-pc)}
  .dot.uip{background:rgba(15,169,160,0.1);border-color:var(--curve-uip)}
  .dot.eps{background:rgba(245,166,35,0.1);border-color:var(--curve-eps)}
  .edge-key{width:20px;height:0;border-top:2px solid var(--ink)}
  .edge-key.fb{border-top:2px dashed var(--accent)}

  .node circle{stroke-width:1.6}
  .node.is circle{fill:rgba(226,89,80,0.1);stroke:var(--curve-is)}
  .node.mp circle{fill:rgba(99,91,255,0.1);stroke:var(--curve-mp)}
  .node.pc circle{fill:rgba(224,64,142,0.1);stroke:var(--curve-pc)}
  .node.uip circle{fill:rgba(15,169,160,0.1);stroke:var(--curve-uip)}
  .node.eps circle{fill:rgba(245,166,35,0.1);stroke:var(--curve-eps)}
  .node text{font-family:var(--font-brand);
             font-size:16px;fill:var(--ink);text-anchor:middle;dominant-baseline:central;font-weight:500;}
  .edge{fill:none;stroke:var(--ink);stroke-width:1.5}
  .edge.fb{stroke:var(--accent);stroke-dasharray:5 4}
"""

html = re.sub(r'\.dot\{width:13px.*?stroke-dasharray:5 4\}', new_css, html, flags=re.DOTALL)

# Update legends
new_legend_closed = """
      <div class="legend">
        <span><i class="dot is"></i>IS Block (Goods)</span>
        <span><i class="dot mp"></i>LM/MP Block (Money)</span>
        <span><i class="dot pc"></i>PC Block (Inflation)</span>
        <span><i class="edge-key"></i>causal link</span>
        <span><i class="edge-key fb"></i>policy feedback</span>
      </div>
"""
html = re.sub(r'<div class="legend">.*?</div>', new_legend_closed, html, count=1, flags=re.DOTALL)

new_legend_open = """
      <div class="legend">
        <span><i class="dot is"></i>IS Block</span>
        <span><i class="dot mp"></i>LM/MP Block</span>
        <span><i class="dot pc"></i>PC Block</span>
        <span><i class="dot uip"></i>UIP Block (Exchange)</span>
        <span><i class="dot eps"></i>Real Exchange (ε)</span>
        <span><i class="edge-key"></i>causal link</span>
        <span><i class="edge-key fb"></i>policy feedback</span>
      </div>
"""
html = re.sub(r'<div class="legend">.*?</div>', new_legend_open, html, count=1, flags=re.DOTALL)

# Update node definitions for Closed
html = html.replace("{ id:'G',  label:'G',  x:70,  y:120, kind:'exo' }", "{ id:'G',  label:'G',  x:70,  y:120, kind:'is' }")
html = html.replace("{ id:'T',  label:'T',  x:70,  y:210, kind:'exo' }", "{ id:'T',  label:'T',  x:70,  y:210, kind:'is' }")
html = html.replace("{ id:'r',  label:'r',  x:200, y:120, kind:'flow' }", "{ id:'r',  label:'r',  x:200, y:120, kind:'is' }")
html = html.replace("{ id:'pe', label:'π&#7497;', x:120, y:300, kind:'flow' }", "{ id:'pe', label:'π&#7497;', x:120, y:300, kind:'pc' }")
html = html.replace("{ id:'Y',  label:'Y',  x:235, y:235, kind:'flow' }", "{ id:'Y',  label:'Y',  x:235, y:235, kind:'is' }")
html = html.replace("{ id:'Yn', label:'Y&#8345;', x:235, y:360, kind:'flow' }", "{ id:'Yn', label:'Y&#8345;', x:235, y:360, kind:'pc' }")
html = html.replace("{ id:'mz', label:'m,z', x:110, y:420, kind:'exo' }", "{ id:'mz', label:'m,z', x:110, y:420, kind:'pc' }")
html = html.replace("{ id:'pi', label:'π',  x:360, y:330, kind:'flow' }", "{ id:'pi', label:'π',  x:360, y:330, kind:'pc' }")
html = html.replace("{ id:'i',  label:'i',  x:380, y:160, kind:'pol' }", "{ id:'i',  label:'i',  x:380, y:160, kind:'mp' }")
html = html.replace("{ id:'MP', label:'M/P', x:380, y:250, kind:'flow' }", "{ id:'MP', label:'M/P', x:380, y:250, kind:'mp' }")

# Update node definitions for Open
html = html.replace("{ id:'G',   label:'G',   x:55,  y:140, kind:'exo' }", "{ id:'G',   label:'G',   x:55,  y:140, kind:'is' }")
html = html.replace("{ id:'T',   label:'T',   x:55,  y:215, kind:'exo' }", "{ id:'T',   label:'T',   x:55,  y:215, kind:'is' }")
html = html.replace("{ id:'Ys',  label:'Y*',  x:55,  y:290, kind:'exo' }", "{ id:'Ys',  label:'Y*',  x:55,  y:290, kind:'is' }")
html = html.replace("{ id:'m1',  label:'m₁',  x:55,  y:365, kind:'exo' }", "{ id:'m1',  label:'m₁',  x:55,  y:365, kind:'is' }")
html = html.replace("{ id:'r',   label:'r',   x:185, y:120, kind:'flow' }", "{ id:'r',   label:'r',   x:185, y:120, kind:'is' }")
html = html.replace("{ id:'pe',  label:'π&#7497;', x:140, y:430, kind:'flow' }", "{ id:'pe',  label:'π&#7497;', x:140, y:430, kind:'pc' }")
html = html.replace("{ id:'Y',   label:'Y',   x:225, y:250, kind:'flow' }", "{ id:'Y',   label:'Y',   x:225, y:250, kind:'is' }")
html = html.replace("{ id:'Yn',  label:'Y&#8345;', x:215, y:385, kind:'flow' }", "{ id:'Yn',  label:'Y&#8345;', x:215, y:385, kind:'pc' }")
html = html.replace("{ id:'mz',  label:'m,z', x:100, y:480, kind:'exo' }", "{ id:'mz',  label:'m,z', x:100, y:480, kind:'pc' }")
html = html.replace("{ id:'pi',  label:'π',   x:225, y:490, kind:'flow' }", "{ id:'pi',  label:'π',   x:225, y:490, kind:'pc' }")
html = html.replace("{ id:'i',   label:'i',   x:340, y:110, kind:'pol' }", "{ id:'i',   label:'i',   x:340, y:110, kind:'mp' }")
html = html.replace("{ id:'eps', label:'ε',   x:330, y:310, kind:'flow' }", "{ id:'eps', label:'ε',   x:330, y:310, kind:'eps' }")
html = html.replace("{ id:'E',   label:'E',   x:380, y:200, kind:'flow' }", "{ id:'E',   label:'E',   x:380, y:200, kind:'uip' }")
html = html.replace("{ id:'Ee',  label:'E&#7497;', x:310, y:55, kind:'exo' }", "{ id:'Ee',  label:'E&#7497;', x:310, y:55, kind:'uip' }")
html = html.replace("{ id:'is',  label:'i*',  x:430, y:110, kind:'exo' }", "{ id:'is',  label:'i*',  x:430, y:110, kind:'uip' }")
html = html.replace("{ id:'P',   label:'P',   x:415, y:360, kind:'flow' }", "{ id:'P',   label:'P',   x:415, y:360, kind:'uip' }")
html = html.replace("{ id:'Ps',  label:'P*',  x:305, y:395, kind:'exo' }", "{ id:'Ps',  label:'P*',  x:305, y:395, kind:'uip' }")

with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Graph recolored successfully.")
