const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  try {
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle0' });
    console.log("Page loaded");
  } catch (e) {
    console.log("Navigation error:", e);
  }
  
  await browser.close();
})();
