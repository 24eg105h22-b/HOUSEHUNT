import React, { useEffect, useState } from 'react'
import API from '../api'
import { Link, useNavigate } from 'react-router-dom'

export default function RenterDashboard(){
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState([])
  const [filters, setFilters] = useState({ location:'', minPrice:'', maxPrice:'' })
  const navigate = useNavigate()

  useEffect(()=>{
    setLoading(true)
    API.get('/bookings')
      .then(r=>setBookings(r.data))
      .catch(()=>setBookings([]))
      .finally(()=>setLoading(false))
  },[])

  useEffect(()=>{ doSearch() }, [])

  const doSearch = ()=>{
    const q = []
    q.push('approved=true')
    if(filters.location) q.push(`location=${encodeURIComponent(filters.location)}`)
    if(filters.minPrice) q.push(`minPrice=${encodeURIComponent(filters.minPrice)}`)
    if(filters.maxPrice) q.push(`maxPrice=${encodeURIComponent(filters.maxPrice)}`)
    API.get('/properties?'+q.join('&'))
      .then(r=>{
        let list = r.data || []
        const min = filters.minPrice ? Number(filters.minPrice) : null
        const max = filters.maxPrice ? Number(filters.maxPrice) : null
        if (min !== null) list = list.filter(p=>Number(p.price) >= min)
        if (max !== null) list = list.filter(p=>Number(p.price) <= max)
        setProperties(list)
      })
      .catch(()=>setProperties([]))
  }

  const cancel = async (id)=>{
    if(!confirm('Cancel booking?')) return
    try{
      await API.delete(`/bookings/${id}`)
      setBookings(bs=>bs.filter(b=>b._id!==id))
    }catch(e){ alert('Cancel failed') }
  }

  if(loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Find Properties</h2>
      <div className="mb-3">
        <form onSubmit={e=>{ e.preventDefault(); doSearch(); }}>
          <div className="row g-2">
            <div className="col-md-4"><input className="form-control" placeholder="Location" value={filters.location} onChange={e=>setFilters(f=>({...f, location: e.target.value}))} /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Min Price" value={filters.minPrice} onChange={e=>setFilters(f=>({...f, minPrice: e.target.value}))} /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Max Price" value={filters.maxPrice} onChange={e=>setFilters(f=>({...f, maxPrice: e.target.value}))} /></div>
            <div className="col-md-2 d-flex">
              <button type="submit" className="btn btn-primary me-2 w-50">Search</button>
              <button type="button" className="btn btn-secondary w-50" onClick={()=>{ setFilters({location:'',minPrice:'',maxPrice:''}); setTimeout(doSearch, 0); }}>Clear</button>
            </div>
          </div>
        </form>
      </div>

      <div className="row mb-4">
        {properties.map((p, i)=> (
          <div className="col-md-4" key={p._id}>
            <div className="card mb-3">
              <img src={(p.images && p.images.length) ? p.images[0] : 'https://images.unsplash.com/photo-1560184897-6f10c01cf6b1?w=600&q=60&auto=format&fit=crop'} className="card-img-top" style={{height:160, objectFit:'cover'}} alt="prop" />
              <div className="card-body">
                <h5 className="card-title">{p.title}</h5>
                <div className="small text-muted">{p.location} — {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.price)}</div>
                <div className="mt-2 d-flex justify-content-end">
                  <Link to={`/properties/${p._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2>Your Bookings</h2>
      {bookings.length===0 && <div>No bookings</div>}
      {bookings.map(b=> (
        <div key={b._id} className="card mb-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div><strong>{b.property?.title}</strong></div>
              <div><small>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</small></div>
              <div><small>Status: {b.status}</small></div>
            </div>
            <div>
              <button className="btn btn-sm btn-danger" onClick={()=>cancel(b._id)}>Cancel</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
