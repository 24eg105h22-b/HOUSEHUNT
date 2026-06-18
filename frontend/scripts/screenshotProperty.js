const puppeteer = require('puppeteer');
const id = process.argv[2]
if(!id){ console.error('Usage: node screenshotProperty.js <propertyId>'); process.exit(2) }
;(async ()=>{
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`http://localhost:5173/properties/${id}`, { waitUntil: 'networkidle2' })
  await page.screenshot({ path: `property-${id}.png`, fullPage: true })
  console.log('Saved screenshot property-'+id+'.png')
  await browser.close()
})();
