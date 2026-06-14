const express = require("express")
const router = express.Router()
const Groq = require("groq-sdk")
const authMiddleware = require("../middleware/authMiddleware")
const StudyPlan = require("../models/StudyPlan")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_groq_api_key_to_allow_server_startup" })

const GROQ_MODEL = "llama-3.3-70b-versatile"

// Unified error handler for Groq AI rate limits & general failures
async function handleAIError(error, res, contextMessage, req) {
  console.error(`${contextMessage} error:`, error.message)

  const isRateLimit =
    error.status === 429 ||
    error.message?.includes("429") ||
    error.message?.toLowerCase().includes("rate limit") ||
    error.message?.toLowerCase().includes("quota")

  if (isRateLimit) {
    return res.status(429).json({
      error: "Groq API rate limit reached. Please wait a moment and try again."
    })
  }

  if (error.status === 401) {
    return res.status(401).json({
      error: "Invalid Groq API key. Please check GROQ_API_KEY in server/.env."
    })
  }

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

// Helper: call Groq chat completions
async function groqComplete(messages) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  })
  return completion.choices[0]?.message?.content ?? ""
}

// POST /api/ai/summary — Summarise notes
router.post("/summary", authMiddleware, async (req, res) => {
  try {
    const { notes } = req.body
    if (!notes) return res.status(400).json({ error: "Notes are required" })

    const text = await groqComplete([
      {
        role: "system",
        content: "You are a helpful study assistant. Summarise the learning notes clearly and concisely in exactly 10 key points (bullet points). Focus on key concepts. Respond only with the bullet points, no extra text. Do not include any emojis in your response. Keep the tone completely professional, informative, and precise.",
      },
      { role: "user", content: notes },
    ])

    res.json({ summary: text.trim() })
  } catch (error) {
    await handleAIError(error, res, "AI summarisation", req)
  }
})

// POST /api/ai/mcq — Generate MCQ quiz questions
router.post("/mcq", authMiddleware, async (req, res) => {
  try {
    const { notes, topic, count = 10 } = req.body
    if (!notes) return res.status(400).json({ error: "Notes are required" })

    const prompt = `Based on these notes about "${topic || "the topic"}", generate exactly ${count} multiple choice questions.

Each question must have a 'subtopic' field identifying the specific concept being tested (e.g., 'Binary Search Tree', 'Recursion', 'Time Complexity'). Return as JSON: [{question, options, answer, subtopic}]

Return ONLY a valid JSON array (no markdown, no explanation, no code fences) in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A) Option 1",
    "explanation": "Brief explanation of why this is correct",
    "subtopic": "Specific subtopic concept being tested (e.g., 'Binary Search Tree')"
  }
]

Notes:
${notes}`

    let text = await groqComplete([
      {
        role: "system",
        content: "You are an expert teacher. Return ONLY valid JSON with no markdown or code fences. Do not include any emojis in any fields of the JSON response.",
      },
      { role: "user", content: prompt },
    ])

    text = text.trim().replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim()

    const rawQuestions = JSON.parse(text)
    const questions = rawQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer || q.answer,
      explanation: q.explanation || "",
      subtopic: q.subtopic || ""
    }))
    res.json({ questions })
  } catch (error) {
    await handleAIError(error, res, "MCQ generation", req)
  }
})

// POST /api/ai/interview — Generate interview questions
router.post("/interview", authMiddleware, async (req, res) => {
  try {
    const { notes, topic } = req.body
    if (!notes) return res.status(400).json({ error: "Notes are required" })

    const prompt = `Based on these notes about "${topic || "the topic"}", generate 5 deep interview questions that test conceptual understanding.

Return ONLY a valid JSON array (no markdown, no code fences) in this format:
[
  {
    "question": "Interview question here?",
    "type": "conceptual",
    "difficulty": "medium",
    "hint": "A hint to guide the answer"
  }
]

Notes:
${notes}`

    let text = await groqComplete([
      {
        role: "system",
        content: "You are a senior technical interviewer. Return ONLY valid JSON with no markdown or code fences. Do not include any emojis in any fields of the JSON response.",
      },
      { role: "user", content: prompt },
    ])

    text = text.trim().replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim()

    const questions = JSON.parse(text)
    res.json({ questions })
  } catch (error) {
    await handleAIError(error, res, "Interview question generation", req)
  }
})

