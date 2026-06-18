import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Bookings(){
  const [bookings, setBookings] = useState([])

  const fetch = ()=>{
    API.get('/bookings').then(r=>setBookings(r.data)).catch(()=>{})
  }

  useEffect(()=>{ fetch() }, [])

  const respond = async (id, status)=>{
    try{
      await API.patch(`/bookings/${id}`, { status })
      fetch()
    }catch(err){ alert(err.response?.data?.message || 'Action failed') }
  }

  return (
    <div>
      <h3>Your Bookings</h3>
      <table className="table">
        <thead><tr><th>Property</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {bookings.map(b=> (
            <tr key={b._id}>
              <td>{b.property?.title || '—'}</td>
              <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
              <td>{b.status}</td>
              <td>
                {b.status==='pending' && (
                  <>
                    <button className="btn btn-sm btn-success me-1" onClick={()=>respond(b._id,'approved')}>Approve</button>
                    <button className="btn btn-sm btn-danger" onClick={()=>respond(b._id,'rejected')}>Reject</button>
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
