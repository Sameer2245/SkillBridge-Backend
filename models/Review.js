const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  // Review parties
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gig",
    required: true,
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500,
  },
  
  // Detailed ratings (for seller reviews)
  communication: {
    type: Number,
    min: 1,
    max: 5,
  },
  serviceAsDescribed: {
    type: Number,
    min: 1,
    max: 5,
  },
  buyAgain: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  // Review type
  reviewType: {
    type: String,
    enum: ["buyer_to_seller", "seller_to_buyer"],
    required: true,
  },
  
  // Review status
  isPublic: {
    type: Boolean,
    default: true,
  },
  isReported: {
    type: Boolean,
    default: false,
  },
  
  // Response from reviewee
  response: {
    message: String,
    respondedAt: Date,
  },
  
}, { timestamps: true });

// Ensure one review per order per user
ReviewSchema.index({ reviewerId: 1, orderId: 1 }, { unique: true });
ReviewSchema.index({ revieweeId: 1, createdAt: -1 });
ReviewSchema.index({ gigId: 1, rating: -1 });

module.exports = mongoose.model("Review", ReviewSchema);