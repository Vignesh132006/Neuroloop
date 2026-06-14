const sgMail = require("@sendgrid/mail")

const apiKey = process.env.SENDGRID_API_KEY
const sender = process.env.SENDGRID_SENDER

if (apiKey) {
  sgMail.setApiKey(apiKey)
} else {
  console.warn("[Warning] SENDGRID_API_KEY is not defined. Email reminders will be logged to console in development.")
}

/**
 * Send a revision reminder email to the user
 * @param {string} toEmail - User email
 * @param {string} userName - User name
 * @param {Array} notes - List of notes due for revision today
 */
async function sendRevisionReminder(toEmail, userName, notes) {
  const noteListHtml = notes
    .map(
      (n) =>
        `<li style="margin-bottom: 10px;">
          <strong>${n.topic}</strong> (Difficulty: ${n.difficulty})<br/>
          <span style="color: #666; font-size: 0.9em;">${n.notes.slice(0, 150)}...</span>
        </li>`
    )
    .join("")

  const textContent = `Hi ${userName},\n\nYou have ${notes.length} topic(s) due for revision today on NeuroLoop:\n\n${notes.map(n => `- ${n.topic}`).join("\n")}\n\nKeep up your study streak!\n\nHappy Learning,\nNeuroLoop Team`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #333;">
      <h2 style="color: #8b5cf6; margin-bottom: 10px;">NeuroLoop Revision Reminder</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>You have <strong>${notes.length}</strong> topic(s) due for revision today. Regular active recall is key to long-term memory retention!</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <ul style="padding-left: 20px; margin-bottom: 20px;">
        ${noteListHtml}
      </ul>
      <a href="http://localhost:5173/revision" style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center;">Go to Revisions</a>
      <p style="margin-top: 20px; color: #718096; font-size: 0.8em; text-align: center;">Keep up your learning streak!</p>
    </div>
  `

  const msg = {
    to: toEmail,
    from: sender || "no-reply@neuroloop.com",
    subject: `NeuroLoop Revision Reminder: ${notes.length} topics due today`,
    text: textContent,
    html: htmlContent,
  }

  if (apiKey && sender) {
    try {
      await sgMail.send(msg)
      console.log(`[Email] Reminder sent via SendGrid to ${toEmail}`)
      return { success: true, method: "SendGrid" }
    } catch (error) {
      console.error("[Email] SendGrid email sending failed:", error.response?.body || error.message)
      return { success: false, error: error.message }
    }
  } else {
    console.log(`[Email] [MOCK EMAIL SENT TO CONSOLE]
To: ${toEmail}
Subject: ${msg.subject}
Body (Text):
${textContent}
---------------------------------------------`)
    return { success: true, method: "Console Mock" }
  }
}

module.exports = {
  sendRevisionReminder,
}
