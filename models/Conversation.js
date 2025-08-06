const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  // Conversation ID (unique identifier)
  conversationId: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Participants
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastRead: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
    }
  }],
  
  // Related order (if conversation is about an order)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  
  // Related gig (if conversation is about a gig)
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gig",
  },
  
  // Last message info
  lastMessage: {
    message: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    messageType: {
      type: String,
      default: "text",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    }
  },
  
  // Conversation status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Conversation type
  conversationType: {
    type: String,
    enum: ["inquiry", "order", "support"],
    default: "inquiry",
  },
  
}, { timestamps: true });

// Generate conversation ID before saving
ConversationSchema.pre('save', function(next) {
  if (!this.conversationId) {
    // Sort participant IDs to ensure consistent conversation ID
    const sortedIds = this.participants
      .map(p => p.userId.toString())
      .sort()
      .join('_');
    this.conversationId = `conv_${sortedIds}`;
  }
  next();
});

// Indexes
ConversationSchema.index({ conversationId: 1 });
ConversationSchema.index({ "participants.userId": 1 });
ConversationSchema.index({ orderId: 1 });
ConversationSchema.index({ "lastMessage.sentAt": -1 });

module.exports = mongoose.model("Conversation", ConversationSchema);