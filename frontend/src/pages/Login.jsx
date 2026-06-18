import React, { useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const res = await API.post('/auth/login', { email, password })
      localStorage.setItem('user', JSON.stringify(res.data.user))
      const role = res.data.user?.role
      if (role === 'owner') window.location.href = '/owner'
      else if (role === 'renter') window.location.href = '/renter'
      else if (role === 'admin') window.location.href = '/admin'
      else window.location.href = '/'
    }catch(err){
      alert(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="col-md-6 offset-md-3">
      <h3>Login</h3>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary">Login</button>
      </form>
    </div>
  )
}
