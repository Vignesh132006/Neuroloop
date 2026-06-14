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

    const prompt = `You are an expert CS tutor creating a structured study plan.

Student weak topics: ${weakSubtopics.join(", ")}
Main subject: ${topic}

Create a clean 5-day study plan. You MUST follow this EXACT format with no deviation:

DAY 1 — UNDERSTAND THE BASICS
Focus: [specific subtopic from weak list]
Goal: [one clear learning goal]
Tasks:
• [specific task 1]
• [specific task 2]  
• [specific task 3]
Time: [estimated time, e.g. 45 minutes]

DAY 2 — DEEP DIVE
Focus: [next subtopic]
Goal: [one clear learning goal]
Tasks:
• [specific task 1]
• [specific task 2]
• [specific task 3]
Time: [estimated time]

DAY 3 — PRACTICE PROBLEMS
Focus: [problem-solving on weak areas]
Goal: Solve at least 5 problems on today's topic
Tasks:
• [specific problem type 1]
• [specific problem type 2]
• [specific problem type 3]
Time: [estimated time]

DAY 4 — REVIEW AND CONNECT
Focus: [connecting all weak subtopics together]
Goal: [integration goal]
Tasks:
• [review task 1]
• [review task 2]
• [review task 3]
Time: [estimated time]

DAY 5 — TEST YOURSELF
Focus: Mock assessment
Goal: Score above 80% on a self-quiz
Tasks:
• Write 5 questions and answer them without notes
• Identify any remaining gaps
• Review only the gaps found today
Time: [estimated time]

WEEKLY GOAL: [one sentence overall goal for the week]
SUCCESS METRIC: [how the student knows they have mastered this]

Rules you must follow:
- Use ONLY the exact format above with DAY headings
- Every task must start with a bullet point •
- Be specific to the student's weak topics: ${weakSubtopics.join(", ")}
- Do not add any extra sections or commentary outside the format
- Do not use markdown asterisks ** or # headers — use plain text only
- Keep each day section clear and separated`

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

// DELETE /api/study-plans/:id — Delete a study plan by id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!plan) {
      return res.status(404).json({ error: "Study plan not found" })
    }
    res.json({ message: "Study plan deleted" })
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
