const request = require('supertest')
const app = require('../server')

describe('API basic', ()=>{
  it('GET / responds', async ()=>{
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
  })
})
const request = require('supertest');

const base = process.env.API_URL || 'http://localhost:5000/api';

describe('HouseHunt API smoke', ()=>{
  let email = `test+${Date.now()}@example.com`
  let token

  test('register and login', async ()=>{
    const r = await request(base).post('/auth/register').send({ name: 'T', email, password: 'password' })
    expect(r.status).toBe(201)
    const l = await request(base).post('/auth/login').send({ email, password: 'password' })
    expect(l.status).toBe(200)
    expect(l.body.token).toBeDefined()
    token = l.body.token
  })

  test('create property', async ()=>{
    const r = await request(base).post('/properties').set('Authorization', `Bearer ${token}`).field('title','t').field('price',100).field('location','x')
    expect([201,200]).toContain(r.status)
  })
})
