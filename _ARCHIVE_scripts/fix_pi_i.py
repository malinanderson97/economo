import re

with open('FINAL DOCUMENTATION/model_digraphs.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We need to change { from:'pi', to:'i', fb:true, curve:60 } in the openEdges array to something else.
# Let's find the openEdges block
open_edges_match = re.search(r'(const openEdges = \[.*?\];)', html, flags=re.DOTALL)
if open_edges_match:
    open_edges = open_edges_match.group(1)
    
    # Change pi to i curve
    new_open_edges = open_edges.replace("{ from:'pi', to:'i', fb:true, curve:60 }", "{ from:'pi', to:'i', fb:true, curve:120 }")
    
    html = html.replace(open_edges, new_open_edges)
    
    with open('FINAL DOCUMENTATION/model_digraphs.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Curve adjusted.")
else:
    print("Block not found")
