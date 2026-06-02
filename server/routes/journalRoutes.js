const express = require("express")
const router = express.Router()

const Journal = require("../models/Journal")

const authMiddleware = require("../middleware/authMiddleware")

// CREATE JOURNAL
router.post("/add", authMiddleware, async (req, res) => {

  try {

    const { topic, notes } = req.body

    const newJournal = new Journal({
  topic,
  notes,
  user: req.user.id,
})

    await newJournal.save()

    res.status(201).json({
      message: "Journal saved successfully",
    })

  } catch (error) {

    res.status(500).json({
      error: error.message,
    })

  }

})

// GET ALL JOURNALS
router.get("/", authMiddleware, async (req, res) => {

  try {

    const journals = await Journal.find({
  user: req.user.id,
})

    res.status(200).json(journals)

  } catch (error) {

    res.status(500).json({
      error: error.message,
    })

  }

})

// DELETE JOURNAL
router.delete("/:id", authMiddleware, async (req, res) => {

  try {

    await Journal.findOneAndDelete({
  _id: req.params.id,
  user: req.user.id,
})

    res.status(200).json({
      message: "Journal deleted successfully",
    })

  } catch (error) {

    res.status(500).json({
      error: error.message,
    })

  }

})

// UPDATE JOURNAL
router.put("/:id", authMiddleware, async (req, res) => {

  try {

    const { topic, notes } = req.body

    await Journal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        topic,
        notes,
      }
    )

    res.status(200).json({
      message: "Journal updated successfully",
    })

  } catch (error) {

    res.status(500).json({
      error: error.message,
    })

  }

})

module.exports = router