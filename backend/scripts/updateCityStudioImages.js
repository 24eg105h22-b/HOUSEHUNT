const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const connectDB = require('../config/db')
const Property = require('../models/Property')

async function run(){
  await connectDB()
  const id = process.argv[2]
  if(!id){ console.error('Usage: node updateCityStudioImages.js <propertyId>'); process.exit(2) }
  const imgs = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1200&q=80&auto=format&fit=crop'
  ]
  const p = await Property.findByIdAndUpdate(id, { images: imgs }, { new: true }).lean()
  console.log('Updated:', p && p.images)
  process.exit(0)
}

run().catch(e=>{ console.error(e); process.exit(1) })
