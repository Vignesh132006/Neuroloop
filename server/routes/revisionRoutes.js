const express = require("express")
const router = express.Router()
const Note = require("../models/Note")
const RevisionLog = require("../models/RevisionLog")
const authMiddleware = require("../middleware/authMiddleware")

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

module.exports = router