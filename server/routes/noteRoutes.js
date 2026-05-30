const express = require("express")
const router = express.Router()
const Note = require("../models/Note")
const authMiddleware = require("../middleware/authMiddleware")

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
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/notes — Get all notes for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json(notes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/notes/:id — Get single note
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id })
    if (!note) return res.status(404).json({ message: "Note not found" })
    res.json(note)
  } catch (error) {
    res.status(500).json({ error: error.message })
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
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/notes/:id — Delete note
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!deleted) return res.status(404).json({ message: "Note not found" })
    res.status(200).json({ message: "Note deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/notes/stats/heatmap — Activity heatmap data
router.get("/stats/heatmap", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }, "createdAt")
    const heatmap = {}
    notes.forEach((note) => {
      const date = new Date(note.createdAt).toISOString().split("T")[0]
      heatmap[date] = (heatmap[date] || 0) + 1
    })
    const result = Object.entries(heatmap).map(([date, count]) => ({ date, count }))
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
