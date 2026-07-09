const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Case 1: user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    // Case 2: user registered with same email manually before
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId     = profile.id;
      user.avatar       = profile.photos?.[0]?.value || '';
      user.isGoogleUser = true;
      user.isEmailVerified = true; // Google verified
      await user.save();
      return done(null, user);
    }

    // Case 3: brand new user via Google
    user = await User.create({
      name:         profile.displayName,
      email:        profile.emails[0].value,
      googleId:     profile.id,
      avatar:       profile.photos?.[0]?.value || '',
      isGoogleUser: true,
      isEmailVerified: true, // Google verified
      // password field: set a random string so the required validator passes
      password:     require('crypto').randomBytes(32).toString('hex'),
    });

    // Welcome Email (Step 11)
    const { sendWelcomeEmail } = require('../utils/emailService');
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (e) {
      console.error('[Email] Welcome email failed:', e.message);
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
