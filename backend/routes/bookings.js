const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    if (!propertyId || !startDate || !endDate) return res.status(400).json({ message: 'Missing fields' });
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const s = new Date(startDate)
    const e = new Date(endDate)
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return res.status(400).json({ message: 'Invalid dates' })
    const booking = await Booking.create({ user: req.user._id, property: propertyId, startDate: s, endDate: e });

    try{
      const prop = await Property.findById(propertyId).populate('owner')
      if(prop && prop.owner){
        await Notification.create({ user: prop.owner._id, booking: booking._id, message: `New booking for ${prop.title}` })
      }
    }catch(e){ }
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const all = await Booking.find().populate('user', 'name email').populate('property', 'title price');
      return res.json(all);
    }
    const bookings = await Booking.find({ user: req.user._id }).populate('property', 'title price location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/for-owner', protect, async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'admin') return res.status(403).json({ message: 'Owner access required' });
    const props = await Property.find({ owner: req.user._id }).select('_id');
    const propIds = props.map(p => p._id);
    const bookings = await Booking.find({ property: { $in: propIds } }).populate('user', 'name email').populate('property', 'title');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    const isOwner = booking.property && booking.property.owner && booking.property.owner.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) return res.status(403).json({ message: 'Not authorized to update booking' });
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel' });
    }
    await booking.deleteOne();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

