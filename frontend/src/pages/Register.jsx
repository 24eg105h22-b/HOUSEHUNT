import React, { useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('renter')
  const navigate = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const res = await API.post('/auth/register', { name, email, password, role })
      console.log('register response', res.data)
      // server sets HttpOnly cookie; store user profile for UI
      localStorage.setItem('user', JSON.stringify(res.data.user))
      const userRole = res.data.user?.role
      if (userRole === 'owner') window.location.href = '/owner'
      else if (userRole === 'renter') window.location.href = '/renter'
      else if (userRole === 'admin') window.location.href = '/admin'
      else window.location.href = '/'
    }catch(err){
      console.error('register failed', err)
      // expose last register error for debugging (helps reproduce issues during development)
      try{ window.__lastRegisterError = err }catch(e){}
      alert(err.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div className="col-md-6 offset-md-3">
      <h3>Register</h3>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Register as</label>
          <select className="form-select" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="renter">Renter</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        {role === 'owner' && (
          <div className="alert alert-info">Owner accounts require admin verification before you can create or manage properties.</div>
        )}
        <button className="btn btn-primary">Register</button>
      </form>
    </div>
  )
}
