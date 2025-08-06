# FreelanceHub API Documentation

Base URL: `http://localhost:5000/api` (development) or `https://your-api-domain.com/api` (production)

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details (optional)
  }
}
```

## 🔑 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "userType": "freelancer" // or "client"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "userType": "freelancer",
      "isEmailVerified": false
    },
    "token": "jwt_token"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /auth/reset-password/:token
```

**Request Body:**
```json
{
  "password": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

### Verify Email
```http
GET /auth/verify-email/:token
```

## 👤 User Endpoints

### Get Current User
```http
GET /users/me
```
*Requires authentication*

### Update Profile
```http
PUT /users/profile
```
*Requires authentication*

**Request Body (multipart/form-data):**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "description": "Professional web developer",
  "country": "United States",
  "phone": "+1234567890",
  "skills": ["JavaScript", "React", "Node.js"],
  "languages": [
    {
      "language": "English",
      "level": "Native"
    }
  ]
}
```

**Files:**
- `profileImage`: Profile picture file

### Get User Profile
```http
GET /users/:userId
```

### Become Seller
```http
POST /users/become-seller
```
*Requires authentication*

## 🎯 Gig Endpoints

### Get All Gigs
```http
GET /gigs
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `category`: Filter by category
- `search`: Search query
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `deliveryTime`: Maximum delivery time in days
- `sortBy`: Sort by (newest, oldest, price_low, price_high, rating, popular)

### Search Gigs
```http
GET /gigs/search
```

**Query Parameters:**
- `q`: Search query
- `category`: Category filter
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `deliveryTime`: Maximum delivery time
- `sortBy`: Sort order
- `page`: Page number
- `limit`: Items per page

### Get Gig by ID
```http
GET /gigs/:id
```

### Create Gig
```http
POST /gigs
```
*Requires authentication (seller only)*

**Request Body (multipart/form-data):**
```json
{
  "title": "I will create a modern responsive website",
  "description": "Professional website development service...",
  "category": "Web Development",
  "subcategory": "Website Development",
  "tags": ["website", "responsive", "modern"],
  "basicTitle": "Basic Website",
  "basicDescription": "Simple responsive website",
  "basicPrice": 299,
  "basicDeliveryTime": 7,
  "basicRevisions": 2,
  "basicFeatures": ["Responsive Design", "5 Pages", "Contact Form"],
  "standardTitle": "Standard Website",
  "standardDescription": "Advanced website with CMS",
  "standardPrice": 599,
  "standardDeliveryTime": 14,
  "standardRevisions": 3,
  "standardFeatures": ["Everything in Basic", "CMS Integration", "SEO Optimization"],
  "premiumTitle": "Premium Website",
  "premiumDescription": "Full-featured website with e-commerce",
  "premiumPrice": 999,
  "premiumDeliveryTime": 21,
  "premiumRevisions": 5,
  "premiumFeatures": ["Everything in Standard", "E-commerce", "Advanced Analytics"],
  "faqs": [
    {
      "question": "What do you need to get started?",
      "answer": "I need your content, branding materials, and requirements."
    }
  ],
  "requirements": [
    {
      "question": "Do you have existing branding materials?",
      "type": "multiple_choice",
      "required": true,
      "options": ["Yes", "No", "Partial"]
    }
  ]
}
```

**Files:**
- `images`: Gig images (up to 5)
- `video`: Gig video (optional)

### Update Gig
```http
PUT /gigs/:id
```
*Requires authentication (gig owner only)*

### Delete Gig
```http
DELETE /gigs/:id
```
*Requires authentication (gig owner only)*

### Get My Gigs
```http
GET /gigs/my-gigs
```
*Requires authentication (seller only)*

### Get Gigs by Category
```http
GET /gigs/category/:category
```

## 🛒 Order Endpoints

### Get My Orders
```http
GET /orders
```
*Requires authentication*

**Query Parameters:**
- `status`: Filter by status (pending_payment, active, delivered, completed, cancelled, revision)
- `role`: Filter by role (buyer, seller)
- `page`: Page number
- `limit`: Items per page

### Create Order
```http
POST /orders
```
*Requires authentication*

**Request Body:**
```json
{
  "gigId": "gig_id",
  "package": "basic", // basic, standard, or premium
  "requirements": {
    "requirement_id": "answer"
  }
}
```

### Get Order by ID
```http
GET /orders/:id
```
*Requires authentication*

### Update Order Status
```http
PUT /orders/:id/status
```
*Requires authentication (seller only)*

**Request Body:**
```json
{
  "status": "active" // active, delivered, completed, cancelled
}
```

### Deliver Order
```http
POST /orders/:id/deliver
```
*Requires authentication (seller only)*

**Request Body (multipart/form-data):**
```json
{
  "deliveryNote": "Your order has been completed. Please find the files attached."
}
```

**Files:**
- `deliveryFiles`: Delivery files

### Accept Delivery
```http
POST /orders/:id/accept
```
*Requires authentication (buyer only)*

### Request Revision
```http
POST /orders/:id/revision
```
*Requires authentication (buyer only)*

**Request Body:**
```json
{
  "revisionNote": "Please make the following changes..."
}
```

### Cancel Order
```http
POST /orders/:id/cancel
```
*Requires authentication*

**Request Body:**
```json
{
  "reason": "Reason for cancellation"
}
```

## 💬 Message Endpoints

### Get Conversations
```http
GET /messages/conversations
```
*Requires authentication*

### Get Messages
```http
GET /messages/conversations/:conversationId/messages
```
*Requires authentication*

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page

### Send Message
```http
POST /messages
```
*Requires authentication*

**Request Body (multipart/form-data):**
```json
{
  "conversationId": "conversation_id", // optional for new conversation
  "receiverId": "receiver_user_id",
  "content": "Hello, I'm interested in your service"
}
```

**Files:**
- `attachments`: Message attachments

### Mark Message as Read
```http
PUT /messages/:messageId/read
```
*Requires authentication*

### Create Conversation
```http
POST /messages/conversations
```
*Requires authentication*

**Request Body:**
```json
{
  "participantId": "other_user_id",
  "gigId": "gig_id" // optional
}
```

## ⭐ Review Endpoints

### Get Gig Reviews
```http
GET /reviews/gig/:gigId
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `sortBy`: Sort by (newest, oldest, highest, lowest, helpful)

