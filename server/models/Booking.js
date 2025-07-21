const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Booking details
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  // Appointment details
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String, // format: "14:30"
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  // Location details
  meetingPoint: {
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    },
    instructions: String
  },
  // Service details
  serviceType: {
    type: String,
    enum: ['viewing', 'negotiation', 'inspection', 'full_service'],
    default: 'viewing'
  },
  specialRequirements: [String],
  // Pricing
  pricing: {
    baseAmount: {
      type: Number,
      required: true
    },
    additionalFees: [{
      name: String,
      amount: Number,
      description: String
    }],
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },
  // Payment details
  payment: {
    method: {
      type: String,
      enum: ['mpesa', 'card', 'bank_transfer', 'cash'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    mpesaReference: String
  },
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  // Communication
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'agent', 'system'],
      required: true
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  // Cancellation
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['user', 'agent', 'system']
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'completed'],
      default: 'pending'
    }
  },
  // Feedback and ratings
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  // Agent report
  agentReport: {
    submitted: {
      type: Boolean,
      default: false
    },
    submittedAt: Date,
    propertyCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    neighborhoodRating: {
      type: Number,
      min: 1,
      max: 5
    },
    accessibilityRating: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    },
    recommendations: String,
    photos: [String], // URLs to photos taken during viewing
    notes: String
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
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
bookingSchema.index({ appointmentDate: 1, status: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ agentId: 1, appointmentDate: 1 });

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  appointmentDateTime.setHours(parseInt(this.appointmentTime.split(':')[0]));
  appointmentDateTime.setMinutes(parseInt(this.appointmentTime.split(':')[1]));
  
  // Can cancel up to 24 hours before appointment
  const cancellationDeadline = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
  
  return now < cancellationDeadline && this.status === 'confirmed';
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (this.status === 'cancelled' && this.cancellation.cancelledBy === 'user') {
    const now = new Date();
    const appointmentDateTime = new Date(this.appointmentDate);
    appointmentDateTime.setHours(parseInt(this.appointmentTime.split(':')[0]));
    appointmentDateTime.setMinutes(parseInt(this.appointmentTime.split(':')[1]));
    
    const cancellationDeadline = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    
    if (now < cancellationDeadline) {
      // Full refund if cancelled more than 24 hours before
      return this.pricing.totalAmount;
    } else {
      // 50% refund if cancelled within 24 hours
      return this.pricing.totalAmount * 0.5;
    }
  }
  return 0;
};

module.exports = mongoose.model('Booking', bookingSchema); 