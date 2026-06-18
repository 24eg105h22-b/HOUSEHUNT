const Property = require('../models/Property')

exports.listProperties = async (req, res) => {
  const { location, minPrice, maxPrice, type, approved, featured, page = 1, pageSize = 50 } = req.query
  const filter = {}
  if (location) filter.location = new RegExp(location, 'i')
  if (type) filter.type = type
  if (approved !== undefined) filter.approved = approved === 'true'
  if (featured !== undefined) filter.featured = featured === 'true'
  if (minPrice || maxPrice) filter.price = {}
  if (minPrice) filter.price.$gte = Number(minPrice)
  if (maxPrice) filter.price.$lte = Number(maxPrice)

  const skip = Math.max(0, (Number(page) - 1) * Number(pageSize))
  const limit = Math.min(Number(pageSize) || 50, 200)

  const query = Property.find(filter)
    .select('-__v')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  const [items, total] = await Promise.all([query.exec(), Property.countDocuments(filter)])
  res.set('X-Total-Count', String(total))
  return res.json(items)
}

exports.createProperty = async (req, res) => {
  const { title, description, price, location, type, images } = req.body
  if (!title || !price || !location) return res.status(400).json({ message: 'title, price and location are required' })
  if (isNaN(Number(price)) || Number(price) < 0) return res.status(400).json({ message: 'price must be a positive number' })
  const imgs = Array.isArray(images) ? images : (typeof images === 'string' ? images.split(',').map(s => s.trim()) : [])
  const prop = await Property.create({ title, description, price: Number(price), location, type, images: imgs, owner: req.user._id })
  return res.status(201).json(prop)
}

exports.getProperty = async (req, res) => {
  const prop = await Property.findById(req.params.id).populate('owner', 'name email').lean().exec()
  if (!prop) return res.status(404).json({ message: 'Property not found' })
  return res.json(prop)
}

exports.updateProperty = async (req, res) => {
  const prop = await Property.findById(req.params.id)
  if (!prop) return res.status(404).json({ message: 'Property not found' })
  if (prop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to update' })

  const { title, description, price, location, type, images } = req.body
  if (title !== undefined) prop.title = title
  if (description !== undefined) prop.description = description
  if (price !== undefined) {
    if (isNaN(Number(price)) || Number(price) < 0) return res.status(400).json({ message: 'price must be a positive number' })
    prop.price = Number(price)
  }
  if (location !== undefined) prop.location = location
  if (type !== undefined) prop.type = type
  if (images !== undefined) prop.images = Array.isArray(images) ? images : (typeof images === 'string' ? images.split(',').map(s => s.trim()) : [])
  await prop.save()
  return res.json(prop)
}

exports.deleteProperty = async (req, res) => {
  const prop = await Property.findById(req.params.id)
  if (!prop) return res.status(404).json({ message: 'Property not found' })
  if (prop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to delete' })
  await prop.deleteOne()
  return res.json({ message: 'Property removed' })
}

exports.approveProperty = async (req, res) => {
  const prop = await Property.findById(req.params.id)
  if (!prop) return res.status(404).json({ message: 'Property not found' })
  prop.approved = true
  await prop.save()
  return res.json(prop)
}

exports.featureProperty = async (req, res) => {
  const prop = await Property.findById(req.params.id)
  if (!prop) return res.status(404).json({ message: 'Property not found' })
  prop.featured = !!req.body.featured
  await prop.save()
  return res.json(prop)
}
