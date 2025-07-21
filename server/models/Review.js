const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  targetListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
  reply: {
    text: { type: String },
    date: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema); 