require("dotenv").config()

const aiRoutes = require("./routes/aiRoutes")
const journalRoutes = require("./routes/journalRoutes")

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const testRoutes = require("./routes/testRoutes")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/journal", journalRoutes)
app.use("/api/ai", aiRoutes)
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