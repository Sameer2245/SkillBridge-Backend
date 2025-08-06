const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Parties involved
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gig",
    required: true,
  },
  
  // Order details
  packageType: {
    type: String,
    enum: ["basic", "standard", "premium"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
  },
  serviceFee: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  
  // Timeline
  deliveryTime: {
    type: Number,
    required: true, // in days
  },
  expectedDelivery: {
    type: Date,
    required: true,
  },
  actualDelivery: {
    type: Date,
  },
  
  // Order status
  status: {
    type: String,
    enum: [
      "pending", 
      "pending_payment",
      "active", 
      "delivered", 
      "revision_requested", 
      "completed", 
      "cancelled", 
      "disputed"
    ],
    default: "pending",
  },
  
  // Requirements and responses
  requirements: [{
    question: String,
    answer: String,
    type: String,
    files: [String], // URLs to uploaded files
  }],
  
  // Deliverables
  deliverables: [{
    message: String,
    files: [String], // URLs to delivered files
    deliveredAt: {
      type: Date,
      default: Date.now,
    }
  }],
  
  // Revisions
  revisions: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: String,
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    response: String,
    respondedAt: Date,
    files: [String],
  }],
  revisionsUsed: {
    type: Number,
    default: 0,
  },
  maxRevisions: {
    type: Number,
    required: true,
  },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "released", "refunded"],
    default: "pending",
  },
  paymentIntentId: String, // Stripe payment intent ID
  paymentMethod: String,
  
  // Communication
  lastMessage: {
    type: Date,
    default: Date.now,
  },
  
  // Completion and review
  completedAt: Date,
  reviewLeft: {
    type: Boolean,
    default: false,
  },
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  cancelledAt: Date,
  
}, { timestamps: true });

// Generate unique order ID
OrderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderId = `FO${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Indexes
OrderSchema.index({ buyerId: 1, status: 1 });
OrderSchema.index({ sellerId: 1, status: 1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);