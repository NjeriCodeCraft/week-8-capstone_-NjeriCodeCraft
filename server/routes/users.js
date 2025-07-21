const express = require('express');
const router = express.Router();
console.log('Loaded users router');
const User = require('../models/User');
const Listing = require('../models/Listing');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Contribution = require('../models/Contribution');
const Notification = require('../models/Notification');
const adminOnly = require('../middleware/admin');
const Agent = require('../models/Agent');
const Booking = require('../models/Booking');

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

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  }
});
const avatarUpload = multer({ storage: avatarStorage });

// GET /me - Get user profile (with favorites and contribution stats)
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('favorites');
  if (!user) return res.status(404).json({ message: 'User not found' });
  // Contribution stats
  const [total, approved, pending, rejected] = await Promise.all([
    Contribution.countDocuments({ contributor: user._id }),
    Contribution.countDocuments({ contributor: user._id, status: 'verified' }),
    Contribution.countDocuments({ contributor: user._id, status: 'pending' }),
    Contribution.countDocuments({ contributor: user._id, status: 'rejected' })
  ]);
  res.json({
    user: user.getPublicProfile(),
    favorites: user.favorites,
    notificationPreferences: user.notificationPreferences,
    contributionStats: { total, approved, pending, rejected }
  });
});

// PUT /notification-preferences - Update notification preferences
router.put('/notification-preferences', authMiddleware, async (req, res) => {
  const { email, sms, whatsapp } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.notificationPreferences = {
    email: !!email,
    sms: !!sms,
    whatsapp: !!whatsapp
  };
  await user.save();
  res.json({ notificationPreferences: user.notificationPreferences });
});

// PUT /me - Update user profile
router.put('/me', authMiddleware, async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (name) user.name = name;
  if (phone) user.phone = phone;
  await user.save();
  res.json({ user: user.getPublicProfile() });
});

// PUT /change-password - Change user password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new password required' });
  }
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password changed successfully' });
});

// POST /favorites/:listingId - Add/remove favorite
router.post('/favorites/:listingId', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const listingId = req.params.listingId;
  const idx = user.favorites.indexOf(listingId);
  let action;
  if (idx === -1) {
    user.favorites.push(listingId);
    action = 'added';
  } else {
    user.favorites.splice(idx, 1);
    action = 'removed';
  }
  await user.save();
  res.json({ message: `Favorite ${action}`, favorites: user.favorites });
});

// POST /upload-avatar - Upload user avatar
router.post('/upload-avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.profile.avatar = `/uploads/${req.file.filename}`;
  await user.save();
  res.json({ avatar: user.profile.avatar });
});

// GET /leaderboard - Top contributors by points
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, 'name points').sort({ points: -1 }).limit(10);
    // For each user, get their contribution stats
    const Contribution = require('../models/Contribution');
    const leaderboard = await Promise.all(users.map(async (u) => {
      const [total, approved, pending, rejected] = await Promise.all([
        Contribution.countDocuments({ contributor: u._id }),
        Contribution.countDocuments({ contributor: u._id, status: 'verified' }),
        Contribution.countDocuments({ contributor: u._id, status: 'pending' }),
        Contribution.countDocuments({ contributor: u._id, status: 'rejected' })
      ]);
      return {
        name: u.name,
        points: u.points,
        total,
        approved,
        pending,
        rejected
      };
    }));
    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: err.message });
  }
});

// GET /notifications - List notifications for current user
router.get('/notifications', authMiddleware, async (req, res) => {
  const { read, channel } = req.query;
  const filter = { user: req.user.id };
  if (read === 'true') filter.read = true;
  if (read === 'false') filter.read = false;
  if (channel) filter.channel = channel;
  const notifications = await Notification.find(filter).sort({ createdAt: -1 });
  res.json({ notifications });
});

// PUT /notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  notification.read = true;
  await notification.save();
  res.json({ notification });
});

// List all users (admin only)
router.get('/admin/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Activate/deactivate user (admin only)
router.put('/admin/users/:id/toggle-active', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// Update user (admin only)
router.put('/admin/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    await user.save();
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// Delete user (admin only)
router.delete('/admin/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

// Reset user password (admin only)
router.put('/admin/users/:id/reset-password', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();
    res.json({ message: 'Password reset', tempPassword });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
});

// List all agents (admin only)
router.get('/admin/agents', authMiddleware, adminOnly, async (req, res) => {
  try {
    const agents = await Agent.find({}).populate('userId', 'name email phone');
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agents', error: err.message });
  }
});

// Approve agent (admin only)
router.put('/admin/agents/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    agent.verificationStatus = 'approved';
    await agent.save();
    res.json({ message: 'Agent approved', agent });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve agent', error: err.message });
  }
});

// Reject agent (admin only)
router.put('/admin/agents/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    agent.verificationStatus = 'rejected';
    await agent.save();
    res.json({ message: 'Agent rejected', agent });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject agent', error: err.message });
  }
});

