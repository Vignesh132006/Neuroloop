import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import RevisionCompleteModal from "../components/RevisionCompleteModal"
import RevisionIntervalPicker from "../components/RevisionIntervalPicker"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { FiRefreshCw, FiAlertTriangle, FiCalendar, FiCpu, FiCheck, FiBookOpen, FiClock, FiInfo, FiSmile, FiTarget } from "react-icons/fi"

export default function Revision() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dueNotes, setDueNotes] = useState([])
  const [weakTopics, setWeakTopics] = useState([])
  const [studyPlan, setStudyPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [planLoading, setPlanLoading] = useState(false)
  const [confidenceMap, setConfidenceMap] = useState({})
  const [completing, setCompleting] = useState({})
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState("due")
  const [notePlans, setNotePlans] = useState({})
  const [notePlanLoading, setNotePlanLoading] = useState({})
  const [genLoading, setGenLoading] = useState({})
  const [revisionModal, setRevisionModal] = useState(null)

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

  const handleMarkRevised = async (note, confidenceVal) => {
    setCompleting((p) => ({ ...p, [note._id]: true }))
    try {
      const res = await api.put(`/revision/${note._id}`, { confidenceRating: confidenceVal })
      setRevisionModal({
        topic: note.topic,
        confidence: confidenceVal,
        nextRevisionDays: res.data.daysUntilNext,
        masteryScore: res.data.masteryScore || note.masteryScore,
        revisionsCount: (note.revisionCount || 0) + 1,
      })
      fetchData()
    } catch (e) {
      showToast("Failed to mark as revised", "error")
    } finally {
      setCompleting((p) => ({ ...p, [note._id]: false }))
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
      await api.post("/study-plans/generate", { topic, weakSubtopics: subtopicsArray })
      showToast("Study plan saved! Navigating to Study Plans...")
      setTimeout(() => navigate("/study-plans"), 1000)
    } catch (err) {
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

  const handleIntervalChange = async (noteId, newDate) => {
    try {
      await api.patch(`/notes/${noteId}/reschedule`, { nextRevisionDate: newDate })
      fetchData()
      showToast('Revision date updated successfully')
    } catch (err) {
      console.error('Failed to reschedule:', err.message)
      showToast('Failed to reschedule revision date', 'error')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="page-wrap">
        {toast && (
          <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>
            {toast.msg}
          </div>
        )}

        {revisionModal && (
          <RevisionCompleteModal
            topic={revisionModal.topic}
            confidence={revisionModal.confidence}
            nextRevisionDays={revisionModal.nextRevisionDays}
            masteryScore={revisionModal.masteryScore}
            revisionsCount={revisionModal.revisionsCount}
            onClose={() => setRevisionModal(null)}
          />
        )}

        <div className="page-header flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div className="page-eyebrow">NeuroLoop</div>
            <h1 className="page-title">Smart Revision</h1>
            <p className="page-subtitle">Spaced repetition powered by science</p>
          </div>
          <button className="btn-gold" onClick={generateStudyPlan} disabled={planLoading} style={{ padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FiCpu /> {planLoading ? "Generating..." : "AI Study Plan"}
          </button>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold)' }} />
            <div className="stat-icon" style={{ background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiRefreshCw /></div>
            <div className="stat-val">{dueNotes.length}</div>
            <div className="stat-label">Due Today</div>
          </div>
          <div className="stat-card">
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--red)' }} />
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}><FiAlertTriangle /></div>
            <div className="stat-val" style={{ color: 'var(--red)' }}>{weakTopics.length}</div>
            <div className="stat-label">Weak Topics</div>
          </div>
          <div className="stat-card">
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--em)' }} />
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--em)' }}><FiCalendar /></div>
            <div className="stat-val" style={{ fontSize: '1.25rem', padding: '10px 0' }}>1·3·7·14·30d</div>
            <div className="stat-label">Intervals</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="filter-row" style={{ marginBottom: "24px" }}>
          {["due", "weak", "plan"].map((tab) => (
            <button
              key={tab}
              className={`filter-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "due" ? `Due (${dueNotes.length})` : tab === "weak" ? `Weak Topics` : `Study Plan`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div className="skeleton" style={{ height: "150px", width: "100%" }} />
          </div>
        ) : activeTab === "due" ? (
          <div>
            {dueNotes.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--em)' }}><FiSmile /></div>
                  <h3 className="empty-title">All caught up!</h3>
                  <p className="empty-sub">No revisions due today. Keep studying to build new notes.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {dueNotes.map((note) => (
                  <div key={note._id} className="card" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: note.difficulty === 'easy' ? 'var(--em)' : note.difficulty === 'hard' ? 'var(--red)' : 'var(--gold)' }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '8px' }}>
                      <h3 style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--t1)" }}>{note.topic}</h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <span className="badge badge-gold">Rev #{note.revisionCount + 1}</span>
                        <span className={`badge ${note.difficulty === "easy" ? "badge-em" : note.difficulty === "hard" ? "badge-red" : "badge-gold"}`}>
                          {note.difficulty}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: "var(--t2)", fontSize: "0.85rem", marginBottom: "12px", lineHeight: 1.6 }}>
                      {note.notes.slice(0, 200)}...
                    </p>

                    {/* Mastery Progress */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--t3)" }}>Mastery</span>
                      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: 'var(--t1)' }}>{note.masteryScore}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{ height: '100%', background: 'var(--gold)', width: `${note.masteryScore}%` }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <RevisionIntervalPicker
                        noteId={note._id}
                        currentNextDate={note.nextRevision}
                        onIntervalChange={handleIntervalChange}
                      />
                      <button
                        className="btn-outline"
                        onClick={() => getRevisionPlan(note)}
                        disabled={notePlanLoading[note._id]}
                        style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <FiCpu /> {notePlanLoading[note._id] ? "Generating..." : "Get AI Plan"}
                      </button>
                    </div>

                    {/* Confidence + segment selector */}
                    <div style={{ marginTop: '12px', borderTop: '1px solid var(--bd)', paddingTop: '12px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginBottom: '8px', fontWeight: '500' }}>
                        How confident do you feel?
                      </p>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setConfidenceMap(prev => ({ ...prev, [note._id]: star }))}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '9999px',
                              border: '1px solid',
                              borderColor: confidenceMap[note._id] === star ? 'var(--gold)' : 'var(--bd)',
                              background: confidenceMap[note._id] === star ? 'var(--goldg)' : 'transparent',
                              color: confidenceMap[note._id] === star ? 'var(--gold)' : 'var(--t2)',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: confidenceMap[note._id] === star ? '600' : '400',
                              transition: 'all 0.2s',
                              fontFamily: 'inherit',
                            }}
                          >
                            {star === 1 ? '1 Hard' : star === 2 ? '2' : star === 3 ? '3 OK' : star === 4 ? '4' : '5 Easy'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleMarkRevised(note, confidenceMap[note._id] || 3)}
                        disabled={completing[note._id]}
                        className="btn-emerald"
                        style={{ padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <FiCheck /> {completing[note._id] ? "Saving..." : "Mark as Revised"}
                      </button>
                    </div>

                    {notePlans[note._id] && (
                      <div className="card" style={{ marginTop: '12px', background: 'var(--s2)', padding: '16px', border: '1px solid var(--bd)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--t1)' }}>
                          <FiCpu style={{ color: 'var(--gold)' }} /> 3-Day Revision Plan
                        </h4>
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--t2)', lineHeight: '1.5' }}>
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
                  <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiTarget /></div>
                  <h3 className="empty-title">No weak spots detected</h3>
                  <p className="empty-sub">Take more quizzes to identify areas to improve</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {weakTopics.map((group, i) => (
                  <div key={i} className="card" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--red)' }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '12px' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--t1)' }}>Topic: {group.topic}</h3>
                      <span className="badge badge-red">{group.totalFails} fail{group.totalFails !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--t3)', marginBottom: '0.5rem' }}>Weak subtopics:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {group.weakSubtopics && group.weakSubtopics.map((sub, idx) => (
                          <span key={idx} className="badge badge-gold">{sub.name} ({sub.failCount})</span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="btn-gold"
                      onClick={() => handleGenerateTopicPlan(group.topic, group.weakSubtopics)}
                      disabled={!!genLoading[group.topic]}
                      style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center' }}
                    >
                      {genLoading[group.topic] ? "Generating Study Plan..." : "Get AI Study Plan"}
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
                  <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiBookOpen /></div>
                  <h3 className="empty-title">No study plan yet</h3>
                  <p className="empty-sub">Click "AI Study Plan" to generate a personalised 7-day plan based on your weak topics</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div className="ai-output" style={{ background: 'var(--s2)', border: '1px solid var(--bd)', color: 'var(--t2)' }}>{studyPlan.overview}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(studyPlan.days || []).map((day) => (
                    <div key={day.day} className="card" style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold)' }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '8px' }}>
                        <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--t1)' }}>Day {day.day}: {day.focus}</h3>
                        <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FiClock size={12} /> {day.estimatedTime}
                        </span>
                      </div>
                      <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {(day.tasks || []).map((task, i) => (
                          <li key={i} style={{ color: 'var(--t2)', fontSize: '0.85rem' }}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {studyPlan.tips && (
                  <div className="card" style={{ marginTop: '16px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1rem', marginBottom: '12px', color: 'var(--t1)' }}>
                      <FiInfo style={{ color: 'var(--gold)' }} /> Tips
                    </h3>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {studyPlan.tips.map((tip, i) => (
                        <li key={i} style={{ color: 'var(--t2)', fontSize: '0.85rem' }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
