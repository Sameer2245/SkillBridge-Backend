const express = require('express');
const router = express.Router();

// Get Stripe publishable key
router.get('/stripe-key', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

module.exports = router;