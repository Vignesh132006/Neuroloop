const express  = require('express');
const router   = express.Router();
const passport = require('../config/passport');
const jwt      = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const getCallbackURL = (req) => {
  if (process.env.GOOGLE_CALLBACK_URL && !process.env.GOOGLE_CALLBACK_URL.includes('localhost')) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}/api/auth/google/callback`;
};

const getFrontendURLFromState = (req) => {
  const state = req.query.state;
  if (state) {
    try {
      const url = new URL(state);
      const origin = url.origin;
      const isAllowed = origin === process.env.FRONTEND_URL ||
                        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
                        /^http:\/\/localhost(:\d+)?$/.test(origin) || 
                        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
      if (isAllowed) {
        return origin;
      }
    } catch (e) {}
  }
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Step 1 — redirect user to Google consent screen
router.get('/', (req, res, next) => {
  const referer = req.headers.referer;
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (referer) {
    try {
      const url = new URL(referer);
      const origin = url.origin;
      const isAllowed = origin === process.env.FRONTEND_URL ||
                        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
                        /^http:\/\/localhost(:\d+)?$/.test(origin) || 
                        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
      if (isAllowed) {
        frontendUrl = origin;
      }
    } catch (e) {}
  }

  const callbackURL = getCallbackURL(req);
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    callbackURL,
    state: frontendUrl,
  })(req, res, next);
});

// Step 2 — Google redirects back here after login
router.get('/callback', (req, res, next) => {
  const callbackURL = getCallbackURL(req);
  const frontendUrl = getFrontendURLFromState(req);
  passport.authenticate('google', {
    callbackURL,
    failureRedirect: `${frontendUrl}/login?error=google_failed`,
    session: true,
  })(req, res, next);
}, (req, res) => {
  try {
    const token = generateToken(req.user._id);
    const name  = encodeURIComponent(req.user.name);
    const email = encodeURIComponent(req.user.email);
    const avatar= encodeURIComponent(req.user.avatar || '');

    const frontendUrl = getFrontendURLFromState(req);

    // Send everything to frontend via redirect
    res.redirect(
      `${frontendUrl}/auth/success?token=${token}&name=${name}&email=${email}&avatar=${avatar}`
    );
  } catch (err) {
    const frontendUrl = getFrontendURLFromState(req);
    res.redirect(`${frontendUrl}/login?error=token_failed`);
  }
});

module.exports = router;
