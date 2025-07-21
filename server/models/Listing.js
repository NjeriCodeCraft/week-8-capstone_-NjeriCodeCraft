const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    // Location coordinates for maps
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    // Nearby landmarks for better search
    landmarks: [{
      name: String,
      distance: Number, // in meters
      type: {
        type: String,
        enum: ['bus_stop', 'school', 'hospital', 'shopping', 'restaurant', 'other']
      }
    }]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  squareFeet: {
    type: Number,
    required: true,
    min: 0
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'bedsitter']
  },
  availableDate: {
    type: Date,
    required: true
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  amenities: {
    water: {
      type: Boolean,
      default: false
    },
    electricity: {
      type: Boolean,
      default: false
    },
    wifi: {
      type: Boolean,
      default: false
    },
    security: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    kitchen: {
      type: Boolean,
      default: false
    },
    bathroom: {
      type: Boolean,
      default: false
    },
    balcony: {
      type: Boolean,
      default: false
    },
    furnished: {
      type: Boolean,
      default: false
    },
    // Additional amenities
    others: [String]
  },
  contactInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    whatsapp: String,
    // Agent information if applicable
    isAgent: {
      type: Boolean,
      default: false
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    }
  },
  // Premium features
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumFeatures: {
    guidedViewing: {
      type: Boolean,
      default: false
    },
    virtualTour: {
      type: Boolean,
      default: false
    },
    priorityListing: {
      type: Boolean,
      default: false
    }
  },
  // Status and availability
  status: {
    type: String,
    enum: ['available', 'rented', 'under_review', 'maintenance'],
    default: 'available'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
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

// Update the updatedAt field before saving
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create geospatial index for location-based queries
listingSchema.index({ 'address.location': '2dsphere' });

// Create text index for search functionality
listingSchema.index({
  title: 'text',
  description: 'text',
  'address.city': 'text',
  'address.street': 'text'
});

module.exports = mongoose.model('Listing', listingSchema); 