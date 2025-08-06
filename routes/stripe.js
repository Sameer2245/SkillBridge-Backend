const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const {
  createCheckoutSession,
  handleWebhook,
  getOrderDetails,
  verifyPayment,
} = require('../controllers/paymentController');

const router = express.Router();

// Middleware to check if Stripe is configured
const checkStripeConfig = (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ 
      success: false,
      message: 'Payment service is not configured. Please add your Stripe API keys to the environment variables.' 
    });
  }
  next();
};

// Create checkout session
router.post('/create-checkout-session', verifyToken, checkStripeConfig, createCheckoutSession);

// Stripe webhook (must be before express.json() middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Get order details
router.get('/order/:orderId', verifyToken, getOrderDetails);

// Verify payment status
router.get('/verify/:sessionId', verifyToken, checkStripeConfig, verifyPayment);

module.exports = router;