const express = require("express");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Initialize Cloudinary only if configured
let cloudinary = null;
try {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary = require("../config/cloudinary");
  }
} catch (error) {
  console.log("Cloudinary not configured, profile image uploads will be disabled");
}

const router = express.Router();

// Public routes
router.get("/public/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Protected routes
router.use(verifyToken);

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const {
      fullName,
      description,
      country,
      phone,
      skills,
      languages
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        description,
        country,
        phone,
        skills: skills || [],
        languages: languages || []
      },
      { new: true }
    ).select('-password');

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Upload profile image
router.post("/upload-avatar", upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    if (!cloudinary) {
      return res.status(500).json({ error: "Image upload service not configured" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile-images',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' }
      ]
    });

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      message: "Profile image updated successfully",
      profileImage: result.secure_url,
      user: updatedUser
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
});

// Change password
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Become a seller
router.post("/become-seller", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isSeller) {
      return res.status(400).json({ error: "User is already a seller" });
    }

    await User.findByIdAndUpdate(req.user.id, { isSeller: true });

    res.json({ message: "Successfully became a seller" });
  } catch (error) {
    console.error("Become seller error:", error);
    res.status(500).json({ error: "Failed to become seller" });
  }
});

// Get user notifications
router.get("/notifications", async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    let filter = { userId: req.user.id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.put("/notifications/mark-all-read", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Update last seen
router.put("/update-last-seen", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      lastSeen: new Date()
    });

    res.json({ message: "Last seen updated" });
  } catch (error) {
    console.error("Update last seen error:", error);
    res.status(500).json({ error: "Failed to update last seen" });
  }
});

module.exports = router;