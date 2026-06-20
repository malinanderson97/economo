import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('islm_pc_model_v19_Open_Economy_Complete_Demo.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Wait for initial render
setTimeout(() => {
  // Unlock everything
  window.setUnlocked(['GOODS', 'ISLM', 'UIP', 'PC', 'DEBT']);
  
  const mpHandle = document.querySelector('.handle[data-handle="mp"]');
  console.log("MP Handle outerHTML:", mpHandle.outerHTML);
  console.log("MP Handle classList:", [...mpHandle.classList]);
  
  // What is on top of it? In jsdom we can't easily do document.elementFromPoint,
  // but we can look at the svg children.
  const svg = document.getElementById('ismp');
  console.log("SVG children count:", svg.children.length);
  
  // Find the index of the MP handle
  const children = [...svg.children];
  const mpIndex = children.indexOf(mpHandle);
  console.log("MP Handle is at child index:", mpIndex);
  if (mpIndex < children.length - 1) {
    console.log("Elements after MP handle:", children.slice(mpIndex + 1).map(c => c.outerHTML));
  } else {
    console.log("MP handle is the LAST element in the SVG.");
  }

  // Is there any pointer-events issue?
  // Let's check the inline styles or classes of the MP handle.
  
}, 500);
