const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    type: { type: String },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approved: { type: Boolean, default: false },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

PropertySchema.index({ location: 1 })
PropertySchema.index({ price: 1 })
PropertySchema.index({ approved: 1, featured: 1 })
PropertySchema.index({ title: 'text', description: 'text', location: 'text' })

module.exports = mongoose.model('Property', PropertySchema);
