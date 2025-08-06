const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, messageType = "text", orderId, attachments } = req.body;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Generate conversation ID
    const participants = [req.user.id, receiverId].sort();
    const conversationId = `conv_${participants.join('_')}`;

    // Create or update conversation
    let conversation = await Conversation.findOne({ conversationId });
    
    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        participants: participants.map(userId => ({ userId })),
        orderId: orderId || null,
        conversationType: orderId ? "order" : "inquiry"
      });
    }

    // Update conversation's last message
    conversation.lastMessage = {
      message,
      senderId: req.user.id,
      messageType,
      sentAt: new Date()
    };

    // Update unread count for receiver
    const receiverParticipant = conversation.participants.find(
      p => p.userId.toString() === receiverId
    );
    if (receiverParticipant) {
      receiverParticipant.unreadCount += 1;
    }

    await conversation.save();

    // Create message
    const newMessage = new Message({
      conversationId,
      senderId: req.user.id,
      receiverId,
      message,
      messageType,
      orderId: orderId || null,
      attachments: attachments || []
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('senderId', 'username profileImage');

    // Create notification for receiver
    await new Notification({
      userId: receiverId,
      title: "New Message",
      message: `You have a new message from ${req.user.username}`,
      type: "message_received",
      relatedId: savedMessage._id,
      relatedModel: "Message",
      actionUrl: `/messages/${conversationId}`
    }).save();

    // Emit real-time message via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${receiverId}`).emit('new_message', {
        message: savedMessage,
        conversation: conversation
      });
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: savedMessage
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get conversation messages
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized to view this conversation" });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId, 
        receiverId: req.user.id, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    // Update conversation unread count
    const userParticipant = conversation.participants.find(
      p => p.userId.toString() === req.user.id
    );
    if (userParticipant) {
      userParticipant.unreadCount = 0;
      userParticipant.lastRead = new Date();
      await conversation.save();
    }

    const total = await Message.countDocuments({ conversationId });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Get user conversations
const getUserConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const conversations = await Conversation.find({
      'participants.userId': req.user.id
    })
      .populate('participants.userId', 'username profileImage lastSeen')
      .populate('lastMessage.senderId', 'username')
      .populate('orderId', 'orderId status')
      .sort({ 'lastMessage.sentAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p.userId._id.toString() !== req.user.id
      );
      const currentUserParticipant = conv.participants.find(
        p => p.userId._id.toString() === req.user.id
      );

      return {
        ...conv.toObject(),
        otherUser: otherParticipant?.userId,
        unreadCount: currentUserParticipant?.unreadCount || 0,
        lastRead: currentUserParticipant?.lastRead
      };
    });

    const total = await Conversation.countDocuments({
      'participants.userId': req.user.id
    });

    res.json({
      conversations: formattedConversations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Start conversation with a user
const startConversation = async (req, res) => {
  try {
    const { userId, gigId, message } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({ error: "Cannot start conversation with yourself" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate conversation ID
    const participants = [req.user.id, userId].sort();
    const conversationId = `conv_${participants.join('_')}`;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({ conversationId });
    
    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        participants: participants.map(userId => ({ userId })),
        gigId: gigId || null,
        conversationType: "inquiry"
      });
      await conversation.save();
    }

    // Send initial message if provided
    if (message) {
      const newMessage = new Message({
        conversationId,
        senderId: req.user.id,
        receiverId: userId,
        message,
        messageType: "text"
      });

      await newMessage.save();

      // Update conversation
      conversation.lastMessage = {
        message,
        senderId: req.user.id,
        messageType: "text",
        sentAt: new Date()
      };

      // Update unread count
      const receiverParticipant = conversation.participants.find(
        p => p.userId.toString() === userId
      );
      if (receiverParticipant) {
        receiverParticipant.unreadCount += 1;
      }

      await conversation.save();
    }

    res.json({
      message: "Conversation started successfully",
      conversationId,
      conversation
    });
  } catch (error) {
    console.error("Start conversation error:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Can only delete your own messages" });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.user.id
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      const userParticipant = conv.participants.find(
        p => p.userId.toString() === req.user.id
      );
      if (userParticipant) {
        totalUnread += userParticipant.unreadCount || 0;
      }
    });

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};

module.exports = {
  sendMessage,
  getConversationMessages,
  getUserConversations,
  startConversation,
  deleteMessage,
  getUnreadCount
};