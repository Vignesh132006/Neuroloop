require("dotenv").config()

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
app.use("/api", testRoutes)

// Keep backward-compat alias for old /api/journal routes
app.use("/api/journal", noteRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err))

app.get("/", (req, res) => {
  res.json({ message: "NeuroLoop API Running 🧠", version: "2.0.0" })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})