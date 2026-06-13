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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175"
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || 
                      /^http:\/\/localhost(:\d+)?$/.test(origin) || 
                      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn('[Warning] GMAIL_USER or GMAIL_PASS not set in environment variables. Emails will not send.')
  } else {
    console.log('[Email] Gmail SMTP ready.')
  }
})

// Daily revision reminder — runs every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('[Cron] Running daily revision reminders...')
    const User = require('./models/User')
    const Note = require('./models/Note')
    const { sendReminderEmail } = require('./utils/emailService')

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const users = await User.find({ emailNotifications: { $ne: false } })
    const usersWithDueRevisions = []

    for (const user of users) {
      const dueNotes = await Note.find({
        user: user._id,
        nextRevision: { $lte: today },
      })
      if (dueNotes.length > 0) {
        usersWithDueRevisions.push({
          email: user.email,
          name: user.name,
          dueNotes,
        })
      }
    }

    for (const user of usersWithDueRevisions) {
      const dueTopics = user.dueNotes.map(n => n.topic)
      try {
        await sendReminderEmail(user.email, user.name, dueTopics)
      } catch (err) {
        console.error(`[Email] Failed for ${user.email}:`, err.message)
      }
    }
  } catch (err) {
    console.error('[Cron] Reminder failed:', err.message)
  }
})

console.log('[Cron] Daily reminder scheduler started — runs at 8:00 AM')