const base = process.env.API_URL || 'http://localhost:5000/api'

async function req(path, opts={}){
  const res = await fetch(base+path, opts)
  const text = await res.text()
  let body = text
  try{ body = JSON.parse(text) }catch(e){}
  console.log(path, res.status, body)
  return { status: res.status, body }
}

async function run(){
  const email = `testuser+${Date.now()}@example.com`
  await req('/auth/register', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ name: 'Test User', email, password: 'password' }) })
  const login = await req('/auth/login', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password: 'password' }) })
  const token = login.body?.token
  if(!token){ console.error('Login failed, abort'); process.exit(1) }

  const prop = await req('/properties', { method: 'POST', headers: {'content-type':'application/json', 'authorization': `Bearer ${token}`}, body: JSON.stringify({ title: 'Test Home', description: 'Nice place', price: 1000, location: 'Test City' }) })
  const propId = prop.body?._id

  await req('/properties')

  const start = new Date();
  const end = new Date(Date.now() + 1000*60*60*24*7)
  await req('/bookings', { method: 'POST', headers: {'content-type':'application/json', 'authorization': `Bearer ${token}`}, body: JSON.stringify({ propertyId: propId, startDate: start.toISOString(), endDate: end.toISOString() }) })

  await req('/bookings', { headers: { authorization: `Bearer ${token}` } })
}

run().catch(e=>{ console.error(e); process.exit(1) })
