const express = require("express")

const router = express.Router()

const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
)

router.post("/summary", async (req, res) => {

  try {

    const { notes } = req.body

    if (!notes) {
      return res.status(400).json({
        error: "Notes are required",
      })
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    })

    const prompt =
      `Summarize these learning notes in short:\n\n${notes}`

    const result = await model.generateContent(prompt)

    const text = result.response.text()

    res.json({
      summary: text,
    })

  } catch (error) {

    console.log("GEMINI ERROR:", error)

    res.status(500).json({
      error: "AI generation failed",
    })

  }

})

module.exports = router