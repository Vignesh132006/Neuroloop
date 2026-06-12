require("dotenv").config()

const express = require("express")
const cron = require('node-cron')
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")
const noteRoutes = require("./routes/noteRoutes")
const topicRoutes = require("./routes/topicRoutes")
const quizRoutes = require("./routes/quizRoutes")
const revisionRoutes = require("./routes/revisionRoutes")
const aiRoutes = require("./routes/aiRoutes")
const testRoutes = require("./routes/testRoutes")
const studyPlanRoutes = require("./routes/studyPlanRoutes")

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))
app.use(express.json({ limit: "5mb" }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/notes", noteRoutes)
app.use("/api/topics", topicRoutes)
app.use("/api/quiz", quizRoutes)
app.use("/api/revision", revisionRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/study-plans", studyPlanRoutes)
app.use("/api", testRoutes)

// Keep backward-compat alias for old /api/journal routes
app.use("/api/journal", noteRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("[Database] MongoDB Connected"))
  .catch((err) => console.error("[Database] MongoDB Error:", err))

app.get("/", (req, res) => {
  res.json({ message: "NeuroLoop API Running", version: "2.0.0" })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`)
})

// Daily revision reminder — runs every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('[Cron] Running daily revision reminders...')
    const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/revision/send-reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    console.log('[Cron] Reminder result:', data)
  } catch (err) {
    console.error('[Cron] Reminder failed:', err.message)
  }
})

console.log('[Cron] Daily reminder scheduler started — runs at 8:00 AM')