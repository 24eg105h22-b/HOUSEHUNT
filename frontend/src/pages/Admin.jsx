import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Admin(){
  const [props, setProps] = useState([])
  const [bookings, setBookings] = useState([])
  const [pendingOwners, setPendingOwners] = useState([])

  const fetchAll = async ()=>{
    try{
      const p = await API.get('/properties?approved=false')
      setProps(p.data)
      const b = await API.get('/bookings')
      setBookings(b.data)
      const u = await API.get('/admin/users')
      setPendingOwners(u.data.filter(x=> x.role==='owner' && !x.verified))
    }catch(err){}
  }

  useEffect(()=>{ fetchAll() }, [])

  const approveProp = async (id)=>{
    try{ await API.patch(`/properties/${id}/approve`); fetchAll() }catch(err){alert('Failed')}
  }

  const respondBooking = async (id, status)=>{
    try{ await API.patch(`/bookings/${id}`, { status }); fetchAll() }catch(err){alert('Failed')}
  }

  return (
    <div>
      <h3>Pending Owner Approvals</h3>
      <div className="mb-4">
        {pendingOwners.length===0 && <div>No pending owners</div>}
        {pendingOwners.map(u=> (
          <div key={u._id} className="card mb-2">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div><strong>{u.name}</strong></div>
                <div><small>{u.email}</small></div>
              </div>
              <div>
                <button className="btn btn-sm btn-success" onClick={async ()=>{ try{ await API.patch(`/admin/users/${u._id}/verify`, { verified: true }); fetchAll() }catch(e){alert('Failed')} }}>Approve</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h3>Admin — Pending Properties</h3>
      <div className="list-group mb-4">
        {props.map(p=> (
          <div key={p._id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img src={p.images && p.images.length ? p.images[0] : 'https://images.unsplash.com/photo-1560184897-6f10c01cf6b1?w=600&q=60&auto=format&fit=crop'} alt="thumb" style={{width:80,height:50,objectFit:'cover'}} className="me-3 rounded" />
                <div>
                  <h5 className="mb-0">{p.title}</h5>
                  <div className="small text-muted">{p.location} — {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.price)}</div>
                </div>
              </div>
              <div>
                <button className="btn btn-sm btn-primary" onClick={()=>approveProp(p._id)}>Approve</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3>Bookings</h3>
      <table className="table">
        <thead><tr><th>User</th><th>Property</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {bookings.map(b=> (
            <tr key={b._id}>
              <td>{b.user?.name}</td>
              <td>{b.property?.title}</td>
              <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
              <td>{b.status}</td>
              <td>
                {b.status==='pending' && (
                  <>
                    <button className="btn btn-sm btn-success me-1" onClick={()=>respondBooking(b._id,'approved')}>Approve</button>
                    <button className="btn btn-sm btn-danger" onClick={()=>respondBooking(b._id,'rejected')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
