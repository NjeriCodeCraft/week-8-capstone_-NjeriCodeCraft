const express = require('express');
const router = express.Router();
console.log('Loaded bookings router');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const Agent = require('../models/Agent');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth middleware (reuse from auth.js)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// POST /api/bookings - Create a new booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { listingId, agentId, appointmentDate, appointmentTime, serviceType, specialRequirements, meetingPoint } = req.body;
    if (!listingId || !agentId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Ensure agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    // Ensure listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    // Create booking
    const booking = new Booking({
      listingId,
      userId: req.user.id,
      agentId,
      appointmentDate,
      appointmentTime,
      serviceType: serviceType || 'viewing',
      specialRequirements: specialRequirements || [],
      meetingPoint: meetingPoint || {},
      pricing: {
        baseAmount: agent.pricing.baseRate,
        totalAmount: agent.pricing.baseRate,
        currency: agent.pricing.currency || 'KES'
      }
    });
    await booking.save();
    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
});

// GET /api/bookings - Get bookings for user or agent
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let bookings;
    if (user.role === 'agent') {
      bookings = await Booking.find({ agentId: req.user.id }).populate('listingId userId');
    } else {
      bookings = await Booking.find({ userId: req.user.id }).populate('listingId agentId');
    }
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

// PUT /api/bookings/:id - Update booking status (accept, reject, complete, cancel, etc.)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // Only agent or user involved can update
    if (![booking.userId.toString(), booking.agentId.toString()].includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Update allowed fields
    const { status, payment, feedback, cancellation } = req.body;
    if (status) booking.status = status;
    if (payment) booking.payment = { ...booking.payment, ...payment };
    if (feedback) booking.feedback = feedback;
    if (cancellation) booking.cancellation = cancellation;
    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking', error: err.message });
  }
});

module.exports = router; 