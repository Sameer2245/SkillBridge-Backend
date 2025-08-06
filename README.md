# SkillBridge Backend API

## 🚀 Node.js/Express REST API for SkillBridge Freelance Marketplace

A comprehensive backend API built with Node.js, Express, and MongoDB for the SkillBridge freelance marketplace platform.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe Integration
- **Real-time**: Socket.io
- **File Upload**: Cloudinary
- **Security**: bcryptjs, CORS, helmet
- **Validation**: express-validator

## 📋 Features

### Core API Features
- ✅ **User Authentication** - JWT-based auth with dual roles
- ✅ **Gig Management** - CRUD operations for service listings
- ✅ **Order System** - Complete order lifecycle management
- ✅ **Payment Processing** - Stripe integration with webhooks
- ✅ **Real-time Chat** - Socket.io messaging system
- ✅ **Review System** - Rating and review management
- ✅ **Search & Filtering** - Advanced search with MongoDB indexing
- ✅ **File Upload** - Cloudinary integration for images/videos
- ✅ **Notifications** - Real-time notification system

### Security Features
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Environment variable security
- ✅ Stripe webhook verification

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe account for payments
- Cloudinary account (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sameer2245/SkillBridge-Backend.git
cd SkillBridge-Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Database
MONGO_URI=mongodb://localhost:27017/skillbridge
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/skillbridge

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL (Frontend URL)
CLIENT_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
NODE_ENV=development
```

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at: `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Reset password

### Gigs
- `GET /api/gigs` - Get all gigs
- `GET /api/gigs/:id` - Get gig by ID
- `POST /api/gigs` - Create new gig (auth required)
- `PUT /api/gigs/:id` - Update gig (auth required)
- `DELETE /api/gigs/:id` - Delete gig (auth required)
- `GET /api/gigs/search` - Search gigs

### Orders
- `GET /api/orders` - Get user orders (auth required)
- `POST /api/orders` - Create new order (auth required)
- `PUT /api/orders/:id/status` - Update order status (auth required)
- `POST /api/orders/:id/deliver` - Deliver order (auth required)
- `POST /api/orders/:id/accept` - Accept delivery (auth required)

### Messages
- `GET /api/messages/conversations` - Get conversations (auth required)
- `GET /api/messages/conversations/:id/messages` - Get messages (auth required)
- `POST /api/messages` - Send message (auth required)

### Payments
- `POST /api/payments/create-intent` - Create payment intent (auth required)
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/history` - Payment history (auth required)

### Reviews
- `GET /api/reviews/gig/:gigId` - Get gig reviews
- `POST /api/reviews` - Create review (auth required)
- `PUT /api/reviews/:id` - Update review (auth required)

## 🗄️ Database Models

### User Model
- Authentication and profile information
- Role-based access (freelancer/client)
- Skills, portfolio, and ratings

### Gig Model
- Service listings with packages
- Categories and tags
- Pricing and delivery information

### Order Model
- Order lifecycle management
- Payment status tracking
- Requirements and deliverables

### Message Model
- Real-time chat functionality
- Conversation management
- File attachments support

### Review Model
- Rating and feedback system
- Reply functionality
- Moderation features

## 🚀 Deployment

### Railway Deployment (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy with automatic builds

### Heroku Deployment
1. Create Heroku app
2. Set environment variables
3. Deploy using Git

### Manual Server Deployment
1. Set up Node.js environment
2. Configure process manager (PM2)
3. Set up reverse proxy (Nginx)
4. Configure SSL certificates

## 🧪 Testing

### Run Tests
```bash
npm test
```

### API Testing
Use tools like Postman or Thunder Client with the provided API documentation.

### Seed Test Data
```bash
# Create sample users and gigs
node scripts/seedTestData.js

# Create payment test data
node scripts/seedPaymentTestData.js
```

## 📊 Performance

- **Database Indexing** for optimized queries
- **Connection Pooling** for MongoDB
- **Response Compression** enabled
- **CORS Optimization** configured
- **Error Handling** middleware

## 🔧 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Payment Guide](PAYMENT_GUIDE.md) - Stripe integration guide
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue in this repository
- Check the API documentation
- Review server logs for debugging

## 🌐 Live API

- **Production URL**: `https://skillbridge-production-53c7.up.railway.app`
- **API Health Check**: `GET /health`
- **API Status**: `GET /api/status`

---

**Built with ❤️ for the SkillBridge Freelance Marketplace**
