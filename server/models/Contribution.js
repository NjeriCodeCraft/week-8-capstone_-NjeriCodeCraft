const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['photo', 'video', 'report'], required: true },
  mediaUrl: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: String,
    area: String
  },
  description: String,
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

contributionSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Contribution', contributionSchema); 