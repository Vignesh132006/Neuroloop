const express = require("express")
const router = express.Router()
const Note = require("../models/Note")
const authMiddleware = require("../middleware/authMiddleware")
const User = require("../models/User")
const QuizResult = require("../models/QuizResult")
const RevisionLog = require("../models/RevisionLog")
const multer = require("multer")
const { PDFParse } = require("pdf-parse")
const Groq = require("groq-sdk")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_groq_api_key_to_allow_server_startup" })
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB limit

// Cache for GitHub event API calls (15 mins)
// NOTE: Defined at top so it can be used by /stats/heatmap route
const githubCache = {}

async function fetchGitHubCommits(username) {
  const now = Date.now()
  if (githubCache[username] && githubCache[username].expiry > now) {
    return githubCache[username].data
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/events`, {
      headers: { "User-Agent": "NeuroLoop-App" }
    })
    if (!response.ok) return {}
    const events = await response.json()

    const commitCounts = {}
    events.forEach((event) => {
      if (event.type === "PushEvent" && event.created_at) {
        const date = event.created_at.split("T")[0]
        const count = event.payload?.commits?.length || 1
        commitCounts[date] = (commitCounts[date] || 0) + count
      }
    })

    githubCache[username] = {
      data: commitCounts,
      expiry: now + 15 * 60 * 1000
    }
    return commitCounts
  } catch (err) {
    console.error("Failed to fetch github activity:", err.message)
    return {}
  }
}

// GET /api/notes/stats/heatmap — Activity heatmap data (merged with GitHub activity)
router.get("/stats/heatmap", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }, "createdAt")
    const heatmap = {}

    // Add study note activity
    notes.forEach((note) => {
      const date = new Date(note.createdAt).toISOString().split("T")[0]
      heatmap[date] = (heatmap[date] || 0) + 1
    })

    // Fetch user profile and merge GitHub activity if username is linked
    const user = await User.findById(req.user.id)
    if (user && user.githubUsername) {
      const gitCommits = await fetchGitHubCommits(user.githubUsername)
      Object.entries(gitCommits).forEach(([date, count]) => {
        heatmap[date] = (heatmap[date] || 0) + count
      })
    }

    const result = Object.entries(heatmap).map(([date, count]) => ({ date, count }))
    res.json(result)
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

// GET /api/notes/stats/weekly — Get weekly progress statistics
router.get("/stats/weekly", authMiddleware, async (req, res) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const notesCount = await Note.countDocuments({
      user: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    })

    const quizResults = await QuizResult.find({
      user: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    })

    const revisionsCount = await RevisionLog.countDocuments({
      user: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    })

    let totalScore = 0
    let totalQuizzes = quizResults.length
    let averagePercentage = 0

    if (totalQuizzes > 0) {
      quizResults.forEach(q => totalScore += q.percentage)
      averagePercentage = Math.round(totalScore / totalQuizzes)
    }

    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)

      const startOfDay = new Date(d)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(d)
      endOfDay.setHours(23, 59, 59, 999)

      const dayNotes = await Note.countDocuments({
        user: req.user.id,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      })

      const dayQuizzes = await QuizResult.countDocuments({
        user: req.user.id,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      })

      dailyStats.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        notes: dayNotes,
        quizzes: dayQuizzes
      })
    }

    res.json({
      notesCount,
      revisionsCount,
      quizzesCount: totalQuizzes,
      averagePercentage,
      dailyStats
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

// POST /api/notes/upload-pdf — Parse PDF and summarize text via AI
router.post("/upload-pdf", authMiddleware, upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" })
    }

    const parser = new PDFParse(new Uint8Array(req.file.buffer))
    const data = await parser.getText()
    const extractedText = data.text.trim()

    if (!extractedText) {
      return res.status(400).json({ error: "Could not extract text from PDF (it might be scanned or empty)" })
    }

    // Call Groq to generate a summary and extract the main topic
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant. Extract the main topic and generate a clear 3-5 bullet point summary of the text provided. Return JSON ONLY in this format: { \"topic\": \"extracted topic\", \"summary\": \"bullet points summary here\" }."
        },
        { role: "user", content: extractedText.slice(0, 8000) } // Truncate to fit context safely
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(completion.choices[0].message.content)
    res.json({
      topic: result.topic || "PDF Uploaded Notes",
      summary: result.summary,
      text: extractedText
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

// GET /api/notes — Get all notes for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json(notes)
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

// POST /api/notes/add — Create a note
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { topic, notes, tags, difficulty, aiSummary } = req.body

    if (!topic || !notes) {
      return res.status(400).json({ message: "Topic and notes are required" })
    }

    // Spaced repetition: first revision in 1 day
    const nextRevision = new Date()
    nextRevision.setDate(nextRevision.getDate() + 1)

    const newNote = new Note({
      topic,
      notes,
      tags: tags || [],
      difficulty: difficulty || "medium",
      aiSummary: aiSummary || "",
      nextRevision,
      user: req.user.id,
    })

    await newNote.save()

    res.status(201).json({ message: "Note saved successfully", note: newNote })
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

// PUT /api/notes/:id — Update note
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { topic, notes, tags, difficulty, aiSummary } = req.body

    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { topic, notes, tags, difficulty, aiSummary },
      { new: true }
    )

    if (!updated) return res.status(404).json({ message: "Note not found" })

    res.status(200).json({ message: "Note updated successfully", note: updated })
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

// DELETE /api/notes/:id — Delete note
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!deleted) return res.status(404).json({ message: "Note not found" })
    res.status(200).json({ message: "Note deleted successfully" })
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

// GET /api/notes/:id — Get single note
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id })
    if (!note) return res.status(404).json({ message: "Note not found" })
    res.json(note)
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

// PATCH /api/notes/:id/reschedule — Reschedule revision date for a note
router.patch('/:id/reschedule', authMiddleware, async (req, res) => {
  try {
    const { nextRevisionDate } = req.body
    if (!nextRevisionDate) {
      return res.status(400).json({ message: 'nextRevisionDate is required' })
    }
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { nextRevision: new Date(nextRevisionDate) },
      { new: true }
    )
    if (!note) return res.status(404).json({ message: 'Note not found' })
    res.json({ message: 'Revision date updated', note })
  } catch (err) {
    const { sendAdminAlert } = require("../utils/adminAlert")
    console.error("[RouteError]", err)
    await sendAdminAlert({
      route: req.originalUrl,
      method: req.method,
      error: err,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null
    })
    res.status(500).json({ error: "Something went wrong. Our team has been notified." })
  }
})

module.exports = router
