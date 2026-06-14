const express = require("express")
const router = express.Router()
const Groq = require("groq-sdk")
const StudyPlan = require("../models/StudyPlan")
const authMiddleware = require("../middleware/authMiddleware")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_key" })

// POST /api/study-plans/generate — Generate AI study plan
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { topic, weakSubtopics } = req.body
    if (!topic || !weakSubtopics || !Array.isArray(weakSubtopics)) {
      return res.status(400).json({ error: "topic and weakSubtopics are required" })
    }

    const prompt = `A student is weak in the topic '${topic}'. Their specific weak areas are: ${weakSubtopics.join(', ')}.
Create a focused 5-day study plan to fix these weak areas only.
Format it clearly:
Day 1: [what to study]
Day 2: [what to practice]
Day 3: [solve problems on]
Day 4: [review and test]
Day 5: [mock quiz yourself]
Be specific, practical and encouraging. Keep it under 300 words.`

    let completion
    try {
      completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      })
    } catch (e) {
      throw new Error(`AI API failed: ${e.message}`)
    }

    const planText = completion.choices[0]?.message?.content ?? ""

    const newPlan = new StudyPlan({
      user: req.user.id,
      topic,
      weakSubtopics,
      plan: planText.trim(),
    })
    await newPlan.save()

    res.status(201).json({
      _id: newPlan._id,
      topic: newPlan.topic,
      weakSubtopics: newPlan.weakSubtopics,
      plan: newPlan.plan,
      createdAt: newPlan.createdAt,
    })
  } catch (error) {
    console.error("Generate Study Plan Error:", error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/study-plans — Return all study plans for current user, newest first
router.get("/", authMiddleware, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(plans.map(p => ({
      _id: p._id,
      topic: p.topic,
      weakSubtopics: p.weakSubtopics,
      plan: p.plan,
      createdAt: p.createdAt
    })))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/study-plans/:id — Delete a study plan by id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!plan) {
      return res.status(404).json({ error: "Study plan not found" })
    }
    res.json({ message: "Study plan deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
