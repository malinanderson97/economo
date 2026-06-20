import fs from 'fs';

const html = fs.readFileSync('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'utf8');

// Let's just find the exact order of elements in drawISMP by simulating it.
// We can see from the source:
console.log("Source snippet for IS curve drawing:");
const drawLineIdx = html.indexOf("drawLine(svg, isPts, o, 'curve-is');");
console.log(html.substring(drawLineIdx - 50, drawLineIdx + 50));

const isHandleIdx = html.indexOf("'data-handle': 'is'");
const mpHandleIdx = html.indexOf("'data-handle': 'mp'");

console.log("IS curve at idx:", drawLineIdx);
console.log("IS handle at idx:", isHandleIdx);
console.log("MP handle at idx:", mpHandleIdx);
console.log("Order is correct?", drawLineIdx < isHandleIdx && isHandleIdx < mpHandleIdx);

// Now let's check renderTutorial taylor_on logic
const taylorLogicIdx = html.indexOf("if (state.taylor_on) {");
console.log("\nTaylor logic:");
console.log(html.substring(taylorLogicIdx, taylorLogicIdx + 150));
