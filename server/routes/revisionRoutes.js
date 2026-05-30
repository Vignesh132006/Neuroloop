const express = require("express")

const router = express.Router()

const Journal = require("../models/Journal")

const authMiddleware = require("../middleware/authMiddleware")

// GET TOPICS TO REVISE

router.get("/", authMiddleware, async (req, res) => {

  try {

    const journals = await Journal.find({
      user: req.user.id,
      revisionCount: { $lt: 3 }
    })

    res.status(200).json(journals)

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

})

// MARK AS REVISED

router.put("/:id", authMiddleware, async (req, res) => {

  try {

    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!journal) {

      return res.status(404).json({
        message: "Journal not found",
      })

    }

    journal.revisionCount += 1

    journal.lastRevised = new Date()

    await journal.save()

    res.status(200).json({
      message: "Revision updated successfully",
    })

  } catch (error) {

    res.status(500).json({
      message: error.message,
    })

  }

})

module.exports = router