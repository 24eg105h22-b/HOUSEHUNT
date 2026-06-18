import React, { useEffect, useState } from 'react'
import API from '../api'
import { Link } from 'react-router-dom'

export default function OwnerDashboard(){
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [showBookings, setShowBookings] = useState(false)

  useEffect(()=>{
    setLoading(true)
    API.get('/properties/mine')
      .then(r=>setProps(r.data))
      .catch(()=>setProps([]))
      .finally(()=>setLoading(false))
    // load owner bookings
    API.get('/bookings/for-owner')
      .then(r=>setBookings(r.data))
      .catch(()=>setBookings([]))
  },[])

  const remove = async (id)=>{
    if(!confirm('Delete this property?')) return
    try{
      await API.delete(`/properties/${id}`)
      setProps(ps=>ps.filter(p=>p._id!==id))
    }catch(e){ alert('Delete failed') }
  }

  const handleBookingAction = async (id, status)=>{
    try{
      await API.patch(`/bookings/${id}`, { status })
      setBookings(bs=>bs.map(b=> b._id===id ? {...b, status} : b))
    }catch(e){ alert('Action failed') }
  }

  if(loading) return <div>Loading...</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Your Properties</h2>
        {user && user.role === 'owner' && !user.verified ? (
          <button className="btn btn-secondary" disabled title="Account pending verification by admin">Create Property (awaiting verification)</button>
        ) : (
          <Link className="btn btn-primary" to="/create">Create Property</Link>
        )}
      </div>
      {user && user.role === 'owner' && !user.verified && (
        <div className="alert alert-warning">Your owner account is pending admin verification. You cannot create or manage properties until approved.</div>
      )}
      <div className="mb-3">
        <button className="btn btn-outline-secondary me-2" onClick={()=>setShowBookings(s=>!s)}>{showBookings? 'Hide':'Show'} Bookings ({bookings.length})</button>
      </div>
      {showBookings && (
        <div className="mb-4">
          <h4>Bookings for your properties</h4>
          {bookings.length===0 && <div>No bookings</div>}
          {bookings.map(b=> (
            <div key={b._id} className="card mb-2">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div><strong>{b.property?.title}</strong></div>
                  <div><small>By: {b.user?.name} • {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</small></div>
                </div>
                <div>
                  <button className="btn btn-sm btn-success me-2" onClick={()=>handleBookingAction(b._id,'approved')}>Approve</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>handleBookingAction(b._id,'rejected')}>Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="row">
        {props.length===0 && <div className="col-12">No properties yet.</div>}
        {props.map(p=> (
          <div className="col-md-4" key={p._id}>
            <div className="card mb-3">
              <img src={p.images && p.images.length ? p.images[0] : '/uploads/modern-static.svg'} className="card-img-top" style={{height:180, objectFit:'cover'}} alt="prop" />
              <div className="card-body">
                <h5 className="card-title">{p.title}</h5>
                <p className="card-text text-truncate">{p.description}</p>
                <div className="d-flex justify-content-between">
                  <div>
                    <Link to={`/properties/${p._id}`} className="btn btn-sm btn-outline-primary me-2">View</Link>
                    <Link to={`/properties/${p._id}/edit`} className="btn btn-sm btn-secondary me-2">Edit</Link>
                    <button className="btn btn-sm btn-danger" onClick={()=>remove(p._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
