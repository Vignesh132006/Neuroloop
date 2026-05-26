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

})

module.exports = mongoose.model(
  "Journal",
  journalSchema
)