import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

export default function Revision() {
  const { user } = useAuth()
  const [dueNotes, setDueNotes] = useState([])
  const [weakTopics, setWeakTopics] = useState([])
  const [studyPlan, setStudyPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [planLoading, setPlanLoading] = useState(false)
  const [confidence, setConfidence] = useState({})
  const [completing, setCompleting] = useState({})
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState("due")

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [revRes, weakRes] = await Promise.all([
        api.get("/revision"),
        api.get("/quiz/weakness"),
      ])
      setDueNotes(revRes.data)
      setWeakTopics(weakRes.data.weakTopics || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const markRevised = async (noteId) => {
    const conf = confidence[noteId] || 3
    setCompleting((p) => ({ ...p, [noteId]: true }))
    try {
      const res = await api.put(`/revision/${noteId}`, { confidenceRating: conf })
      showToast(`Revised! Next revision in ${res.data.daysUntilNext} days 📅`)
      fetchData()
    } catch (e) {
      showToast("Failed to mark as revised", "error")
    } finally {
      setCompleting((p) => ({ ...p, [noteId]: false }))
    }
  }

  const generateStudyPlan = async () => {
    if (weakTopics.length === 0) { showToast("No weak topics detected!", "info"); return }
    setPlanLoading(true)
    try {
      const res = await api.post("/ai/study-plan", {
        weakTopics: weakTopics.map((t) => t.topic),
        userName: user?.name,
      })
      setStudyPlan(res.data.plan)
      setActiveTab("plan")
      showToast("Study plan generated! 📋")
    } catch (e) {
      showToast("Study plan generation failed", "error")
    } finally {
      setPlanLoading(false)
    }
  }

  const INTERVALS = [1, 3, 7, 14, 30]
  const getNextInterval = (revisionCount) => INTERVALS[Math.min(revisionCount, INTERVALS.length - 1)]

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">🔁 Smart Revision</h1>
            <p className="page-subtitle">Spaced repetition powered by science</p>
          </div>
          <button className="btn btn-primary" onClick={generateStudyPlan} disabled={planLoading}>
            {planLoading ? "Generating..." : "📋 AI Study Plan"}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid-3 mb-6">
          <div className="stat-card orange">
            <div style={{ fontSize: "1.5rem" }}>🔁</div>
            <div className="stat-label mt-2">Due Today</div>
            <div className="stat-number" style={{ color: "var(--accent-orange)" }}>{dueNotes.length}</div>
          </div>
          <div className="stat-card pink">
            <div style={{ fontSize: "1.5rem" }}>⚠️</div>
            <div className="stat-label mt-2">Weak Topics</div>
            <div className="stat-number" style={{ color: "var(--accent-pink)" }}>{weakTopics.length}</div>
          </div>
          <div className="stat-card green">
            <div style={{ fontSize: "1.5rem" }}>📅</div>
            <div className="stat-label mt-2">Intervals</div>
            <div className="stat-number" style={{ color: "var(--accent-green)", fontSize: "1rem" }}>1·3·7·14·30d</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {["due", "weak", "plan"].map((tab) => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "due" ? `🔁 Due (${dueNotes.length})` : tab === "weak" ? `⚠️ Weak Topics` : `📋 Study Plan`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /><p>Loading revision data...</p></div>
        ) : activeTab === "due" ? (
          <div>
            {dueNotes.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No revisions due today. Keep studying to build new notes!</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {dueNotes.map((note) => (
                  <div key={note._id} className="revision-card">
                    <div className="flex-between mb-2">
                      <h3 style={{ fontWeight: 700 }}>{note.topic}</h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <span className="badge badge-orange">Rev #{note.revisionCount + 1}</span>
                        <span className={`badge badge-${note.difficulty === "easy" ? "green" : note.difficulty === "hard" ? "pink" : "blue"}`}>
                          {note.difficulty}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                      {note.notes.slice(0, 200)}...
                    </p>

                    {/* Mastery Progress */}
                    <div className="flex-between mb-1">
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Mastery</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{note.masteryScore}%</span>
                    </div>
                    <div className="progress-bar mb-3">
                      <div className="progress-fill" style={{ width: `${note.masteryScore}%` }} />
                    </div>

                    {/* Confidence Rating */}
                    <div style={{ marginBottom: "0.75rem" }}>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                        How confident are you? (1 = struggling, 5 = mastered)
                      </p>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => setConfidence((p) => ({ ...p, [note._id]: v }))}
                            style={{
                              width: "36px", height: "36px",
                              borderRadius: "8px",
                              border: `1px solid ${(confidence[note._id] || 3) >= v ? "var(--accent-purple)" : "var(--border)"}`,
                              background: (confidence[note._id] || 3) >= v ? "rgba(139,92,246,0.2)" : "var(--bg-secondary)",
                              color: "var(--text-primary)",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              transition: "all 0.15s",
                            }}
                          >{v}</button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-between">
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Next: in {getNextInterval(note.revisionCount + 1)} days
                      </span>
                      <button
                        className="btn btn-success"
                        onClick={() => markRevised(note._id)}
                        disabled={completing[note._id]}
                      >
                        {completing[note._id] ? "Saving..." : "✅ Mark Revised"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "weak" ? (
          <div>
            {weakTopics.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">🎯</div>
                  <h3>No weak spots detected</h3>
                  <p>Take more quizzes to identify areas to improve</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {weakTopics.map((t, i) => (
                  <div key={i} className="card" style={{ borderLeft: "3px solid var(--accent-pink)" }}>
                    <div className="flex-between">
                      <div>
                        <h3 style={{ fontWeight: 700 }}>{t.topic}</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          Failed {t.failCount} time{t.failCount !== 1 ? "s" : ""} (scored below 60%)
                        </p>
                      </div>
                      <span className="badge badge-pink">⚠️ Weak</span>
                    </div>
                    <div className="progress-bar mt-2">
                      <div className="progress-fill" style={{
                        width: `${Math.max(10, 100 - t.failCount * 20)}%`,
                        background: "linear-gradient(135deg,#ef4444,#f97316)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {!studyPlan ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <h3>No study plan yet</h3>
                  <p>Click "AI Study Plan" to generate a personalised 7-day plan based on your weak topics</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="card mb-4">
                  <div className="ai-output">{studyPlan.overview}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(studyPlan.days || []).map((day) => (
                    <div key={day.day} className="card">
                      <div className="flex-between mb-2">
                        <h3 style={{ fontWeight: 700 }}>Day {day.day}: {day.focus}</h3>
                        <span className="badge badge-purple">⏱️ {day.estimatedTime}</span>
                      </div>
                      <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {(day.tasks || []).map((task, i) => (
                          <li key={i} style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {studyPlan.tips && (
                  <div className="card mt-4">
                    <h3 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>💡 Tips</h3>
                    <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {studyPlan.tips.map((tip, i) => (
                        <li key={i} style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
