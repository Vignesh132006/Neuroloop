const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || process.env.SENDER_EMAIL,
    pass: process.env.GMAIL_PASS
  }
});

async function sendReminderEmail(userEmail, userName, dueTopics) {
  const topicList = dueTopics
    .map(t => `<li style="margin:6px 0;color:#06B6D4;">${t}</li>`)
    .join('');

  const mailOptions = {
    to: userEmail,
    from: process.env.GMAIL_USER || process.env.SENDER_EMAIL,
    subject: `🔥 ${dueTopics.length} revision(s) due today — keep your streak alive!`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#0D0D1A;color:#F0EFFE;
                  padding:32px;border-radius:16px;max-width:520px;margin:auto;
                  border:1px solid rgba(124,58,237,0.3);">
        <h2 style="color:#A78BFA;">Hey ${userName}! 🔥</h2>
        <p style="color:#9CA3AF;">
          You have <strong style="color:#F0EFFE;">${dueTopics.length} topic(s)</strong> due for revision today.
        </p>
        <div style="background:#13132A;border-radius:12px;padding:16px 24px;
                    border:1px solid rgba(124,58,237,0.2);margin:20px 0;">
          <p style="color:#A78BFA;font-weight:600;margin:0 0 10px;">📚 Topics due:</p>
          <ul style="margin:0;padding-left:20px;">${topicList}</ul>
        </div>
        <a href="http://localhost:5173/revision"
           style="display:inline-block;padding:12px 32px;
                  background:linear-gradient(135deg,#7C3AED,#06B6D4);
                  color:white;border-radius:9999px;text-decoration:none;font-weight:600;">
          Start Revision →
        </a>
        <p style="color:#6B7280;font-size:0.78rem;margin-top:24px;">
          Keep learning. Keep growing. 💜
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[Email] Reminder sent to ${userEmail}`);
}

async function sendWelcomeEmail(userEmail, userName) {
  const mailOptions = {
    to: userEmail,
    from: process.env.GMAIL_USER || process.env.SENDER_EMAIL,
    subject: `🎉 Welcome to NeuroLoop, ${userName}! Your learning loop starts now.`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#0D0D1A;color:#F0EFFE;
                  padding:32px;border-radius:16px;max-width:520px;margin:auto;
                  border:1px solid rgba(124,58,237,0.3);">
        <h1 style="background:linear-gradient(135deg,#A78BFA,#06B6D4);
                   -webkit-background-clip:text;-webkit-text-fill-color:transparent;">
          Welcome to NeuroLoop 🧠
        </h1>
        <h2 style="color:#F0EFFE;">Hey ${userName}, you're in! 🎉</h2>
        <p style="color:#9CA3AF;line-height:1.7;">
          Your AI-powered learning journal is ready. Start writing notes,
          take quizzes, and let spaced repetition build your mastery!
        </p>
        <a href="http://localhost:5173/dashboard"
           style="display:block;text-align:center;padding:14px;margin-top:24px;
                  background:linear-gradient(135deg,#7C3AED,#06B6D4);
                  color:white;border-radius:9999px;text-decoration:none;font-weight:600;">
          Open My Dashboard →
        </a>
        <p style="color:#6B7280;font-size:0.78rem;text-align:center;margin-top:24px;">
          "An investment in knowledge pays the best interest." — Benjamin Franklin 💜
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[Email] Welcome email sent to ${userEmail}`);
}

async function sendResetOtpEmail(userEmail, userName, otp) {
  const mailOptions = {
    to: userEmail,
    from: process.env.GMAIL_USER || process.env.SENDER_EMAIL,
    subject: 'Your NeuroLoop password reset code',
    html: `
      <div style="font-family:Inter,sans-serif;background:#0a0a0a;color:#f5f0e8;
                  padding:32px;border-radius:16px;max-width:480px;margin:auto;
                  border:1px solid rgba(212,175,55,0.2);">
        <h2 style="color:#d4af37;font-family:Georgia,serif;font-weight:400;">
          Password Reset
        </h2>
        <p style="color:#a09880;margin:12px 0 24px;">
          Hey ${userName}, here is your 6-digit verification code:
        </p>
        <div style="background:#111111;border:1px solid rgba(212,175,55,0.25);
                    border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:2.5rem;font-weight:800;letter-spacing:0.3em;color:#d4af37;">
            ${otp}
          </div>
          <div style="font-size:0.78rem;color:#5a5040;margin-top:8px;">
            Valid for 10 minutes
          </div>
        </div>
        <p style="color:#5a5040;font-size:0.78rem;">
          If you did not request this, ignore this email. Your password will not change.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log('[Email] Reset OTP sent to', userEmail);
}

module.exports = { sendReminderEmail, sendWelcomeEmail, sendResetOtpEmail };
