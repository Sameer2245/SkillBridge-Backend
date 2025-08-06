const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");
const User = require("../models/User");
const Gig = require("../models/Gig");
const Notification = require("../models/Notification");

// Create a review
const createReview = async (req, res) => {
  try {
    const {
      orderId,
      rating,
      comment,
      communication,
      serviceAsDescribed,
      buyAgain
    } = req.body;

    // Validate order exists and is completed
    const order = await Order.findById(orderId)
      .populate('buyerId')
      .populate('sellerId');
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "completed") {
      return res.status(400).json({ error: "Can only review completed orders" });
    }

    // Check if user is involved in the order
    if (order.buyerId._id.toString() !== req.user.id && 
        order.sellerId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to review this order" });
    }

    // Determine review type and reviewee
    const isBuyerReview = order.buyerId._id.toString() === req.user.id;
    const revieweeId = isBuyerReview ? order.sellerId._id : order.buyerId._id;
    const reviewType = isBuyerReview ? "buyer_to_seller" : "seller_to_buyer";

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewerId: req.user.id,
      orderId: orderId
    });

    if (existingReview) {
      return res.status(400).json({ error: "Review already exists for this order" });
    }

    // Create review
    const newReview = new Review({
      reviewerId: req.user.id,
      revieweeId,
      orderId,
      gigId: order.gigId,
      rating,
      comment,
      communication: isBuyerReview ? communication : undefined,
      serviceAsDescribed: isBuyerReview ? serviceAsDescribed : undefined,
      buyAgain: isBuyerReview ? buyAgain : undefined,
      reviewType
    });

    const savedReview = await newReview.save();
    await savedReview.populate('reviewerId', 'username profileImage');

    // Update reviewee's rating
    await updateUserRating(revieweeId);
    
    // If it's a buyer review, update gig rating
    if (isBuyerReview) {
      await updateGigRating(order.gigId);
    }

    // Mark order as reviewed
    order.reviewLeft = true;
    await order.save();

    // Create notification for reviewee
    await new Notification({
      userId: revieweeId,
      title: "New Review Received",
      message: `You received a ${rating}-star review`,
      type: "review_received",
      relatedId: savedReview._id,
      relatedModel: "Review",
      actionUrl: `/reviews/${savedReview._id}`
    }).save();

    res.status(201).json({
      message: "Review created successfully",
      review: savedReview
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
};

// Get reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type = "received" } = req.query;

    let filter = {};
    if (type === "received") {
      filter.revieweeId = userId;
    } else if (type === "given") {
      filter.reviewerId = userId;
    }

    const reviews = await Review.find(filter)
      .populate('reviewerId', 'username profileImage country')
      .populate('revieweeId', 'username profileImage')
      .populate('gigId', 'title images')
      .populate('orderId', 'orderId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    // Calculate rating statistics for received reviews
    let ratingStats = null;
    if (type === "received") {
      const stats = await Review.aggregate([
        { $match: { revieweeId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } }
          }
        }
      ]);

      ratingStats = stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
      };
    }

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      ratingStats
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get reviews for a gig
const getGigReviews = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    let filter = { 
      gigId,
      reviewType: "buyer_to_seller",
      isPublic: true
    };

    if (rating) {
      filter.rating = Number(rating);
    }

    const reviews = await Review.find(filter)
      .populate('reviewerId', 'username profileImage country')
      .populate('orderId', 'orderId packageType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    // Get rating statistics
    const ratingStats = await Review.aggregate([
      { 
        $match: { 
          gigId: mongoose.Types.ObjectId(gigId),
          reviewType: "buyer_to_seller",
          isPublic: true
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      ratingStats: ratingStats[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
      }
    });
  } catch (error) {
    console.error("Get gig reviews error:", error);
    res.status(500).json({ error: "Failed to fetch gig reviews" });
  }
};

// Respond to a review
const respondToReview = async (req, res) => {
  try {
    const { message } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.revieweeId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Can only respond to reviews about you" });
    }

    if (review.response && review.response.message) {
      return res.status(400).json({ error: "Response already exists" });
    }

    review.response = {
      message,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      message: "Response added successfully",
      review
    });
  } catch (error) {
    console.error("Respond to review error:", error);
    res.status(500).json({ error: "Failed to respond to review" });
  }
};

// Report a review
const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    review.isReported = true;
    await review.save();

    res.json({ message: "Review reported successfully" });
  } catch (error) {
    console.error("Report review error:", error);
    res.status(500).json({ error: "Failed to report review" });
  }
};

// Helper function to update user rating
const updateUserRating = async (userId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { revieweeId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(userId, {
        totalRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error("Update user rating error:", error);
  }
};

// Helper function to update gig rating
const updateGigRating = async (gigId) => {
  try {
    const stats = await Review.aggregate([
      { 
        $match: { 
          gigId: mongoose.Types.ObjectId(gigId),
          reviewType: "buyer_to_seller"
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Gig.findByIdAndUpdate(gigId, {
        totalRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error("Update gig rating error:", error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getGigReviews,
  respondToReview,
  reportReview
};