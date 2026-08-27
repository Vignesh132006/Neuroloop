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
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false)

  useEffect(() => {
    const checkSettingAndOnboarding = () => {
      const stored = localStorage.getItem("showSupportPanel")
      setIsSettingEnabled(stored !== "false")

      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser && storedUser !== 'undefined') {
          const userObj = JSON.parse(storedUser)
          if (userObj && userObj.onboardingCompleted) {
            setIsOnboardingCompleted(true)
            return
          }
        }
      } catch (e) {
        console.error('[SupportPanel] Error parsing user:', e)
      }
      setIsOnboardingCompleted(false)
    }

    checkSettingAndOnboarding()

    window.addEventListener("support-setting-changed", checkSettingAndOnboarding)
    window.addEventListener("storage", checkSettingAndOnboarding)

    return () => {
      window.removeEventListener("support-setting-changed", checkSettingAndOnboarding)
      window.removeEventListener("storage", checkSettingAndOnboarding)
    }
  }, [])

  if (!isSettingEnabled || !isOnboardingCompleted || window.location.pathname === '/onboarding') return null

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
          background: 'linear-gradient(135deg, #E91E8C, #FF6B9D)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0 12px 12px 0',
          padding: '16px 10px',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '4px 0 20px rgba(233,30,140,0.3)'
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
            background: 'rgba(255, 240, 245, 0.6)',
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
        background: '#FFFFFF',
        borderRight: '1.5px solid #F9C0D8',
        zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '8px 0 32px rgba(233, 30, 140, 0.12)'
      }}>

        {/* Panel Header */}
        <div style={{
          padding: '22px 20px 18px',
          borderBottom: '1.5px solid #F9C0D8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#FFF0F5'
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: '700', color: '#1A1A2E' }}>
              Customer Support
            </div>
            <div style={{ fontSize: '12px', color: '#8888AA', marginTop: '2px', fontWeight: 500 }}>
              We respond within 24 hours
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: '#FCE4F0', border: '1px solid #F9C0D8',
              borderRadius: '50%', color: '#E91E8C',
              width: '32px', height: '32px', cursor: 'pointer',
              fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
            }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1.5px solid #F9C0D8', background: '#FFF0F5'
        }}>
          {[
            { id: 'contact', label: 'Contact Us' },
            { id: 'faq', label: 'FAQ' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#E91E8C' : '#8888AA',
              fontSize: '13px', fontWeight: activeTab === tab.id ? '700' : '600',
              borderBottom: activeTab === tab.id ? '2.5px solid #E91E8C' : '2.5px solid transparent',
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
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: '700', color: '#1A1A2E', marginBottom: '8px' }}>
                    Ticket Submitted!
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '13px', fontWeight: '600',
                    background: '#FCE4F0', border: '1.5px solid #F9C0D8',
                    borderRadius: '50px', padding: '8px 20px', color: '#E91E8C',
                    display: 'inline-block', marginBottom: '16px'
                  }}>{ticketId}</div>
                  <p style={{ fontSize: '14px', color: '#4A4A6A', marginBottom: '24px', lineHeight: '1.6' }}>
                    We will respond to your email within 24 hours.
                  </p>
                  <button onClick={() => { setSubmitted(false); setForm({ category: '', subject: '', message: '', priority: 'medium' }) }}
                    style={{
                      padding: '10px 24px', background: '#FFFFFF',
                      border: '1.5px solid #F9C0D8', borderRadius: '50px',
                      color: '#E91E8C', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                    }}>Submit Another</button>
                </div>
              ) : (
                <>
                  {/* Category */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8888AA', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Category
                    </label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: '#FFFFFF',
                        border: '1.5px solid #F9C0D8',
                        borderRadius: '12px', color: form.category ? '#1A1A2E' : '#8888AA',
                        fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                      }}>
                      <option value="">Select a category...</option>
                      {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  {/* Subject */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8888AA', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Subject
                    </label>
                    <input type="text" value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                      placeholder="Brief description..."
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: '#FFFFFF',
                        border: '1.5px solid #F9C0D8',
                        borderRadius: '12px', color: '#1A1A2E',
                        fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                      }} />
                  </div>

                  {/* Priority */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8888AA', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Priority
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { val: 'low', label: 'Low' },
                        { val: 'medium', label: 'Medium' },
                        { val: 'high', label: 'High' }
                      ].map(p => (
                        <button key={p.val} onClick={() => setForm({...form, priority: p.val})}
                          style={{
                            flex: 1, padding: '8px', borderRadius: '50px', cursor: 'pointer',
                            border: form.priority === p.val ? 'none' : '1.5px solid #F9C0D8',
                            background: form.priority === p.val ? 'linear-gradient(135deg, #E91E8C, #FF6B9D)' : '#FFFFFF',
                            color: form.priority === p.val ? '#ffffff' : '#4A4A6A',
                            fontSize: '12px', fontWeight: '600',
                            boxShadow: form.priority === p.val ? '0 4px 12px rgba(233, 30, 140, 0.2)' : 'none'
                          }}>{p.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8888AA', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Message
                    </label>
                    <textarea value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      placeholder="Describe your issue in detail..."
                      rows={5}
                      style={{
                        width: '100%', padding: '12px 14px',
                        background: '#FFFFFF',
                        border: '1.5px solid #F9C0D8',
                        borderRadius: '14px', color: '#1A1A2E',
                        fontSize: '13px', outline: 'none', resize: 'vertical',
                        boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6
                      }} />
                    <div style={{ fontSize: '11px', color: '#8888AA', marginTop: '4px', textAlign: 'right', fontWeight: 500 }}>
                      {form.message.length} characters {form.message.length < 20 ? '(min 20)' : '✓'}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !form.category || form.subject.length < 5 || form.message.length < 20}
                    style={{
                      width: '100%', padding: '14px',
                      background: 'linear-gradient(135deg, #E91E8C, #FF6B9D)',
                      color: '#ffffff', border: 'none', borderRadius: '50px',
                      fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(233, 30, 140, 0.25)',
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
                marginTop: '20px', padding: '16px',
                background: '#FCE4F0',
                border: '1.5px solid #F9C0D8',
                borderRadius: '16px', textAlign: 'center'
              }}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '14px', fontWeight: '700', color: '#E91E8C', marginBottom: '4px' }}>
                  Still need help?
                </div>
                <div style={{ fontSize: '12px', color: '#4A4A6A' }}>
                  Switch to Contact Us tab to submit a ticket
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1.5px solid #F9C0D8',
          background: '#FFF0F5',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '12px', color: '#8888AA', margin: 0, fontWeight: 500 }}>
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
      borderBottom: '1px solid #F9C0D8',
      marginBottom: '4px'
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '12px 0',
        background: 'transparent', border: 'none',
        color: '#1A1A2E', fontSize: '13.5px', fontWeight: '600',
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
      }}>
        {question}
        <span style={{ color: '#E91E8C', fontSize: '14px', flexShrink: 0 }}>
          {open ? '▲' : '▽'}
        </span>
      </button>
      {open && (
        <div style={{
          padding: '0 0 12px',
          fontSize: '13px', color: '#4A4A6A', lineHeight: '1.6'
        }}>
          {answer}
        </div>
      )}
    </div>
  )
}
