const express  = require('express');
const router   = express.Router();
const passport = require('../config/passport');
const jwt      = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Step 1 — redirect user to Google consent screen
router.get('/',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

// Step 2 — Google redirects back here after login
router.get('/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login?error=google_failed',
    session: true,
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      const name  = encodeURIComponent(req.user.name);
      const email = encodeURIComponent(req.user.email);
      const avatar= encodeURIComponent(req.user.avatar || '');

      // Send everything to frontend via redirect
      res.redirect(
        `http://localhost:5173/auth/success?token=${token}&name=${name}&email=${email}&avatar=${avatar}`
      );
    } catch (err) {
      res.redirect('http://localhost:5173/login?error=token_failed');
    }
  }
);

module.exports = router;
