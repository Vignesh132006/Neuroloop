require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const revisionRoutes = require("./routes/revisionRoutes")

const aiRoutes = require("./routes/aiRoutes")
const journalRoutes = require("./routes/journalRoutes")
const authRoutes = require("./routes/authRoutes")
const testRoutes = require("./routes/testRoutes")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/revision", revisionRoutes)
app.use("/api/journal", journalRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/auth", authRoutes)
app.use("/api", testRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err))

app.get("/", (req, res) => {
  res.send("Backend Running")
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})