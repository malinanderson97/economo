import matplotlib.pyplot as plt

def plot_graph(nodes, edges, filename):
    fig, ax = plt.subplots(figsize=(8, 8))
    
    # Invert Y axis because SVG origin is top-left
    ax.invert_yaxis()
    
    for node in nodes:
        ax.plot(node['x'], node['y'], 'o', markersize=20, label=node['id'])
        ax.text(node['x'], node['y'], node['id'], ha='center', va='center', fontsize=8, color='white')
        
    for edge in edges:
        n1 = next(n for n in nodes if n['id'] == edge['from'])
        n2 = next(n for n in nodes if n['id'] == edge['to'])
        # Simple straight line for now, if curve is specified we can note it
        ax.annotate("",
                    xy=(n2['x'], n2['y']), xycoords='data',
                    xytext=(n1['x'], n1['y']), textcoords='data',
                    arrowprops=dict(arrowstyle="->", color="black",
                                    connectionstyle=f"arc3,rad={edge.get('curve', 0)*0.01}"))

    plt.title(filename)
    plt.savefig(f"C:/Users/Admin/.gemini/antigravity/brain/228bf523-1b4b-4950-a6b0-550465978438/{filename}.png")
    plt.close()

closed_nodes = [
  { 'id':'G',  'x':70,  'y':120 },
  { 'id':'T',  'x':70,  'y':210 },
  { 'id':'r',  'x':200, 'y':120 },
  { 'id':'pe', 'x':120, 'y':300 },
  { 'id':'Y',  'x':235, 'y':235 },
  { 'id':'Yn', 'x':235, 'y':360 },
  { 'id':'mz', 'x':110, 'y':420 },
  { 'id':'pi', 'x':360, 'y':330 },
  { 'id':'i',  'x':380, 'y':160 },
  { 'id':'MP', 'x':380, 'y':250 },
]

closed_edges = [
  { 'from':'G',  'to':'Y' },
  { 'from':'T',  'to':'Y' },
  { 'from':'r',  'to':'Y' },
  { 'from':'i',  'to':'r', 'curve':18 },
  { 'from':'pe', 'to':'r' },
  { 'from':'Y',  'to':'pi' },
  { 'from':'pe', 'to':'pi', 'curve':-30 },
  { 'from':'Yn', 'to':'pi' },
  { 'from':'mz', 'to':'Yn' },
  { 'from':'pi', 'to':'i', 'curve':28 },
  { 'from':'Y',  'to':'i', 'curve':40 },
  { 'from':'Y',  'to':'MP' },
  { 'from':'i',  'to':'MP' },
  { 'from':'Yn', 'to':'i', 'curve':-40 },
  { 'from':'mz', 'to':'pi', 'curve': 60 },
]

plot_graph(closed_nodes, closed_edges, 'closed_graph')

open_nodes = [
  { 'id':'G',   'x':55,  'y':140 },
  { 'id':'T',   'x':55,  'y':215 },
  { 'id':'Ys',  'x':55,  'y':290 },
  { 'id':'m1',  'x':55,  'y':365 },
  { 'id':'r',   'x':185, 'y':120 },
  { 'id':'pe',  'x':140, 'y':430 },
  { 'id':'Y',   'x':225, 'y':250 },
  { 'id':'Yn',  'x':215, 'y':385 },
  { 'id':'mz',  'x':100, 'y':480 },
  { 'id':'pi',  'x':225, 'y':490 },
  { 'id':'i',   'x':340, 'y':110 },
  { 'id':'eps', 'x':330, 'y':310 },
  { 'id':'E',   'x':380, 'y':200 },
  { 'id':'Ee',  'x':310, 'y':55 },
  { 'id':'is',  'x':430, 'y':110 },
  { 'id':'P',   'x':415, 'y':360 },
  { 'id':'Ps',  'x':305, 'y':395 },
]

open_edges = [
  { 'from':'G',  'to':'Y' },
  { 'from':'T',  'to':'Y' },
  { 'from':'r',  'to':'Y' },
  { 'from':'i',  'to':'r', 'curve':16 },
  { 'from':'pe', 'to':'r' },
  { 'from':'m1', 'to':'Y' },
  { 'from':'Ys', 'to':'Y' },
  { 'from':'eps','to':'Y' },
  { 'from':'Y',  'to':'pi' },
  { 'from':'pe', 'to':'pi', 'curve':-26 },
  { 'from':'Yn', 'to':'pi' },
  { 'from':'mz', 'to':'Yn' },
  { 'from':'pi', 'to':'i', 'curve':95 },
  { 'from':'Y',  'to':'i', 'curve':38 },
  { 'from':'Ee', 'to':'E' },
  { 'from':'i',  'to':'E' },
  { 'from':'is', 'to':'E' },
  { 'from':'E',  'to':'eps' },
  { 'from':'P',  'to':'eps' },
  { 'from':'Ps', 'to':'eps' },
  { 'from':'Yn', 'to':'i', 'curve':-40 },
  { 'from':'mz', 'to':'pi', 'curve': 60 },
]

plot_graph(open_nodes, open_edges, 'open_graph')
