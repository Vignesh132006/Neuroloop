const mongoose = require("mongoose")

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  weakSubtopics: [{ type: String }],
  plan: { type: String, required: true },
  title: { type: String }, // for backwards compatibility
  weakTopics: [{ type: String }], // for backwards compatibility
  createdAt: { type: Date, default: Date.now }
})

// pre-validate middleware to automatically map old schema fields to new schema fields
studyPlanSchema.pre('validate', function() {
  if (!this.topic) {
    this.topic = this.title || "General";
  }
  if (!this.weakSubtopics || this.weakSubtopics.length === 0) {
    this.weakSubtopics = this.weakTopics || [];
  }
})

module.exports = mongoose.model("StudyPlan", studyPlanSchema)
