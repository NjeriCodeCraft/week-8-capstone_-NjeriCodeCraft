const express = require('express');
const router = express.Router();
console.log('Loaded contributions router');
const Contribution = require('../models/Contribution');
const multer = require('multer');
const path = require('path');
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

const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `contrib-${req.user.id}-${Date.now()}${ext}`);
  }
});
const mediaUpload = multer({ storage: mediaStorage });

// POST /api/contributions - Submit a new contribution
router.post('/', authMiddleware, mediaUpload.single('media'), async (req, res) => {
  try {
    const { type, lng, lat, address, area, description } = req.body;
    if (!type || !lng || !lat) return res.status(400).json({ message: 'type, lng, lat required' });
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const contribution = new Contribution({
      contributor: req.user.id,
      type,
      mediaUrl,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address,
        area
      },
      description
    });
    await contribution.save();
    res.status(201).json({ contribution });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit contribution', error: err.message });
  }
});

// GET /api/contributions - List contributions (optionally filter by area/status)
router.get('/', async (req, res) => {
  try {
    const { area, status } = req.query;
    const filter = {};
    if (area) filter['location.area'] = area;
    if (status) filter.status = status;
    const contributions = await Contribution.find(filter).populate('contributor', 'name email');
    res.json({ contributions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contributions', error: err.message });
  }
});

// PUT /api/contributions/:id/verify - Verify/reject a contribution (admin/agent)
router.put('/:id/verify', authMiddleware, async (req, res) => {
  // Only admin/agent can verify/reject
  if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: Only admin/agent can moderate contributions' });
  }
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
    const prevStatus = contribution.status;
    contribution.status = status;
    await contribution.save();
    // Award points if newly verified
    if (status === 'verified' && prevStatus !== 'verified') {
      const User = require('../models/User');
      await User.findByIdAndUpdate(contribution.contributor, { $inc: { points: 10 } });
    }
    // Notify contributor
    if (status !== prevStatus) {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const user = await User.findById(contribution.contributor);
      const message = status === 'verified'
        ? 'Your contribution has been approved! Thank you for helping the community.'
        : 'Your contribution was reviewed but did not meet our requirements.';
      // In-app notification
      await Notification.create({
        user: contribution.contributor,
        type: 'contribution',
        message,
        link: '/contribute',
        channel: 'in-app'
      });
      // Email notification if enabled
      if (user.notificationPreferences?.email) {
        await Notification.create({
          user: contribution.contributor,
          type: 'contribution',
          message,
          link: '/contribute',
          channel: 'email'
        });
        // TODO: Integrate actual email sending in the future
      }
    }
    res.json({ contribution });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update contribution', error: err.message });
  }
});

module.exports = router; 