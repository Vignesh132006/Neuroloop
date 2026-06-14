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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
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
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
  }
})

// POST /api/revision/study-plan — specific topic the user wants a plan for
router.post("/study-plan", authMiddleware, async (req, res) => {
  try {
    const { topic, noteContent } = req.body

    // Validate request body
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ message: "Topic is required" })
    }
    if (!noteContent || typeof noteContent !== "string" || !noteContent.trim()) {
      return res.status(400).json({ message: "Note content is required" })
    }

    const trimmedTopic = topic.trim()
    const trimmedNoteContent = noteContent.trim()

    const prompt = `You are an expert CS tutor creating a focused 3-day revision plan.

Student topic to revise: ${trimmedTopic}
Note content summary: ${trimmedNoteContent?.substring(0, 500) || trimmedTopic}

Create a clean 3-day revision plan. Follow this EXACT format:

DAY 1 — RE-LEARN
Focus: ${trimmedTopic}
Goal: Rebuild a clear understanding from scratch
Tasks:
• Re-read your notes on ${trimmedTopic} slowly and carefully
• Write a 5-sentence summary in your own words without looking at notes
• Identify the 3 most important concepts in this topic
Time: 30-40 minutes

DAY 2 — PRACTICE
Focus: Apply knowledge of ${trimmedTopic}
Goal: Solve at least 3 problems without referring to notes
Tasks:
• Solve 3 practice problems on ${trimmedTopic}
• For each problem you get wrong, write the correct solution
• Create 2 MCQ questions for yourself and answer them
Time: 45-60 minutes

DAY 3 — TEST
Focus: Confirm mastery of ${trimmedTopic}
Goal: Score 80%+ on a self-assessment
Tasks:
• Write 5 questions about ${trimmedTopic} from memory
• Answer all 5 without looking at notes
• Review only the answers you got wrong
Time: 30 minutes

RESULT: If you complete all 3 days you will have solidly revised ${trimmedTopic}.

Rules:
- Use ONLY the exact format above
- Every task must start with bullet •
- Plain text only — no markdown ** or # symbols
- Be specific and practical`

    let completion
    try {
      completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful study assistant. Create a focused, practical, and encouraging 3-day revision plan. Always format the plan using a clear bulleted list structure.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      })
    } catch (aiError) {
      throw new Error(`AI API failed: ${aiError.message}`)
    }

    const plan = completion?.choices?.[0]?.message?.content ?? ""
    if (!plan.trim()) {
      throw new Error("AI API returned an empty plan")
    }

    // Save to StudyPlan collection automatically
    const savedPlan = new StudyPlan({
      user: req.user.id,
      title: `Revision Plan — ${trimmedTopic}`,
      topic: trimmedTopic,
      weakTopics: [trimmedTopic],
      weakSubtopics: [trimmedTopic],
      plan: plan,
    })
    await savedPlan.save()

    return res.json({ plan })
  } catch (error) {
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", error)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: error,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
  }
})

module.exports = router