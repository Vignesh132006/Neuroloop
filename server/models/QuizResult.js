const mongoose = require("mongoose")

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },

    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      default: null,
    },

    questions: [
      {
        question: { type: String },
        options: [{ type: String }],
        correctAnswer: { type: String },
        userAnswer: { type: String },
        isCorrect: { type: Boolean },
        subtopic: { type: String },
      },
    ],

    score: {
      type: Number,
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    timeTaken: {
      type: Number, // seconds
      default: 0,
    },

    weakAreas: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("QuizResult", quizResultSchema)
