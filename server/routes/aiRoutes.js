const express = require("express")
const router = express.Router()
const Groq = require("groq-sdk")
const authMiddleware = require("../middleware/authMiddleware")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const GROQ_MODEL = "llama-3.3-70b-versatile"

// Unified error handler for Groq AI rate limits & general failures
function handleAIError(error, res, contextMessage) {
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

  res.status(500).json({ error: `${contextMessage} failed` })
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
        content: "You are a helpful study assistant. Summarise the learning notes clearly and concisely in 3-5 bullet points. Focus on key concepts. Respond only with the bullet points, no extra text.",
      },
      { role: "user", content: notes },
    ])

    res.json({ summary: text.trim() })
  } catch (error) {
    handleAIError(error, res, "AI summarisation")
  }
})

// POST /api/ai/mcq — Generate MCQ quiz questions
router.post("/mcq", authMiddleware, async (req, res) => {
  try {
    const { notes, topic, count = 5 } = req.body
    if (!notes) return res.status(400).json({ error: "Notes are required" })

    const prompt = `Based on these notes about "${topic || "the topic"}", generate exactly ${count} multiple choice questions.

Return ONLY a valid JSON array (no markdown, no explanation, no code fences) in this exact format:
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

    let text = await groqComplete([
      {
        role: "system",
        content: "You are an expert teacher. Return ONLY valid JSON with no markdown or code fences.",
      },
      { role: "user", content: prompt },
    ])

    text = text.trim().replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim()

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
        content: "You are a senior technical interviewer. Return ONLY valid JSON with no markdown or code fences.",
      },
      { role: "user", content: prompt },
    ])

    text = text.trim().replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim()

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

    const prompt = `The student "${userName || "a student"}" is struggling with these topics: ${weakTopics.join(", ")}.

Create a focused 7-day study plan to strengthen these areas.

Return ONLY valid JSON (no markdown, no code fences) in this format:
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

    let text = await groqComplete([
      {
        role: "system",
        content: "You are a personalized learning coach. Return ONLY valid JSON with no markdown or code fences.",
      },
      { role: "user", content: prompt },
    ])

    text = text.trim().replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim()

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

    const systemPrompt = `You are Neuro, an intelligent and encouraging AI study assistant for NeuroLoop — a personal learning platform.

Your personality:
- Curious and Socratic: guide students to think rather than just giving answers
- Warm but precise: encouraging without being vague
- Expert tutor: deeply knowledgeable across all subjects
- You use the Socratic method: ask follow-up questions, challenge assumptions, guide to deeper understanding

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
    handleAIError(error, res, "AI Socratic chat")
  }
})

module.exports = router