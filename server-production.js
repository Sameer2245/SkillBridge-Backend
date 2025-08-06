const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

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
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

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

// Simple root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 SkillBridge API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
});

// Routes with error handling
const routeConfigs = [
  { path: '/api/auth', file: './routes/auth' },
  { path: '/api/gigs', file: './routes/gigs' },
  { path: '/api/orders', file: './routes/orders' },
  { path: '/api/messages', file: './routes/messages' },
  { path: '/api/reviews', file: './routes/reviews' },
  { path: '/api/users', file: './routes/users' },
  { path: '/api/payments', file: './routes/payments' },
  { path: '/api/stripe', file: './routes/stripe' },
  { path: '/api/search', file: './routes/search' },
  { path: '/api/notifications', file: './routes/notifications' },
  { path: '/api/config', file: './routes/config' }
];

let loadedRoutes = 0;
routeConfigs.forEach(({ path, file }) => {
  try {
    const route = require(file);
    app.use(path, route);
    loadedRoutes++;
    console.log(`✅ Loaded route: ${path}`);
  } catch (error) {
    console.warn(`⚠️ Failed to load route ${path}:`, error.message);
  }
});

console.log(`📊 Loaded ${loadedRoutes}/${routeConfigs.length} routes successfully`);

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User joined conversation: ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User left conversation: ${conversationId}`);
  });

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

  socket.on('order_update', (data) => {
    io.to(`user_${data.buyerId}`).emit('order_status_changed', data);
    io.to(`user_${data.sellerId}`).emit('order_status_changed', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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
if (process.env.MONGO_URI && process.env.MONGO_URI !== 'mongodb://localhost:27017/skillbridge-prod') {
  console.log('🔄 Connecting to MongoDB Atlas...');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB Atlas connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️ Server running without database connection');
    });
} else {
  console.log('⚠️ No valid MongoDB URI provided, server running without database');
  console.log('🔧 Please set up MongoDB Atlas and update MONGO_URI environment variable');
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🔊 Server listening on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 CORS allowed origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`📡 API URL: https://skillbridge-production-53c7.up.railway.app`);
});
