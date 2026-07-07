import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function SupportPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('contact') // 'contact' or 'faq'
  const [form, setForm] = useState({ category: '', subject: '', message: '', priority: 'medium' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [isSettingEnabled, setIsSettingEnabled] = useState(true)

  useEffect(() => {
    const checkSetting = () => {
      const stored = localStorage.getItem("showSupportPanel")
      setIsSettingEnabled(stored !== "false")
    }

    checkSetting()

    window.addEventListener("support-setting-changed", checkSetting)
    window.addEventListener("storage", checkSetting)

    return () => {
      window.removeEventListener("support-setting-changed", checkSetting)
      window.removeEventListener("storage", checkSetting)
    }
  }, [])

  if (!isSettingEnabled) return null

  const handleSubmit = async () => {
    if (!form.category || !form.subject || !form.message) return
    if (form.subject.trim().length < 5) return
    if (form.message.trim().length < 20) return
    setLoading(true)

    // Auto-populate user info if logged in
    const storedUser = localStorage.getItem("user")
    let userName = "Anonymous"
    let userEmail = "anonymous@example.com"
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.name) userName = user.name
        if (user.email) userEmail = user.email
      } catch (e) {}
    }

    const formattedMessage = `Category: ${form.category}\nPriority: ${form.priority}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`

    try {
      const res = await api.post('/auth/support', {
        name: userName,
        email: userEmail,
        message: formattedMessage
      })
      setTicketId(res.data.ticketId)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const faqs = [
    { q: 'How does spaced repetition work?', a: 'After saving a note, revision is scheduled after 1 day. Each revision extends the interval: 1→3→7→14→30 days based on your confidence rating.' },
    { q: 'Why is AI summary not generating?', a: 'Check that GROQ_API_KEY is valid in the server .env file and restart the server.' },
    { q: 'How is mastery score calculated?', a: 'masteryScore = score + (confidence - 2) × 10. Rating 5 adds 30 points, rating 1 subtracts 10.' },
    { q: 'Why did my streak reset?', a: 'Streaks increment on consecutive daily logins. Missing one day resets it to 1.' },
    { q: 'How do I generate a study plan?', a: 'Take a quiz and score below 60%. That topic gets flagged as weak. Go to Study Plans and generate a plan.' },
    { q: 'Can I upload PDF notes?', a: 'Yes — in Journal page click Select PDF Note. Only text-based PDFs work, not scanned images.' },
  ]

  const categories = [
    { value: 'bug', label: 'Bug Report' },
    { value: 'question', label: 'Question' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'feature-request', label: 'Feature Request' },
    { value: 'account', label: 'Account Issue' },
  ]

  return (
    <>
      <style>{`
        .support-trigger-btn {
          left: 220px;
        }
        @media (max-width: 768px) {
          .support-panel-wrap {
            width: 100% !important;
          }
          .support-trigger-btn {
            left: 0 !important;
          }
        }
      `}</style>

      {/* TRIGGER BUTTON — fixed on left side */}
      <button
        onClick={() => setIsOpen(true)}
        className="support-trigger-btn"
        style={{
          position: 'fixed',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 998,
          background: 'linear-gradient(135deg, #d4af37, #8a6f1e)',
          color: '#0a0a0a',
          border: 'none',
          borderRadius: '0 8px 8px 0',
          padding: '14px 8px',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '2px 0 12px rgba(212,175,55,0.35)'
        }}
        title="Open Support Panel"
      >
        Support
      </button>

      {/* BACKDROP */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      {/* SLIDE-IN PANEL from left */}
      <div className="support-panel-wrap" style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: '380px',
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: 'none',
        zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>

        {/* Panel Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
              Customer Support
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              We respond within 24 hours
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              borderRadius: '8px', color: '#94a3b8',
              width: '32px', height: '32px', cursor: 'pointer',
              fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {[
            { id: 'contact', label: 'Contact Us' },
            { id: 'faq', label: 'FAQ' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: activeTab === tab.id ? '#d4af37' : '#94a3b8',
              fontSize: '13px', fontWeight: activeTab === tab.id ? '600' : '400',
              borderBottom: activeTab === tab.id ? '2px solid #d4af37' : '2px solid transparent',
              transition: 'all 0.2s'
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Panel Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <>
              {submitted ? (
                <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>
                    Ticket Submitted!
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '13px',
                    background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.25)',
                    borderRadius: '8px', padding: '8px 16px', color: '#d4af37',
                    display: 'inline-block', marginBottom: '12px'
                  }}>{ticketId}</div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>
                    We will respond to your email within 24 hours.
                  </p>
                  <button onClick={() => { setSubmitted(false); setForm({ category: '', subject: '', message: '', priority: 'medium' }) }}
                    style={{
                      padding: '10px 20px', background: 'rgba(212,175,55,0.08)',
                      border: '1px solid rgba(212,175,55,0.25)', borderRadius: '8px',
                      color: '#d4af37', fontSize: '13px', cursor: 'pointer'
                    }}>Submit Another</button>
                </div>
              ) : (
                <>
                  {/* Category */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
                      Category
                    </label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px', color: form.category ? '#f1f5f9' : '#64748b',
                        fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                      }}>
                      <option value="">Select a category...</option>
                      {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  {/* Subject */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
                      Subject
                    </label>
                    <input type="text" value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                      placeholder="Brief description..."
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px', color: '#f1f5f9',
                        fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                      }} />
                  </div>

                  {/* Priority */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
                      Priority
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { val: 'low', label: 'Low' },
                        { val: 'medium', label: 'Medium' },
                        { val: 'high', label: 'High' }
                      ].map(p => (
                        <button key={p.val} onClick={() => setForm({...form, priority: p.val})}
                          style={{
                            flex: 1, padding: '7px', borderRadius: '7px', cursor: 'pointer',
                            border: `1px solid ${form.priority === p.val ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.08)'}`,
                            background: form.priority === p.val ? 'rgba(212,175,55,0.08)' : 'transparent',
                            color: form.priority === p.val ? '#d4af37' : '#94a3b8',
                            fontSize: '12px'
                          }}>{p.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
                      Message
                    </label>
                    <textarea value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      placeholder="Describe your issue in detail..."
                      rows={5}
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px', color: '#f1f5f9',
                        fontSize: '13px', outline: 'none', resize: 'vertical',
                        boxSizing: 'border-box', fontFamily: 'inherit'
                      }} />
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', textAlign: 'right' }}>
                      {form.message.length} characters {form.message.length < 20 ? '(min 20)' : '✓'}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !form.category || form.subject.length < 5 || form.message.length < 20}
                    style={{
                      width: '100%', padding: '12px',
                      background: 'linear-gradient(135deg, #d4af37, #8a6f1e)',
                      color: '#0a0a0a', border: 'none', borderRadius: '10px',
                      fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                      opacity: (loading || !form.category || form.subject.length < 5 || form.message.length < 20) ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </>
              )}
            </>
          )}

          {/* FAQ TAB */}
          {activeTab === 'faq' && (
            <div>
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ))}
              <div style={{
                marginTop: '20px', padding: '14px',
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: '10px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', color: '#d4af37', marginBottom: '4px' }}>
                  Still need help?
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Switch to Contact Us tab to submit a ticket
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#374151', margin: 0 }}>
            neuroloopadmin@gmail.com
          </p>
        </div>
      </div>
    </>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      marginBottom: '4px'
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '12px 0',
        background: 'transparent', border: 'none',
        color: '#f1f5f9', fontSize: '13px', fontWeight: '500',
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
      }}>
        {question}
        <span style={{ color: '#64748b', fontSize: '16px', flexShrink: 0 }}>
          {open ? '▲' : '▽'}
        </span>
      </button>
      {open && (
        <div style={{
          padding: '0 0 12px',
          fontSize: '13px', color: '#94a3b8', lineHeight: '1.6'
        }}>
          {answer}
        </div>
      )}
    </div>
  )
}
