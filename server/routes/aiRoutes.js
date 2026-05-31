const express = require("express")
const router = express.Router()
const { GoogleGenerativeAI } = require("@google/generative-ai")
const authMiddleware = require("../middleware/authMiddleware")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

function getModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
}

// Unified error handler for Gemini AI rate limits & general failures
function handleAIError(error, res, contextMessage) {
  console.error(`${contextMessage} error:`, error.message)

  const isQuotaExceeded =
    error.status === 429 ||
    error.message?.includes("429") ||
    error.message?.toLowerCase().includes("quota") ||
    error.message?.toLowerCase().includes("limit")

  if (isQuotaExceeded) {
    return res.status(429).json({
      error: "Gemini API quota exceeded. Please upgrade to a pay-as-you-go plan in Google AI Studio or configure a new API key in server/.env."
    })
  }

  res.status(500).json({ error: `${contextMessage} failed` })
}

// POST /api/ai/summary — Summarise notes
router.post("/summary", authMiddleware, async (req, res) => {
  try {
    const { notes } = req.body
    if (!notes) return res.status(400).json({ error: "Notes are required" })

    const model = getModel()
    const prompt = `You are a helpful study assistant. Summarise these learning notes clearly and concisely in 3-5 bullet points. Focus on key concepts:\n\n${notes}`
    const result = await model.generateContent(prompt)
    res.json({ summary: result.response.text() })
  } catch (error) {
    handleAIError(error, res, "AI summarisation")
  }
})

// POST /api/ai/mcq — Generate MCQ quiz questions
router.post("/mcq", authMiddleware, async (req, res) => {
  try {
    const { notes, topic, count = 5 } = req.body
    if (!notes) return res.status(400).json({ error: "Notes are required" })

    const model = getModel()
    const prompt = `You are an expert teacher. Based on these notes about "${topic || "the topic"}", generate exactly ${count} multiple choice questions.

Return ONLY valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A) Option 1",
    "explanation": "Brief explanation of why this is correct"
  }
]

Notes:
${notes}`

    const result = await model.generateContent(prompt)
    let text = result.response.text().trim()

    // Strip markdown code fences if present
    text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()

    const questions = JSON.parse(text)
    res.json({ questions })
  } catch (error) {
    handleAIError(error, res, "MCQ generation")
  }
})

// POST /api/ai/interview — Generate interview questions
router.post("/interview", authMiddleware, async (req, res) => {
  try {
    const { notes, topic } = req.body
    if (!notes) return res.status(400).json({ error: "Notes are required" })

    const model = getModel()
    const prompt = `You are a senior technical interviewer. Based on these notes about "${topic || "the topic"}", generate 5 deep interview questions that test conceptual understanding.

Return ONLY valid JSON array in this format:
[
  {
    "question": "Interview question here?",
    "type": "conceptual|practical|scenario",
    "difficulty": "easy|medium|hard",
    "hint": "A hint to guide the answer"
  }
]

Notes:
${notes}`

    const result = await model.generateContent(prompt)
    let text = result.response.text().trim()
    text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()

    const questions = JSON.parse(text)
    res.json({ questions })
  } catch (error) {
    handleAIError(error, res, "Interview question generation")
  }
})

// POST /api/ai/study-plan — Generate weakness study plan
router.post("/study-plan", authMiddleware, async (req, res) => {
  try {
    const { weakTopics, userName } = req.body
    if (!weakTopics || weakTopics.length === 0) {
      return res.status(400).json({ error: "Weak topics are required" })
    }

    const model = getModel()
    const prompt = `You are a personalized learning coach for ${userName || "a student"}. 
They are struggling with these topics: ${weakTopics.join(", ")}.

Create a focused 7-day study plan to strengthen these areas.

Return ONLY valid JSON in this format:
{
  "overview": "Brief overview of the plan",
  "days": [
    {
      "day": 1,
      "focus": "Topic focus",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "estimatedTime": "30 mins"
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`

    const result = await model.generateContent(prompt)
    let text = result.response.text().trim()
    text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()

    const plan = JSON.parse(text)
    res.json({ plan })
  } catch (error) {
    handleAIError(error, res, "Study plan generation")
  }
})

// POST /api/ai/chat — Socratic chat with Neuro (the AI tutor)
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, history = [], context } = req.body
    if (!message) return res.status(400).json({ error: "Message is required" })

    const model = getModel()

    const systemPrompt = `You are Neuro, an intelligent and encouraging AI study assistant for NeuroLoop — a personal learning platform. 

Your personality:
- Curious and Socratic: guide students to think rather than just giving answers
- Warm but precise: encouraging without being vague
- Expert tutor: deeply knowledgeable across all subjects
- You use the Socratic method: ask follow-up questions, challenge assumptions, guide to deeper understanding

${context ? `Current study context: ${context}` : ""}

Keep responses concise (2-4 paragraphs max). Use bullet points for lists. Ask one follow-up question at the end to deepen understanding.`

    // Build conversation history
    const chatHistory = history.slice(-10).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Hello! I'm Neuro, your AI study companion. I'm here to help you truly understand concepts, not just memorize them. What are you working on today?" }] },
        ...chatHistory,
      ],
    })

    const result = await chat.sendMessage(message)
    const reply = result.response.text()

    res.json({ reply })
  } catch (error) {
    handleAIError(error, res, "AI Socratic chat")
  }
})

module.exports = router