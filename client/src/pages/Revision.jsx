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
      showToast("Study plan generated successfully")
    } catch (e) {
      showToast("Server issue, try again later", "error")
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
            <div className="page-eyebrow" style={{ color: "#E91E8C", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>NeuroLoop</div>
            <h1 className="page-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 700, color: "#1A1A2E", margin: "4px 0" }}>Smart Revision</h1>
            <p className="page-subtitle" style={{ color: "#4A4A6A", fontSize: "14px" }}>Spaced repetition powered by science</p>
          </div>
          <button className="btn-gold" onClick={generateStudyPlan} disabled={planLoading} style={{ padding: '12px 28px', borderRadius: "50px", background: "linear-gradient(135deg, #E91E8C, #FF6B9D)", border: "none", color: "#ffffff", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: "0 4px 18px rgba(233, 30, 140, 0.25)" }}>
            <FiCpu /> {planLoading ? "Generating..." : "AI Study Plan"}
          </button>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: '24px' }}>
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderTop: "3px solid #E91E8C", borderRadius: "20px", padding: "20px 22px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.08)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FCE4F0", display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontSize: "1.1rem", marginBottom: "12px" }}><FiRefreshCw /></div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#E91E8C" }}>{dueNotes.length}</div>
            <div style={{ fontSize: "11px", color: "#8888AA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>Due Today</div>
          </div>
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderTop: "3px solid #EF4444", borderRadius: "20px", padding: "20px 22px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.08)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.12)", display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: "1.1rem", marginBottom: "12px" }}><FiAlertTriangle /></div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#EF4444" }}>{weakTopics.length}</div>
            <div style={{ fontSize: "11px", color: "#8888AA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>Weak Topics</div>
          </div>
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderTop: "3px solid #10B981", borderRadius: "20px", padding: "20px 22px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.08)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontSize: "1.1rem", marginBottom: "12px" }}><FiCalendar /></div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#1A1A2E", margin: "6px 0" }}>1 - 3 - 7 - 14 - 30d</div>
            <div style={{ fontSize: "11px", color: "#8888AA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Intervals</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="filter-row" style={{ marginBottom: "24px", display: "flex", gap: "10px" }}>
          {["due", "weak", "plan"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 22px",
                borderRadius: "50px",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.25s",
                border: activeTab === tab ? "none" : "1.5px solid #F9C0D8",
                background: activeTab === tab ? "linear-gradient(135deg, #E91E8C, #FF6B9D)" : "#FFFFFF",
                color: activeTab === tab ? "#ffffff" : "#E91E8C",
                boxShadow: activeTab === tab ? "0 4px 14px rgba(233, 30, 140, 0.25)" : "none"
              }}
            >
              {tab === "due" ? `Due (${dueNotes.length})` : tab === "weak" ? `Weak Topics` : `Study Plan`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div className="skeleton" style={{ height: "150px", width: "100%", borderRadius: "20px" }} />
          </div>
        ) : activeTab === "due" ? (
          <div>
            {dueNotes.length === 0 ? (
              <div style={{ background: "#FFFFFF", border: "1.5px dashed #F9C0D8", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
                <div className="empty-state">
                  <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontSize: '2.5rem', marginBottom: '12px' }}><FiSmile /></div>
                  <h3 className="empty-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", color: "#1A1A2E", marginBottom: "6px" }}>All caught up!</h3>
                  <p className="empty-sub" style={{ color: "#4A4A6A", fontSize: "0.9rem" }}>No revisions due today. Keep studying to build new notes.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {dueNotes.map((note, i) => (
                  <div key={note._id} style={{ position: 'relative', background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
                    <div style={{
                      position: 'absolute',
                      left: 0, top: 0, bottom: 0,
                      width: '5px',
                      borderTopLeftRadius: '20px',
                      borderBottomLeftRadius: '20px',
                      background: note.difficulty === 'easy' ? '#10B981' : note.difficulty === 'hard' ? '#EF4444' : '#F59E0B'
                    }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '10px' }}>
                      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1.2rem", color: "#1A1A2E", margin: 0 }}>{note.topic}</h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <span style={{ background: "#FCE4F0", color: "#E91E8C", border: "1px solid #F9C0D8", padding: "3px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 600 }}>Rev #{note.revisionCount + 1}</span>
                        <span style={{
                          background: note.difficulty === "easy" ? "rgba(16, 185, 129, 0.12)" : note.difficulty === "hard" ? "rgba(239, 68, 68, 0.12)" : "#FCE4F0",
                          color: note.difficulty === "easy" ? "#059669" : note.difficulty === "hard" ? "#dc2626" : "#E91E8C",
                          border: `1px solid ${note.difficulty === "easy" ? "rgba(16, 185, 129, 0.3)" : note.difficulty === "hard" ? "rgba(239, 68, 68, 0.3)" : "#F9C0D8"}`,
                          padding: "3px 12px",
                          borderRadius: "50px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase"
                        }}>
                          {note.difficulty}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: "#4A4A6A", fontSize: "0.92rem", marginBottom: "14px", lineHeight: 1.6 }}>
                      {note.notes.slice(0, 200)}...
                    </p>

                    {/* Mastery Progress */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: "0.8rem", color: "#8888AA", fontWeight: 600 }}>Mastery</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: '#1A1A2E' }}>{note.masteryScore}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#FFF0F5', borderRadius: '50px', overflow: 'hidden', marginBottom: '16px' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, #E91E8C, #FF6B9D)', width: `${note.masteryScore}%`, borderRadius: '50px' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <RevisionIntervalPicker
                        noteId={note._id}
                        currentNextDate={note.nextRevision}
                        onIntervalChange={handleIntervalChange}
                      />
                      <button
                        onClick={() => getRevisionPlan(note)}
                        disabled={notePlanLoading[note._id]}
                        style={{ fontSize: '0.82rem', padding: '8px 18px', borderRadius: "50px", background: "#FFFFFF", border: "1.5px solid #F9C0D8", color: "#E91E8C", fontWeight: 600, cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <FiCpu /> {notePlanLoading[note._id] ? "Generating..." : "Get AI Plan"}
                      </button>
                    </div>

                    {/* Confidence + segment selector */}
                    <div style={{ marginTop: '16px', borderTop: '1.5px solid #F9C0D8', paddingTop: '16px' }}>
                      <p style={{ fontSize: '0.82rem', color: '#4A4A6A', marginBottom: '10px', fontWeight: '600' }}>
                        How confident do you feel?
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: "wrap" }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setConfidenceMap(prev => ({ ...prev, [note._id]: star }))}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '50px',
                              border: confidenceMap[note._id] === star ? 'none' : '1.5px solid #F9C0D8',
                              background: confidenceMap[note._id] === star ? 'linear-gradient(135deg, #E91E8C, #FF6B9D)' : '#FFFFFF',
                              color: confidenceMap[note._id] === star ? '#ffffff' : '#1A1A2E',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              transition: 'all 0.2s',
                              fontFamily: 'inherit',
                              boxShadow: confidenceMap[note._id] === star ? '0 4px 14px rgba(233, 30, 140, 0.25)' : 'none'
                            }}
                          >
                            {star === 1 ? '1 Hard' : star === 2 ? '2' : star === 3 ? '3 OK' : star === 4 ? '4' : '5 Easy'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleMarkRevised(note, confidenceMap[note._id] || 3)}
                        disabled={completing[note._id]}
                        style={{ padding: '10px 24px', borderRadius: "50px", background: "linear-gradient(135deg, #E91E8C, #FF6B9D)", border: "none", color: "#ffffff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: "0 4px 18px rgba(233, 30, 140, 0.25)" }}
                      >
                        <FiCheck /> {completing[note._id] ? "Saving..." : "Mark as Revised"}
                      </button>
                    </div>

                    {notePlans[note._id] && (
                      <div style={{ marginTop: '16px', background: '#FCE4F0', padding: '18px', border: '1.5px solid #F9C0D8', borderRadius: '16px' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '0.98rem', marginBottom: '10px', color: '#1A1A2E' }}>
                          <FiCpu style={{ color: '#E91E8C' }} /> 3-Day Revision Plan
                        </h4>
                        <div>
                          {renderStudyPlan(notePlans[note._id])}
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
              <div style={{ background: "#FFFFFF", border: "1.5px dashed #F9C0D8", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
                <div className="empty-state">
                  <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontSize: '2.5rem', marginBottom: '12px' }}><FiTarget /></div>
                  <h3 className="empty-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", color: "#1A1A2E", marginBottom: "6px" }}>No weak spots detected</h3>
                  <p className="empty-sub" style={{ color: "#4A4A6A", fontSize: "0.9rem" }}>Take more quizzes to identify areas to improve</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {weakTopics.map((group, i) => (
                  <div key={i} style={{ position: 'relative', background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px', background: '#EF4444' }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '14px' }}>
                      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '1.2rem', color: '#1A1A2E', margin: 0 }}>Topic: {group.topic}</h3>
                      <span style={{ background: "rgba(239, 68, 68, 0.12)", color: "#dc2626", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "3px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 600 }}>{group.totalFails} fail{group.totalFails !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.82rem', color: '#8888AA', marginBottom: '0.5rem', fontWeight: 600, textTransform: "uppercase" }}>Weak subtopics:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {group.weakSubtopics && group.weakSubtopics.map((sub, idx) => (
                          <span key={idx} style={{ background: "#FCE4F0", color: "#E91E8C", border: "1px solid #F9C0D8", padding: "4px 14px", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600 }}>{sub.name} ({sub.failCount})</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerateTopicPlan(group.topic, group.weakSubtopics)}
                      disabled={!!genLoading[group.topic]}
                      style={{ width: '100%', padding: "12px", borderRadius: "50px", background: "linear-gradient(135deg, #E91E8C, #FF6B9D)", border: "none", color: "#ffffff", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: "0 4px 18px rgba(233, 30, 140, 0.25)" }}
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
              <div style={{ background: "#FFFFFF", border: "1.5px dashed #F9C0D8", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
                <div className="empty-state">
                  <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontSize: '2.5rem', marginBottom: '12px' }}><FiBookOpen /></div>
                  <h3 className="empty-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", color: "#1A1A2E", marginBottom: "6px" }}>No study plan yet</h3>
                  <p className="empty-sub" style={{ color: "#4A4A6A", fontSize: "0.9rem" }}>Click "AI Study Plan" to generate a personalised 7-day plan based on your weak topics</p>
                </div>
              </div>
            ) : (
              <div>
                {renderStudyPlan(studyPlan)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function renderStudyPlan(planText) {
  if (!planText) return null
  
  const days = planText.split(/(?=DAY \d+)/g).filter(s => s.trim())
  
  if (days.length <= 1) {
    return (
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#4A4A6A', fontSize: '14px', background: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #F9C0D8' }}>
        {planText}
      </div>
    )
  }

  const mainDays = days.filter(d => d.startsWith('DAY'))
  const footer = planText.split(/OVERALL GOAL:|WEEKLY GOAL:|SUCCESS METRIC:/)[1] || ''

  return (
    <div>
      {mainDays.map((day, i) => {
        const lines = day.trim().split('\n')
        const heading = lines[0] || ''
        const rest = lines.slice(1).join('\n')
        
        return (
          <div key={i} style={{
            marginBottom: '16px',
            background: '#FFFFFF',
            border: '1.5px solid #F9C0D8',
            borderLeft: `4px solid #E91E8C`,
            borderRadius: '16px',
            padding: '18px 20px',
            boxShadow: '0 4px 20px rgba(233,30,140,0.06)'
          }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '15px',
              fontWeight: '700',
              color: '#1A1A2E',
              marginBottom: '10px',
              letterSpacing: '0.02em'
            }}>
              {heading}
            </div>
            {rest.split('\n').map((line, j) => {
              if (!line.trim()) return null
              const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-')
              const isLabel = line.includes(':') && !line.startsWith('•') && line.split(':')[0].length < 20
              return (
                <div key={j} style={{
                  fontSize: '13.5px',
                  color: isBullet ? '#4A4A6A' : '#1A1A2E',
                  fontWeight: isLabel ? '600' : '400',
                  marginBottom: '4px',
                  paddingLeft: isBullet ? '8px' : '0',
                  lineHeight: 1.6
                }}>
                  {line.trim()}
                </div>
              )
            })}
          </div>
        )
      })}
      {footer && (
        <div style={{
          background: '#FCE4F0',
          border: '1.5px solid #F9C0D8',
          borderRadius: '16px',
          padding: '16px 20px',
          fontSize: '14px',
          color: '#E91E8C',
          marginTop: '12px',
          fontWeight: '600'
        }}>
          <span style={{ fontWeight: '700', color: '#1A1A2E' }}>🎯 Overall Goal: </span>
          {footer.split('\n')[0]?.trim()}
        </div>
      )}
    </div>
  )
}