// POST /api/ai/study-plan — Generate weakness study plan
router.post("/study-plan", authMiddleware, async (req, res) => {
  try {
    const { weakTopics } = req.body
    if (!weakTopics || weakTopics.length === 0) {
      return res.status(400).json({ error: "Weak topics are required" })
    }

    const topics = weakTopics.join(", ")

    const prompt = `You are an expert CS tutor. Create a structured 7-day study plan.

Student weak topics: ${topics || "general CS topics"}

Follow this EXACT format:

DAY 1 — FOUNDATION
Focus: [first weak topic]
Goal: [specific measurable goal]
Tasks:
• [task 1]
• [task 2]
• [task 3]
Time: [e.g. 45 minutes]

DAY 2 — BUILD
Focus: [second weak topic or continue day 1]
Goal: [specific measurable goal]
Tasks:
• [task 1]
• [task 2]
• [task 3]
Time: [estimated time]

DAY 3 — PRACTICE
Focus: Problem solving
Goal: Solve 5 problems without hints
Tasks:
• [specific problem types]
• [timed practice task]
• [self-check task]
Time: 60 minutes

DAY 4 — DEEPEN
Focus: [harder concepts in weak topics]
Goal: [specific goal]
Tasks:
• [task 1]
• [task 2]
• [task 3]
Time: [estimated time]

DAY 5 — CONNECT
Focus: Linking all topics together
Goal: See how all weak topics relate to each other
Tasks:
• Draw a concept map connecting all topics
• Write 3 sentences explaining how each topic connects
• Create one example that uses all topics together
Time: 45 minutes

DAY 6 — INTERVIEW PREP
Focus: Interview-style questions
Goal: Answer 5 interview questions confidently
Tasks:
• Answer: "Explain [topic] in simple terms"
• Answer: "What is the time complexity of [topic] operations?"
• Write answers as if in a real interview
Time: 45 minutes

DAY 7 — FINAL TEST
Focus: Full assessment
Goal: Score 80%+ across all weak topics
Tasks:
• Take a full quiz on all 7 days of material
• Review only wrong answers
• Write what you will study next week
Time: 60 minutes

OVERALL GOAL: [one sentence describing mastery achieved after 7 days]

Rules:
- Exact format only — DAY headings, bullet tasks, Time field
- No markdown ** or # symbols — plain text
- Specific to topics: ${topics}
- Encouraging but professional tone`

    let text = await groqComplete([
      {
        role: "system",
        content: "You are an expert CS tutor.",
      },
      { role: "user", content: prompt },
    ])

    const cleanText = text.trim()

    // Save to StudyPlan collection automatically
    const savedPlan = new StudyPlan({
      user: req.user.id,
      title: `Study Plan for ${weakTopics.join(", ")} - 7 Day`,
      weakTopics,
      plan: cleanText,
    })
    await savedPlan.save()

    res.json({ plan: cleanText, savedId: savedPlan._id })
  } catch (error) {
    await handleAIError(error, res, "Study plan generation", req)
  }
})

// POST /api/ai/chat — Socratic chat with Neuro (the AI tutor)
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, history = [], context } = req.body
    if (!message) return res.status(400).json({ error: "Message is required" })

    const systemPrompt = `You are Neuro, an intelligent and encouraging AI study assistant for NeuroLoop — a personal learning platform.

Your personality:
- Curious and Socratic: guide students to think rather than just giving answers
- Warm but precise: encouraging without being vague
- Expert tutor: deeply knowledgeable across all subjects
- You use the Socratic method: ask follow-up questions, challenge assumptions, guide to deeper understanding
- Do not use any emojis in your response. Keep the tone completely professional, informative, and precise.

${context ? `Current study context: ${context}` : ""}

Keep responses concise (2-4 paragraphs max). Use bullet points for lists. Ask one follow-up question at the end to deepen understanding.`

    // Build conversation history in Groq/OpenAI format
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map((msg) => ({
        role: msg.role === "model" ? "assistant" : msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    const reply = await groqComplete(messages)
    res.json({ reply: reply.trim() })
  } catch (error) {
    await handleAIError(error, res, "AI Socratic chat", req)
  }
})

module.exports = router