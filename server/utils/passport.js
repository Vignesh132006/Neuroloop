const passport = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const User = require('../models/User')

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('[Google OAuth Verify Callback] Triggered for email:', profile.emails?.[0]?.value);
      const email  = profile.emails[0].value
      const name   = profile.displayName

      let user = await User.findOne({ email })

      if (!user) {
        const crypto = require('crypto')
        user = await User.create({
          name,
          email,
          password: crypto.randomBytes(32).toString('hex'),
          streak: 1,
          lastActiveDate: new Date(),
          isEmailVerified: true
        })
      } else {
        // Update streak on Google login
        const today = new Date()
        today.setHours(0,0,0,0)
        if (user.lastActiveDate) {
          const last = new Date(user.lastActiveDate)
          last.setHours(0,0,0,0)
          const diff = Math.floor((today - last) / (1000*60*60*24))
          if (diff === 1) user.streak = (user.streak || 0) + 1
          else if (diff > 1) user.streak = 1
        } else {
          user.streak = 1
        }
        user.lastActiveDate = new Date()
        user.isEmailVerified = true // Auto-verify on Google login
        await user.save()
      }

      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }
))

passport.serializeUser((user, done) => done(null, user._id.toString()))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

module.exports = passport
