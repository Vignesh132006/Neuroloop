const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    streak: {
      type: Number,
      default: 0,
    },

    lastActiveDate: {
      type: Date,
      default: null,
    },

    totalTopics: {
      type: Number,
      default: 0,
    },

    weakTopics: [
      {
        type: String,
      },
    ],

    githubUsername: {
      type: String,
      default: "",
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    lastReminderSentDate: {
      type: Date,
      default: null,
    },

    resetOtp: {
      type: String,
      default: null,
    },

    resetOtpExpiry: {
      type: Date,
      default: null,
    },

    hasResetPasswordBefore: {
      type: Boolean,
      default: false,
    },

    googleId: { type: String, default: null },
    avatar:   { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },

    emailOtp:          { type: String,  default: null },
    emailOtpExpiry:    { type: Date,    default: null },
    emailOtpAttempts:  { type: Number,  default: 0 },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: null,
    },

    goal: {
      type: String,
      enum: ['crack-interviews', 'learn-skills', 'improve-weak', 'build-projects'],
      default: null,
    },

    focusSubjects: [{ type: String }],

    onboardingCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.index({ lastActiveDate: -1 })

module.exports = mongoose.model("User", userSchema)