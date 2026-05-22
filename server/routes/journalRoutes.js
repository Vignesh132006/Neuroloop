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