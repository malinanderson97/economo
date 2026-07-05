import re

with open('FINAL DOCUMENTATION/Instructor_Manual.html', 'r', encoding='utf-8') as f:
    im_html = f.read()

# Extract the header and head from Instructor Manual
head_start = im_html.find('<head>')
head_end = im_html.find('</head>') + 7
im_head = im_html[head_start:head_end]

header_start = im_html.find('<header>')
header_end = im_html.find('</header>') + 9
im_header = im_html[header_start:header_end]

# Customize the title and sub for the digraphs
im_head = re.sub(r'<title>.*?</title>', '<title>Economo — Model Directed Graphs</title>', im_head)
im_header = re.sub(r'<div class="doc-title">.*?</div>', '<div class="doc-title">Model Directed Graphs</div>', im_header)
im_header = re.sub(r'<div class="doc-sub">.*?</div>', '<div class="doc-sub">Variable dependencies read straight off the engine</div>', im_header)

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    dg_html = f.read()

# Replace <head>
dg_html = re.sub(r'<head>.*?</head>', im_head, dg_html, flags=re.DOTALL)

# Replace <header class="page">
dg_html = re.sub(r'<header class="page">.*?</header>', im_header, dg_html, flags=re.DOTALL)

# Let's preserve the custom SVG styles from digraphs by appending them to the <style> in im_head
svg_styles = """
  /* svg node + edge styling */
  figure{
    margin:0;background:var(--surface);border:1px solid var(--rule);border-radius:14px;
    overflow:hidden;box-shadow:var(--shadow-card);
  }
  figcaption{padding:14px 18px 4px}
  .fig-tag{
    font-family:var(--font-mono);
    font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-4);
  }
  .fig-title{font-size:18px;font-weight:600;margin:2px 0 0}
  .fig-sub{font-size:13px;color:var(--ink-2);margin:5px 0 0;line-height:1.45}
  svg.graph{display:block;width:100%;height:auto}
  .legend{
    display:flex;flex-wrap:wrap;gap:12px 18px;padding:10px 18px 18px;
    font-size:12px;color:var(--ink-2);border-top:1px solid var(--rule);margin-top:6px;
  }
  .legend span{display:inline-flex;align-items:center;gap:7px}
  .dot{width:13px;height:13px;border-radius:50%;border:1.5px solid}
  .dot.flow{background:#cfe6ef;border-color:#6aa6bd}
  .dot.exo{background:#dfeadb;border-color:#8bb389}
  .dot.pol{background:#e7d9b8;border-color:#c2a55e}
  .edge-key{width:20px;height:0;border-top:2px solid var(--ink)}
  .edge-key.fb{border-top:2px dashed var(--accent)}

  .node circle{stroke-width:1.6}
  .node.flow circle{fill:#cfe6ef;stroke:#6aa6bd}
  .node.exo  circle{fill:#dfeadb;stroke:#8bb389}
  .node.pol  circle{fill:#e7d9b8;stroke:#c2a55e}
  .node text{font-family:var(--font-ui);font-style:italic;
             font-size:15px;fill:var(--ink);text-anchor:middle;dominant-baseline:central}
  .edge{fill:none;stroke:var(--ink);stroke-width:1.5}
  .edge.fb{stroke:var(--accent);stroke-dasharray:5 4}
  .grid{display:grid;grid-template-columns:1fr;gap:26px;margin-top:28px}
  @media(min-width:880px){.grid{grid-template-columns:1fr 1fr}}
  .footnote{margin-top:30px;font-size:12.5px;color:var(--ink-3);line-height:1.5;max-width:70ch}
"""

dg_html = dg_html.replace('</style>', svg_styles + '\n</style>')

# Also, update the digraph edges in the JS section
# I'll update `closedEdges` to add the missing { from:'mz', to:'pi' } for the direct supply shock
# and { from:'Yn', to:'i', fb:true } for the gap in Taylor Rule.
closed_edges_old = "  { from:'Y',  to:'i', fb:true, curve:40 },"
closed_edges_new = "  { from:'Y',  to:'i', fb:true, curve:40 },\n  { from:'Yn', to:'i', fb:true, curve:-40 },\n  { from:'mz', to:'pi', curve: 60 },"
dg_html = dg_html.replace(closed_edges_old, closed_edges_new)

# Same for openEdges
open_edges_old = "  { from:'Y',  to:'i', fb:true, curve:38 },"
open_edges_new = "  { from:'Y',  to:'i', fb:true, curve:38 },\n  { from:'Yn', to:'i', fb:true, curve:-40 },\n  { from:'mz', to:'pi', curve: 60 },"
dg_html = dg_html.replace(open_edges_old, open_edges_new)

with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
    f.write(dg_html)

print("Updated model_digraphs.html")
