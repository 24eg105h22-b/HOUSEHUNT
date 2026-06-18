const http = require('http')

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/properties',
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}

const req = http.request(options, (res) => {
  let body = ''
  res.on('data', c=> body += c)
  res.on('end', ()=>{
    try{
      const list = JSON.parse(body)
      const p = list.find(x=> x.title && x.title.includes('City Center Studio'))
      console.log('Found:', !!p)
      if(p) console.log('Id:', p._id, '\nImages:', p.images)
    }catch(e){ console.error('Parse err', e, body) }
  })
})
req.on('error', e=> console.error('Request err', e))
req.end()
