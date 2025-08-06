const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  // Recipient
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      "order_placed",
      "order_delivered",
      "order_completed",
      "order_cancelled",
      "message_received",
      "review_received",
      "payment_received",
      "gig_approved",
      "gig_rejected",
      "system_update"
    ],
    required: true,
  },
  
  // Related entities
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can reference Order, Message, Review, etc.
  },
  relatedModel: {
    type: String,
    enum: ["Order", "Message", "Review", "Gig", "User"],
  },
  
  // Notification status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  
  // Action URL (for frontend navigation)
  actionUrl: String,
  
  // Priority
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  
}, { timestamps: true });

// Indexes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);