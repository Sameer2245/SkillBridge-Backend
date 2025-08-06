const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isSeller: {
    type: Boolean,
    default: false,
  },
  // Enhanced profile fields
  fullName: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  // Seller-specific fields
  skills: [{
    type: String,
  }],
  languages: [{
    language: String,
    level: {
      type: String,
      enum: ["Basic", "Conversational", "Fluent", "Native"],
    }
  }],
  // Ratings and reviews
  totalRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  // Seller stats
  completedOrders: {
    type: Number,
    default: 0,
  },
  ongoingOrders: {
    type: Number,
    default: 0,
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
