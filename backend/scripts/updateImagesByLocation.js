const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const connectDB = require('../config/db')
const Property = require('../models/Property')

async function run(){
  await connectDB()
  const locations = process.argv.slice(2)
  if(locations.length===0){ console.error('Usage: node updateImagesByLocation.js Delhi Bangalore'); process.exit(2) }
  const good = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&q=80&auto=format&fit=crop'
  ]
  for(const loc of locations){
    const props = await Property.find({ location: new RegExp('^'+loc+'$','i') })
    console.log(`Found ${props.length} properties in ${loc}`)
    for(const p of props){
      p.images = good
      await p.save()
      console.log('Updated', p.title, p._id)
    }
  }
  process.exit(0)
}

run().catch(e=>{ console.error(e); process.exit(1) })
