const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const User = require('../models/User')
const Property = require('../models/Property')

router.get('/stats', protect, adminOnly, async (req, res) => {
  try{
    const users = await User.countDocuments()
    const props = await Property.countDocuments()
    const pending = await Property.countDocuments({ approved: false })
    res.json({ users, props, pending })
  }catch(e){ res.status(500).json({ message: e.message }) }
})

router.get('/users', protect, adminOnly, async (req, res) => {
  try{ const u = await User.find().select('-password'); res.json(u) }catch(e){ res.status(500).json({ message: e.message }) }
})

router.patch('/users/:id/role', protect, adminOnly, async (req, res) => {
  try{
    const u = await User.findById(req.params.id)
    if(!u) return res.status(404).json({ message: 'User not found' })
    const { role } = req.body
    if(!['user','owner','renter','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' })
    u.role = role
    await u.save()
    res.json({ id: u._id, role: u.role })
  }catch(e){ res.status(500).json({ message: e.message }) }
})

router.patch('/users/:id/verify', protect, adminOnly, async (req, res) => {
  try{
    const u = await User.findById(req.params.id)
    if(!u) return res.status(404).json({ message: 'User not found' })
    const { verified } = req.body
    u.verified = Boolean(verified)
    await u.save()
    res.json({ id: u._id, verified: u.verified })
  }catch(e){ res.status(500).json({ message: e.message }) }
})

module.exports = router
