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

  createdAt: {
    type: Date,
    default: Date.now,
  },

})

module.exports = mongoose.model("Journal", journalSchema)