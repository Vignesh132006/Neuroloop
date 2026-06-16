const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { sendWelcomeEmail } = require('../utils/emailService')

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

    // Send welcome email — non-blocking, don't await
    sendWelcomeEmail(newUser.email, newUser.name).catch(err =>
      console.error('[Auth] Welcome email failed:', err.message)
    )

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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
  }
})

// GET /api/auth/me
router.get("/me", require("../middleware/authMiddleware"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (error) {
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
  }
})

// BACKEND ROUTES FOR FORGOT PASSWORD
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/emailService');

// Step 1 — Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success even if user not found (security)
    if (!user) {
      return res.json({ message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    console.log(`[Email Reset] Generating OTP for ${email}: ${otp}`);

    // Send OTP email via SendGrid
    await sendOTPEmail(user.email, user.name, otp);

    res.json({ 
      message: 'Verification code sent to your email',
      isFirstTime: !user.hasResetPasswordBefore
    });
  } catch(err) {
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", err)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: err,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", err)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: err,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
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
    user.hasResetPasswordBefore = true;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch(err) {
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", err)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: err,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
  }
});

// Step 4 — Customer Support Submission
router.post('/support', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Generate a unique ticket ID formatted as NL-XXXXX
    const ticketId = 'NL-' + Math.floor(10000 + Math.random() * 90000);
    
    // Save to MongoDB
    const SupportTicket = require("../models/SupportTicket");
    const newTicket = new SupportTicket({
      ticketId,
      name,
      email,
      message
    });
    await newTicket.save();

    // Send support email to admin — non-blocking
    const { sendSupportTicketEmail } = require('../utils/emailService');
    sendSupportTicketEmail(
      ticketId,
      name,
      email,
      'other',
      `Support request from ${name}`,
      message
    ).catch(err => console.error('[Support] Email failed:', err.message))

    res.json({ message: `Ticket submitted! ID: ${ticketId}`, ticketId });
  } catch(err) {
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", err)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: err,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
  }
});

// Step 5 — Automatic Error Report
router.post('/report-error', async (req, res) => {
  try {
    const { email, url, errorMessage, stack } = req.body;
    console.log(`[Error Report Logged] User: ${email}, URL: ${url}, Error: ${errorMessage}`);
    res.json({ message: 'Error report logged' });
  } catch(err) {
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", err)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: err,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
  }
// ── ADMIN LOGIN ─────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const ADMIN_EMAIL = 'neuroloopadmin@gmail.com'
    const ADMIN_PASSWORD = 'Admin@2026'

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials' })
    }

    const token = jwt.sign(
      { id: 'admin', email: ADMIN_EMAIL, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      admin: { email: ADMIN_EMAIL, role: 'admin', name: 'NeuroLoop Admin' }
    })
  } catch (err) {
    console.error('[Admin] Login error:', err)
    res.status(500).json({ error: 'Admin login failed' })
  }
})

module.exports = router