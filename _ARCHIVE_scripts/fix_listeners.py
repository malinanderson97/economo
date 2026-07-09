import re

with open('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the mouseover listener
html = re.sub(
    r"document\.addEventListener\('mouseover', e => \{.*?return;\s*\}",
    """document.addEventListener('mouseover', e => {
      if (!document.body.classList.contains('help-mode')) return;
      const sym = e.target.closest('.sym');
      if (sym) {
        const pop = document.getElementById('svg-tooltip');
        if (!pop) return;
        
        // Use data-tooltip attribute. If not present, try finding inner sym-pop
        let tipText = sym.getAttribute('data-tooltip');
        if (!tipText) {
           const innerPop = sym.querySelector('.sym-pop');
           if (innerPop) tipText = innerPop.getAttribute('data-tooltip');
        }
        if (!tipText) return;
        
        pop.setAttribute('data-tooltip', tipText);
  
        const rect = sym.getBoundingClientRect();
        pop.style.display = 'block';
        const popRect = pop.getBoundingClientRect();
        
        let top = rect.bottom + 4;
        let left = rect.left;
        
        if (left + popRect.width > window.innerWidth) {
          left = window.innerWidth - popRect.width - 10;
        }
        if (top + popRect.height > window.innerHeight) {
          top = rect.top - popRect.height - 4;
        }
        
        pop.style.top = top + 'px';
        pop.style.left = Math.max(10, left) + 'px';
        return;
      }""",
    html,
    count=1,
    flags=re.DOTALL
)

# Replace the mouseout listener
html = re.sub(
    r"document\.addEventListener\('mouseout', e => \{.*?const pop = sym\.querySelector\('\.sym-pop'\);\s*if \(pop\) pop\.style\.display = 'none';\s*\}",
    """document.addEventListener('mouseout', e => {
      const sym = e.target.closest('.sym');
      if (sym) {
        if (e.relatedTarget && sym.contains(e.relatedTarget)) return;
        const pop = document.getElementById('svg-tooltip');
        if (pop) pop.style.display = 'none';
      }""",
    html,
    count=1,
    flags=re.DOTALL
)

with open('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated event listeners.")
