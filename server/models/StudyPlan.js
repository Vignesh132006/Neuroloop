const mongoose = require("mongoose")

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    weakTopics: [
      {
        type: String,
      },
    ],
    plan: {
      type: String, // full AI-generated plan text
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
)

module.exports = mongoose.model("StudyPlan", studyPlanSchema)
