const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  createReview,
  getUserReviews,
  getGigReviews,
  respondToReview,
  reportReview
} = require("../controllers/reviewController");

const router = express.Router();

// Public routes
router.get("/user/:userId", getUserReviews);
router.get("/gig/:gigId", getGigReviews);

// Protected routes
router.use(verifyToken);

// Review management
router.post("/", createReview);
router.post("/:id/respond", respondToReview);
router.post("/:id/report", reportReview);

module.exports = router;