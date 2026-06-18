import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Notifications(){
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    API.get('/notifications').then(r=>setNotes(r.data)).catch(()=>setNotes([])).finally(()=>setLoading(false))
  },[])

  const markRead = async (id)=>{
    try{ await API.post(`/notifications/${id}/read`); setNotes(ns=>ns.map(n=> n._id===id?{...n, read:true}:n)) }catch(e){}
  }

  if(loading) return <div>Loading...</div>
  if(notes.length===0) return <div>No notifications</div>
  return (
    <div>
      <h3>Notifications</h3>
      {notes.map(n=> (
        <div key={n._id} className={`card mb-2 ${n.read? 'border-secondary':''}`}>
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div>{n.message}</div>
              <div><small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small></div>
            </div>
            {!n.read && <button className="btn btn-sm btn-primary" onClick={()=>markRead(n._id)}>Mark read</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
