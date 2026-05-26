const express = require("express")
const router = express.Router()

const Journal = require("../models/Journal")

router.post("/add", async (req, res) => {

    try {

        const { topic, notes } = req.body

        const newJournal = new Journal({
            topic,
            notes,
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

module.exports = router
router.get("/", async (req, res) => {

    try {

        const journals = await Journal.find()

        res.status(200).json(journals)

    } catch (error) {

        res.status(500).json({
            error: error.message,
        })

    }

})
router.delete("/:id", async (req, res) => {

  try {

    await Journal.findByIdAndDelete(req.params.id)

    res.status(200).json({
      message: "Journal deleted successfully",
    })

  } catch (error) {

    res.status(500).json({
      error: error.message,
    })

  }

})
router.put("/:id", async (req, res) => {

  try {

    const { topic, notes } = req.body

    await Journal.findByIdAndUpdate(
      req.params.id,
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