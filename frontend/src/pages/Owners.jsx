import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Owners(){
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    API.get('/admin/users').then(r=>{
      setOwners((r.data||[]).filter(u=>u.role==='owner'))
    }).catch(()=>setOwners([])).finally(()=>setLoading(false))
  },[])

  const copyCreds = (email)=>{
    const text = `email: ${email}\npassword: password` // seeded password
    navigator.clipboard?.writeText(text).then(()=>alert('Credentials copied to clipboard'))
  }

  if(loading) return <div>Loading owners...</div>
  if(owners.length===0) return <div>No owners found</div>

  return (
    <div>
      <h3>Owners — Credentials (seeded)</h3>
      <p className="small text-muted">Seeded owner accounts use the default password <strong>password</strong>. Change before production.</p>
      <div className="list-group">
        {owners.map(o=> (
          <div key={o._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div><strong>{o.name}</strong> {o.verified? <span className="badge bg-success ms-2">verified</span> : <span className="badge bg-warning ms-2">unverified</span>}</div>
              <div className="small text-muted">{o.email} • id: {o._id}</div>
            </div>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>copyCreds(o.email)}>Copy creds</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
