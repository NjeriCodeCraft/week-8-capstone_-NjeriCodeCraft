const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rent-radar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const listingsRouter = require('./routes/listings');
const authRouter = require('./routes/auth');
const agentsRouter = require('./routes/agents');
const usersRouter = require('./routes/users');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');
const contributionsRouter = require('./routes/contributions');
console.log("Registering /api/listings");
app.use('/api/listings', listingsRouter);
console.log("Registering /api/auth");
app.use('/api/auth', authRouter);
console.log("Registering /api/agents");
app.use('/api/agents', agentsRouter);
console.log("Registering /api/users");
app.use('/api/users', usersRouter);
console.log("Registering /api/bookings");
app.use('/api/bookings', bookingsRouter);
console.log("Registering /api/payments");
app.use('/api/payments', paymentsRouter);
console.log("Registering /api/contributions");
app.use('/api/contributions', contributionsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Rent Radar API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; 