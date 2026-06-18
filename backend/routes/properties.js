const express = require('express')
const router = express.Router()
const { protect, adminOnly, ownerOnly } = require('../middleware/auth')
const { asyncHandler } = require('../utils/handlers')
const controller = require('../controllers/propertiesController')

router.post('/', protect, ownerOnly, asyncHandler(controller.createProperty))
router.get('/', asyncHandler(controller.listProperties))
router.get('/mine', protect, ownerOnly, asyncHandler(async (req, res) => {
  req.query.page = req.query.page || 1
  req.query.pageSize = req.query.pageSize || 100
  const props = await require('../models/Property').find({ owner: req.user._id }).select('-__v').lean().exec()
  res.json(props)
}))
router.get('/:id', asyncHandler(controller.getProperty))
router.put('/:id', protect, asyncHandler(controller.updateProperty))
router.delete('/:id', protect, asyncHandler(controller.deleteProperty))
router.patch('/:id/approve', protect, adminOnly, asyncHandler(controller.approveProperty))
router.patch('/:id/feature', protect, adminOnly, asyncHandler(controller.featureProperty))

module.exports = router
