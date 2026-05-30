const mongoose = require("mongoose")

const revisionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },

    revisionNumber: {
      type: Number,
      required: true,
    },

    // Spaced repetition intervals (days): 1, 3, 7, 14, 30
    nextRevisionDate: {
      type: Date,
      required: true,
    },

    confidenceRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    notes: {
      type: String,
      default: "",
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("RevisionLog", revisionLogSchema)
