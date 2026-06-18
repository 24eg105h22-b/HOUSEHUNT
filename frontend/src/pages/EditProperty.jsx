import React, { useEffect, useState } from 'react'
import API from '../api'
import { useParams, useNavigate } from 'react-router-dom'

export default function EditProperty(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')

  useEffect(()=>{
    API.get(`/properties/${id}`).then(r=>{
      const p = r.data
      setTitle(p.title||'')
      setDescription(p.description||'')
      setPrice(p.price||'')
      setLocation(p.location||'')
    }).catch(()=>{}).finally(()=>setLoading(false))
  },[id])

  const submit = async (e)=>{
    e.preventDefault()
    try{
      await API.put(`/properties/${id}`, { title, description, price: Number(price), location })
      navigate('/owner')
    }catch(err){ alert(err.response?.data?.message || 'Update failed') }
  }

  if(loading) return <div>Loading...</div>

  return (
    <div className="col-md-8 offset-md-2">
      <h3>Edit Property</h3>
      <form onSubmit={submit}>
        <div className="mb-3"><label className="form-label">Title</label><input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" value={description} onChange={e=>setDescription(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Price (INR)</label><input className="form-control" value={price} onChange={e=>setPrice(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Location</label><input className="form-control" value={location} onChange={e=>setLocation(e.target.value)} /></div>
        <button className="btn btn-primary">Save</button>
      </form>
    </div>
  )
}
