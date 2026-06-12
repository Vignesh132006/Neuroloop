import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { 
  FiRefreshCw, 
  FiAlertTriangle, 
  FiCalendar, 
  FiCheckCircle, 
  FiTarget, 
  FiBookOpen, 
  FiCpu, 
  FiInfo 
} from "react-icons/fi"

export default function Revision() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dueNotes, setDueNotes] = useState([])
  const [weakTopics, setWeakTopics] = useState([])
  const [studyPlan, setStudyPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [planLoading, setPlanLoading] = useState(false)
  const [confidence, setConfidence] = useState({})
  const [confidenceMap, setConfidenceMap] = useState({})
  const [completing, setCompleting] = useState({})
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState("due")
  const [notePlans, setNotePlans] = useState({})
  const [notePlanLoading, setNotePlanLoading] = useState({})
  const [genLoading, setGenLoading] = useState({})

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
      setWeakTopics(weakRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleMarkRevised = async (noteId, confidenceVal) => {
    setCompleting((p) => ({ ...p, [noteId]: true }))
    try {
      const res = await api.put(`/revision/${noteId}`, { confidenceRating: confidenceVal })
      showToast(`Revised! Next revision in ${res.data.daysUntilNext} days`)
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
      const topicsList = weakTopics.flatMap(t => {
        if (t.weakSubtopics && Array.isArray(t.weakSubtopics)) {
          return t.weakSubtopics.map(sub => sub.name)
        }
        return [t.subTopic || t.topic]
      })
      const res = await api.post("/ai/study-plan", {
        weakTopics: topicsList,
        userName: user?.name,
      })
      setStudyPlan(res.data.plan)
      setActiveTab("plan")
      showToast("Study plan generated!")
    } catch (e) {
      showToast("Study plan generation failed", "error")
    } finally {
      setPlanLoading(false)
    }
  }

  const handleGenerateTopicPlan = async (topic, weakSubtopics) => {
    setGenLoading((prev) => ({ ...prev, [topic]: true }))
    try {
      const subtopicsArray = weakSubtopics.map((s) => s.name)
      await api.post("/study-plans/generate", {
        topic,
        weakSubtopics: subtopicsArray,
      })
      showToast("Study plan saved! Navigating to Study Plans...")
      setTimeout(() => {
        navigate("/study-plans")
      }, 1000)
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.error || "Failed to generate study plan", "error")
    } finally {
      setGenLoading((prev) => ({ ...prev, [topic]: false }))
    }
  }

  const getRevisionPlan = async (note) => {
    setNotePlanLoading((p) => ({ ...p, [note._id]: true }))
    try {
      const res = await api.post("/revision/study-plan", {
        topic: note.topic,
        noteContent: note.notes,
      })
      setNotePlans((p) => ({ ...p, [note._id]: res.data.plan }))
      showToast("Revision plan generated!")
    } catch (e) {
      showToast("Failed to generate plan", "error")
    } finally {
      setNotePlanLoading((p) => ({ ...p, [note._id]: false }))
    }
  }

  const INTERVALS = [1, 3, 7, 14, 30]
  const getNextInterval = (revisionCount) => INTERVALS[Math.min(revisionCount, INTERVALS.length - 1)]

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Smart Revision</h1>
            <p className="page-subtitle">Spaced repetition powered by science</p>
          </div>
          <button className="btn btn-primary" onClick={generateStudyPlan} disabled={planLoading} style={{ gap: "0.4rem" }}>
            <FiCpu /> {planLoading ? "Generating..." : "AI Study Plan"}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid-3 mb-6">
          <div className="stat-card orange">
            <div style={{ fontSize: "1.25rem", color: "var(--accent-orange)", display: "flex", alignItems: "center" }}>
              <FiRefreshCw />
            </div>
            <div className="stat-label mt-2">Due Today</div>
            <div className="stat-number" style={{ color: "var(--accent-orange)" }}>{dueNotes.length}</div>
          </div>
          <div className="stat-card pink">
            <div style={{ fontSize: "1.25rem", color: "var(--accent-pink)", display: "flex", alignItems: "center" }}>
              <FiAlertTriangle />
            </div>
            <div className="stat-label mt-2">Weak Topics</div>
            <div className="stat-number" style={{ color: "var(--accent-pink)" }}>{weakTopics.length}</div>
          </div>
          <div className="stat-card green">
            <div style={{ fontSize: "1.25rem", color: "var(--accent-green)", display: "flex", alignItems: "center" }}>
              <FiCalendar />
            </div>
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
              {tab === "due" ? `Due (${dueNotes.length})` : tab === "weak" ? `Weak Topics` : `Study Plan`}
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
                  <div className="empty-state-icon"><FiCheckCircle size={32} /></div>
                  <h3>All caught up!</h3>
                  <p>No revisions due today. Keep studying to build new notes.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {dueNotes.map((note) => (
                  <div key={note._id} className="revision-card">
                    <div className="flex-between mb-2">
                      <h3 style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--text-primary)" }}>{note.topic}</h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <span className="badge badge-orange">Rev #{note.revisionCount + 1}</span>
                        <span className={`badge badge-${note.difficulty === "easy" ? "green" : note.difficulty === "hard" ? "pink" : "blue"}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                          <span className={`dot dot-${note.difficulty}`}></span>
                          {note.difficulty}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.75rem", lineHeight: 1.6 }}>
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

                    <div className="flex-between" style={{ marginBottom: "1rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Next: in {getNextInterval(note.revisionCount + 1)} days
                      </span>
                      <button
                        className="btn btn-secondary"
                        onClick={() => getRevisionPlan(note)}
                        disabled={notePlanLoading[note._id]}
                        style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        <FiCpu /> {notePlanLoading[note._id] ? "Generating..." : "Get AI Plan"}
                      </button>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
                        How confident do you feel? (affects your mastery score)
                      </p>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setConfidenceMap(prev => ({ ...prev, [note._id]: star }))}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid',
                              borderColor: confidenceMap[note._id] === star ? '#3b82f6' : '#e2e8f0',
                              background: confidenceMap[note._id] === star ? '#eff6ff' : 'transparent',
                              color: confidenceMap[note._id] === star ? '#1d4ed8' : '#64748b',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: confidenceMap[note._id] === star ? '600' : '400'
                            }}
                          >
                            {star === 1 ? '1 Hard' : star === 2 ? '2' : star === 3 ? '3 OK' : star === 4 ? '4' : '5 Easy'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleMarkRevised(note._id, confidenceMap[note._id] || 3)}
                        disabled={completing[note._id]}
                        style={{
                          padding: '8px 18px',
                          background: '#22c55e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        {completing[note._id] ? "Saving..." : "Mark as Revised"}
                      </button>
                    </div>

                    {notePlans[note._id] && (
                      <div className="card mt-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "1rem" }}>
                        <h4 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>3-Day Revision Plan</h4>
                        <div style={{ whiteSpace: "pre-line", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                          {notePlans[note._id]}
                        </div>
                      </div>
                    )}
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
                  <div className="empty-state-icon"><FiTarget size={32} /></div>
                  <h3>No weak spots detected</h3>
                  <p>Take more quizzes to identify areas to improve</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {weakTopics.map((group, i) => (
                  <div key={i} className="card" style={{ borderLeft: "4px solid var(--accent-pink)" }}>
                    <div className="flex-between mb-3">
                      <h3 style={{ fontWeight: 600, fontSize: "1.15rem", color: "var(--text-primary)" }}>
                        Topic: {group.topic}
                      </h3>
                      <span className="badge badge-pink" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                        {group.totalFails} {group.totalFails === 1 ? "fail" : "fails"}
                      </span>
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                        Weak subtopics:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {group.weakSubtopics && group.weakSubtopics.map((sub, idx) => (
                          <span
                            key={idx}
                            className="badge"
                            style={{
                              backgroundColor: "rgba(249, 115, 22, 0.15)",
                              color: "rgb(249, 115, 22)",
                              padding: "0.3rem 0.65rem",
                              borderRadius: "9999px",
                              fontSize: "0.775rem",
                              fontWeight: 500
                            }}
                          >
                            {sub.name} ({sub.failCount})
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => handleGenerateTopicPlan(group.topic, group.weakSubtopics)}
                      disabled={!!genLoading[group.topic]}
                      style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}
                    >
                      {genLoading[group.topic] ? (
                        <>
                          <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", margin: 0 }} />
                          Generating Study Plan...
                        </>
                      ) : (
                        "Get AI Study Plan"
                      )}
                    </button>
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
                  <div className="empty-state-icon"><FiBookOpen size={32} /></div>
                  <h3>No study plan yet</h3>
                  <p>Click "AI Study Plan" to generate a personalised 7-day plan based on your weak topics</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="card mb-4">
                  <div className="ai-output" style={{ lineHeight: 1.6 }}>{studyPlan.overview}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(studyPlan.days || []).map((day) => (
                    <div key={day.day} className="card">
                      <div className="flex-between mb-2">
                        <h3 style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>Day {day.day}: {day.focus}</h3>
                        <span className="badge badge-purple">Time: {day.estimatedTime}</span>
                      </div>
                      <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {(day.tasks || []).map((task, i) => (
                          <li key={i} style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {studyPlan.tips && (
                  <div className="card mt-4">
                    <h3 style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <FiInfo style={{ color: "var(--accent-blue)" }} /> Tips
                    </h3>
                    <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {studyPlan.tips.map((tip, i) => (
                        <li key={i} style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{tip}</li>
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
