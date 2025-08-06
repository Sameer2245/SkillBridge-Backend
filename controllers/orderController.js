const Order = require("../models/Order");
const Gig = require("../models/Gig");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      gigId,
      packageType,
      requirements
    } = req.body;

    const gig = await Gig.findById(gigId).populate('userId');
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    if (gig.userId._id.toString() === req.user.id) {
      return res.status(400).json({ error: "Cannot order your own gig" });
    }

    const selectedPackage = gig.packages[packageType];
    if (!selectedPackage) {
      return res.status(400).json({ error: "Invalid package type" });
    }

    // Calculate pricing
    const price = selectedPackage.price;
    const serviceFee = Math.round(price * 0.05); // 5% service fee
    const totalAmount = price + serviceFee;

    // Calculate expected delivery
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + selectedPackage.deliveryTime);

    // Create order
    const newOrder = new Order({
      buyerId: req.user.id,
      sellerId: gig.userId._id,
      gigId: gigId,
      packageType,
      title: selectedPackage.title,
      description: selectedPackage.description,
      price,
      serviceFee,
      totalAmount,
      deliveryTime: selectedPackage.deliveryTime,
      expectedDelivery,
      maxRevisions: selectedPackage.revisions,
      requirements: requirements || [],
      status: "pending"
    });

    const savedOrder = await newOrder.save();

    // Create Stripe payment intent (if Stripe is configured)
    let paymentIntent = null;
    if (stripe) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: savedOrder._id.toString(),
          buyerId: req.user.id,
          sellerId: gig.userId._id.toString()
        }
      });

      // Update order with payment intent
      savedOrder.paymentIntentId = paymentIntent.id;
      await savedOrder.save();
    }

    // Create notification for seller
    await new Notification({
      userId: gig.userId._id,
      title: "New Order Received",
      message: `You received a new order for "${gig.title}"`,
      type: "order_placed",
      relatedId: savedOrder._id,
      relatedModel: "Order",
      actionUrl: `/orders/${savedOrder._id}`
    }).save();

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
      clientSecret: paymentIntent ? paymentIntent.client_secret : null
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Confirm payment and activate order
const confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Verify payment with Stripe (if configured)
    let paymentSucceeded = false;
    
    if (stripe && paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentSucceeded = paymentIntent.status === 'succeeded';
    } else {
      // For demo purposes, assume payment succeeded if no Stripe
      paymentSucceeded = true;
    }
    
    if (paymentSucceeded) {
      order.status = "active";
      order.paymentStatus = "paid";
      await order.save();

      // Update gig stats
      await Gig.findByIdAndUpdate(order.gigId, {
        $inc: { totalOrders: 1 }
      });

      // Update seller stats
      await User.findByIdAndUpdate(order.sellerId, {
        $inc: { ongoingOrders: 1 }
      });

      // Create notification for seller
      await new Notification({
        userId: order.sellerId,
        title: "Order Payment Confirmed",
        message: "Payment has been confirmed for your order. You can start working now!",
        type: "payment_received",
        relatedId: order._id,
        relatedModel: "Order",
        actionUrl: `/orders/${order._id}`
      }).save();

      res.json({
        message: "Payment confirmed and order activated",
        order
      });
    } else {
      res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
};

