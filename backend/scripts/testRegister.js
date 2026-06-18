const http = require('http')

const data = JSON.stringify({ name: 'CI Test', email: `ci+${Date.now()}@example.com`, password: 'password' })

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode)
  let body = ''
  res.on('data', (chunk) => body += chunk)
  res.on('end', () => console.log('Body:', body))
})

req.on('error', (e) => console.error('Request error', e))
req.write(data)
req.end()
