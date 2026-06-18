const puppeteer = require('puppeteer');
const id = process.argv[2]
if(!id){ console.error('Usage: node readPropImgSrc.js <propertyId>'); process.exit(2) }
;(async ()=>{
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`http://localhost:5173/properties/${id}`, { waitUntil: 'networkidle2' })
  const srcs = await page.evaluate(()=>{
    const imgs = Array.from(document.querySelectorAll('.carousel-item img'))
    return imgs.map(i=> ({ src: i.getAttribute('src'), alt: i.getAttribute('alt') }))
  })
  console.log(srcs)
  await browser.close()
})();
