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

    emailOtp:          { type: String,  default: null },
    emailOtpExpiry:    { type: Date,    default: null },
    emailOtpAttempts:  { type: Number,  default: 0 },
  },
  {
    timestamps: true,
  }
)

userSchema.index({ email: 1 })
userSchema.index({ lastActiveDate: -1 })

module.exports = mongoose.model("User", userSchema)