const express = require('express');
const verifyToken = require('../middleware/verifyToken');

// Initialize Stripe only if secret key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}
const Order = require('../models/Order');
const User = require('../models/User');
const Gig = require('../models/Gig');

const router = express.Router();

// Middleware to check if Stripe is configured
const checkStripeConfig = (req, res, next) => {
  if (!stripe) {
    return res.status(503).json({ 
      message: 'Payment service is not configured. Please add your Stripe API keys to the environment variables.' 
    });
  }
  next();
};

// Create payment intent
router.post('/create-intent', verifyToken, checkStripeConfig, async (req, res) => {
  try {
    const { gigId, package, requirements } = req.body;
    const buyerId = req.user.id;

    // Get gig details
    const gig = await Gig.findById(gigId).populate('userId');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Get package details
    let packageDetails;
    let price;

    if (package === 'basic') {
      packageDetails = gig.packages.basic;
      price = gig.packages.basic.price;
    } else if (package === 'standard' && gig.packages.standard) {
      packageDetails = gig.packages.standard;
      price = gig.packages.standard.price;
    } else if (package === 'premium' && gig.packages.premium) {
      packageDetails = gig.packages.premium;
      price = gig.packages.premium.price;
    } else {
      // Fallback to legacy pricing
      packageDetails = {
        title: gig.title,
        description: gig.description,
        price: gig.price,
        deliveryTime: gig.deliveryTime,
        revisions: gig.revisions,
      };
      price = gig.price;
    }

    // Calculate total with service fee (5%)
    const serviceFee = price * 0.05;
    const totalAmount = price + serviceFee;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        gigId: gigId,
        buyerId: buyerId,
        sellerId: gig.userId._id.toString(),
        package: package,
        price: price.toString(),
        serviceFee: serviceFee.toString(),
      },
    });

    // Create pending order
    const order = new Order({
      gigId,
      buyerId,
      sellerId: gig.userId._id,
      package,
      packageDetails,
      requirements: requirements || [],
      price,
      serviceFee,
      totalAmount,
      paymentIntentId: paymentIntent.id,
      status: 'pending_payment',
    });

    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Confirm payment (webhook handler)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).send('Payment service not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      try {
        // Update order status
        const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
        if (order) {
          order.status = 'active';
          order.paymentStatus = 'completed';
          await order.save();

          // Update gig stats
          await Gig.findByIdAndUpdate(order.gigId, {
            $inc: { totalOrders: 1 }
          });

          // Update seller stats
          await User.findByIdAndUpdate(order.sellerId, {
            $inc: { ongoingOrders: 1 }
          });

          // Emit socket event for real-time updates
          const io = req.app.get('io');
          if (io) {
            io.to(`user_${order.buyerId}`).emit('order_status_changed', {
              orderId: order._id,
              status: 'active',
              message: 'Payment successful! Your order is now active.'
            });
            
            io.to(`user_${order.sellerId}`).emit('order_status_changed', {
              orderId: order._id,
              status: 'active',
              message: 'New order received!'
            });
          }
        }
      } catch (error) {
        console.error('Error updating order after payment:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      try {
        // Update order status
        const order = await Order.findOne({ paymentIntentId: failedPayment.id });
        if (order) {
          order.status = 'cancelled';
          order.paymentStatus = 'failed';
          await order.save();

          // Emit socket event
          const io = req.app.get('io');
          if (io) {
            io.to(`user_${order.buyerId}`).emit('order_status_changed', {
              orderId: order._id,
              status: 'cancelled',
              message: 'Payment failed. Please try again.'
            });
          }
        }
      } catch (error) {
        console.error('Error updating order after payment failure:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get payment history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
      paymentStatus: 'completed'
    })
    .populate('gigId', 'title images')
    .populate('buyerId', 'username profileImage')
    .populate('sellerId', 'username profileImage')
    .sort({ createdAt: -1 });

    res.json({ data: orders });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});

// Get seller earnings
router.get('/earnings', verifyToken, async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    const earnings = await Order.aggregate([
      {
        $match: {
          sellerId: sellerId,
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$price' },
          totalOrders: { $sum: 1 },
          pendingEarnings: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                '$price',
                0
              ]
            }
          }
        }
      }
    ]);

    const result = earnings[0] || {
      totalEarnings: 0,
      totalOrders: 0,
      pendingEarnings: 0
    };

    res.json({ data: result });
  } catch (error) {
    console.error('Earnings fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch earnings' });
  }
});

// Process refund (admin only or specific conditions)
router.post('/refund', verifyToken, checkStripeConfig, async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to request refund
    if (order.buyerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if refund is possible (within certain timeframe, etc.)
    const daysSinceOrder = (Date.now() - order.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceOrder > 14) {
      return res.status(400).json({ message: 'Refund period has expired' });
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      reason: 'requested_by_customer',
      metadata: {
        orderId: orderId,
        reason: reason
      }
    });

    // Update order status
    order.status = 'refunded';
    order.refundId = refund.id;
    order.refundReason = reason;
    await order.save();

    res.json({ message: 'Refund processed successfully', refundId: refund.id });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

// Get buyer spending analytics
router.get('/spending', verifyToken, async (req, res) => {
  try {
    const buyerId = req.user.id;
    
    const spending = await Order.aggregate([
      {
        $match: {
          buyerId: buyerId,
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const result = spending[0] || {
      totalSpent: 0,
      totalOrders: 0,
      averageOrderValue: 0
    };

    res.json({ data: result });
  } catch (error) {
    console.error('Spending fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch spending data' });
  }
});

// Get payment analytics
router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const analytics = await Order.aggregate([
      {
        $match: {
          $or: [{ buyerId: userId }, { sellerId: userId }],
          paymentStatus: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$sellerId', userId] },
                '$price',
                0
              ]
            }
          },
          spending: {
            $sum: {
              $cond: [
                { $eq: ['$buyerId', userId] },
                '$totalAmount',
                0
              ]
            }
          },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ data: analytics });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Verify payment status
router.get('/verify/:paymentIntentId', verifyToken, checkStripeConfig, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      created: paymentIntent.created
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// Get payment fees calculation
router.get('/fees', verifyToken, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.query;
    const orderAmount = parseFloat(amount);
    
    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Calculate fees (5% service fee + Stripe fees)
    const serviceFee = orderAmount * 0.05;
    const stripeFee = (orderAmount + serviceFee) * 0.029 + 0.30; // Stripe's standard rate
    const totalFees = serviceFee + stripeFee;
    const totalAmount = orderAmount + serviceFee;

    res.json({
      orderAmount,
      serviceFee: parseFloat(serviceFee.toFixed(2)),
      stripeFee: parseFloat(stripeFee.toFixed(2)),
      totalFees: parseFloat(totalFees.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      currency
    });
  } catch (error) {
    console.error('Fee calculation error:', error);
    res.status(500).json({ message: 'Failed to calculate fees' });
  }
});

module.exports = router;