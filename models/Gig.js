const mongoose = require("mongoose");

const GigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 80,
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      "Graphics & Design",
      "Digital Marketing",
      "Writing & Translation",
      "Video & Animation",
      "Music & Audio",
      "Programming & Tech",
      "Business",
      "Lifestyle",
      "Data",
      "Photography"
    ]
  },
  subcategory: {
    type: String,
    required: true,
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 1200,
  },
  // Pricing packages
  packages: {
    basic: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      deliveryTime: { type: Number, required: true }, // days
      revisions: { type: Number, required: true },
      features: [String],
    },
    standard: {
      title: String,
      description: String,
      price: Number,
      deliveryTime: Number,
      revisions: Number,
      features: [String],
    },
    premium: {
      title: String,
      description: String,
      price: Number,
      deliveryTime: Number,
      revisions: Number,
      features: [String],
    }
  },
  // Legacy fields for backward compatibility
  price: { type: Number, required: true },
  deliveryTime: { type: Number, required: true },
  revisions: { type: Number, required: true },
  
  // Media
  images: [{
    type: String, // URLs to images
  }],
  video: {
    type: String, // URL to video
  },
  
  // SEO and search
  tags: [{
    type: String,
  }],
  searchTags: [{
    type: String,
  }],
  
  // Gig stats
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  
  // Gig status
  isActive: {
    type: Boolean,
    default: true,
  },
  isPaused: {
    type: Boolean,
    default: false,
  },
  
  // Requirements from buyer
  requirements: [{
    question: String,
    type: {
      type: String,
      enum: ["text", "multiple_choice", "file"],
      default: "text"
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [String], // for multiple choice
  }],
  
  // FAQ
  faq: [{
    question: String,
    answer: String,
  }],
  
}, { timestamps: true });

// Comprehensive text index for search functionality
GigSchema.index({ 
  title: "text", 
  description: "text", 
  tags: "text", 
  searchTags: "text",
  category: "text",
  subcategory: "text"
}, {
  weights: {
    title: 10,
    tags: 8,
    searchTags: 8,
    category: 6,
    subcategory: 6,
    description: 4
  },
  name: "gig_text_index"
});

// Additional indexes for filtering and sorting
GigSchema.index({ category: 1, subcategory: 1 });
GigSchema.index({ "packages.basic.price": 1 });
GigSchema.index({ "packages.basic.deliveryTime": 1 });
GigSchema.index({ totalRating: -1, totalReviews: -1 });
GigSchema.index({ totalOrders: -1 });
GigSchema.index({ createdAt: -1 });
GigSchema.index({ isActive: 1, isPaused: 1 });

// Compound indexes for common search patterns
GigSchema.index({ category: 1, "packages.basic.price": 1 });
GigSchema.index({ totalRating: -1, "packages.basic.price": 1 });
GigSchema.index({ isActive: 1, isPaused: 1, totalRating: -1 });

module.exports = mongoose.model("Gig", GigSchema);
