const puppeteer = require('puppeteer');
const ids = process.argv.slice(2)
if(ids.length===0){ console.error('Usage: node screenshotMultiple.js <id1> <id2>...'); process.exit(2) }
;(async ()=>{
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  for(const id of ids){
    await page.goto(`http://localhost:5173/properties/${id}`, { waitUntil: 'networkidle2' })
    await page.screenshot({ path: `property-${id}.png`, fullPage: true })
    console.log('Saved screenshot property-'+id+'.png')
  }
  await browser.close()
})();
