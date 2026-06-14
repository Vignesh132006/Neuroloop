const express = require("express")
const router = express.Router()
const Topic = require("../models/Topic")
const authMiddleware = require("../middleware/authMiddleware")

// POST /api/topics — Create topic
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, tags, difficulty } = req.body
    if (!name) return res.status(400).json({ message: "Topic name is required" })

    const existing = await Topic.findOne({ user: req.user.id, name: name.trim() })
    if (existing) return res.status(400).json({ message: "Topic already exists" })

    const topic = new Topic({ user: req.user.id, name, description, tags, difficulty })
    await topic.save()
    res.status(201).json({ message: "Topic created", topic })
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

// GET /api/topics — Get all topics
router.get("/", authMiddleware, async (req, res) => {
  try {
    const topics = await Topic.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(topics)
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

// PUT /api/topics/:id — Update topic mastery
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Topic.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    )
    if (!updated) return res.status(404).json({ message: "Topic not found" })
    res.json({ message: "Topic updated", topic: updated })
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

// DELETE /api/topics/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Topic.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    res.json({ message: "Topic deleted" })
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
