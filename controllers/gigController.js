const Gig = require("../models/Gig");
const User = require("../models/User");

// Initialize Cloudinary only if configured
let cloudinary = null;
try {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary = require("../config/cloudinary");
  }
} catch (error) {
  console.log("Cloudinary not configured, file uploads will be disabled");
}

// Create a new gig
const createGig = async (req, res) => {
  try {
    const {
      title,
      category,
      subcategory,
      description,
      packages,
      tags,
      requirements,
      faq
    } = req.body;

    // Validate user is a seller
    const user = await User.findById(req.user.id);
    if (!user.isSeller) {
      return res.status(403).json({ error: "Only sellers can create gigs" });
    }

    // Create gig with basic package as default price
    const newGig = new Gig({
      userId: req.user.id,
      title,
      category,
      subcategory,
      description,
      packages,
      price: packages.basic.price, // For backward compatibility
      deliveryTime: packages.basic.deliveryTime,
      revisions: packages.basic.revisions,
      tags: tags || [],
      requirements: requirements || [],
      faq: faq || [],
      searchTags: [...(tags || []), title.toLowerCase().split(' ')].flat()
    });

    const savedGig = await newGig.save();
    await savedGig.populate('userId', 'username profileImage totalRating totalReviews');

    res.status(201).json({
      message: "Gig created successfully",
      gig: savedGig
    });
  } catch (error) {
    console.error("Create gig error:", error);
    res.status(500).json({ error: "Failed to create gig" });
  }
};

// Get all gigs with filtering and pagination
const getGigs = async (req, res) => {
  try {
    console.log('🔍 GetGigs called with query params:', req.query);
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      minPrice,
      maxPrice,
      deliveryTime,
      search,
      query, // Also accept 'query' parameter for search
      q, // Also accept 'q' parameter for search
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build simple filter object
    const filter = { 
      isActive: true
    };
    
    // Only add isPaused filter if not searching
    const searchTerm = search || query || q;
    if (!searchTerm) {
      filter.$or = [
        { isPaused: { $exists: false } },
        { isPaused: false }
      ];
    } else {
      // When searching, keep it simple
      filter.isPaused = { $ne: true };
    }
    
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (minPrice || maxPrice) {
      filter['packages.basic.price'] = {};
      if (minPrice) filter['packages.basic.price'].$gte = Number(minPrice);
      if (maxPrice) filter['packages.basic.price'].$lte = Number(maxPrice);
    }
    if (deliveryTime) {
      filter['packages.basic.deliveryTime'] = { $lte: Number(deliveryTime) };
    }
    
    // Handle search with simple regex - no text search to avoid conflicts
    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { subcategory: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('📋 Filter applied:', JSON.stringify(filter, null, 2));
    console.log('🔧 Sort applied:', sort);
    
    const gigs = await Gig.find(filter)
      .populate('userId', 'username profileImage totalRating totalReviews country')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gig.countDocuments(filter);
    
    console.log(`📊 Found ${gigs.length} gigs out of ${total} total`);
    console.log('🎯 Gig titles:', gigs.map(g => g.title));

    res.json({
      gigs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get gigs error:", error);
    res.status(500).json({ error: "Failed to fetch gigs" });
  }
};

// Get single gig by ID
const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('userId', 'username profileImage totalRating totalReviews country description completedOrders lastSeen');

    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    res.json(gig);
  } catch (error) {
    console.error("Get gig error:", error);
    res.status(500).json({ error: "Failed to fetch gig" });
  }
};

// Update gig
const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    if (gig.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this gig" });
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      { ...req.body, searchTags: [...(req.body.tags || []), req.body.title?.toLowerCase().split(' ')].flat() },
      { new: true }
    ).populate('userId', 'username profileImage totalRating totalReviews');

    res.json({
      message: "Gig updated successfully",
      gig: updatedGig
    });
  } catch (error) {
    console.error("Update gig error:", error);
    res.status(500).json({ error: "Failed to update gig" });
  }
};

// Delete gig
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    if (gig.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this gig" });
    }

    await Gig.findByIdAndDelete(req.params.id);

    res.json({ message: "Gig deleted successfully" });
  } catch (error) {
    console.error("Delete gig error:", error);
    res.status(500).json({ error: "Failed to delete gig" });
  }
};

// Get seller's gigs
const getSellerGigs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const gigs = await Gig.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gig.countDocuments({ userId: req.user.id });

    res.json({
      gigs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get seller gigs error:", error);
    res.status(500).json({ error: "Failed to fetch seller gigs" });
  }
};

// Upload gig images
const uploadGigImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    if (!cloudinary) {
      return res.status(500).json({ error: "Image upload service not configured" });
    }

    const imageUrls = [];
    
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'gig-images',
        transformation: [
          { width: 800, height: 600, crop: 'fill' }
        ]
      });
      imageUrls.push(result.secure_url);
    }

    res.json({
      message: "Images uploaded successfully",
      imageUrls
    });
  } catch (error) {
    console.error("Upload images error:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
};

// Toggle gig status (pause/unpause)
const toggleGigStatus = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    if (gig.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    gig.isPaused = !gig.isPaused;
    await gig.save();

    res.json({
      message: `Gig ${gig.isPaused ? 'paused' : 'activated'} successfully`,
      gig
    });
  } catch (error) {
    console.error("Toggle gig status error:", error);
    res.status(500).json({ error: "Failed to toggle gig status" });
  }
};

module.exports = {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  getSellerGigs,
  uploadGigImages,
  toggleGigStatus
};