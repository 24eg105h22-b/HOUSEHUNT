import React, { useEffect, useState } from 'react'
import API from '../api'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const SAMPLE_IMAGES = [
  '/uploads/modern-static.svg',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505691723518-36a0f2c0b4b8?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?w=1200&q=80&auto=format&fit=crop'
]

export default function Home(){
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [featured, setFeatured] = useState([])
  const [filters, setFilters] = useState({ location:'', minPrice:'', maxPrice:'' })
  const [lastSearchSummary, setLastSearchSummary] = useState(null)

  useEffect(()=>{
    API.get('/properties?approved=true&featured=true').then(r=>setFeatured(r.data)).catch(()=>setFeatured([]))
    doSearch()
  },[])

  React.useEffect(()=>{
    if (featured && featured.length) {
      console.log('Featured props:', featured)
      featured.forEach((p,i)=> console.log('featured image', i, p.images))
    }
  }, [featured])

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
        setLastSearchSummary({ count: list.length, min: filters.minPrice || null, max: filters.maxPrice || null })
        if (Array.isArray(list) && list.length === 1) {
          navigate(`/properties/${list[0]._id}`)
        }
      })
      .catch(()=>{})
  }

  return (
    <div>
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Properties</h2>
        {lastSearchSummary && (
          <div className="small text-muted">Showing {lastSearchSummary.count} properties {lastSearchSummary.min || lastSearchSummary.max ? `within ${lastSearchSummary.min || '0'} - ${lastSearchSummary.max || '∞'} INR` : ''}</div>
        )}
      </div>
      {featured && featured.length>0 && (
        <div className="mb-4">
          <h3>Featured</h3>
          <div className="row">
            {featured.map((p, i)=> (
              <div className="col-md-4" key={p._id}>
                <div className="card mb-4 shadow-sm">
                  <img src={(p.images && p.images.length && typeof p.images[0] === 'string' && (p.images[0].startsWith('http') || p.images[0].startsWith('/')) ) ? p.images[0] : SAMPLE_IMAGES[i % SAMPLE_IMAGES.length]} className="card-img-top" style={{height:200, objectFit:'cover'}} alt="featured" />
                  <div className="card-body">
                    <h5 className="card-title">{p.title}</h5>
                    <p className="card-text text-truncate">{p.description}</p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div>
                        <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.price)}</strong>
                        <div><small className="text-muted">{p.location}</small></div>
                      </div>
                      <Link to={`/properties/${p._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="row">
        {properties.map((p, index)=> (
          <div className="col-md-4" key={p._id}>
            <div className="card mb-4 shadow-sm">
              <img src={(p.images && p.images.length && typeof p.images[0] === 'string' && (p.images[0].startsWith('http') || p.images[0].startsWith('/')) ) ? p.images[0] : SAMPLE_IMAGES[index % SAMPLE_IMAGES.length]} className="card-img-top" style={{height:200, objectFit:'cover'}} alt="property" />
              <div className="card-body">
                <h5 className="card-title">{p.title}</h5>
                <p className="card-text text-truncate">{p.description}</p>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div>
                      <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.price)}</strong>
                      <div><small className="text-muted">{p.location}</small></div>
                    </div>
                  <Link to={`/properties/${p._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
