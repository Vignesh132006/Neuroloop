const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const passport = require('passport')
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

    const hashedPassword = await bcrypt.hash(password, 8)

    const newUser = new User({ name, email, password: hashedPassword })
    await newUser.save()

    const { sendVerificationOtp, sendWelcomeEmail } = require('../utils/emailService');

    // Generate 6-digit OTP
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    newUser.emailOtp         = otp;
    newUser.emailOtpExpiry   = expiry;
    newUser.isEmailVerified  = false;
    newUser.emailOtpAttempts = 0;
    await newUser.save();

    // Send OTP email
    try {
      await sendVerificationOtp(newUser.email, newUser.name, otp);
    } catch (emailErr) {
      console.error('[Email] Failed to send verification OTP:', emailErr.message);
      // Don't block signup if email fails — user can resend
    }

    // Return pending status — NO token yet
    return res.status(201).json({
      message: 'Account created. Please verify your email.',
      status:  'pending_verification',
      email:   newUser.email,
      name:    newUser.name,
    });
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

const { sendVerificationOtp } = require('../utils/emailService');

// ── ROUTE 1: Verify OTP ──────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check attempt limit (max 5 attempts)
    if (user.emailOtpAttempts >= 5) {
      return res.status(429).json({
        message: 'Too many attempts. Please request a new code.',
      });
    }

    // Check expiry
    if (!user.emailOtpExpiry || new Date() > user.emailOtpExpiry) {
      return res.status(400).json({
        message: 'Code has expired. Please request a new one.',
      });
    }

    // Check OTP
    if (user.emailOtp !== otp.trim()) {
      user.emailOtpAttempts += 1;
      await user.save();
      const remaining = 5 - user.emailOtpAttempts;
      return res.status(400).json({
        message: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    // OTP is correct — verify the account
    user.isEmailVerified  = true;
    user.emailOtp         = null;
    user.emailOtpExpiry   = null;
    user.emailOtpAttempts = 0;
    await user.save();

    // Send welcome email
    try {
      const { sendWelcomeEmail } = require('../utils/emailService');
      await sendWelcomeEmail(user.email, user.name);
    } catch (e) {
      console.error('[Email] Welcome email failed:', e.message);
    }

    // Now issue the JWT token
    const jwt   = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        level:  user.level,
        goal:   user.goal,
        focusSubjects: user.focusSubjects,
        streak: user.streak || 0,
      },
    });
  } catch (err) {
    console.error('[Auth] verify-email error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── ROUTE 2: Resend OTP ──────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user)              return res.status(404).json({ message: 'Account not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    // Rate limit: max 1 resend per 60 seconds
    if (user.emailOtpExpiry) {
      const secondsLeft = Math.ceil((user.emailOtpExpiry - Date.now()) / 1000);
      if (secondsLeft > 540) { // OTP was sent less than 60 seconds ago (600 - 60 = 540)
        return res.status(429).json({
          message: `Please wait ${60 - (600 - secondsLeft)} seconds before requesting a new code.`,
        });
      }
    }

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.emailOtp         = otp;
    user.emailOtpExpiry   = expiry;
    user.emailOtpAttempts = 0;
    await user.save();

    await sendVerificationOtp(user.email, user.name, otp);

    res.json({ message: 'New verification code sent to your email.' });
  } catch (err) {
    console.error('[Auth] resend-verification error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── ROUTE 3: Check verification status ───────────────────────
router.get('/verification-status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    res.json({ isEmailVerified: user.isEmailVerified });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email }).select(
      'name email password streak lastActiveDate weakTopics emailNotifications googleId isEmailVerified onboardingCompleted level goal focusSubjects'
    )
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message:  'Please verify your email before logging in.',
        status:   'pending_verification',
        email:    user.email,
      });
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        onboardingCompleted: user.onboardingCompleted,
        level: user.level,
        goal: user.goal,
        focusSubjects: user.focusSubjects,
      },
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
      user.password = await bcrypt.hash(newPassword, 8)
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
    user.password = await bcrypt.hash(newPassword, 8);
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
});

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

// ── GOOGLE OAUTH ─────────────────────────────────────
router.get('/google', (req, res, next) => {
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const callbackURL = `${protocol}://${host}/api/auth/google/callback`;
  let state = req.query.frontend_origin || process.env.FRONTEND_URL || 'http://localhost:5173';

  // Sanitize redirect target to ensure it is absolute
  if (!state.startsWith('http://') && !state.startsWith('https://')) {
    state = state.includes('localhost') ? `http://${state}` : `https://${state}`;
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    callbackURL: callbackURL,
    state: state
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('[Google Callback] Query params:', req.query);
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const callbackURL = `${protocol}://${host}/api/auth/google/callback`;
  let frontendURL = req.query.state || process.env.FRONTEND_URL || 'http://localhost:5173';

  // Sanitize redirect target to ensure it is absolute
  if (!frontendURL.startsWith('http://') && !frontendURL.startsWith('https://')) {
    frontendURL = frontendURL.includes('localhost') ? `http://${frontendURL}` : `https://${frontendURL}`;
  }

  passport.authenticate('google', { callbackURL }, (err, user, info) => {
    console.log('[Google Callback] Authenticated. err:', err, 'user:', user ? user.email : null, 'info:', info);
    if (err) {
      console.error('[Google OAuth Callback Error]:', err);
      return res.redirect(`${frontendURL}/login?error=google_failed`);
    }
    if (!user) {
      console.error('[Google OAuth Failure Info]:', info);
      return res.redirect(`${frontendURL}/login?error=google_failed`);
    }
    req.logIn(user, (logInErr) => {
      if (logInErr) {
        console.error('[Google logIn error]:', logInErr);
        return res.redirect(`${frontendURL}/login?error=server_error`);
      }
      try {
        const jwt   = require('jsonwebtoken')
        const token = jwt.sign(
          { id: user._id, name: user.name, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )
        const userData = encodeURIComponent(JSON.stringify({
          id:     user._id,
          name:   user.name,
          email:  user.email,
          streak: user.streak || 0
        }))
        res.redirect(`${frontendURL}/auth/google/success?token=${token}&user=${userData}`)
      } catch (err) {
        console.error('[Google OAuth] Callback error:', err)
        res.redirect(`${frontendURL}/login?error=server_error`)
      }
    });
  })(req, res, next);
})

// POST /api/auth/onboarding — save user onboarding answers
router.post('/onboarding', require('../middleware/authMiddleware'), async (req, res) => {
  try {
    const { level, goal, focusSubjects } = req.body

    if (!level || !goal || !focusSubjects || focusSubjects.length === 0) {
      return res.status(400).json({ error: 'All onboarding fields are required' })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        level,
        goal,
        focusSubjects,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
      { new: true }
    ).select('-password')

    res.json({
      message: 'Onboarding completed successfully',
      user,
    })
  } catch (err) {
    console.error('[Onboarding] Error:', err)
    res.status(500).json({ error: 'Failed to save onboarding data' })
  }
})

// GET /api/auth/onboarding/status — check if onboarding is done
router.get('/onboarding/status', require('../middleware/authMiddleware'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('onboardingCompleted level goal focusSubjects')
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to get onboarding status' })
  }
})

// POST /api/auth/onboarding/skip — skip onboarding (mark as completed with null values)
router.post('/onboarding/skip', require('../middleware/authMiddleware'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
      { new: true }
    ).select('-password')

    res.json({
      message: 'Onboarding skipped',
      user,
    })
  } catch (err) {
    console.error('[Onboarding Skip] Error:', err)
    res.status(500).json({ error: 'Failed to skip onboarding' })
  }
})

module.exports = router