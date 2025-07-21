const express = require('express');
const router = express.Router();
console.log('Loaded auth router');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES_IN = '7d';

// Helper: sign JWT
function signToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Middleware: protect route
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ message: 'Email or phone already in use' });
    }
    const user = new User({ name, email, phone, password });
    await user.save();
    const token = signToken(user);
    res.status(201).json({ token, user: user.getPublicProfile() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({ token, user: user.getPublicProfile() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /me (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: user.getPublicProfile() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

module.exports = router; 