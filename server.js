const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());

// Stripe webhook route (must be before express.json())
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), require('./routes/stripe'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
const authRoutes = require("./routes/auth");
const gigRoutes = require("./routes/gigs");
const orderRoutes = require("./routes/orders");
const messageRoutes = require("./routes/messages");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");
const stripeRoutes = require("./routes/stripe");
const searchRoutes = require("./routes/search");
const notificationRoutes = require("./routes/notifications");
const configRoutes = require("./routes/config");

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/config", configRoutes);

// Simple root route
app.get("/", (req, res) => {
  res.send("🚀 Freelance Marketplace API is running...");
});

// Health check endpoint for deployment platforms
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0"
  });
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins their personal room
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // User joins a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // User leaves a conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User left conversation: ${conversationId}`);
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: data.userId,
      username: data.username
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
      userId: data.userId
    });
  });

  // Handle real-time order updates
  socket.on('order_update', (data) => {
    // Broadcast to both buyer and seller
    io.to(`user_${data.buyerId}`).emit('order_status_changed', data);
    io.to(`user_${data.sellerId}`).emit('order_status_changed', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users map
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to DB
if (process.env.MONGO_URI && 
    process.env.MONGO_URI !== 'mongodb://localhost:27017/skillbridge-prod' &&
    !process.env.MONGO_URI.includes('<db_password>')) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      console.log("⚠️ Server running without database connection");
    });
} else {
  console.log("⚠️ No valid MongoDB URI provided or placeholder password detected");
  console.log("🔧 Please set up MongoDB Atlas and update MONGO_URI environment variable");
  console.log("📍 Server will run without database connection");
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🔊 Server listening on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});
