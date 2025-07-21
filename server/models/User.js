const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin'],
    default: 'user'
  },
  // User preferences for search
  preferences: {
    preferredLocations: [String],
    budgetRange: {
      min: Number,
      max: Number
    },
    propertyTypes: [String],
    requiredAmenities: [String]
  },
  // Saved favorites
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  // Profile information
  profile: {
    avatar: String,
    bio: String,
    dateOfBirth: Date,
    occupation: String,
    employer: String
  },
  // Contact information
  contactInfo: {
    whatsapp: String,
    alternativePhone: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  // Rewards points for contributions
  points: {
    type: Number,
    default: 0
  },
  // Premium subscription
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'agent'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 