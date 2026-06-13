import { useState, useEffect } from "react"
import api from "../api/axios"

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Auto-populate user info if logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.name) setName(user.name)
        if (user.email) setEmail(user.email)
      } catch (e) {}
    }
  }, [isOpen])

  // Automatically monitor and report unhandled client-side JS runtime errors to the admin
  useEffect(() => {
    const handleGlobalError = (event) => {
      const storedUser = localStorage.getItem("user")
      let userEmail = "anonymous@example.com"
      if (storedUser) {
        try {
          userEmail = JSON.parse(storedUser).email || userEmail
        } catch (e) {}
      }

      api.post("/auth/report-error", {
        email: userEmail,
        url: window.location.href,
        errorMessage: `[Client Crash] ${event.message || "Unhandled exception"}`,
        stack: event.error?.stack || ""
      }).catch(() => {})
    }

    const handleRejection = (event) => {
      const storedUser = localStorage.getItem("user")
      let userEmail = "anonymous@example.com"
      if (storedUser) {
        try {
          userEmail = JSON.parse(storedUser).email || userEmail
        } catch (e) {}
      }

      api.post("/auth/report-error", {
        email: userEmail,
        url: window.location.href,
        errorMessage: `[Client Rejection] ${event.reason?.message || "Unhandled promise rejection"}`,
        stack: event.reason?.stack || ""
      }).catch(() => {})
    }

    window.addEventListener("error", handleGlobalError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleGlobalError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !message) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await api.post("/auth/support", { name, email, message })
      setSuccess("Support ticket sent! Admin has been notified.")
      setMessage("")
      setTimeout(() => {
        setIsOpen(false)
        setSuccess("")
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ticket. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .support-btn {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #d4af37, #8a6f1e);
          box-shadow: 0 4px 24px rgba(212, 175, 55, 0.45);
          border: none; color: #0a0a0a; display: flex;
          align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .support-btn:hover {
          transform: scale(1.08) rotate(5deg);
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.6);
        }
        .support-btn.active {
          transform: scale(0.9) rotate(-90deg);
        }

        .support-card {
          position: absolute; bottom: 76px; right: 0;
          width: 350px; background: rgba(18, 18, 18, 0.96);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          animation: supportExpand 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes supportExpand {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .support-hdr {
          background: rgba(212, 175, 55, 0.06);
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          padding: 14px 20px; display: flex;
          align-items: center; justify-content: space-between;
        }
        .support-title {
          font-family: 'DM Serif Display', Georgia, serif;
          color: #d4af37; font-size: 1.05rem; margin: 0;
          display: flex; align-items: center; gap: 8px;
        }
        .support-close {
          background: none; border: none; color: rgba(255, 255, 255, 0.4);
          font-size: 1.2rem; cursor: pointer; transition: color 0.2s;
        }
        .support-close:hover { color: #fca5a5; }

        .support-body { padding: 20px; }
        .support-label {
          display: block; font-size: 0.68rem; font-weight: 600;
          color: #a09880; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .support-inp {
          width: 100%; padding: 10px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px; color: #f5f0e8;
          font-size: 0.88rem; transition: all 0.2s;
          margin-bottom: 14px; outline: none;
        }
        .support-inp:focus {
          border-color: rgba(212, 175, 55, 0.5);
          background: rgba(212, 175, 55, 0.02);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }
        .support-txt {
          min-height: 100px; resize: none;
        }
        .support-submit {
          width: 100%; padding: 11px; border-radius: 8px;
          border: none; background: #d4af37; color: #0a0a0a;
          font-weight: 700; font-size: 0.88rem; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.25);
        }
        .support-submit:hover:not(:disabled) {
          background: #f0d060; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
        }
        .support-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .support-err {
          font-size: 0.76rem; color: #fca5a5;
          margin-bottom: 12px; padding: 8px 12px;
          background: rgba(239, 68, 68, 0.08);
          border-radius: 6px; border-left: 2px solid #ef4444;
        }
        .support-success {
          font-size: 0.82rem; color: #10b981;
          text-align: center; padding: 16px;
          background: rgba(16, 185, 129, 0.08);
          border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.15);
        }
        .support-container {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: flex-end;
        }
        .support-badge {
          background: rgba(18, 18, 18, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 99px;
          padding: 8px 16px;
          color: #d4af37;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          animation: supportPulse 2s infinite alternate, supportBadgeFadeIn 0.4s ease;
          pointer-events: auto;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .support-badge:hover {
          background: rgba(212, 175, 55, 0.08);
          border-color: #d4af37;
          transform: translateY(-1px);
        }
        @keyframes supportBadgeFadeIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes supportPulse {
          from { box-shadow: 0 4px 16px rgba(212, 175, 55, 0.08); }
          to { box-shadow: 0 4px 24px rgba(212, 175, 55, 0.25); }
        }
      `}</style>

      {/* SUPPORT DRAWER CARD */}
      {isOpen && (
        <div className="support-card">
          <div className="support-hdr">
            <h4 className="support-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Customer Support
            </h4>
            <button className="support-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="support-body">
            {success ? (
              <div className="support-success">{success}</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="support-err">{error}</div>}

                <label className="support-label">Name</label>
                <input
                  className="support-inp"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <label className="support-label">Email</label>
                <input
                  className="support-inp"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                <label className="support-label">How can we help?</label>
                <textarea
                  className="support-inp support-txt"
                  placeholder="Describe your issue or feedback..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />

                <button className="support-submit" type="submit" disabled={loading}>
                  {loading ? "Sending Ticket..." : "Submit Support Ticket"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <div className="support-container">
        {!isOpen && (
          <div className="support-badge" onClick={() => setIsOpen(true)}>
            Support
          </div>
        )}
        <button
          className={`support-btn ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Contact Customer Support"
        >
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
