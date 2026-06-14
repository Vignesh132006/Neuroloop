require("dotenv").config()
const { sendServerErrorAlert } = require("./utils/emailService")

const express = require("express")
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
app.use(async (err, req, res, next) => {
  console.error("[Server Error]", err.stack)

  // Alert admin — non-blocking
  sendServerErrorAlert({
    route: req.originalUrl,
    method: req.method,
    error: err,
    userId: req.user?.id || null,
    userEmail: req.user?.email || null
  }).catch(e => console.error('[Email] Error alert failed:', e.message))

  res.status(500).json({
    error: 'Something went wrong on our end. Our team has been notified.'
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`)
})