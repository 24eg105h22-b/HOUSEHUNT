import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from '../api'

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1560184897-6f10c01cf6b1?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505691723518-36a0f2c0b4b8?w=1200&q=80&auto=format&fit=crop'
]

export default function PropertyDetails(){
  const { id } = useParams()
  const [prop, setProp] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(()=>{
    API.get(`/properties/${id}`)
      .then(r=>setProp(r.data))
      .catch(()=>{})
  },[id])

  const book = async (e)=>{
    e.preventDefault()
    try{
      await API.post('/bookings', { propertyId: id, startDate, endDate })
      alert('Booking requested')
    }catch(err){
      alert(err.response?.data?.message || 'Booking failed')
    }
  }

  if(!prop) return <div>Loading...</div>

  const images = prop.images && prop.images.length ? prop.images : [SAMPLE_IMAGES[0]]

  return (
    <div>
      <div className="row">
        <div className="col-md-8">
          <div id="propCarousel" className="carousel slide mb-3" data-bs-ride="carousel">
            <div className="carousel-inner">
              {images.map((img, idx) => (
                <div className={`carousel-item ${idx===0? 'active':''}`} key={idx}>
                  <img src={img} className="d-block w-100" style={{height:400, objectFit:'cover'}} alt={`img-${idx}`} />
                </div>
              ))}
            </div>
            {images.length>1 && (
              <> 
                <button className="carousel-control-prev" type="button" data-bs-target="#propCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#propCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>

          <h3>{prop.title}</h3>
          <p className="text-muted">{prop.location} • <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(prop.price)}</strong></p>
          <p>{prop.description}</p>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Request Booking</h5>
              <form onSubmit={book}>
                <div className="mb-2"><label className="form-label">Start</label><input type="date" className="form-control" value={startDate} onChange={e=>setStartDate(e.target.value)} required/></div>
                <div className="mb-2"><label className="form-label">End</label><input type="date" className="form-control" value={endDate} onChange={e=>setEndDate(e.target.value)} required/></div>
                <button className="btn btn-primary w-100">Request</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
