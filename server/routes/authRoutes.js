const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = new User({ name, email, password: hashedPassword })
    await newUser.save()

    const { sendWelcomeEmail } = require('../utils/emailService')
    try {
      await sendWelcomeEmail(newUser.email, newUser.name)
    } catch (err) {
      console.error('[Email] Welcome email failed:', err.message)
    }

    const token = jwt.sign(
      { id: newUser._id, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Signup failed" })
  }
})

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Update streak
    const today = new Date().toDateString()
    const lastActive = user.lastActiveDate
      ? new Date(user.lastActiveDate).toDateString()
      : null

    if (lastActive !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const wasYesterday = lastActive === yesterday.toDateString()
      user.streak = wasYesterday ? user.streak + 1 : 1
      user.lastActiveDate = new Date()
      await user.save()
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// GET /api/auth/me
router.get("/me", require("../middleware/authMiddleware"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// PUT /api/auth/profile — Update user profile settings
router.put("/profile", require("../middleware/authMiddleware"), async (req, res) => {
  try {
    const { githubUsername, emailNotifications, currentPassword, newPassword } = req.body
    
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }
      user.password = await bcrypt.hash(newPassword, 12)
    }

    if (githubUsername !== undefined) user.githubUsername = githubUsername.trim()
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications

    await user.save()

    const updatedUser = user.toObject()
    delete updatedUser.password

    res.json({ message: "Profile updated successfully", user: updatedUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// GET /api/auth/leaderboard — Get user leaderboard based on streak
router.get("/leaderboard", require("../middleware/authMiddleware"), async (req, res) => {
  try {
    const users = await User.find()
      .select("name streak emailNotifications githubUsername")
      .sort({ streak: -1 })
      .limit(20)
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch leaderboard" })
  }
})

// BACKEND ROUTES FOR FORGOT PASSWORD
const crypto = require('crypto');
const { sendResetOtpEmail } = require('../utils/emailService');

// Step 1 — Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendResetOtpEmail(email, user.name, otp);
    res.json({ message: 'Verification code sent to your email' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// Step 2 — Verify OTP
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.resetOtp !== otp) return res.status(400).json({ message: 'Incorrect code' });
    if (new Date() > user.resetOtpExpiry) return res.status(400).json({ message: 'Code expired — request a new one' });
    res.json({ message: 'Code verified' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// Step 3 — Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid session — restart the process' });
    if (new Date() > user.resetOtpExpiry) return res.status(400).json({ message: 'Session expired' });

    const bcrypt = require('bcryptjs');
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router