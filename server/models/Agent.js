const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Agent profile
  profile: {
    bio: String,
    experience: {
      type: Number, // years of experience
      default: 0
    },
    specializations: [String], // areas of expertise
    languages: [String], // languages spoken
    avatar: String,
    idDocument: String, // ID document for verification
    licenseNumber: String // if applicable
  },
  // Service areas
  serviceAreas: [{
    city: String,
    neighborhoods: [String],
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  }],
  // Availability
  availability: {
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    workingHours: {
      start: String, // format: "09:00"
      end: String    // format: "17:00"
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  // Pricing
  pricing: {
    baseRate: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'KES'
    },
    additionalFees: [{
      name: String,
      amount: Number,
      description: String
    }]
  },
  // Performance metrics
  performance: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  // Verification and approval
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  rejectionReason: String,
  // Commission and payments
  commission: {
    rate: {
      type: Number,
      default: 0.15, // 15% commission
      min: 0,
      max: 1
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      default: 0
    }
  },
  // Bank details for payments
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    mpesaNumber: String
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp
agentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create geospatial index for location-based queries
agentSchema.index({ 'serviceAreas.coordinates': '2dsphere' });

// Method to check if agent is available for a specific time and location
agentSchema.methods.isAvailableFor = function(date, location) {
  if (!this.availability.isAvailable) return false;
  
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  if (!this.availability.workingDays.includes(dayOfWeek)) return false;
  
  // Check if location is within service areas
  const isInServiceArea = this.serviceAreas.some(area => {
    // Simple distance calculation (can be enhanced with proper geospatial queries)
    return area.city.toLowerCase() === location.city.toLowerCase();
  });
  
  return isInServiceArea;
};

// Method to calculate earnings
agentSchema.methods.calculateEarnings = function(bookingAmount) {
  return bookingAmount * this.commission.rate;
};

module.exports = mongoose.model('Agent', agentSchema); 