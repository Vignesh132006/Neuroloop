const express = require("express")
const router = express.Router()
const Note = require("../models/Note")
const RevisionLog = require("../models/RevisionLog")
const authMiddleware = require("../middleware/authMiddleware")
const User = require("../models/User")
const { sendRevisionReminder } = require("../utils/sendgrid")
const Groq = require("groq-sdk")
const StudyPlan = require("../models/StudyPlan")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_groq_api_key_to_allow_server_startup" })

// Spaced repetition intervals in days: [1, 3, 7, 14, 30]
const INTERVALS = [1, 3, 7, 14, 30]

// GET /api/revision — Get notes due for revision today
router.get("/", authMiddleware, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const dueNotes = await Note.find({
      user: req.user.id,
      nextRevision: { $lte: today },
    }).sort({ nextRevision: 1 })

    res.json(dueNotes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/revision/schedule — Full revision schedule
router.get("/schedule", authMiddleware, async (req, res) => {
  try {
    const logs = await RevisionLog.find({ user: req.user.id, completed: false })
      .populate("noteId", "topic")
      .sort({ nextRevisionDate: 1 })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/revision/:id — Mark note as revised, schedule next
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { confidenceRating } = req.body
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id })

    if (!note) return res.status(404).json({ message: "Note not found" })

    const currentRevision = note.revisionCount
    note.revisionCount += 1
    note.lastRevised = new Date()

    // Calculate next revision using spaced repetition
    const intervalIndex = Math.min(currentRevision, INTERVALS.length - 1)
    const daysUntilNext = INTERVALS[intervalIndex]
    const nextRevision = new Date()
    nextRevision.setDate(nextRevision.getDate() + daysUntilNext)
    note.nextRevision = nextRevision

    // Update mastery based on confidence
    const conf = confidenceRating || 3
    note.masteryScore = Math.min(
      100,
      note.masteryScore + (conf - 2) * 10
    )

    await note.save()

    // Log revision
    const log = new RevisionLog({
      user: req.user.id,
      noteId: note._id,
      topic: note.topic,
      revisionNumber: note.revisionCount,
      nextRevisionDate: nextRevision,
      confidenceRating: conf,
      completed: false,
    })
    await log.save()

    res.json({
      message: "Revision recorded",
      nextRevision: nextRevision.toISOString().split("T")[0],
      daysUntilNext,
      masteryScore: note.masteryScore,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/revision/send-reminders — Scan and send email reminders for due revisions today
router.post("/send-reminders", authMiddleware, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Find all users who want email notifications
    const users = await User.find({ emailNotifications: { $ne: false } })
    let emailsSent = 0
    let skipped = 0

    for (const user of users) {
      // Find notes due for revision today for this user
      const dueNotes = await Note.find({
        user: user._id,
        nextRevision: { $lte: today },
      })

      if (dueNotes.length > 0) {
        await sendRevisionReminder(user.email, user.name, dueNotes)
        emailsSent++
      } else {
        skipped++
      }
    }

    res.json({
      message: "Email reminder scan complete",
      emailsSent,
      skipped,
    })
  } catch (error) {
    console.error("Reminder job failed:", error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/revision/study-plan — specific topic the user wants a plan for
router.post("/study-plan", authMiddleware, async (req, res) => {
  try {
    const { topic, noteContent } = req.body
    if (!topic || !noteContent) {
      return res.status(400).json({ error: "Topic and noteContent are required" })
    }

    const prompt = `A student needs to revise this specific topic: ${topic}. Their note content is: ${noteContent}. Create a focused 3-day revision plan with: Day 1 (re-read and summarise), Day 2 (practice questions), Day 3 (test yourself). Keep it specific to this topic only. Be practical and encouraging.`

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant. Create a focused, practical, and encouraging 3-day revision plan.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    })

    const plan = completion.choices[0]?.message?.content ?? ""

    // Save to StudyPlan collection automatically
    const savedPlan = new StudyPlan({
      user: req.user.id,
      title: `Revision Plan — ${topic}`,
      weakTopics: [topic],
      plan: plan,
    })
    await savedPlan.save()

    res.json({ plan })
  } catch (error) {
    console.error("Revision study plan error:", error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router