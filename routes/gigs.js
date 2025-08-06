const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  getSellerGigs,
  uploadGigImages,
  toggleGigStatus
} = require("../controllers/gigController");

const router = express.Router();

// Public routes
router.get("/", getGigs);
router.get("/search", getGigs); // Use the same getGigs function for search
router.get("/details/:id", getGigById);
router.get("/:id", getGigById); // Alternative route for gig details

// Protected routes
router.use(verifyToken);

// Seller specific routes (more specific first)
router.get("/seller/my-gigs", getSellerGigs);
router.post("/upload-images", upload.array('images', 5), uploadGigImages);

// Gig management
router.post("/", createGig);
router.put("/:id", updateGig);
router.delete("/:id", deleteGig);
router.patch("/:id/toggle-status", toggleGigStatus);

module.exports = router;

