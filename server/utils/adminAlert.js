const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const ADMIN_EMAIL = "neuroloopadmin@gmail.com"
const APP_NAME = "NeuroLoop"

async function sendAdminAlert({ route, method, error, userId, userEmail }) {
  // Only run if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER) {
    console.error("[AdminAlert] SendGrid not configured — skipping email")
    return
  }

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  const errorMessage = error?.message || String(error) || "Unknown error"
  const errorStack = error?.stack || "No stack trace"

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">🚨 NeuroLoop Server Error Alert</h2>
        <p style="color: #fca5a5; margin: 6px 0 0;">${timestamp} IST</p>
      </div>
      <div style="background: #1f2937; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #374151;">
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 12px; background: #111827; color: #9ca3af; font-size: 12px; width: 140px; border-radius: 4px 0 0 4px;">Route</td>
            <td style="padding: 8px 12px; background: #1f2937; color: #f1f5f9; font-size: 13px; border: 1px solid #374151;">${method} ${route}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #111827; color: #9ca3af; font-size: 12px;">Error</td>
            <td style="padding: 8px 12px; background: #1f2937; color: #fca5a5; font-size: 13px; border: 1px solid #374151; font-weight: bold;">${errorMessage}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #111827; color: #9ca3af; font-size: 12px;">User ID</td>
            <td style="padding: 8px 12px; background: #1f2937; color: #f1f5f9; font-size: 13px; border: 1px solid #374151;">${userId || "Not authenticated"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #111827; color: #9ca3af; font-size: 12px;">User Email</td>
            <td style="padding: 8px 12px; background: #1f2937; color: #f1f5f9; font-size: 13px; border: 1px solid #374151;">${userEmail || "Unknown"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #111827; color: #9ca3af; font-size: 12px;">Time</td>
            <td style="padding: 8px 12px; background: #1f2937; color: #f1f5f9; font-size: 13px; border: 1px solid #374151;">${timestamp}</td>
          </tr>
        </table>

        <div style="background: #111827; border-radius: 6px; padding: 14px; margin-top: 8px;">
          <p style="color: #6b7280; font-size: 11px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">Stack Trace</p>
          <pre style="color: #fbbf24; font-size: 11px; margin: 0; white-space: pre-wrap; word-break: break-all; line-height: 1.5;">${errorStack.substring(0, 800)}</pre>
        </div>

        <p style="color: #6b7280; font-size: 11px; margin-top: 20px; text-align: center;">
          This is an automated alert from ${APP_NAME} server monitoring.<br>
          Do not reply to this email.
        </p>
      </div>
    </div>
  `

  try {
    await sgMail.send({
      to: ADMIN_EMAIL,
      from: process.env.SENDGRID_SENDER,
      subject: `🚨 [NeuroLoop] Server Error — ${method} ${route}`,
      html: htmlBody,
    })
    console.log(`[AdminAlert] Error alert sent to admin for: ${method} ${route}`)
  } catch (emailErr) {
    // Do NOT throw — just log. Never let email failure crash the server.
    console.error("[AdminAlert] Failed to send admin email:", emailErr.message)
  }
}

module.exports = { sendAdminAlert }
