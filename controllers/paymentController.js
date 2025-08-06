// Initialize Stripe only if API key is available
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️ Stripe API key not found. Payment features will be disabled.');
}
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');

// Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        success: false, 
        message: 'Payment service is not available. Stripe API key is not configured.' 
      });
    }

    const { gigId, packageType, requirements } = req.body;
    const buyerId = req.user.id;

    console.log('🔍 Creating checkout session:', { gigId, packageType, buyerId });

    // Validate input
    if (!gigId || !packageType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gig ID and package type are required' 
      });
    }

    // Get gig details
    const gig = await Gig.findById(gigId).populate('userId', 'username email');
    if (!gig) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gig not found' 
      });
    }

    // Check if user is trying to buy their own gig
    if (gig.userId._id.toString() === buyerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot purchase your own gig' 
      });
    }

    // Get package details
    let packageDetails;
    let price;
    let deliveryTime;
    let revisions;

    if (packageType === 'basic') {
      packageDetails = gig.packages.basic;
      price = gig.packages.basic.price;
      deliveryTime = gig.packages.basic.deliveryTime;
      revisions = gig.packages.basic.revisions;
    } else if (packageType === 'standard' && gig.packages.standard) {
      packageDetails = gig.packages.standard;
      price = gig.packages.standard.price;
      deliveryTime = gig.packages.standard.deliveryTime;
      revisions = gig.packages.standard.revisions;
    } else if (packageType === 'premium' && gig.packages.premium) {
      packageDetails = gig.packages.premium;
      price = gig.packages.premium.price;
      deliveryTime = gig.packages.premium.deliveryTime;
      revisions = gig.packages.premium.revisions;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid package type' 
      });
    }

    // Calculate service fee (5%)
    const serviceFee = Math.round(price * 0.05 * 100) / 100;
    const totalAmount = price + serviceFee;

    // Calculate expected delivery date
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + deliveryTime);

    // Create pending order first
    const order = new Order({
      buyerId,
      sellerId: gig.userId._id,
      gigId,
      packageType,
      title: packageDetails.title,
      description: packageDetails.description,
      price,
      serviceFee,
      totalAmount,
      deliveryTime,
      expectedDelivery,
      maxRevisions: revisions,
      requirements: requirements || [],
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    console.log('✅ Order created:', order.orderId);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${gig.title} - ${packageDetails.title}`,
              description: packageDetails.description,
              images: gig.images.length > 0 ? [gig.images[0]] : [],
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Service Fee',
              description: 'SkillBridge service fee (5%)',
            },
            unit_amount: Math.round(serviceFee * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/gig/${gigId}?cancelled=true`,
      metadata: {
        orderId: order._id.toString(),
        gigId: gigId,
        buyerId: buyerId,
        sellerId: gig.userId._id.toString(),
        packageType: packageType,
      },
      customer_email: req.user.email,
    });

    // Update order with session ID
    order.paymentIntentId = session.id;
    await order.save();

    console.log('✅ Stripe session created:', session.id);

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order._id,
    });

  } catch (error) {
    console.error('❌ Checkout session creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create checkout session',
      error: error.message 
    });
  }
};

// Handle Stripe webhook
const handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ 
      success: false, 
      message: 'Payment service is not available. Stripe is not configured.' 
    });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('🔔 Webhook received:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Payment successful for session:', session.id);
      
      try {
        // Find the order
        const order = await Order.findById(session.metadata.orderId);
        if (!order) {
          console.error('❌ Order not found for session:', session.id);
          break;
        }

        // Update order status
        order.status = 'active';
        order.paymentStatus = 'paid';
        order.paymentIntentId = session.payment_intent;
        await order.save();

        console.log('✅ Order updated to active:', order.orderId);

        // Update gig stats
        await Gig.findByIdAndUpdate(order.gigId, {
          $inc: { totalOrders: 1 }
        });

        // Update seller stats
        await User.findByIdAndUpdate(order.sellerId, {
          $inc: { 'stats.ongoingOrders': 1 }
        });

        // Emit socket events for real-time updates
        const io = req.app.get('io');
        if (io) {
          io.to(`user_${order.buyerId}`).emit('order_created', {
            orderId: order._id,
            status: 'active',
            message: 'Payment successful! Your order is now active.'
          });
          
          io.to(`user_${order.sellerId}`).emit('new_order', {
            orderId: order._id,
            buyerName: req.user?.username || 'Unknown',
            gigTitle: order.title,
            amount: order.price,
            message: 'You have received a new order!'
          });
        }

        console.log('✅ Order processing completed successfully');

      } catch (error) {
        console.error('❌ Error processing successful payment:', error);
      }
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      console.log('⏰ Session expired:', expiredSession.id);
      
      try {
        // Update order status to cancelled
        const order = await Order.findById(expiredSession.metadata.orderId);
        if (order) {
          order.status = 'cancelled';
          order.paymentStatus = 'failed';
          await order.save();
          console.log('✅ Expired order cancelled:', order.orderId);
        }
      } catch (error) {
        console.error('❌ Error handling expired session:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment failed:', failedPayment.id);
      
      try {
        // Find order by payment intent ID
        const order = await Order.findOne({ paymentIntentId: failedPayment.id });
        if (order) {
          order.status = 'cancelled';
          order.paymentStatus = 'failed';
          await order.save();
          console.log('✅ Failed payment order cancelled:', order.orderId);
        }
      } catch (error) {
        console.error('❌ Error handling failed payment:', error);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId)
      .populate('buyerId', 'username email profileImage')
      .populate('sellerId', 'username email profileImage')
      .populate('gigId', 'title images category');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if user is authorized to view this order
    if (order.buyerId._id.toString() !== userId && order.sellerId._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this order' 
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ Get order details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order details' 
    });
  }
};

// Verify payment status
const verifyPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        success: false, 
        message: 'Payment service is not available. Stripe is not configured.' 
      });
    }

    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      success: true,
      data: {
        status: session.payment_status,
        amount: session.amount_total / 100,
        currency: session.currency,
        customerEmail: session.customer_email,
      }
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment' 
    });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getOrderDetails,
  verifyPayment,
};