// Get user orders (buyer or seller)
const getUserOrders = async (req, res) => {
  try {
    const { type = 'all', status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    if (type === 'buying') {
      filter.buyerId = req.user.id;
    } else if (type === 'selling') {
      filter.sellerId = req.user.id;
    } else {
      filter.$or = [
        { buyerId: req.user.id },
        { sellerId: req.user.id }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('buyerId', 'username profileImage')
      .populate('sellerId', 'username profileImage')
      .populate('gigId', 'title images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'username profileImage email')
      .populate('sellerId', 'username profileImage email')
      .populate('gigId', 'title description images');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user is involved in this order
    if (order.buyerId._id.toString() !== req.user.id && 
        order.sellerId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Deliver order (seller only)
const deliverOrder = async (req, res) => {
  try {
    const { message, files } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only seller can deliver order" });
    }

    if (order.status !== "active") {
      return res.status(400).json({ error: "Order is not active" });
    }

    // Add delivery
    order.deliverables.push({
      message,
      files: files || []
    });
    
    order.status = "delivered";
    order.actualDelivery = new Date();
    await order.save();

    // Create notification for buyer
    await new Notification({
      userId: order.buyerId,
      title: "Order Delivered",
      message: "Your order has been delivered. Please review and accept.",
      type: "order_delivered",
      relatedId: order._id,
      relatedModel: "Order",
      actionUrl: `/orders/${order._id}`
    }).save();

    res.json({
      message: "Order delivered successfully",
      order
    });
  } catch (error) {
    console.error("Deliver order error:", error);
    res.status(500).json({ error: "Failed to deliver order" });
  }
};

// Accept delivery (buyer only)
const acceptDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only buyer can accept delivery" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ error: "Order is not delivered yet" });
    }

    order.status = "completed";
    order.completedAt = new Date();
    await order.save();

    // Update user stats
    await User.findByIdAndUpdate(order.sellerId, {
      $inc: { 
        completedOrders: 1,
        ongoingOrders: -1
      }
    });

    // Create notification for seller
    await new Notification({
      userId: order.sellerId,
      title: "Order Completed",
      message: "Your order has been accepted and completed!",
      type: "order_completed",
      relatedId: order._id,
      relatedModel: "Order",
      actionUrl: `/orders/${order._id}`
    }).save();

    res.json({
      message: "Order completed successfully",
      order
    });
  } catch (error) {
    console.error("Accept delivery error:", error);
    res.status(500).json({ error: "Failed to accept delivery" });
  }
};

// Request revision (buyer only)
const requestRevision = async (req, res) => {
  try {
    const { message } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only buyer can request revision" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ error: "Can only request revision for delivered orders" });
    }

    if (order.revisionsUsed >= order.maxRevisions) {
      return res.status(400).json({ error: "Maximum revisions exceeded" });
    }

    // Add revision request
    order.revisions.push({
      requestedBy: req.user.id,
      message
    });
    
    order.revisionsUsed += 1;
    order.status = "revision_requested";
    await order.save();

    // Create notification for seller
    await new Notification({
      userId: order.sellerId,
      title: "Revision Requested",
      message: "The buyer has requested a revision for your order.",
      type: "order_delivered", // Reusing type
      relatedId: order._id,
      relatedModel: "Order",
      actionUrl: `/orders/${order._id}`
    }).save();

    res.json({
      message: "Revision requested successfully",
      order
    });
  } catch (error) {
    console.error("Request revision error:", error);
    res.status(500).json({ error: "Failed to request revision" });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check authorization
    if (order.buyerId.toString() !== req.user.id && 
        order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to cancel this order" });
    }

    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({ error: "Cannot cancel this order" });
    }

    order.status = "cancelled";
    order.cancellationReason = reason;
    order.cancelledBy = req.user.id;
    order.cancelledAt = new Date();
    await order.save();

    // Update stats
    await User.findByIdAndUpdate(order.sellerId, {
      $inc: { ongoingOrders: -1 }
    });

    // Create notification for the other party
    const otherUserId = order.buyerId.toString() === req.user.id ? 
      order.sellerId : order.buyerId;
    
    await new Notification({
      userId: otherUserId,
      title: "Order Cancelled",
      message: `Order has been cancelled. Reason: ${reason}`,
      type: "order_cancelled",
      relatedId: order._id,
      relatedModel: "Order",
      actionUrl: `/orders/${order._id}`
    }).save();

    res.json({
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

module.exports = {
  createOrder,
  confirmPayment,
  getUserOrders,
  getOrderById,
  deliverOrder,
  acceptDelivery,
  requestRevision,
  cancelOrder
};