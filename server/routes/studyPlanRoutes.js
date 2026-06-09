const express = require("express")
const router = express.Router()
const StudyPlan = require("../models/StudyPlan")
const authMiddleware = require("../middleware/authMiddleware")

// GET /api/study-plans — get all saved study plans for current user (newest first)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(plans)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/study-plans/:id — delete a specific study plan by id (only if it belongs to current user)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!plan) {
      return res.status(404).json({ error: "Study plan not found or not authorized" })
    }
    res.json({ message: "Study plan deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
