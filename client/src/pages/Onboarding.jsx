import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

// ── Goal label formatter ─────────────────────────────────────────────────────
const goalLabel = (g) => {
  switch (g) {
    case 'crack-interviews': return 'Crack Interviews'
    case 'learn-skills':    return 'Learn New Skills'
    case 'improve-weak':    return 'Fix Weak Areas'
    case 'build-projects':  return 'Build Projects'
    default: return g || '—'
  }
}

// ── Subject list ─────────────────────────────────────────────────────────────
const SUBJECTS = [
  { value: 'dsa',           label: 'Data Structures and Algorithms' },
  { value: 'oops',          label: 'Object Oriented Programming' },
  { value: 'os',            label: 'Operating Systems' },
  { value: 'dbms',          label: 'Database Management' },
  { value: 'system-design', label: 'System Design' },
  { value: 'web-dev',       label: 'Web Development' },
  { value: 'cn',            label: 'Computer Networks' },
  { value: 'other',         label: 'Other Topics' },
]

// ── Animated checkmark SVG ───────────────────────────────────────────────────
function AnimatedCheck() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      style={{ display: 'block', margin: '0 auto 24px' }}
    >
      <style>{`
        @keyframes drawCircle {
          from { stroke-dashoffset: 188; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 50; }
          to   { stroke-dashoffset: 0; }
        }
        .ob-circle {
          stroke-dasharray: 188;
          stroke-dashoffset: 188;
          animation: drawCircle 0.7s ease 0.1s forwards;
        }
        .ob-check {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawCheck 0.5s ease 0.8s forwards;
        }
      `}</style>
      <circle
        className="ob-circle"
        cx="32" cy="32" r="30"
        stroke="#10b981" strokeWidth="2.5" fill="none"
        strokeLinecap="round"
      />
      <polyline
        className="ob-check"
        points="18,33 27,43 46,22"
        stroke="#10b981" strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Onboarding() {
  const [step,     setStep]     = useState(1)      // 1 | 2 | 3 | 4
  const [level,    setLevel]    = useState(null)
  const [goal,     setGoal]     = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [subjectError, setSubjectError] = useState('')
  const [submitError,  setSubmitError]  = useState('')
  const [userName, setUserName] = useState('')

  const navigate  = useNavigate()
  const { user: ctxUser, login } = useAuth()

  // Resolve user name from context or localStorage
  useEffect(() => {
    const name =
      ctxUser?.name ||
      (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').name } catch { return '' } })()
    if (name) setUserName(name)
  }, [ctxUser])

  // Progress bar width per step
  const progressWidth = step === 1 ? '33%' : step === 2 ? '66%' : '100%'

  // ── Toggle subject ──────────────────────────────────────────────────────────
  const toggleSubject = (val) => {
    setSubjectError('')
    if (subjects.includes(val)) {
      setSubjects(subjects.filter(s => s !== val))
    } else {
      if (subjects.length >= 5) {
        setSubjectError('You can select up to 5 subjects.')
        return
      }
      setSubjects([...subjects, val])
    }
  }

  // ── Skip handler ────────────────────────────────────────────────────────────
  const handleSkip = async () => {
    try {
      await api.post('/auth/onboarding/skip')
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...storedUser, onboardingCompleted: true }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        login(localStorage.getItem('token'), updatedUser)
      } catch (_) {}
    } catch (_) {}
    navigate('/dashboard')
  }

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (subjects.length === 0) {
      setSubjectError('Please select at least one subject.')
      return
    }
    setLoading(true)
    setSubmitError('')
    try {
      await api.post('/auth/onboarding', {
        level,
        goal,
        focusSubjects: subjects,
      })
      // Persist updated user data to localStorage
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = {
          ...storedUser,
          onboardingCompleted: true,
          level,
          goal,
          focusSubjects: subjects,
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        login(localStorage.getItem('token'), updatedUser)
      } catch (_) {}
      setStep(4)
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Level completion text ───────────────────────────────────────────────────
  const levelSubtext = {
    beginner:     'We have prepared a beginner-friendly learning path for you. Start with your first note today.',
    intermediate: 'Your dashboard is ready with topics matched to your level. Time to level up.',
    advanced:     'Interview-ready study plans are waiting. Let us close your knowledge gaps.',
  }[level] || 'Your personalised dashboard is ready. Start exploring.'

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#050508', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }

        .ob-card {
          padding: 24px 28px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
          overflow: hidden;
        }
        .ob-card:hover {
          border-color: rgba(124,58,237,0.4);
          background: rgba(124,58,237,0.04);
        }
        .ob-card.selected {
          border-color: #7c3aed;
          background: rgba(124,58,237,0.08);
        }
        .ob-card-accent {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
        }
        .ob-card-check {
          position: absolute;
          top: 12px; right: 12px;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #7c3aed;
          display: flex; align-items: center; justify-content: center;
        }
        .ob-card-name {
          font-size: 17px;
          font-weight: 500;
          color: #f1f5f9;
          margin-bottom: 6px;
          padding-left: 4px;
        }
        .ob-card-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          line-height: 1.5;
          padding-left: 4px;
        }

        .ob-pill {
          padding: 10px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
          user-select: none;
        }
        .ob-pill:hover {
          border-color: rgba(124,58,237,0.4);
          color: rgba(255,255,255,0.8);
        }
        .ob-pill.selected {
          background: rgba(124,58,237,0.12);
          border-color: #7c3aed;
          color: #a78bfa;
        }

        .ob-btn {
          margin-top: 32px;
          padding: 14px 40px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          transition: opacity 0.2s, transform 0.2s;
          font-family: inherit;
        }
        .ob-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .ob-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ob-skip-btn {
          position: fixed;
          top: 16px; right: 24px;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          z-index: 101;
          transition: color 0.2s;
          padding: 4px 8px;
        }
        .ob-skip-btn:hover {
          color: rgba(255,255,255,0.6);
        }

        .ob-heading {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
        }
        .ob-subtext {
          font-size: 15px;
          color: rgba(255,255,255,0.4);
          margin: 12px 0 40px;
          line-height: 1.6;
        }

        .ob-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 16px;
        }
        .ob-summary-row:last-child {
          border-bottom: none;
        }
        .ob-summary-label {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          flex-shrink: 0;
        }
        .ob-summary-value {
          font-size: 13px;
          color: #f1f5f9;
          text-align: right;
        }

        @media (max-width: 600px) {
          .ob-goal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── Fixed progress bar ────────────────────────────────────────────────── */}
      {step < 4 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          height: '3px', background: 'rgba(255,255,255,0.06)',
          zIndex: 100,
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
            width: progressWidth,
            transition: 'width 0.5s ease',
          }} />
        </div>
      )}

      {/* ── Step counter ─────────────────────────────────────────────────────── */}
      {step < 4 && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          zIndex: 101,
          whiteSpace: 'nowrap',
        }}>
          Step {step} of 3
        </div>
      )}

      {/* ── Skip button ──────────────────────────────────────────────────────── */}
      {step < 4 && (
        <button className="ob-skip-btn" id="btn-skip-onboarding" onClick={handleSkip}>
          Skip for now
        </button>
      )}

      {/* ── Center content ────────────────────────────────────────────────────── */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '600px', width: '100%' }}>

          {/* ══════════════════════════════════════════════════════════════════
              STEP 1 — EXPERIENCE LEVEL
          ══════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div key="step1">
              <h1 className="ob-heading" style={{ animation: 'fadeUp 0.5s ease both' }}>
                What is your current level?
              </h1>
              <p className="ob-subtext" style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
                This helps us personalise your learning experience from day one.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
                animation: 'fadeUp 0.5s ease 0.2s both',
              }}>
                {[
                  {
                    value: 'beginner',
                    name: 'Beginner',
                    desc: 'Just starting out with programming and computer science fundamentals.',
                    color: '#10b981',
                  },
                  {
                    value: 'intermediate',
                    name: 'Intermediate',
                    desc: 'Comfortable with basics, actively solving problems and building projects.',
                    color: '#f59e0b',
                  },
                  {
                    value: 'advanced',
                    name: 'Advanced',
                    desc: 'Strong foundation, preparing for product-based company interviews.',
                    color: '#ef4444',
                  },
                ].map((card) => (
                  <div
                    key={card.value}
                    className={`ob-card${level === card.value ? ' selected' : ''}`}
                    onClick={() => setLevel(card.value)}
                    role="button"
                    aria-pressed={level === card.value}
                    id={`level-${card.value}`}
                  >
                    <div className="ob-card-accent" style={{ background: card.color }} />
                    {level === card.value && (
                      <div className="ob-card-check" aria-label="Selected">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <div className="ob-card-name">{card.name}</div>
                    <div className="ob-card-desc">{card.desc}</div>
                  </div>
                ))}
              </div>

              {level && (
                <button
                  className="ob-btn"
                  id="btn-level-continue"
                  onClick={() => setStep(2)}
                  style={{ animation: 'fadeIn 0.3s ease both' }}
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2 — MAIN GOAL
          ══════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div key="step2">
              <h1 className="ob-heading" style={{ animation: 'fadeUp 0.5s ease both' }}>
                What is your main goal?
              </h1>
              <p className="ob-subtext" style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
                We will structure your revision schedule and AI study plans around this.
              </p>

              <div
                className="ob-goal-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  animation: 'fadeUp 0.5s ease 0.2s both',
                }}
              >
                {[
                  {
                    value: 'crack-interviews',
                    title: 'Crack Interviews',
                    desc: 'Prepare for product-based company technical interviews with DSA and system design.',
                    color: '#7c3aed',
                  },
                  {
                    value: 'learn-skills',
                    title: 'Learn New Skills',
                    desc: 'Build knowledge across new computer science topics and programming concepts.',
                    color: '#06b6d4',
                  },
                  {
                    value: 'improve-weak',
                    title: 'Fix Weak Areas',
                    desc: 'Identify and strengthen specific topics where your knowledge has gaps.',
                    color: '#f59e0b',
                  },
                  {
                    value: 'build-projects',
                    title: 'Build Projects',
                    desc: 'Learn through building real-world applications and understanding full-stack concepts.',
                    color: '#10b981',
                  },
                ].map((card) => (
                  <div
                    key={card.value}
                    className={`ob-card${goal === card.value ? ' selected' : ''}`}
                    onClick={() => setGoal(card.value)}
                    role="button"
                    aria-pressed={goal === card.value}
                    id={`goal-${card.value}`}
                  >
                    <div className="ob-card-accent" style={{ background: card.color }} />
                    {goal === card.value && (
                      <div className="ob-card-check" aria-label="Selected">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <div className="ob-card-name">{card.title}</div>
                    <div className="ob-card-desc">{card.desc}</div>
                  </div>
                ))}
              </div>

              {goal && (
                <button
                  className="ob-btn"
                  id="btn-goal-continue"
                  onClick={() => setStep(3)}
                  style={{ animation: 'fadeIn 0.3s ease both' }}
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3 — FOCUS SUBJECTS
          ══════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div key="step3">
              <h1 className="ob-heading" style={{ animation: 'fadeUp 0.5s ease both' }}>
                Which subjects do you focus on?
              </h1>
              <p className="ob-subtext" style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
                Select all that apply. We will prioritise these in your quiz generation and study plans.
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                animation: 'fadeUp 0.5s ease 0.2s both',
              }}>
                {SUBJECTS.map((s) => (
                  <div
                    key={s.value}
                    className={`ob-pill${subjects.includes(s.value) ? ' selected' : ''}`}
                    onClick={() => toggleSubject(s.value)}
                    role="checkbox"
                    aria-checked={subjects.includes(s.value)}
                    id={`subject-${s.value}`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>

              {subjectError && (
                <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '12px', animation: 'fadeIn 0.2s ease' }}>
                  {subjectError}
                </p>
              )}

              {submitError && (
                <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '12px', animation: 'fadeIn 0.2s ease' }}>
                  {submitError}
                </p>
              )}

              <button
                className="ob-btn"
                id="btn-complete-setup"
                onClick={handleSubmit}
                disabled={subjects.length === 0 || loading}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 4 — COMPLETION SCREEN
          ══════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div key="step4" style={{ textAlign: 'center' }}>
              <div style={{ animation: 'fadeIn 0.6s ease both' }}>
                <AnimatedCheck />
              </div>

              <h1 className="ob-heading" style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}>
                You are all set, {userName || 'there'}.
              </h1>

              <p
                className="ob-subtext"
                style={{ animation: 'fadeUp 0.5s ease 0.4s both', marginTop: '12px', marginBottom: '0' }}
              >
                {levelSubtext}
              </p>

              {/* Summary card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '20px 24px',
                margin: '24px 0',
                animation: 'scaleIn 0.4s ease 0.5s both',
                textAlign: 'left',
              }}>
                <div className="ob-summary-row">
                  <span className="ob-summary-label">Level</span>
                  <span className="ob-summary-value">
                    {level ? level.charAt(0).toUpperCase() + level.slice(1) : '—'}
                  </span>
                </div>
                <div className="ob-summary-row">
                  <span className="ob-summary-label">Goal</span>
                  <span className="ob-summary-value">{goalLabel(goal)}</span>
                </div>
                <div className="ob-summary-row">
                  <span className="ob-summary-label">Focus areas</span>
                  <span className="ob-summary-value" style={{ maxWidth: '300px' }}>
                    {subjects.length > 0
                      ? subjects.map(sv => SUBJECTS.find(s => s.value === sv)?.label || sv).join(', ')
                      : '—'}
                  </span>
                </div>
              </div>

              <button
                className="ob-btn"
                id="btn-enter-dashboard"
                onClick={() => navigate('/dashboard', { replace: true })}
                style={{ marginTop: '0', animation: 'fadeUp 0.5s ease 0.6s both' }}
              >
                Enter Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
