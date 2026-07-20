import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

function ActivityHeatmap({ heatmapData }) {
  const today = new Date()
  const days = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }

  const countMap = {}
  if (Array.isArray(heatmapData)) {
    heatmapData.forEach((item) => { countMap[item.date] = item.count })
  }

  const getLevel = (count) => {
    if (!count) return ""
    if (count === 1) return "level-1"
    if (count <= 3) return "level-2"
    if (count <= 5) return "level-3"
    return "level-4"
  }

  return (
    <div>
      <div className="heatmap-grid">
        {days.map((date) => (
          <div
            key={date}
            className={`heatmap-cell ${getLevel(countMap[date])}`}
            title={`${date}: ${countMap[date] || 0} contribution${countMap[date] !== 1 ? 's' : ''}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--t2)' }}>
        <span>Less</span>
        {['', 'level-1', 'level-2', 'level-3', 'level-4'].map((l, i) => (
          <div key={i} className={`heatmap-cell ${l}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [dueRevisions, setDueRevisions] = useState([])
  const [quizHistory, setQuizHistory] = useState([])
  const [weeklyStats, setWeeklyStats] = useState(null)
  const [heatmapData, setHeatmapData] = useState([])
  const [weakTopics, setWeakTopics] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [notesRes, revRes, quizRes, weeklyRes, heatmapRes, weaknessRes] = await Promise.all([
        api.get("/notes"),
        api.get("/revision"),
        api.get("/quiz/history"),
        api.get("/notes/stats/weekly"),
        api.get("/notes/stats/heatmap"),
        api.get("/quiz/weakness"),
      ])
      setNotes(notesRes.data)
      setDueRevisions(revRes.data)
      setQuizHistory(quizRes.data)
      setWeeklyStats(weeklyRes.data)
      setHeatmapData(heatmapRes.data)
      setWeakTopics(weaknessRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const calcStreak = () => {
    if (!notes.length) return 0
    const dates = [...new Set(notes.map((n) => new Date(n.createdAt).toDateString()))]
    return dates.length
  }

  const avgQuizScore = quizHistory.length
    ? Math.round(quizHistory.reduce((s, q) => s + q.percentage, 0) / quizHistory.length)
    : 0

  const streak = user?.streak || calcStreak()

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="page-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Skeleton loaders */}
            <div className="skeleton" style={{ height: '32px', width: '250px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '14px', width: '40%' }} />
            <div className="stat-grid" style={{ marginTop: '1rem' }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '120px' }} />)}
            </div>
            <div className="skeleton" style={{ height: '160px', marginTop: '0.5rem' }} />
            <div className="grid-2" style={{ marginTop: '0.5rem' }}>
              <div className="skeleton" style={{ height: '200px' }} />
              <div className="skeleton" style={{ height: '200px' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalRevisions = notes.reduce((sum, n) => sum + (n.revisionCount || 0), 0)
  const masteryScore = notes.length
    ? Math.round(notes.reduce((sum, n) => sum + (n.masteryScore || 0), 0) / notes.length)
    : 0

  const stats = {
    notesCount: notes.length,
    quizzesCount: quizHistory.length,
    revisionsCount: totalRevisions,
    averagePercentage: avgQuizScore
  }

  const xp = (stats.notesCount * 50) + (stats.quizzesCount * 30) + (stats.revisionsCount * 20)
  const xpPercent = Math.min((xp / 1000) * 100, 100)
  const overallMastery = masteryScore

  // Get motivational mastery message
  const getMasteryText = (val) => {
    if (val < 30) return "Keep reviewing to boost this!"
    if (val <= 60) return "You are making real progress!"
    if (val <= 80) return "Almost there — push to 80%!"
    return "Outstanding mastery level!"
  }

  // Daily Quote Selection
  const quotes = [
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Gandhi" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "Education is not the filling of a pail but the lighting of a fire.", author: "W.B. Yeats" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" }
  ]
  const quote = quotes[new Date().getDay()]

  // Topic mastery bar color helper
  const getTopicColor = (index) => {
    switch (index) {
      case 0: return "#ff6b76"
      case 1: return "#ff3b30"
      case 2: return "#b31b22"
      case 3: return "#ff9999"
      default: return "#ff3b30"
    }
  }

  // Goal calculations
  const goals = [
    { text: "Write a note", done: stats.notesCount > 0 },
    { text: "Take a quiz", done: stats.quizzesCount > 0 },
    { text: "Complete all revisions", done: dueRevisions.length === 0 }
  ]
  const doneCount = goals.filter(g => g.done).length
  const donePercent = (doneCount / 3) * 100

  // Neuro Tip Content Logic
  let neuroTip = ""
  if (weakTopics && weakTopics.length > 0) {
    const topSubtopic = weakTopics[0].weakSubtopics?.[0]?.name || "this area"
    neuroTip = `You are weak in ${weakTopics[0].topic}. Focus on ${topSubtopic} before your next quiz!`
  } else if (stats.revisionsCount === 0) {
    neuroTip = "No revisions done today. Check your revision queue — spaced repetition is your superpower!"
  } else if (stats.averagePercentage < 50) {
    neuroTip = `Your quiz average is ${stats.averagePercentage}%. Try reviewing notes before taking quizzes.`
  } else {
    neuroTip = `Great momentum today, ${user?.name || "learner"}! Keep writing notes and taking quizzes to boost your mastery.`
  }

  return (
    <div className="app-layout">
      <style>{`
        :root {
          --text-primary: var(--t1, #f5f0e8);
          --text-secondary: var(--t2, #a09880);
          --text-muted: var(--t3, #5a5040);
          --border: var(--bd, rgba(255,255,255,0.08));
          --border-strong: rgba(255,255,255,0.18);
          
          --bg-pro: var(--s2, #1a1a1a);
          --border-pro: var(--bd, rgba(255,255,255,0.08));
          --text-pro: var(--t1, #f5f0e8);
          
          --bg-warning: rgba(239, 159, 39, 0.15);
          --text-warning: #EF9F27;
          --border-warning: rgba(239, 159, 39, 0.3);
          
          --fill-success: #1D9E75;
          --surface-1: var(--s1, #111111);
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #EF9F27;
          display: inline-block;
          animation: pulse-dot 2s infinite;
        }

        @keyframes xp-fill {
          from { width: 0; }
          to { width: var(--target-width); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .command-centre-header {
          padding: 24px;
          border-bottom: 0.5px solid var(--border);
          margin-bottom: 20px;
        }

        .stats-grid-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          padding: 0 24px;
          margin-bottom: 24px;
        }

        .stat-card-custom {
          background: var(--surface-1);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          position: relative;
          transition: border-color 0.2s ease, transform 0.2s ease;
          overflow: hidden;
        }

        .stat-card-custom:hover {
          border-color: var(--border-strong);
          transform: translateY(-2px);
        }

        .stat-card-top-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
        }

        .stat-icon-container {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .stat-number-large {
          font-size: 24px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.2;
          margin-bottom: 2px;
        }

        .stat-label-caps {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .stat-trend-text {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .two-column-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 14px;
          padding: 0 24px 24px 24px;
        }

        .layout-col-left {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .layout-col-right {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (max-width: 768px) {
          .two-column-layout {
            grid-template-columns: 1fr;
          }
          .stats-grid-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Sidebar />
      <div className="page-wrap">
        <div style={{ animation: "fadeUp 0.4s ease both" }}>
          
          {/* Section A: HERO HEADER */}
          <div className="command-centre-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 600 }}>
                YOUR LEARNING COMMAND CENTRE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                Welcome back, {user?.name}!
              </h1>
              <div style={{
                background: 'rgba(255, 59, 48, 0.12)',
                color: '#ff6b76',
                border: '0.5px solid rgba(255, 59, 48, 0.3)',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 500
              }}>
                <span>🔥</span> {streak} day streak
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Keep your streak alive today
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>XP Progress</span>
              <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #b31b22, #ff6b76)',
                  borderRadius: '3px',
                  width: `${xpPercent}%`,
                  transition: 'width 1.2s ease'
                }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {xp} / 1000 XP
              </span>
            </div>
          </div>

          {/* ── Personalised Level Banner ──────────────────────────────────── */}
          {(() => {
            const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } })()
            const userLevel = user?.level || storedUser.level
            if (!userLevel) return null

            const bannerConfig = {
              beginner: {
                bg:     'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                text:   'Beginner path active — Start by writing your first note and taking a quiz.',
                btnLabel: 'Write First Note',
                btnColor: '#10b981',
                path: '/journal',
              },
              intermediate: {
                bg:     'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                text:   'Intermediate path — Focus on your weak topics and practice daily quizzes.',
                btnLabel: 'View Weak Topics',
                btnColor: '#f59e0b',
                path: '/quiz',
              },
              advanced: {
                bg:     'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                text:   'Advanced path — Interview-focused study plans and hard-mode quizzes are active.',
                btnLabel: 'Generate Study Plan',
                btnColor: '#ef4444',
                path: '/study-plans',
              },
            }

            const cfg = bannerConfig[userLevel]
            if (!cfg) return null

            return (
              <div style={{
                background: cfg.bg,
                border: cfg.border,
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                margin: '0 24px 20px',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>
                  {cfg.text}
                </span>
                <button
                  id={`level-banner-btn-${userLevel}`}
                  onClick={() => window.location.href = cfg.path}
                  style={{
                    background: 'none',
                    border: `1px solid ${cfg.btnColor}`,
                    color: cfg.btnColor,
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${cfg.btnColor}18`}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {cfg.btnLabel}
                </button>
              </div>
            )
          })()}

          {/* Section B: STAT CARDS ROW */}
          <div className="stats-grid-row">
            {/* Card 1: Notes Written */}
            <div className="stat-card-custom">
              <div className="stat-card-top-border" style={{ backgroundColor: '#ff6b76' }} />
              <div className="stat-icon-container" style={{ background: 'rgba(255, 107, 118, 0.15)' }}>
                <i className="ti ti-notebook" style={{ color: '#ff6b76', fontSize: '16px' }} />
              </div>
              <div className="stat-number-large">{stats.notesCount}</div>
              <div className="stat-label-caps">Notes Written</div>
              <div className="stat-trend-text">Your knowledge base is growing</div>
            </div>

            {/* Card 2: Quizzes Taken */}
            <div className="stat-card-custom">
              <div className="stat-card-top-border" style={{ backgroundColor: '#ff3b30' }} />
              <div className="stat-icon-container" style={{ background: 'rgba(255, 59, 48, 0.15)' }}>
                <i className="ti ti-brain" style={{ color: '#ff3b30', fontSize: '16px' }} />
              </div>
              <div className="stat-number-large">{stats.quizzesCount}</div>
              <div className="stat-label-caps">Quizzes Taken</div>
              <div className="stat-trend-text">Avg score: {stats.averagePercentage}%</div>
            </div>

            {/* Card 3: Revisions Done */}
            <div className="stat-card-custom">
              <div className="stat-card-top-border" style={{ backgroundColor: '#b31b22' }} />
              <div className="stat-icon-container" style={{ background: 'rgba(179, 27, 34, 0.15)' }}>
                <i className="ti ti-refresh" style={{ color: '#b31b22', fontSize: '16px' }} />
              </div>
              <div className="stat-number-large">{stats.revisionsCount}</div>
              <div className="stat-label-caps">Revisions Done</div>
              <div className="stat-trend-text">Spaced repetition mastery</div>
            </div>

            {/* Card 4: Overall Mastery */}
            <div className="stat-card-custom">
              <div className="stat-card-top-border" style={{ backgroundColor: '#ff9999' }} />
              <div className="stat-icon-container" style={{ background: 'rgba(255, 153, 153, 0.15)' }}>
                <i className="ti ti-star" style={{ color: '#ff9999', fontSize: '16px' }} />
              </div>
              <div className="stat-number-large">{overallMastery}%</div>
              <div className="stat-label-caps">Overall Mastery</div>
              <div className="stat-trend-text">{getMasteryText(overallMastery)}</div>
            </div>
          </div>

          {/* Section C: TWO COLUMN LAYOUT */}
          <div className="two-column-layout">
            
            {/* Left Column */}
            <div className="layout-col-left">
              
              {/* Element 1: Daily Quote Card */}
              <div style={{
                background: 'var(--bg-pro)',
                border: '0.5px solid var(--border-pro)',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-pro)',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  "{quote.text}"
                </p>
                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '6px',
                  margin: '6px 0 0 0',
                  fontWeight: 500
                }}>
                  — {quote.author}
                </p>
              </div>

              {/* Element 2: Topic Mastery Panel */}
              <div style={{
                background: 'var(--surface-1)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Topic mastery</h3>
                  <span className="badge badge-em" style={{ fontSize: '10px' }}>This Week</span>
                </div>

                <div>
                  {weakTopics && weakTopics.length > 0 ? (
                    weakTopics.map((topic, index) => {
                      const scoreVal = Math.max(10, 100 - topic.totalFails * 10)
                      return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>{topic.topic}</span>
                          <div style={{ width: '80px', height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                            <div style={{
                              width: `${scoreVal}%`,
                              height: '100%',
                              borderRadius: '2px',
                              backgroundColor: getTopicColor(index)
                            }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '28px', textAlign: 'right' }}>
                            {scoreVal}%
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ color: '#1D9E75', fontSize: '13px', fontWeight: '500', padding: '12px 0' }}>
                      All topics looking strong! Keep it up.
                    </div>
                  )}
                </div>
              </div>

              {/* Element 3: Heatmap */}
              <div style={{
                background: 'var(--surface-1)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Activity heatmap</h3>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Last 90 days</span>
                </div>
                <ActivityHeatmap heatmapData={heatmapData} />
              </div>

            </div>

            {/* Right Column */}
            <div className="layout-col-right">
              
              {/* Element 1: Daily Goals Checklist */}
              <div style={{
                background: 'var(--surface-1)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>Today's goals</h3>
                <div>
                  {goals.map((g, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '0.5px solid var(--border)' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: g.done ? 'var(--fill-success)' : 'transparent',
                        border: g.done ? '1.5px solid var(--fill-success)' : '1.5px solid var(--border-strong)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {g.done && <i className="ti ti-check" style={{ fontSize: '10px' }} />}
                      </div>
                      <span style={{
                        fontSize: '13px',
                        color: g.done ? 'var(--text-muted)' : 'var(--text-secondary)',
                        textDecoration: g.done ? 'line-through' : 'none',
                        flex: 1
                      }}>
                        {g.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>Progress</span>
                    <span>{doneCount} of 3 complete</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${donePercent}%`, height: '100%', background: 'var(--gold)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>

              {/* Element 2: Neuro AI Tip Card */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)' }} />
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 600 }}>Neuro says</span>
                </div>
                <div style={{
                  background: 'var(--bg-pro)',
                  border: '0.5px solid var(--border-pro)',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: 'var(--text-pro)',
                  lineHeight: '1.5'
                }}>
                  {neuroTip}
                </div>
              </div>

              {/* Element 3: Weekly Summary Card */}
              <div style={{
                background: 'var(--surface-1)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px 0' }}>This week</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>{stats.notesCount}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>notes written</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>{stats.quizzesCount}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>quizzes completed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>{stats.revisionsCount}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>revisions done</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  )
}