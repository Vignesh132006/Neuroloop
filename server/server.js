console.log("[Diagnostic] Starting server initialization...");
  require("dotenv").config()
  console.log("[Diagnostic] dotenv loaded");
  
  const { sendServerErrorAlert } = require("./utils/emailService")
  console.log("[Diagnostic] emailService loaded");

  const express = require("express")
  console.log("[Diagnostic] express loaded");
  const mongoose = require("mongoose")
  console.log("[Diagnostic] mongoose loaded");
  const cors = require("cors")
  console.log("[Diagnostic] cors loaded");

  const authRoutes = require("./routes/authRoutes")
  console.log("[Diagnostic] authRoutes loaded");
  const noteRoutes = require("./routes/noteRoutes")
  console.log("[Diagnostic] noteRoutes loaded");
  const topicRoutes = require("./routes/topicRoutes")
  console.log("[Diagnostic] topicRoutes loaded");
  const quizRoutes = require("./routes/quizRoutes")
  console.log("[Diagnostic] quizRoutes loaded");
  const revisionRoutes = require("./routes/revisionRoutes")
  console.log("[Diagnostic] revisionRoutes loaded");
  const aiRoutes = require("./routes/aiRoutes")
  console.log("[Diagnostic] aiRoutes loaded");
  const testRoutes = require("./routes/testRoutes")
  console.log("[Diagnostic] testRoutes loaded");
  const studyPlanRoutes = require("./routes/studyPlanRoutes")
  console.log("[Diagnostic] studyPlanRoutes loaded");
  const adminRoutes = require('./routes/adminRoutes')
  console.log("[Diagnostic] adminRoutes loaded");

  const app = express()
  console.log("[Diagnostic] express app created");

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        'http://localhost:5173',
        'https://neuroloop-wine.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean);

      const isAllowed = allowedOrigins.includes(origin);
      const isVercel = origin.endsWith('.vercel.app') && (origin.includes('neuroloop') || origin.includes('vignesh'));

      if (isAllowed || isVercel || origin === 'null') {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true
  }))
  app.use(express.json({ limit: "5mb" }))


  console.log("[Diagnostic] middleware set up");

  // Routes
  console.log("[Diagnostic] Mounting routes...");

  app.use("/api/auth", authRoutes)
  app.use("/api/notes", noteRoutes)
  app.use("/api/topics", topicRoutes)
  app.use("/api/quiz", quizRoutes)
  app.use("/api/revision", revisionRoutes)
  app.use("/api/ai", aiRoutes)
  app.use("/api/study-plans", studyPlanRoutes)
  app.use("/api/admin", adminRoutes)
  app.use("/api", testRoutes)
  app.use("/api/journal", noteRoutes)
  console.log("[Diagnostic] Routes mounted successfully");

  console.log("[Database] Connecting to MongoDB...");
  if (!process.env.MONGO_URI) {
    console.error("[Database] ERROR: MONGO_URI is not defined in environment variables!");
    process.exit(1);
  }

  app.get("/", (req, res) => {
    res.json({ message: "NeuroLoop API Running", version: "2.0.0" })
  })

  app.get('/api/ping', (req, res) => {
    res.json({ ok: true })
  })

  app.use((req, res) => {
    res.status(404).json({ error: 'API route not found' })
  })

  // Global error handler
  app.use(async (err, req, res, next) => {
    console.error("[Server Error]", err.stack)
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

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn('[Warning] GOOGLE_CLIENT_ID not set. Google OAuth will not work.');
  } else {
    console.log('[Auth] Google OAuth ready.');
  }

  const PORT = process.env.PORT || 5000

  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('[Database] MongoDB Connected')
      try {
        const { startReminderScheduler } = require('./utils/scheduler')
        startReminderScheduler()
        console.log('[Scheduler] Spaced repetition scheduler initialized')
      } catch (schedErr) {
        console.error('[Scheduler] Initialization failed:', schedErr.message)
      }
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Server] Running on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error('[Database] MongoDB connection failed:', err.message)
      process.exit(1)
    })