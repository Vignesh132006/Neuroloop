import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div style={{ fontSize: "1.5rem" }}>{icon}</div>
      <div className="stat-label" style={{ marginTop: "0.5rem" }}>{label}</div>
      <div className="stat-number" style={{
        color: color === "purple" ? "var(--accent-purple)"
             : color === "blue" ? "var(--accent-blue)"
             : color === "green" ? "var(--accent-green)"
             : "var(--accent-orange)"
      }}>
        {value}
      </div>
    </div>
  )
}

function ActivityHeatmap({ notes }) {
  const today = new Date()
  const days = []

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }

  const countMap = {}
  notes.forEach((n) => {
    const date = new Date(n.createdAt).toISOString().split("T")[0]
    countMap[date] = (countMap[date] || 0) + 1
  })

  const getLevel = (count) => {
    if (!count) return ""
    if (count === 1) return "level-1"
    if (count === 2) return "level-2"
    if (count === 3) return "level-3"
    return "level-4"
  }

  return (
    <div className="card">
      <div className="flex-between mb-4">
        <h3 style={{ fontWeight: 700 }}>📅 Activity Heatmap</h3>
        <span className="badge badge-purple">Last 90 Days</span>
      </div>
      <div className="heatmap-grid">
        {days.map((date) => (
          <div
            key={date}
            className={`heatmap-cell ${getLevel(countMap[date])}`}
            title={`${date}: ${countMap[date] || 0} note${countMap[date] !== 1 ? "s" : ""}`}
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [notesRes, revRes, quizRes] = await Promise.all([
          api.get("/notes"),
          api.get("/revision"),
          api.get("/quiz/history"),
        ])
        setNotes(notesRes.data)
        setDueRevisions(revRes.data)
        setQuizHistory(quizRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
          <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-6">
          <StatCard label="Total Notes" value={notes.length} color="purple" icon="📝" />
          <StatCard label="Study Streak" value={`${calcStreak()}d 🔥`} color="orange" icon="⚡" />
          <StatCard label="Due Revisions" value={dueRevisions.length} color="blue" icon="🔁" />
          <StatCard label="Avg Quiz Score" value={`${avgQuizScore}%`} color="green" icon="🧠" />
        </div>

        {/* Heatmap */}
        <div className="mb-6">
          <ActivityHeatmap notes={notes} />
        </div>

        {/* Recent Notes + Due Revisions */}
        <div className="grid-2">
          {/* Recent Notes */}
          <div className="card">
            <div className="flex-between mb-4">
              <h3 style={{ fontWeight: 700 }}>📖 Recent Notes</h3>
              <span className="badge badge-purple">{notes.length} total</span>
            </div>
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3>No notes yet</h3>
                <p>Start writing in your Journal</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {notes.slice(0, 5).map((n) => (
                  <div key={n._id} style={{
                    padding: "0.875rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "10px",
                    borderLeft: "3px solid var(--accent-purple)",
                  }}>
                    <div className="flex-between">
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{n.topic}</span>
                      <span className={`badge badge-${n.difficulty === "easy" ? "green" : n.difficulty === "hard" ? "pink" : "blue"}`}>
                        {n.difficulty}
                      </span>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
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
              <h3 style={{ fontWeight: 700 }}>🔁 Due for Revision</h3>
              <span className="badge badge-orange">{dueRevisions.length} due</span>
            </div>
            {dueRevisions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <h3>All caught up!</h3>
                <p>No revisions due today</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {dueRevisions.slice(0, 5).map((n) => (
                  <div key={n._id} className="revision-card">
                    <div className="flex-between">
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{n.topic}</span>
                      <span className="badge badge-orange">Rev #{n.revisionCount + 1}</span>
                    </div>
                    <div className="progress-bar mt-2">
                      <div className="progress-fill" style={{ width: `${n.masteryScore}%` }} />
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
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
            <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>📊 Recent Quiz Performance</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {quizHistory.slice(0, 5).map((q) => (
                <div key={q._id} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: "0.9rem" }}>{q.topic}</span>
                  <div className="progress-bar" style={{ flex: 2 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${q.percentage}%`,
                        background: q.percentage >= 80 ? "var(--gradient-green)"
                          : q.percentage >= 60 ? "var(--gradient-blue)"
                          : "linear-gradient(135deg, #ef4444, #f97316)",
                      }}
                    />
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: "0.9rem", minWidth: "45px", textAlign: "right",
                    color: q.percentage >= 80 ? "var(--accent-green)"
                      : q.percentage >= 60 ? "var(--accent-blue)" : "#f87171",
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