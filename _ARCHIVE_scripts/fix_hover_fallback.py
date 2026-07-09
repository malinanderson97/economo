import re

html_file = 'islm_pc_model_v19_Open_Economy_Complete_Demo.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

fallback_js = """
      const sym = e.target.closest('.sym');
      if (sym) {
        const pop = document.getElementById('svg-tooltip');
        if (!pop) return;
        
        let tipText = sym.getAttribute('data-tooltip');
        if (!tipText) {
           const innerPop = sym.querySelector('.sym-pop');
           if (innerPop) tipText = innerPop.getAttribute('data-tooltip');
        }
        if (!tipText) {
           // Fallback to text content
           const defs = typeof findSymbols === 'function' ? findSymbols(sym.textContent || '') : [];
           if (defs && defs.length > 0) {
              tipText = defs.map(f => f.def.meaning + '; ' + f.def.ref + '; ' + f.def.role).join(' | ');
           }
        }
        if (!tipText) return;
"""

html = re.sub(
    r"const sym = e\.target\.closest\('\.sym'\);\s*if \(sym\) \{\s*const pop = document\.getElementById\('svg-tooltip'\);\s*if \(!pop\) return;\s*let tipText = sym\.getAttribute\('data-tooltip'\);\s*if \(!tipText\) \{\s*const innerPop = sym\.querySelector\('\.sym-pop'\);\s*if \(innerPop\) tipText = innerPop\.getAttribute\('data-tooltip'\);\s*\}\s*if \(!tipText\) return;",
    fallback_js.strip(),
    html
)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Fallback added successfully!")
