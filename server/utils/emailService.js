const sgMail = require('@sendgrid/mail')

// Set API key — if missing, log warning but don't crash
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  console.log('[Email] SendGrid configured successfully')
} else {
  console.warn('[Email] WARNING: SENDGRID_API_KEY not set — emails will not send')
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'neuroloopadmin@gmail.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'neuroloopadmin@gmail.com'

// ─── HELPER ───────────────────────────────────────────
async function sendEmail(mailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[Email] Skipped — SENDGRID_API_KEY not configured')
    return false
  }
  try {
    await sgMail.send(mailOptions)
    console.log(`[Email] Sent successfully to: ${mailOptions.to}`)
    return true
  } catch (err) {
    console.error('[Email] SendGrid error:', err.response?.body || err.message)
    return false
    // NEVER throw — email failure must never crash the server
  }
}

// ─── 1. WELCOME EMAIL → sends to USER ─────────────────
async function sendWelcomeEmail(userEmail, userName) {
  const mail = {
    to: userEmail,
    from: FROM_EMAIL,
    subject: `Welcome to NeuroLoop, ${userName}! Your learning loop starts now 🧠`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0D0D1A;font-family:Inter,Arial,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#13132A;border-radius:16px;
            border:1px solid rgba(124,58,237,0.3);overflow:hidden;">

  <div style="background:linear-gradient(135deg,#7C3AED,#06B6D4);padding:32px;text-align:center;">
    <div style="font-size:48px;margin-bottom:8px;">🧠</div>
    <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">NeuroLoop</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">
      AI-Powered Learning Journal
    </p>
  </div>

  <div style="padding:32px;">
    <h2 style="color:#F0EFFE;margin:0 0 12px;">Hey ${userName}! 🎉</h2>
    <p style="color:#9CA3AF;line-height:1.7;margin:0 0 24px;">
      Welcome to NeuroLoop — your personal AI study assistant.
      You are now ready to learn smarter, remember longer, and master anything.
    </p>

    <div style="background:#1E1E3A;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#A78BFA;font-weight:600;margin:0 0 12px;font-size:14px;">
        What you can do now:
      </p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="color:#9CA3AF;font-size:14px;">📝 Write daily learning notes</div>
        <div style="color:#9CA3AF;font-size:14px;">🤖 Get AI summaries instantly</div>
        <div style="color:#9CA3AF;font-size:14px;">🧠 Take quizzes from your own notes</div>
        <div style="color:#9CA3AF;font-size:14px;">🔁 Track revision with spaced repetition</div>
        <div style="color:#9CA3AF;font-size:14px;">📊 Detect your weak topics automatically</div>
      </div>
    </div>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard"
       style="display:block;text-align:center;padding:14px 32px;
              background:linear-gradient(135deg,#7C3AED,#06B6D4);
              color:white;border-radius:9999px;text-decoration:none;
              font-weight:600;font-size:16px;">
      Open My Dashboard →
    </a>

    <p style="color:#6B7280;font-size:12px;text-align:center;margin-top:24px;font-style:italic;">
      "An investment in knowledge pays the best interest." — Benjamin Franklin
    </p>
  </div>

  <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
    <p style="color:#4B5563;font-size:11px;margin:0;">
      You received this because you signed up for NeuroLoop.
    </p>
  </div>
</div>
</body>
</html>
    `
  }
  return await sendEmail(mail)
}

// ─── 2. OTP PASSWORD RESET EMAIL → sends to USER ──────
async function sendOTPEmail(userEmail, userName, otp) {
  const mail = {
    to: userEmail,
    from: FROM_EMAIL,
    subject: 'Your NeuroLoop password reset code',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Arial,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:#111111;border-radius:16px;
            border:1px solid rgba(212,175,55,0.2);overflow:hidden;">

  <div style="padding:32px 32px 0;">
    <div style="font-size:32px;margin-bottom:8px;">🔐</div>
    <h2 style="color:#d4af37;font-weight:400;margin:0 0 8px;font-size:22px;">
      Password Reset
    </h2>
    <p style="color:#a09880;margin:0 0 24px;line-height:1.6;">
      Hey ${userName}, here is your 6-digit verification code.
      This code is valid for <strong style="color:#f5f0e8;">10 minutes only.</strong>
    </p>
  </div>

  <div style="padding:0 32px;">
    <div style="background:#1a1a1a;border:1px solid rgba(212,175,55,0.3);
                border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <div style="font-size:42px;font-weight:800;letter-spacing:0.4em;
                  color:#d4af37;font-family:monospace;">
        ${otp}
      </div>
      <div style="font-size:12px;color:#5a5040;margin-top:10px;">
        Do not share this code with anyone
      </div>
    </div>

    <div style="background:#1a0a0a;border:1px solid rgba(239,68,68,0.2);
                border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      <p style="color:#fca5a5;font-size:12px;margin:0;">
        ⚠️ If you did not request a password reset, ignore this email.
        Your password will remain unchanged.
      </p>
    </div>
  </div>

  <div style="padding:16px 32px 24px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
    <p style="color:#4B5563;font-size:11px;margin:0;">
      NeuroLoop — AI-Powered Learning Journal
    </p>
  </div>
</div>
</body>
</html>
    `
  }
  return await sendEmail(mail)
}

// ─── 3. REVISION REMINDER EMAIL → sends to USER ───────
async function sendRevisionReminderEmail(userEmail, userName, dueNotes) {
  const notesList = dueNotes
    .map(n => `
      <div style="background:#1E1E3A;border-radius:8px;padding:10px 14px;margin-bottom:8px;
                  border-left:3px solid #7C3AED;">
        <div style="color:#F0EFFE;font-size:14px;font-weight:500;">${n.topic || n}</div>
        ${n.difficulty ? `<div style="color:#6B7280;font-size:12px;margin-top:2px;">Difficulty: ${n.difficulty}</div>` : ''}
      </div>
    `).join('')

  const mail = {
    to: userEmail,
    from: FROM_EMAIL,
    subject: `🔥 ${dueNotes.length} revision(s) due today — keep your streak alive!`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0D0D1A;font-family:Inter,Arial,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#13132A;border-radius:16px;
            border:1px solid rgba(124,58,237,0.3);overflow:hidden;">

  <div style="padding:28px 32px;border-bottom:1px solid rgba(124,58,237,0.15);">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="font-size:32px;">🔥</div>
      <div>
        <h2 style="color:#F0EFFE;margin:0;font-size:20px;">Hey ${userName}!</h2>
        <p style="color:#9CA3AF;margin:4px 0 0;font-size:14px;">
          You have ${dueNotes.length} topic(s) waiting for revision today.
        </p>
      </div>
    </div>
  </div>

  <div style="padding:24px 32px;">
    <p style="color:#A78BFA;font-weight:600;margin:0 0 12px;font-size:14px;">
      📚 Due for revision:
    </p>
    ${notesList}

    <div style="background:#1E1E3A;border-radius:12px;padding:16px;
                margin:20px 0;border:1px solid rgba(6,182,212,0.2);">
      <p style="color:#67E8F9;font-size:13px;margin:0;line-height:1.6;">
        💡 <strong>Why revise today?</strong> Spaced repetition boosts memory retention by up to 80%.
        Missing a revision breaks the learning curve.
      </p>
    </div>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/revision"
       style="display:block;text-align:center;padding:14px 32px;
              background:linear-gradient(135deg,#7C3AED,#06B6D4);
              color:white;border-radius:9999px;text-decoration:none;
              font-weight:600;font-size:15px;">
      Start Revision Now →
    </a>

    <p style="color:#6B7280;font-size:12px;text-align:center;margin-top:20px;">
      Keep learning. Keep growing. 💜
    </p>
  </div>
</div>
</body>
</html>
    `
  }
  return await sendEmail(mail)
}

// ─── 4. SUPPORT TICKET EMAIL → sends to ADMIN ONLY ────
async function sendSupportTicketEmail(ticketId, userName, userEmail, category, subject, message) {
  const categoryEmoji = {
    bug: '🐛', question: '❓', feedback: '💡',
    'feature-request': '✨', account: '🔑', other: '📄'
  }
  const mail = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    replyTo: userEmail,
    subject: `🎧 [Support #${ticketId}] ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#111111;border-radius:16px;
            border:1px solid rgba(212,175,55,0.2);overflow:hidden;">

  <div style="background:linear-gradient(135deg,#1a0a00,#2a1500);
              padding:24px 32px;border-bottom:1px solid rgba(212,175,55,0.2);">
    <div style="font-size:28px;margin-bottom:6px;">🎧</div>
    <h2 style="color:#d4af37;margin:0;font-size:20px;">New Support Ticket</h2>
    <p style="color:#a09880;margin:4px 0 0;font-size:13px;">
      Ticket ID: <strong style="color:#f5f0e8;font-family:monospace;">${ticketId}</strong>
    </p>
  </div>

  <div style="padding:24px 32px;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px;">From</td>
        <td style="padding:8px 0;color:#f5f0e8;font-size:13px;font-weight:500;">${userName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td>
        <td style="padding:8px 0;color:#67e8f9;font-size:13px;">${userEmail}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Category</td>
        <td style="padding:8px 0;color:#f5f0e8;font-size:13px;">
          ${categoryEmoji[category] || '📄'} ${category}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Subject</td>
        <td style="padding:8px 0;color:#f5f0e8;font-size:13px;font-weight:500;">${subject}</td>
      </tr>
    </table>

    <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.06);
                border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="color:#a09880;font-size:13px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
    </div>

    <p style="color:#4b5563;font-size:11px;margin:0;">
      Reply to this email to respond directly to ${userName}.
    </p>
  </div>
</div>
</body>
</html>
    `
  }
  return await sendEmail(mail)
}

// ─── 5. SERVER ERROR ALERT → sends to ADMIN ONLY ──────
async function sendServerErrorAlert({ route, method, error, userId, userEmail }) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  const errorMessage = error?.message || String(error) || 'Unknown error'
  const errorStack = (error?.stack || 'No stack trace').substring(0, 600)

  const mail = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `🚨 [NeuroLoop Error] ${method} ${route}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:monospace;">
<div style="max-width:580px;margin:40px auto;background:#110000;border-radius:16px;
            border:1px solid rgba(239,68,68,0.3);overflow:hidden;">

  <div style="background:linear-gradient(135deg,#2a0000,#1a0000);
              padding:24px 32px;border-bottom:1px solid rgba(239,68,68,0.2);">
    <div style="font-size:28px;margin-bottom:6px;">🚨</div>
    <h2 style="color:#ef4444;margin:0;font-size:20px;font-family:monospace;">
      Server Error Alert
    </h2>
    <p style="color:#6b7280;margin:4px 0 0;font-size:12px;">${timestamp} IST</p>
  </div>

  <div style="padding:24px 32px;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:8px 12px;background:#1a0000;color:#6b7280;
                   font-size:12px;width:110px;border-radius:4px 0 0 0;">Route</td>
        <td style="padding:8px 12px;background:#1a1a1a;color:#f5f0e8;
                   font-size:13px;border:1px solid #2a2a2a;">${method} ${route}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;background:#1a0000;color:#6b7280;font-size:12px;">Error</td>
        <td style="padding:8px 12px;background:#1a1a1a;color:#fca5a5;
                   font-size:13px;font-weight:600;border:1px solid #2a2a2a;">${errorMessage}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;background:#1a0000;color:#6b7280;font-size:12px;">User ID</td>
        <td style="padding:8px 12px;background:#1a1a1a;color:#f5f0e8;
                   font-size:13px;border:1px solid #2a2a2a;">${userId || 'Not authenticated'}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;background:#1a0000;color:#6b7280;font-size:12px;">User Email</td>
        <td style="padding:8px 12px;background:#1a1a1a;color:#f5f0e8;
                   font-size:13px;border:1px solid #2a2a2a;">${userEmail || 'Unknown'}</td>
      </tr>
    </table>

    <div style="background:#0d0d0d;border:1px solid rgba(239,68,68,0.15);
                border-radius:8px;padding:14px;">
      <p style="color:#6b7280;font-size:10px;margin:0 0 8px;
                text-transform:uppercase;letter-spacing:0.08em;">Stack Trace</p>
      <pre style="color:#fbbf24;font-size:11px;margin:0;
                  white-space:pre-wrap;word-break:break-all;line-height:1.5;">${errorStack}</pre>
    </div>

    <p style="color:#374151;font-size:10px;margin-top:16px;text-align:center;">
      Automated error monitoring — NeuroLoop Server
    </p>
  </div>
</div>
</body>
</html>
    `
  }
  return await sendEmail(mail)
}

async function sendVerificationOtp(userEmail, userName, otp) {
  const msg = {
    to: userEmail,
    from: { email: process.env.SENDER_EMAIL || FROM_EMAIL, name: 'NeuroLoop' },
    subject: 'Verify your NeuroLoop account',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;background:#0a0a0a;
                  color:#f5f0e8;padding:40px 32px;border-radius:16px;
                  max-width:480px;margin:auto;
                  border:1px solid rgba(212,175,55,0.25);">

        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <div style="width:40px;height:40px;border-radius:10px;
                        background:linear-gradient(135deg,#d4af37,#8a6f1e);
                        display:flex;align-items:center;justify-content:center;
                        font-size:20px;">🧠</div>
            <span style="font-family:Georgia,serif;font-size:1.3rem;
                         color:#f5f0e8;">Neuro<span style="color:#d4af37;">Loop</span></span>
          </div>
        </div>

        <h2 style="font-family:Georgia,serif;font-weight:400;
                   color:#f5f0e8;margin:0 0 8px;text-align:center;">
          Verify your email
        </h2>
        <p style="color:#a09880;text-align:center;margin:0 0 28px;font-size:0.9rem;">
          Hey ${userName}, enter this code to activate your account.
        </p>

        <div style="background:#111111;border:1px solid rgba(212,175,55,0.3);
                    border-radius:14px;padding:28px;text-align:center;
                    margin-bottom:24px;">
          <div style="font-size:2.8rem;font-weight:800;
                      letter-spacing:0.4em;color:#d4af37;
                      font-family:Georgia,serif;">
            ${otp}
          </div>
          <div style="font-size:0.75rem;color:#5a5040;margin-top:10px;">
            Valid for 10 minutes · Do not share this code
          </div>
        </div>

        <p style="color:#5a5040;font-size:0.78rem;text-align:center;margin:0;">
          If you did not create a NeuroLoop account, ignore this email.
        </p>
      </div>
    `,
  };

  await sgMail.send(msg);
  console.log(`[Email] Verification OTP sent to ${userEmail}`);
}

module.exports = {
  sendWelcomeEmail,
  sendOTPEmail,
  sendRevisionReminderEmail,
  sendSupportTicketEmail,
  sendServerErrorAlert,
  sendVerificationOtp,
  // Export requested aliases and functions:
  sendReminderEmail: sendRevisionReminderEmail,
  sendResetOtpEmail: sendOTPEmail
}
