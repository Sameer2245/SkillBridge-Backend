const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const emailService = require("../services/emailService");

const router = express.Router();

// ✅ Register route
router.post("/register", async (req, res) => {
  try {
    console.log("🔍 Registration attempt:", { 
      body: req.body, 
      timestamp: new Date().toISOString() 
    });
    
    const { username, email, password, isSeller } = req.body;

    // Validation
    if (!username || !email || !password) {
      console.log("❌ Validation failed: Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters long" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check for existing user by email
    console.log("🔍 Checking for existing email:", email);
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.log("❌ Email already exists:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check for existing user by username
    console.log("🔍 Checking for existing username:", username);
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      console.log("❌ Username already exists:", username);
      return res.status(400).json({ message: "Username already taken" });
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("👤 Creating new user...");
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isSeller: isSeller || false,
    });

    console.log("💾 Saving user to database...");
    await newUser.save();
    console.log("✅ User saved successfully:", newUser._id);

    // Generate JWT token
    console.log("🔑 Generating JWT token...");
    const token = jwt.sign(
      { id: newUser._id, isSeller: newUser.isSeller },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("✅ JWT token generated successfully");

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, username);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    console.log("🎉 Registration successful, sending response...");
    res.status(201).json({ 
      message: "User registered successfully!",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isSeller: newUser.isSeller,
      }
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ✅ Login route
router.post("/login", async (req, res) => {
  try {
    console.log("🔍 Login attempt:", { 
      body: req.body, 
      timestamp: new Date().toISOString() 
    });
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("❌ Validation failed: Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("🔍 Looking for user with email:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found with email:", email);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    console.log("✅ User found:", { id: user._id, username: user.username, email: user.email });
    console.log("🔐 Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    console.log("✅ Password match successful");
    console.log("🔑 Generating JWT token...");
    const token = jwt.sign(
      { id: user._id, isSeller: user.isSeller },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🎉 Login successful, sending response...");
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isSeller: user.isSeller,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ✅ Protected route
router.get("/me", verifyToken, (req, res) => {
  try {
    res.status(200).json({
      message: "User is authenticated",
      user: req.user, // comes from JWT
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user info" });
  }
});

// ✅ Forgot Password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ error: "Server error during password reset request" });
  }
});

// ✅ Reset Password route
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

// ✅ Test route to check database connection
router.get("/test-db", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ 
      message: "Database connection successful", 
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Database test error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

module.exports = router;
