const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fileUrl = 'file://' + path.resolve('islm_pc_model_v19_Open_Economy_Complete_Demo.html');
  await page.goto(fileUrl);
  
  // Turn on help mode
  await page.evaluate(() => {
    document.body.classList.add('help-mode');
  });

  const symbols = await page.$$('.sym');
  let missing = 0;
  let total = symbols.length;
  console.log(`Found ${total} .sym elements.`);
  
  for (const sym of symbols) {
      const tip = await sym.getAttribute('data-tooltip');
      const innerPop = await sym.$('.sym-pop');
      if (!tip && !innerPop) {
          missing++;
          const text = await sym.textContent();
          console.log(`Missing tooltip for: ${text}`);
      }
  }
  
  console.log(`${missing} out of ${total} are missing tooltips.`);
  await browser.close();
})();
