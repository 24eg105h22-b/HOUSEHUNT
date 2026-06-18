import React, { useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function CreateProperty(){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const disabled = user && user.role === 'owner' && !user.verified

  const [files, setFiles] = useState(null)
  const [previews, setPreviews] = useState([])
  const submit = async (e)=>{
    e.preventDefault()
    if (disabled) return alert('Your owner account is pending admin verification.')
    try{
      let imageUrls = []
      if (files && files.length) {
        const form = new FormData()
        for (const f of files) form.append('images', f)
        const up = await API.post('/uploads/multipart', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        imageUrls = up.data.urls || []
      }

      await API.post('/properties', { title, description, price: Number(price), location, images: imageUrls })
      navigate('/')
    }catch(err){
      alert(err.response?.data?.message || 'Create failed')
    }
  }

  return (
    <div className="col-md-8 offset-md-2">
      <h3>Create Property</h3>
      {disabled && <div className="alert alert-warning">Your owner account is pending verification — you cannot create properties yet.</div>}
      <form onSubmit={submit} encType="multipart/form-data">
        <div className="mb-3"><label className="form-label">Title</label><input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} disabled={disabled} /></div>
        <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" value={description} onChange={e=>setDescription(e.target.value)} disabled={disabled} /></div>
        <div className="mb-3"><label className="form-label">Price (INR)</label><input className="form-control" value={price} onChange={e=>setPrice(e.target.value)} placeholder="e.g. 1200000" disabled={disabled} /></div>
        <div className="mb-3"><label className="form-label">Location</label><input className="form-control" value={location} onChange={e=>setLocation(e.target.value)} disabled={disabled} /></div>
        <div className="mb-3">
          <label className="form-label">Images</label>
          <input type="file" className="form-control" multiple onChange={e=>{ setFiles(e.target.files); const arr = Array.from(e.target.files||[]); setPreviews(arr.map(f=>URL.createObjectURL(f))); }} disabled={disabled} />
          <div className="mt-2 d-flex flex-wrap">
            {previews.map((p, i) => (
              <img key={i} src={p} alt={`preview-${i}`} style={{width:100, height:70, objectFit:'cover'}} className="me-2 mb-2 rounded" />
            ))}
          </div>
        </div>
        <button className="btn btn-primary" disabled={disabled}>Create</button>
      </form>
    </div>
  )
}
