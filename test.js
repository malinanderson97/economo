const fs = require('fs');

const html = fs.readFileSync('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'utf8');

// extract SYMBOL_DEFS
let defsStr = html.split('const SYMBOL_DEFS = {')[1].split('};')[0];
let SYMBOL_DEFS;
eval('SYMBOL_DEFS = {' + defsStr + '};');

function wrapSymbols(htmlOrText) {
    if (!htmlOrText) return '';
    const sortedTokens = Object.keys(SYMBOL_DEFS).sort((a, b) => b.length - a.length);
    let parts = htmlOrText.split(/(<[^>]*>)/g);
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) continue; // skip tags
      let t = parts[i];
      for (let j = 0; j < sortedTokens.length; j++) {
        const token = sortedTokens[j];
        const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const isWord = /^[a-zA-Z0-9_]+$/.test(token[0]) && /^[a-zA-Z0-9_]+$/.test(token[token.length - 1]);
        const regex = isWord 
          ? new RegExp('\\b' + escaped + '\\b', 'g') 
          : new RegExp(escaped, 'g');
        t = t.replace(regex, '%%SYM' + j + '%%');
      }
      parts[i] = t;
    }
    let result = parts.join('');
    for (let j = 0; j < sortedTokens.length; j++) {
      const token = sortedTokens[j];
      const def = SYMBOL_DEFS[token];
      if (result.includes('%%SYM' + j + '%%')) {
        const tooltip = def.meaning + '; ' + def.ref + '; ' + def.role;
        result = result.split('%%SYM' + j + '%%').join('<span class="sym" data-sym="' + token + '" data-tooltip="' + tooltip + '">' + token + '</span>');
      }
    }
    return result;
}

let testStr = '<span class="t" style="color:#000">C</span>';
console.log(wrapSymbols(testStr));
let testStr2 = '<span class="eq-lbl">C</span>';
console.log(wrapSymbols(testStr2));
