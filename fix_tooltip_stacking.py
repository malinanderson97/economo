import re

with open('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update annotateSymbols to not generate the inner .sym-pop
old_annotate = """      result = result.split('%%SYM' + j + '%%').join('<span class="sym" data-sym="' + token + '" data-tooltip="' + tooltip + '"><span class="sym-pop" data-tooltip="' + tooltip + '"></span>' + token + '</span>');"""
new_annotate = """      result = result.split('%%SYM' + j + '%%').join('<span class="sym" data-sym="' + token + '" data-tooltip="' + tooltip + '">' + token + '</span>');"""
html = html.replace(old_annotate, new_annotate)

# 2. Update mouseover logic for .sym
old_mouseover = """    document.addEventListener('mouseover', e => {
      if (!document.body.classList.contains('help-mode')) return;
      const sym = e.target.closest('.sym');
      if (sym) {
        const pop = sym.querySelector('.sym-pop');
        if (!pop) return;
  
        const rect = sym.getBoundingClientRect();
        pop.style.display = 'block';"""

new_mouseover = """    document.addEventListener('mouseover', e => {
      if (!document.body.classList.contains('help-mode')) return;
      const sym = e.target.closest('.sym');
      if (sym) {
        const pop = document.getElementById('svg-tooltip');
        if (!pop) return;
        pop.setAttribute('data-tooltip', sym.getAttribute('data-tooltip'));
  
        const rect = sym.getBoundingClientRect();
        pop.style.display = 'block';"""
html = html.replace(old_mouseover, new_mouseover)

# 3. Update mouseout logic for .sym
old_mouseout = """    document.addEventListener('mouseout', e => {
      const sym = e.target.closest('.sym');
      if (sym) {
        if (e.relatedTarget && sym.contains(e.relatedTarget)) return;
        const pop = sym.querySelector('.sym-pop');
        if (pop) pop.style.display = 'none';
      }"""

new_mouseout = """    document.addEventListener('mouseout', e => {
      const sym = e.target.closest('.sym');
      if (sym) {
        if (e.relatedTarget && sym.contains(e.relatedTarget)) return;
        const pop = document.getElementById('svg-tooltip');
        if (pop) pop.style.display = 'none';
      }"""
html = html.replace(old_mouseout, new_mouseout)

with open('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated stacking contexts!")