### Create Review
```http
POST /reviews
```
*Requires authentication*

**Request Body:**
```json
{
  "gigId": "gig_id",
  "orderId": "order_id",
  "rating": 5,
  "comment": "Excellent service! Highly recommended."
}
```

### Update Review
```http
PUT /reviews/:reviewId
```
*Requires authentication (review owner only)*

### Delete Review
```http
DELETE /reviews/:reviewId
```
*Requires authentication (review owner only)*

### Vote on Review
```http
POST /reviews/:reviewId/vote
```
*Requires authentication*

**Request Body:**
```json
{
  "isHelpful": true // true for helpful, false for not helpful
}
```

### Report Review
```http
POST /reviews/:reviewId/report
```
*Requires authentication*

**Request Body:**
```json
{
  "reason": "inappropriate" // inappropriate, spam, fake, etc.
}
```

### Get My Reviews
```http
GET /reviews/my-reviews
```
*Requires authentication*

### Get Received Reviews
```http
GET /reviews/received
```
*Requires authentication (seller only)*

## 💳 Payment Endpoints

### Create Payment Intent
```http
POST /payments/create-intent
```
*Requires authentication*

**Request Body:**
```json
{
  "gigId": "gig_id",
  "package": "basic",
  "currency": "usd"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 29900, // amount in cents
    "currency": "usd"
  }
}
```

### Stripe Webhook
```http
POST /payments/webhook
```
*Stripe webhook endpoint - not for direct use*

### Get Payment History
```http
GET /payments/history
```
*Requires authentication*

### Get Seller Earnings
```http
GET /payments/earnings
```
*Requires authentication (seller only)*

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 5420.50,
    "monthlyEarnings": 1250.00,
    "pendingEarnings": 300.00,
    "availableForWithdrawal": 5120.50,
    "earningsHistory": [
      {
        "date": "2024-01-01",
        "amount": 299.00,
        "orderId": "order_id",
        "status": "completed"
      }
    ]
  }
}
```

### Request Withdrawal
```http
POST /payments/withdraw
```
*Requires authentication (seller only)*

**Request Body:**
```json
{
  "amount": 1000.00,
  "method": "bank_transfer", // bank_transfer, paypal
  "accountDetails": {
    "accountNumber": "1234567890",
    "routingNumber": "123456789",
    "accountHolderName": "John Doe"
  }
}
```

## 📊 Analytics Endpoints

### Get Dashboard Stats
```http
GET /analytics/dashboard
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 47,
    "activeOrders": 5,
    "completedOrders": 42,
    "totalEarnings": 5420.50,
    "monthlyEarnings": 1250.00,
    "averageRating": 4.8,
    "totalClients": 32,
    "responseTime": "2 hours",
    "completionRate": 98
  }
}
```

### Get Gig Analytics
```http
GET /analytics/gig/:gigId
```
*Requires authentication (gig owner only)*

## 🔍 Search and Filter Options

### Categories
- Web Development
- Design & Creative
- Writing & Translation
- Digital Marketing
- Video & Animation
- Music & Audio
- Programming & Tech
- Business
- Data Analysis
- Mobile Apps

### Sort Options
- `relevance`: Most relevant (default)
- `newest`: Newest first
- `oldest`: Oldest first
- `price_low`: Price low to high
- `price_high`: Price high to low
- `rating`: Highest rated
- `popular`: Most popular

### Order Status
- `pending_payment`: Waiting for payment
- `active`: Order in progress
- `delivered`: Order delivered, awaiting approval
- `completed`: Order completed and approved
- `cancelled`: Order cancelled
- `revision`: Revision requested

## 🚫 Error Codes

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `429`: Too Many Requests
- `500`: Internal Server Error

### Common Error Messages
- `"Invalid credentials"`: Login failed
- `"Token expired"`: JWT token has expired
- `"Access denied"`: Insufficient permissions
- `"Resource not found"`: Requested resource doesn't exist
- `"Validation failed"`: Request data validation failed
- `"Duplicate entry"`: Resource already exists

## 🔌 WebSocket Events

### Client to Server Events
- `join_conversation`: Join a conversation room
- `leave_conversation`: Leave a conversation room
- `typing`: User started typing
- `stop_typing`: User stopped typing

### Server to Client Events
- `new_message`: New message received
- `user_typing`: Another user is typing
- `user_stopped_typing`: Another user stopped typing
- `message_read`: Message was read
- `order_status_changed`: Order status updated
- `notification`: General notification

## 📝 Rate Limiting

- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute
- Search endpoints: 50 requests per minute

## 🔒 Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

For more information or support, please refer to the main documentation or contact the development team.