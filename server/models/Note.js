const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      required: true,
    },

    aiSummary: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
      },
    ],

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    revisionCount: {
      type: Number,
      default: 0,
    },

    lastRevised: {
      type: Date,
      default: null,
    },

    nextRevision: {
      type: Date,
      default: null,
    },

    masteryScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Alias so old "Journal" references still work
module.exports = mongoose.model("Note", noteSchema)
