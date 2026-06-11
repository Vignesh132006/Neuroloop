const express = require("express")
const router = express.Router()
const QuizResult = require("../models/QuizResult")
const Note = require("../models/Note")
const User = require("../models/User")
const authMiddleware = require("../middleware/authMiddleware")

function extractSubtopic(questionText) {
  try {
    // Try to get text after "—" dash
    if (questionText.includes('—')) {
      const afterDash = questionText.split('—')[1].trim()
      // Remove common question words
      const cleaned = afterDash
        .replace(/^(what is|what are|which|how|why|define|explain)\s+/i, '')
        .replace(/\s+(in|of|for|the|a|an)\s+.*/i, '')
        .replace(/\?.*$/, '')
        .trim()
      // Capitalize first letter
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    }
    return questionText.substring(0, 30)
  } catch(e) {
    return "General"
  }
}

// POST /api/quiz/submit — Submit quiz result
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { topic, noteId, questions, score, totalQuestions, timeTaken } = req.body

    const percentage = Math.round((score / totalQuestions) * 100)

    // Find weak areas from wrong answers
    const weakAreas = questions
      .filter((q) => !q.isCorrect)
      .map((q) => extractSubtopic(q.question))

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
    const results = await QuizResult.find({ user: req.user.id })
    const groups = {}

    results.forEach((r) => {
      const topic = r.topic
      if (!topic) return

      if (!groups[topic]) {
        groups[topic] = {}
      }

      if (r.weakAreas && Array.isArray(r.weakAreas)) {
        r.weakAreas.forEach((wa) => {
          if (!wa) return
          groups[topic][wa] = (groups[topic][wa] || 0) + 1
        })
      }
    })

    const weakTopics = []

    for (const topic in groups) {
      const subtopicsMap = groups[topic]
      const weakSubtopics = []
      let totalFails = 0

      for (const subtopicName in subtopicsMap) {
        const count = subtopicsMap[subtopicName]
        weakSubtopics.push({
          name: subtopicName,
          failCount: count
        })
        totalFails += count
      }

      if (weakSubtopics.length > 0) {
        // Sort subtopics inside topic by failCount descending
        weakSubtopics.sort((a, b) => b.failCount - a.failCount)

        weakTopics.push({
          topic,
          weakSubtopics,
          totalFails
        })
      }
    }

    // Sort topics by totalFails descending
    weakTopics.sort((a, b) => b.totalFails - a.totalFails)

    res.json(weakTopics)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
