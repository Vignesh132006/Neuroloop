const APP_NAME = "NeuroLoop"

async function sendAdminAlert({ route, method, error, userId, userEmail }) {
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  const errorMessage = error?.message || String(error) || "Unknown error"
  console.error(`[AdminAlert Error Log] ${timestamp} IST | ${method} ${route} | User: ${userEmail || "Unknown"} | Error: ${errorMessage}`)
}

module.exports = { sendAdminAlert }
