const express = require('express');
const router = express.Router();
const {
  searchGigs,
  getSearchSuggestions,
  getSearchFilters
} = require('../controllers/searchController');
const Gig = require("../models/Gig");

// @route   GET /api/search
// @desc    Search gigs with filters and pagination
// @access  Public
router.get('/', searchGigs);

// @route   GET /api/search/filters
// @desc    Get available filters for search
// @access  Public
router.get('/filters', getSearchFilters);

// @route   GET /api/search/suggestions
// @desc    Get search suggestions for autocomplete
// @access  Public
router.get('/suggestions', getSearchSuggestions);

// Get popular/trending searches
router.get("/trending", async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get most searched categories from database
    const trendingFromDB = await Gig.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgRating: { $avg: "$totalRating" }
        }
      },
      {
        $sort: { count: -1, avgRating: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          text: "$_id",
          type: "category",
          category: "Popular Categories",
          count: 1
        }
      }
    ]);

    // Popular trending services
    const trendingServices = [
      "logo design", "website development", "content writing", 
      "social media marketing", "video editing", "mobile app",
      "wordpress", "seo", "graphic design", "copywriting",
      "ai chatbot", "data analysis", "business plan", "translation"
    ];

    // Combine with trending services
    const trending = [
      ...trendingFromDB.map(item => ({
        text: item.text,
        type: item.type,
        category: item.category,
        popularity: item.count
      })),
      ...trendingServices.slice(0, Math.max(0, limit - trendingFromDB.length)).map(service => ({
        text: service,
        type: 'trending',
        category: 'Trending Services',
        popularity: Math.floor(Math.random() * 100) + 50 // Mock popularity
      }))
    ].slice(0, limit);

    res.json({ trending });

  } catch (error) {
    console.error("Get trending error:", error);
    res.status(500).json({ error: "Failed to get trending searches" });
  }
});

module.exports = router;