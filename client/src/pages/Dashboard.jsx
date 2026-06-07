import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { 
  FiFileText, 
  FiActivity, 
  FiRefreshCw, 
  FiHelpCircle, 
  FiCheckCircle, 
  FiSettings, 
  FiCalendar 
} from "react-icons/fi"

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div style={{ fontSize: "1.25rem", color: `var(--accent-${color})`, display: "flex", alignItems: "center" }}>
        {icon}
      </div>
      <div className="stat-label" style={{ marginTop: "0.75rem" }}>{label}</div>
      <div className="stat-number">
        {value}
      </div>
    </div>
  )
}

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
    heatmapData.forEach((item) => {
      countMap[item.date] = item.count
    })
  }

  const getLevel = (count) => {
    if (!count) return ""
    if (count === 1) return "level-1"
    if (count === 2 || count === 3) return "level-2"
    if (count === 4 || count === 5) return "level-3"
    return "level-4"
  }

  return (
    <div className="card">
      <div className="flex-between mb-4">
        <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem" }}>
          <FiCalendar style={{ color: "var(--accent-blue)" }} /> Activity Heatmap
        </h3>
        <span className="badge badge-blue">Last 90 Days</span>
      </div>
      <div className="heatmap-grid">
        {days.map((date) => (
          <div
            key={date}
            className={`heatmap-cell ${getLevel(countMap[date])}`}
            title={`${date}: ${countMap[date] || 0} contribution${countMap[date] !== 1 ? "s" : ""}`}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
        <span>Less</span>
        {["", "level-1", "level-2", "level-3", "level-4"].map((l, i) => (
          <div key={i} className={`heatmap-cell ${l}`} style={{ width: "12px", height: "12px" }} />
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
  const [githubUsername, setGithubUsername] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (user) {
      setGithubUsername(user.githubUsername || "")
      setEmailNotifications(user.emailNotifications !== false)
    }
  }, [user])

  const loadData = async () => {
    try {
      const [notesRes, revRes, quizRes, weeklyRes, heatmapRes] = await Promise.all([
        api.get("/notes"),
        api.get("/revision"),
        api.get("/quiz/history"),
        api.get("/notes/stats/weekly"),
        api.get("/notes/stats/heatmap"),
      ])
      setNotes(notesRes.data)
      setDueRevisions(revRes.data)
      setQuizHistory(quizRes.data)
      setWeeklyStats(weeklyRes.data)
      setHeatmapData(heatmapRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveSettings = async () => {
    setSettingsLoading(true)
    try {
      await api.put("/auth/profile", {
        githubUsername,
        emailNotifications
      })
      
      // Refresh heatmap data in case github account changed
      const heatmapRes = await api.get("/notes/stats/heatmap")
      setHeatmapData(heatmapRes.data)
      
      showToast("Profile settings saved successfully!")
    } catch (err) {
      showToast("Failed to update profile settings", "error")
    } finally {
      setSettingsLoading(false)
    }
  }

  const calcStreak = () => {
    if (!notes.length) return 0
    const dates = [...new Set(notes.map((n) => new Date(n.createdAt).toDateString()))]
    return dates.length
  }

  const avgQuizScore = quizHistory.length
    ? Math.round(quizHistory.reduce((s, q) => s + q.percentage, 0) / quizHistory.length)
    : 0

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="loading-screen"><div className="spinner" /><p>Loading dashboard...</p></div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {toast && <div className="alert alert-success" style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-6">
          <StatCard label="Total Notes" value={notes.length} color="blue" icon={<FiFileText />} />
          <StatCard label="Study Streak" value={`${calcStreak()}d`} color="orange" icon={<FiActivity />} />
          <StatCard label="Due Revisions" value={dueRevisions.length} color="pink" icon={<FiRefreshCw />} />
          <StatCard label="Avg Quiz Score" value={`${avgQuizScore}%`} color="green" icon={<FiHelpCircle />} />
        </div>

        {/* Heatmap */}
        <div className="mb-6">
          <ActivityHeatmap heatmapData={heatmapData} />
        </div>

        {/* Weekly Report Card */}
        {weeklyStats && (
          <div className="card mb-6">
            <div className="flex-between mb-4">
              <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem" }}>
                <FiFileText style={{ color: "var(--accent-blue)" }} /> Weekly Progress Report
              </h3>
              <span className="badge badge-green">Last 7 Days</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Weekly summary: You wrote <strong>{weeklyStats.notesCount}</strong> notes, finished <strong>{weeklyStats.revisionsCount}</strong> revisions, and took <strong>{weeklyStats.quizzesCount}</strong> quizzes with an average score of <strong>{weeklyStats.averagePercentage}%</strong>.
            </p>
            
            {/* Styled Bar Chart */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)" }}>Daily Activity (Notes vs Quizzes)</h4>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "140px", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                {weeklyStats.dailyStats.map((day, idx) => {
                  const maxVal = Math.max(...weeklyStats.dailyStats.map(d => d.notes + d.quizzes)) || 1
                  const notesHeight = (day.notes / maxVal) * 100
                  const quizzesHeight = (day.quizzes / maxVal) * 100
                  
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "12%", gap: "0.25rem" }}>
                      <div style={{ display: "flex", gap: "4px", width: "100%", height: "100px", alignItems: "flex-end", justifyContent: "center" }}>
                        {/* Notes bar */}
                        <div 
                          style={{ 
                            width: "8px", 
                            height: `${notesHeight}%`, 
                            background: "var(--accent-blue)", 
                            borderRadius: "2px 2px 0 0",
                            transition: "height 0.3s ease"
                          }} 
                          title={`Notes: ${day.notes}`}
                        />
                        {/* Quizzes bar */}
                        <div 
                          style={{ 
                            width: "8px", 
                            height: `${quizzesHeight}%`, 
                            background: "var(--accent-purple)", 
                            borderRadius: "2px 2px 0 0",
                            transition: "height 0.3s ease"
                          }} 
                          title={`Quizzes: ${day.quizzes}`}
                        />
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{day.day}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.75rem", color: "var(--text-muted)", justifyContent: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <div style={{ width: "8px", height: "8px", background: "var(--accent-blue)", borderRadius: "50%" }} /> Notes Written
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <div style={{ width: "8px", height: "8px", background: "var(--accent-purple)", borderRadius: "50%" }} /> Quizzes Taken
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Profile & Integrations Settings Card */}
        <div className="card mb-6">
          <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", marginBottom: "1.25rem" }}>
            <FiSettings style={{ color: "var(--accent-blue)" }} /> Settings & Social Sync
          </h3>
          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Link GitHub Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Vignesh132006"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.35rem" }}>
                Overlay your public GitHub commits directly on your activity heatmap.
              </p>
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: 0 }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", textTransform: "none" }}>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--accent-blue)" }}
                />
                <span>Receive SendGrid Email Reminders</span>
              </label>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.35rem", paddingLeft: "1.5rem" }}>
                Get notified when you have notes due for spaced-repetition revisions.
              </p>
            </div>
          </div>
          <button className="btn btn-primary mt-4" onClick={handleSaveSettings} disabled={settingsLoading}>
            {settingsLoading ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Recent Notes + Due Revisions */}
        <div className="grid-2">
          {/* Recent Notes */}
          <div className="card">
            <div className="flex-between mb-4">
              <h3 style={{ fontWeight: 600, fontSize: "1.05rem" }}>Recent Notes</h3>
              <span className="badge badge-blue">{notes.length} total</span>
            </div>
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FiFileText size={32} /></div>
                <h3>No notes yet</h3>
                <p>Start writing in your Journal</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {notes.slice(0, 5).map((n) => (
                  <div key={n._id} style={{
                    padding: "0.875rem 1rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "8px",
                    borderLeft: "3px solid var(--accent-blue)",
                  }}>
                    <div className="flex-between">
                      <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{n.topic}</span>
                      <span className={`badge badge-${n.difficulty === "easy" ? "green" : n.difficulty === "hard" ? "pink" : "blue"}`}>
                        {n.difficulty}
                      </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Due Revisions */}
          <div className="card">
            <div className="flex-between mb-4">
              <h3 style={{ fontWeight: 600, fontSize: "1.05rem" }}>Due for Revision</h3>
              <span className="badge badge-orange">{dueRevisions.length} due</span>
            </div>
            {dueRevisions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FiCheckCircle size={32} /></div>
                <h3>All caught up!</h3>
                <p>No revisions due today</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {dueRevisions.slice(0, 5).map((n) => (
                  <div key={n._id} className="revision-card" style={{ padding: "0.875rem 1rem", borderRadius: "8px" }}>
                    <div className="flex-between">
                      <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{n.topic}</span>
                      <span className="badge badge-orange">Rev #{n.revisionCount + 1}</span>
                    </div>
                    <div className="progress-bar mt-2">
                      <div className="progress-fill" style={{ width: `${n.masteryScore}%` }} />
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      Mastery: {n.masteryScore}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quiz History */}
        {quizHistory.length > 0 && (
          <div className="card mt-4">
            <h3 style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: "1rem" }}>Recent Quiz Performance</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {quizHistory.slice(0, 5).map((q) => (
                <div key={q._id} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{q.topic}</span>
                  <div className="progress-bar" style={{ flex: 2 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${q.percentage}%`,
                        background: q.percentage >= 80 ? "var(--accent-green)"
                          : q.percentage >= 60 ? "var(--accent-blue)"
                          : "var(--accent-pink)",
                      }}
                    />
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: "0.875rem", minWidth: "45px", textAlign: "right",
                    color: q.percentage >= 80 ? "var(--accent-green)"
                      : q.percentage >= 60 ? "var(--accent-blue)" : "var(--accent-pink)",
                  }}>
                    {q.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}