const express = require("express")
const router = express.Router()
const QuizResult = require("../models/QuizResult")
const Note = require("../models/Note")
const User = require("../models/User")
const authMiddleware = require("../middleware/authMiddleware")

// POST /api/quiz/submit — Submit quiz result
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { topic, noteId, questions, score, totalQuestions, timeTaken } = req.body

    const percentage = Math.round((score / totalQuestions) * 100)

    // Find weak areas from wrong answers
    const weakAreas = questions
      .filter((q) => !q.isCorrect)
      .map((q) => q.question.substring(0, 60))

    const quizResult = new QuizResult({
      user: req.user.id,
      topic,
      noteId: noteId || null,
      questions,
      score,
      totalQuestions,
      percentage,
      timeTaken: timeTaken || 0,
      weakAreas,
    })
    await quizResult.save()

    // Update note masteryScore if noteId provided
    if (noteId) {
      const note = await Note.findById(noteId)
      if (note) {
        note.masteryScore = Math.min(100, Math.round((note.masteryScore + percentage) / 2))
        await note.save()
      }
    }

    // Update user weak topics
    if (percentage < 60 && weakAreas.length > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { weakTopics: topic },
      })
    } else if (percentage >= 80) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { weakTopics: topic },
      })
    }

    res.status(201).json({
      message: "Quiz submitted",
      result: quizResult,
      percentage,
      weakAreas,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/quiz/history — Get quiz history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/quiz/weakness — Get weakness report
router.get("/weakness", authMiddleware, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user.id, percentage: { $lt: 60 } })
    const weakMap = {}
    results.forEach((r) => {
      weakMap[r.topic] = (weakMap[r.topic] || 0) + 1
    })
    const weakTopics = Object.entries(weakMap)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, failCount]) => ({ topic, failCount }))
    res.json({ weakTopics })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