// Activate/deactivate agent (admin only)
router.put('/admin/agents/:id/toggle-active', authMiddleware, adminOnly, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    agent.availability.isAvailable = !agent.availability.isAvailable;
    await agent.save();
    res.json({ message: `Agent ${agent.availability.isAvailable ? 'activated' : 'deactivated'}`, agent });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update agent', error: err.message });
  }
});

// Update agent (admin only)
router.put('/admin/agents/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    // Update profile fields
    const { bio, experience, specializations, languages, isAvailable } = req.body;
    if (bio !== undefined) agent.profile.bio = bio;
    if (experience !== undefined) agent.profile.experience = experience;
    if (specializations !== undefined) agent.profile.specializations = specializations;
    if (languages !== undefined) agent.profile.languages = languages;
    if (isAvailable !== undefined) agent.availability.isAvailable = isAvailable;
    await agent.save();
    res.json({ message: 'Agent updated', agent });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update agent', error: err.message });
  }
});

// Delete agent (admin only)
router.delete('/admin/agents/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete agent', error: err.message });
  }
});

// Get agent details (admin only)
router.get('/admin/agents/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).populate('userId', 'name email phone');
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ agent });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agent details', error: err.message });
  }
});

// List all listings (admin only)
router.get('/admin/listings', authMiddleware, adminOnly, async (req, res) => {
  try {
    const listings = await Listing.find({}).populate('contactInfo.agentId', 'name email');
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings', error: err.message });
  }
});
// Get listing details (admin only)
router.get('/admin/listings/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('contactInfo.agentId', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listing details', error: err.message });
  }
});
// Approve listing (admin only)
router.put('/admin/listings/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    listing.status = 'available';
    listing.isVerified = true;
    await listing.save();
    res.json({ message: 'Listing approved', listing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve listing', error: err.message });
  }
});
// Reject listing (admin only)
router.put('/admin/listings/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    listing.status = 'under_review';
    listing.isVerified = false;
    await listing.save();
    res.json({ message: 'Listing rejected', listing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject listing', error: err.message });
  }
});
// Edit listing (admin only)
router.put('/admin/listings/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing updated', listing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update listing', error: err.message });
  }
});
// Delete listing (admin only)
router.delete('/admin/listings/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing', error: err.message });
  }
});

// List all contributions (admin only)
router.get('/admin/contributions', authMiddleware, adminOnly, async (req, res) => {
  try {
    const contributions = await Contribution.find({}).populate('contributor', 'name email');
    res.json({ contributions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contributions', error: err.message });
  }
});
// Get contribution details (admin only)
router.get('/admin/contributions/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id).populate('contributor', 'name email');
    if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
    res.json({ contribution });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contribution details', error: err.message });
  }
});
// Approve contribution (admin only)
router.put('/admin/contributions/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
    contribution.status = 'verified';
    await contribution.save();
    res.json({ message: 'Contribution approved', contribution });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve contribution', error: err.message });
  }
});
// Reject contribution (admin only)
router.put('/admin/contributions/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
    contribution.status = 'rejected';
    await contribution.save();
    res.json({ message: 'Contribution rejected', contribution });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject contribution', error: err.message });
  }
});

// Adjust points for a contribution (admin only)
router.put('/admin/contributions/:id/points', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { points } = req.body;
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) return res.status(404).json({ message: 'Contribution not found' });
    contribution.points = points;
    await contribution.save();
    res.json({ message: 'Points updated', contribution });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update points', error: err.message });
  }
});

// Get summary stats (admin only)
router.get('/admin/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users, agents, listings, bookings, contributions] = await Promise.all([
      User.countDocuments({}),
      Agent.countDocuments({}),
      Listing.countDocuments({}),
      Booking.countDocuments({}),
      Contribution.countDocuments({})
    ]);
    res.json({ stats: { users, agents, listings, bookings, contributions } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

// Get users per month for the past 12 months (admin only)
router.get('/admin/stats/users-per-month', authMiddleware, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 1)
      });
    }
    const data = await Promise.all(months.map(async (m) => {
      const count = await User.countDocuments({
        createdAt: { $gte: m.start, $lt: m.end }
      });
      return { month: m.label, count };
    }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users per month', error: err.message });
  }
});

// Get listings per month for the past 12 months (admin only)
router.get('/admin/stats/listings-per-month', authMiddleware, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 1)
      });
    }
    const data = await Promise.all(months.map(async (m) => {
      const count = await Listing.countDocuments({
        createdAt: { $gte: m.start, $lt: m.end }
      });
      return { month: m.label, count };
    }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings per month', error: err.message });
  }
});
// Get bookings per month for the past 12 months (admin only)
router.get('/admin/stats/bookings-per-month', authMiddleware, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 1)
      });
    }
    const data = await Promise.all(months.map(async (m) => {
      const count = await Booking.countDocuments({
        createdAt: { $gte: m.start, $lt: m.end }
      });
      return { month: m.label, count };
    }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings per month', error: err.message });
  }
});

// Sample admin-only route
router.get('/admin/test', authMiddleware, adminOnly, (req, res) => {
  res.json({ message: 'Welcome, admin! This is a protected admin route.' });
});

module.exports = router; 