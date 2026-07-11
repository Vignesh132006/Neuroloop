const cron = require('node-cron')
const User = require('../models/User')
const Note = require('../models/Note')
const { sendRevisionReminderEmail } = require('./emailService')

function startReminderScheduler() {
  // Run every day at 8:00 AM server time (08:00 UTC)
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running daily revision reminder job...')
    try {
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      // Find all users who want email notifications
      const users = await User.find({ emailNotifications: true })

      for (const user of users) {
        // Double check if they already received a reminder today
        if (user.lastReminderSentDate) {
          const lastSent = new Date(user.lastReminderSentDate)
          if (
            lastSent.getUTCFullYear() === today.getUTCFullYear() &&
            lastSent.getUTCMonth() === today.getUTCMonth() &&
            lastSent.getUTCDate() === today.getUTCDate()
          ) {
            // Already sent today
            continue
          }
        }

        // Find notes due for this user
        const dueNotes = await Note.find({
          user: user._id,
          nextRevision: { $lte: today },
        }).sort({ nextRevision: 1 })

        if (dueNotes.length > 0) {
          const topicList = dueNotes.map(n => ({
            topic: n.topic,
            difficulty: n.difficulty || null
          }))

          console.log(`[Scheduler] Sending reminder email to ${user.email} for ${dueNotes.length} notes`)
          await sendRevisionReminderEmail(user.email, user.name, topicList)

          user.lastReminderSentDate = new Date()
          await user.save()
        }
      }
      console.log('[Scheduler] Daily revision reminder job completed.')
    } catch (err) {
      console.error('[Scheduler] Error in daily revision reminder job:', err.message)
    }
  })
}

module.exports = { startReminderScheduler }
