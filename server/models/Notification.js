const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['listing', 'contribution', 'system', 'booking'], required: true },
  message: { type: String, required: true },
  link: { type: String }, // Optional: link to relevant page
  read: { type: Boolean, default: false },
  channel: { type: String, enum: ['in-app', 'email', 'sms', 'whatsapp', 'telegram'], default: 'in-app' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema); 