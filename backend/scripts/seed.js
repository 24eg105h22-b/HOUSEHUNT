const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const fs = require('fs')
const User = require('../models/User')
const Property = require('../models/Property')
const Booking = require('../models/Booking')

async function seed(){
  await connectDB()
  await User.deleteMany({})
  await Property.deleteMany({})
  await Booking.deleteMany({})

  
  const owners = []
  for (let i = 1; i <= 8; i++) {
    // make a couple of owners unverified so admin has pending owner approvals to review
    const verified = i <= 6
    const o = await User.create({ name: `Owner ${i}`, email: `owner${i}@example.com`, password: 'password', role: 'owner', verified })
    owners.push(o)
  }
  const renter = await User.create({ name: 'Renter One', email: 'renter@example.com', password: 'password', role: 'renter' })
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin' })

  const sampleImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?w=1200&q=80&auto=format&fit=crop'
  ]

  
  const uploadsDir = path.join(__dirname, '..', 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const staticModern = path.join(uploadsDir, 'modern-static.svg')
  const modernUrl = 'https://images.unsplash.com/photo-1560184897-6f10c01cf6b1?w=1400&q=80&auto=format&fit=crop'

  let modernImageRef = modernUrl
  if (fs.existsSync(staticModern)) {
    modernImageRef = '/uploads/modern-static.svg'
  } else {
    const modernFilename = `modern-${Date.now()}.jpg`
    const modernPath = path.join(uploadsDir, modernFilename)
    async function downloadImage(url, dest){
      const https = require('https')
      return new Promise((resolve, reject)=>{
        const file = fs.createWriteStream(dest)
        https.get(url, (res)=>{
          if(res.statusCode !== 200){ file.close(); try{ fs.unlinkSync(dest) }catch(e){}; return reject(new Error('Failed to download')) }
          res.pipe(file)
          file.on('finish', ()=>{ file.close(); resolve() })
        }).on('error', (err)=>{ try{ fs.unlinkSync(dest) }catch(e){}; reject(err) })
      })
    }
    try{ await downloadImage(modernUrl, modernPath); modernImageRef = `/uploads/${modernFilename}` }catch(e){ }
  }
  const propertiesData = [
    { title: 'Modern Apartment', description: 'Bright modern apartment in city center', price: 1200000, location: 'Mumbai', images: [modernImageRef] },
    { title: 'Cozy Cottage', description: 'Quiet cottage near countryside', price: 800000, location: 'Rishikesh', images: [sampleImages[1], sampleImages[3]] },
    { title: 'Beach House', description: 'Sea-facing house with private beach access', price: 2500000, location: 'Goa', images: [sampleImages[4], sampleImages[0]] },
    { title: 'Heritage Haveli', description: 'Traditional haveli with ornate architecture', price: 1800000, location: 'Jaipur', images: [sampleImages[5]] },
    { title: 'Tech City Flat', description: 'Comfortable flat near business district', price: 1500000, location: 'Bangalore', images: [sampleImages[2], sampleImages[3]] },
    { title: 'Capital Residency', description: 'Spacious apartment near central amenities', price: 1400000, location: 'Delhi', images: [sampleImages[0], sampleImages[4]] },
    { title: 'Riverside Villa', description: 'Elegant villa with river view', price: 2200000, location: 'Kolkata', images: [sampleImages[1], sampleImages[5]] },
    { title: 'Historic Townhouse', description: 'Charming townhouse in a quiet lane', price: 1100000, location: 'Hyderabad', images: [sampleImages[3], sampleImages[2]] },
    { title: 'Marina View Apartment', description: 'Apartment with sea view and balcony', price: 2100000, location: 'Chennai', images: [sampleImages[4], sampleImages[0]] },
    { title: 'Hillside Retreat', description: 'Peaceful bungalow near the hills', price: 900000, location: 'Pune', images: [sampleImages[5], sampleImages[1]] },
    { title: 'City Center Studio', description: 'Compact studio ideal for singles', price: 650000, location: 'Ahmedabad', images: [sampleImages[2], sampleImages[0]] }
  ]

  const created = []
  for (let i = 0; i < propertiesData.length; i++) {
    const p = propertiesData[i]
    const ownerIndex = i % owners.length
    // leave first few properties unapproved so admin sees pending properties
    const approved = i >= 3
    const prop = await Property.create({ ...p, owner: owners[ownerIndex]._id, approved, featured: i === 0 })
    created.push({ property: prop, owner: owners[ownerIndex] })
  }

  // create a couple of pending bookings for admin to approve
  for (let j = 0; j < 2 && created[j]; j++) {
    try{
      await Booking.create({ user: renter._id, property: created[j].property._id, startDate: new Date(), endDate: new Date(Date.now() + 3*24*3600*1000), status: 'pending' })
    }catch(e){}
  }

  
  const out = created.map(c=>({
    propertyTitle: c.property.title,
    propertyId: c.property._id,
    ownerName: c.owner.name,
    ownerEmail: c.owner.email,
    ownerId: c.owner._id
  }))
  const outPath = path.join(__dirname, '..', 'property_owners.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))

  process.exit(0)
}

seed().catch(err=>{ console.error(err); process.exit(1) })
