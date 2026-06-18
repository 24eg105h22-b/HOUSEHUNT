const puppeteer = require('puppeteer');

(async ()=>{
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'], headless: true, timeout: 0 });
  const page = await browser.newPage();
  // raise default timeouts to avoid intermittent protocol timeouts
  page.setDefaultTimeout(30000)
  page.setDefaultNavigationTimeout(30000)
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('dialog', async d => { console.log('DIALOG:', d.message()); try{ await d.dismiss() }catch(e){} })
  try{
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
  }catch(err){
    console.error('Navigation error', err); await browser.close(); process.exit(2);
  }

  // Fill the form - select inputs by order (name, email, password)
  const inputs = await page.$$('form input')
  if(inputs && inputs.length >= 3){
    await inputs[0].type('Headless Tester').catch(()=>{})
    await inputs[1].type(`headless+${Date.now()}@example.com`).catch(()=>{})
    // find password input among them
    const pwd = inputs.find(i=> i._remoteObject && i._remoteObject.description && i._remoteObject.description.includes('password'))
    if(pwd){ await pwd.type('password').catch(()=>{}) } else { await inputs[2].type('password').catch(()=>{}) }
  }else{
    // fallback: try common selectors
    await page.type('input[type="text"]', 'Headless Tester').catch(()=>{})
    await page.type('input[type="email"]', `headless+${Date.now()}@example.com`).catch(()=>{})
    await page.type('input[type="password"]', 'password').catch(()=>{})
  }
  // submit the form via JS (handles buttons without explicit type)
  await page.evaluate(()=>{
    const f = document.querySelector('form')
    if(f) f.requestSubmit ? f.requestSubmit() : f.submit()
  })
  try{
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
  }catch(e){}

  console.log('URL after submit:', page.url());

  // wait briefly for any client-side error capture, then read it (with retries)
  await new Promise(r => setTimeout(r, 500))
  let lastErr = null
  for (let i = 0; i < 3; i++){
    try{
      lastErr = await page.evaluate(() => {
        try{
          const e = window.__lastRegisterError
          if(!e) return null
          if (typeof e === 'string') return e
          if (e && e.message) return e.message
          try{ return JSON.stringify(e) }catch(ex){ return String(e) }
        }catch(ex){ return String(ex) }
      })
      break
    }catch(e){
      console.warn('evaluate attempt failed, retrying', e.message || e)
      await new Promise(r => setTimeout(r, 500))
    }
  }
  console.log('window.__lastRegisterError:', lastErr);

  await browser.close();
})();
