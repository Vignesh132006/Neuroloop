const mongoose = require("mongoose")

const journalSchema = new mongoose.Schema({

  topic: {
    type: String,
    required: true,
  },

  notes: {
    type: String,
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  revisionCount: {
    type: Number,
    default: 0,
  },

  lastRevised: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

})

module.exports = mongoose.model(
  "Journal",
  journalSchema
)