const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const Notification = require('../models/Notification')

router.get('/', protect, async (req, res) => {
  try{
    const notes = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50)
    res.json(notes)
  }catch(e){ res.status(500).json({ message: e.message }) }
})

router.post('/:id/read', protect, async (req, res)=>{
  try{
    const n = await Notification.findById(req.params.id)
    if(!n) return res.status(404).json({ message: 'Not found' })
    if(n.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' })
    n.read = true
    await n.save()
    res.json(n)
  }catch(e){ res.status(500).json({ message: e.message }) }
})

module.exports = router
