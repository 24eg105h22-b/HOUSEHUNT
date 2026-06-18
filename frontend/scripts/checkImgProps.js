const puppeteer = require('puppeteer');
const id = process.argv[2]
;(async ()=>{
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`http://localhost:5173/properties/${id}`, { waitUntil: 'networkidle2' })
  const info = await page.evaluate(()=>{
    const img = document.querySelector('.carousel-item img')
    if(!img) return null
    return {
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
      styleHeight: img.style.height
    }
  })
  console.log(info)
  await browser.close()
})();
