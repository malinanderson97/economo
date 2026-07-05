const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fileUrl = 'file://' + path.resolve('islm_pc_model_v19_Open_Economy_Complete_Demo.html');
  await page.goto(fileUrl);
  
  await page.evaluate(() => {
    document.body.classList.add('help-mode');
  });

  const symbols = await page.$$('.sym');
  let missing = 0;
  let invisible = 0;
  let total = symbols.length;
  
  for (const sym of symbols) {
      await sym.hover();
      // wait a tiny bit for the mouseover event to fire
      await page.waitForTimeout(50);
      
      const popDisplay = await page.evaluate(() => {
          const pop = document.getElementById('svg-tooltip');
          if (!pop) return 'no element';
          return window.getComputedStyle(pop).display;
      });
      
      if (popDisplay !== 'block') {
          invisible++;
          const text = await sym.textContent();
          console.log(`Tooltip not visible for: ${text} (display: ${popDisplay})`);
      }
  }
  
  console.log(`${invisible} out of ${total} tooltips failed to display on hover.`);
  await browser.close();
})();
