const express = require('express');
const router = express.Router();
console.log('Loaded agents router');
const Agent = require('../models/Agent');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const Review = require('../models/Review');

// Middleware: protect route
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-agent-${req.user.id}-${Date.now()}${ext}`);
  }
});
const avatarUpload = multer({ storage: avatarStorage });

// POST /register - Apply to become an agent
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const {
      bio,
      experience,
      baseRate,
      workingDays,
      workingHours,
      languages,
      specializations
    } = req.body;

    // Check if user is already an agent
    const existingAgent = await Agent.findOne({ userId: req.user.id });
    if (existingAgent) {
      return res.status(400).json({ message: 'You are already registered as an agent' });
    }

    // Create agent profile
    const agent = new Agent({
      userId: req.user.id,
      profile: {
        bio,
        experience: Number(experience),
        specializations,
        languages
      },
      availability: {
        workingDays,
        workingHours
      },
      pricing: {
        baseRate: Number(baseRate),
        currency: 'KES'
      },
      verificationStatus: 'approved' // Auto-approve for now
    });

    await agent.save();

    // Update user role to agent
    await User.findByIdAndUpdate(req.user.id, { role: 'agent' });

    res.status(201).json({ 
      message: 'Agent application submitted successfully',
      agent: agent
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
});

// POST /upload-avatar - Upload agent avatar
router.post('/upload-avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const agent = await Agent.findOne({ userId: req.user.id });
  if (!agent) return res.status(404).json({ message: 'Agent not found' });
  agent.profile.avatar = `/uploads/${req.file.filename}`;
  await agent.save();
  res.json({ avatar: agent.profile.avatar });
});

// GET /profile - Get agent profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id }).populate('userId', 'name email phone');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent profile not found' });
    }

    res.json({ agent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch agent profile', error: error.message });
  }
});

// PUT /profile - Update agent profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      bio,
      experience,
      baseRate,
      workingDays,
      workingHours,
      languages,
      specializations,
      isAvailable
    } = req.body;

    const agent = await Agent.findOne({ userId: req.user.id });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent profile not found' });
    }

    // Update fields
    if (bio) agent.profile.bio = bio;
    if (experience) agent.profile.experience = Number(experience);
    if (languages) agent.profile.languages = languages;
    if (specializations) agent.profile.specializations = specializations;
    if (workingDays) agent.availability.workingDays = workingDays;
    if (workingHours) agent.availability.workingHours = workingHours;
    if (baseRate) agent.pricing.baseRate = Number(baseRate);
    if (typeof isAvailable === 'boolean') agent.availability.isAvailable = isAvailable;

    await agent.save();

    res.json({ 
      message: 'Profile updated successfully',
      agent: agent
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// GET /listings - Get agent's listings
router.get('/listings', authMiddleware, async (req, res) => {
  try {
    const Listing = require('../models/Listing');
    const listings = await Listing.find({ 'contactInfo.agentId': req.user.id }).sort({ createdAt: -1 });
    
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
  }
});

// GET /:id/reviews - Get reviews for agent
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ targetAgent: req.params.id })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    // Calculate average rating
    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : null;
    res.json({ reviews, avgRating, count: reviews.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
});

// POST /:id/reviews - Create review for agent
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
    // Prevent duplicate review by same user for same agent
    const existing = await Review.findOne({ reviewer: req.user.id, targetAgent: req.params.id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this agent' });
    const review = new Review({
      reviewer: req.user.id,
      targetAgent: req.params.id,
      rating,
      comment
    });
    await review.save();
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review', error: err.message });
  }
});

// PUT /reviews/:reviewId/reply - Agent replies to a review
router.put('/reviews/:reviewId/reply', authMiddleware, async (req, res) => {
  try {
    // Only agent can reply
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Only agents can reply to reviews' });
    const { text } = req.body;
    if (!text || text.length < 2) return res.status(400).json({ message: 'Reply text required' });
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    // Only reply to reviews for this agent
    const agent = await Agent.findOne({ userId: req.user.id });
    if (!agent || !review.targetAgent || review.targetAgent.toString() !== agent._id.toString()) {
      return res.status(403).json({ message: 'You can only reply to reviews for your own profile' });
    }
    review.reply = { text, date: new Date() };
    await review.save();
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reply to review', error: err.message });
  }
});

module.exports = router; 