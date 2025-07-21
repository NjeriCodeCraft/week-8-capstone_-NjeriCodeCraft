const express = require('express');
const router = express.Router();
console.log('Loaded listings router');
const Listing = require('../models/Listing');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');

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

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});
const upload = multer({ storage });

// POST /upload - Upload listing images
router.post('/upload', authMiddleware, upload.array('images', 6), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ urls });
});

// GET all listings
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      minPrice, 
      maxPrice, 
      bedrooms, 
      propertyType, 
      limit = 20, 
      page = 1,
      lat,
      lng,
      radius = 5000 // meters
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };
    
    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (bedrooms) {
      filter.bedrooms = { $gte: Number(bedrooms) };
    }
    
    if (propertyType) {
      filter.propertyType = propertyType;
    }

    // Geospatial filter
    if (lat && lng) {
      filter['address.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Listing.countDocuments(filter);

    res.json({
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Math.ceil(total / Number(limit)),
        hasNext: skip + listings.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create new listing (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is an agent
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can create listings' });
    }

    const listingData = {
      ...req.body,
      contactInfo: {
        ...req.body.contactInfo,
        agentId: req.user.id
      }
    };

    const listing = new Listing(listingData);
    await listing.save();

    // Notify users whose preferences match
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const users = await User.find({
      'preferences.preferredLocations': { $in: [listing.address?.city, listing.address?.area].filter(Boolean) },
      'preferences.propertyTypes': listing.propertyType,
      'preferences.budgetRange.min': { $lte: listing.price },
      'preferences.budgetRange.max': { $gte: listing.price }
    });
    const message = `A new listing matching your preferences is available in ${listing.address?.city || 'your area'}!`;
    for (const user of users) {
      // In-app notification
      await Notification.create({
        user: user._id,
        type: 'listing',
        message,
        link: `/listing/${listing._id}`,
        channel: 'in-app'
      });
      // Email notification if enabled
      if (user.notificationPreferences?.email) {
        await Notification.create({
          user: user._id,
          type: 'listing',
          message,
          link: `/listing/${listing._id}`,
          channel: 'email'
        });
        // TODO: Integrate actual email sending in the future
      }
    }

    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// PUT update listing (requires auth, only own listings)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns this listing
    if (listing.contactInfo?.agentId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedListing);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// DELETE listing (requires auth, only own listings)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns this listing
    if (listing.contactInfo?.agentId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET listings by city
router.get('/city/:city', async (req, res) => {
  try {
    const listings = await Listing.find({
      'address.city': { $regex: req.params.city, $options: 'i' },
      isAvailable: true
    }).sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /near?lng=...&lat=...&radius=... (radius in meters)
router.get('/near', async (req, res) => {
  const { lng, lat, radius = 2000 } = req.query;
  if (!lng || !lat) return res.status(400).json({ message: 'lng and lat required' });
  try {
    const listings = await require('../models/Listing').find({
      'address.location': {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    });
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to search listings', error: err.message });
  }
});

// GET /:id/reviews - Get reviews for listing
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ targetListing: req.params.id })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    // Calculate average rating
    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : null;
    res.json({ reviews, avgRating, count: reviews.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
});

// POST /:id/reviews - Create review for listing
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
    // Prevent duplicate review by same user for same listing
    const existing = await Review.findOne({ reviewer: req.user.id, targetListing: req.params.id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this listing' });
    const review = new Review({
      reviewer: req.user.id,
      targetListing: req.params.id,
      rating,
      comment
    });
    await review.save();
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review', error: err.message });
  }
});

module.exports = router; 