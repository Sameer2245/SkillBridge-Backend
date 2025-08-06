const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  // Conversation identification
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  
  // Message parties
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  // Related order (optional)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  
  // Message content
  message: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ["text", "file", "order_update", "system"],
    default: "text",
  },
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
  }],
  
  // Message status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  
  // System message data (for order updates)
  systemData: {
    type: mongoose.Schema.Types.Mixed,
  },
  
  // Message editing
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
  originalMessage: String,
  
}, { timestamps: true });

// Indexes for efficient querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model("Message", MessageSchema);