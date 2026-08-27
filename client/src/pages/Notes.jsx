import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { FiSearch, FiFileText, FiCpu, FiCheck, FiInfo, FiSmile } from "react-icons/fi"

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [mcqQuestions, setMcqQuestions] = useState([])
  const [interviewQuestions, setInterviewQuestions] = useState([])
  const [aiLoading, setAiLoading] = useState("")
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const res = await api.get("/notes")
      setNotes(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotes() }, [])

  const filteredNotes = notes.filter(note =>
    (note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.aiSummary && note.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (filter === "all" || note.difficulty === filter)
  )

  const generateMCQ = async (note) => {
    setAiLoading("mcq")
    setMcqQuestions([])
    setInterviewQuestions([])
    try {
      const res = await api.post("/ai/mcq", { notes: note.notes, topic: note.topic, count: 10 })
      setMcqQuestions(res.data.questions)
      showToast("MCQ questions generated!")
    } catch (e) {
      showToast("MCQ generation failed", "error")
    } finally {
      setAiLoading("")
    }
  }

  const generateInterview = async (note) => {
    setAiLoading("interview")
    setMcqQuestions([])
    setInterviewQuestions([])
    try {
      const res = await api.post("/ai/interview", { notes: note.notes, topic: note.topic })
      setInterviewQuestions(res.data.questions)
      showToast("Interview questions generated!")
    } catch (e) {
      showToast("Interview question generation failed", "error")
    } finally {
      setAiLoading("")
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

        <div className="page-header">
          <div className="page-eyebrow">NeuroLoop</div>
          <h1 className="page-title">Notes Library</h1>
          <p className="page-subtitle">Browse, search, and generate AI questions from your notes</p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-bar" style={{ flex: 1, minWidth: "200px", marginBottom: 0, display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "50px", padding: "8px 18px" }}>
            <span style={{ color: "#E91E8C", display: "flex", alignItems: "center" }}><FiSearch /></span>
            <input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", color: "#1A1A2E", fontSize: "0.9rem" }}
            />
          </div>
          <div className="filter-row" style={{ marginBottom: 0, display: "flex", gap: "8px" }}>
            {["all", "easy", "medium", "hard"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  textTransform: "capitalize",
                  padding: "8px 20px",
                  borderRadius: "50px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.25s",
                  border: filter === f ? "none" : "1.5px solid #F9C0D8",
                  background: filter === f ? "linear-gradient(135deg, #E91E8C, #FF6B9D)" : "#FFFFFF",
                  color: filter === f ? "#ffffff" : "#E91E8C",
                  boxShadow: filter === f ? "0 4px 14px rgba(233, 30, 140, 0.25)" : "none"
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div className="skeleton" style={{ height: "150px", width: "100%", borderRadius: "20px" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: '0.82rem', color: '#8888AA', marginBottom: '0.25rem', fontWeight: 600 }}>
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} found
            </p>
            {filteredNotes.length === 0 ? (
              <div className="empty-state" style={{ background: "#FFFFFF", border: "1.5px dashed #F9C0D8", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
                <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontSize: '2.5rem', marginBottom: '16px' }}><FiFileText /></div>
                <h3 className="empty-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.4rem", color: "#1A1A2E", marginBottom: "8px" }}>No notes found</h3>
                <p className="empty-sub" style={{ color: "#4A4A6A", fontSize: "0.9rem" }}>Try adjusting your search or add notes in the Journal</p>
              </div>
            ) : (
              filteredNotes.map((note, i) => (
                <div key={note._id}>
                  <div
                    className="card anim-card"
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      background: "#FFFFFF",
                      border: "1.5px solid #F9C0D8",
                      borderRadius: "20px",
                      padding: "20px 24px",
                      boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)",
                      '--i': i
                    }}
                    onClick={() => setSelected(selected?._id === note._id ? null : note)}
                  >
                    {/* Left Accent Bar */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '5px',
                      borderTopLeftRadius: '20px',
                      borderBottomLeftRadius: '20px',
                      background: note.difficulty === 'easy' ? '#10B981' : note.difficulty === 'hard' ? '#EF4444' : '#F59E0B'
                    }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1.15rem", color: "#1A1A2E", margin: 0 }}>{note.topic}</h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <span style={{
                          background: note.difficulty === "easy" ? "rgba(16, 185, 129, 0.12)" : note.difficulty === "hard" ? "rgba(239, 68, 68, 0.12)" : "#FCE4F0",
                          color: note.difficulty === "easy" ? "#059669" : note.difficulty === "hard" ? "#dc2626" : "#E91E8C",
                          border: `1px solid ${note.difficulty === "easy" ? "rgba(16, 185, 129, 0.3)" : note.difficulty === "hard" ? "rgba(239, 68, 68, 0.3)" : "#F9C0D8"}`,
                          padding: "3px 12px",
                          borderRadius: "50px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          textTransform: "uppercase"
                        }}>
                          {note.difficulty}
                        </span>
                        <span style={{ background: "#FCE4F0", color: "#E91E8C", border: "1px solid #F9C0D8", padding: "3px 12px", borderRadius: "50px", fontSize: "0.72rem", fontWeight: 600 }}>
                          Mastery: {note.masteryScore}%
                        </span>
                      </div>
                    </div>
                    <p style={{ color: "#4A4A6A", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "12px" }}>
                      {note.notes.slice(0, 160)}...
                    </p>
                    <div style={{ width: '100%', height: '6px', background: '#FFF0F5', borderRadius: '50px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, #E91E8C, #FF6B9D)', width: `${note.masteryScore}%`, borderRadius: '50px', transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {(note.tags || []).slice(0, 3).map((t) => (
                          <span key={t} style={{ background: "#FFF0F5", color: "#8888AA", border: "1px solid #F9C0D8", padding: "2px 10px", borderRadius: "50px", fontSize: "0.7rem", fontWeight: 500 }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span style={{ color: "#8888AA", fontSize: "0.78rem" }}>
                        Rev: {note.revisionCount} · {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded AI Panel */}
                  {selected?._id === note._id && (
                    <div style={{ marginTop: "0.75rem", background: "#FFFFFF", border: '1.5px solid #F9C0D8', borderRadius: "20px", padding: "20px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.08)" }}>
                      <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.05rem", marginBottom: "1rem", color: '#1A1A2E' }}>
                        <FiCpu style={{ color: '#E91E8C' }} /> AI Tools for "{note.topic}"
                      </h4>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                        <button className="btn-gold" onClick={() => generateMCQ(note)} disabled={!!aiLoading}>
                          {aiLoading === "mcq" ? "Generating..." : "Generate MCQ"}
                        </button>
                        <button className="btn-outline" onClick={() => generateInterview(note)} disabled={!!aiLoading}>
                          {aiLoading === "interview" ? "Generating..." : "Interview Questions"}
                        </button>
                      </div>

                      <div className="ai-output" style={{ marginBottom: "1.5rem", padding: "16px", borderRadius: "14px", fontSize: "0.9rem", lineHeight: 1.7, background: '#FFF0F5', border: '1px solid #F9C0D8', color: '#4A4A6A' }}>
                        {note.notes}
                      </div>

                      {/* MCQ */}
                      {mcqQuestions.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          <h5 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1rem", color: '#1A1A2E' }}>MCQ Questions</h5>
                          {mcqQuestions.map((q, i) => (
                            <div key={i} style={{ padding: "1.25rem", background: "#FFF0F5", borderRadius: "14px", border: "1px solid #F9C0D8" }}>
                              <p style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: "0.75rem", color: '#1A1A2E' }}>{i + 1}. {q.question}</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {(q.options || []).map((opt, j) => (
                                  <div key={j} style={{
                                    padding: "0.6rem 0.85rem", borderRadius: "10px", fontSize: "0.88rem",
                                    background: opt === q.correctAnswer ? "rgba(16,185,129,0.12)" : "#FFFFFF",
                                    border: opt === q.correctAnswer ? "1.5px solid #10B981" : "1px solid #F9C0D8",
                                    color: opt === q.correctAnswer ? "#059669" : "#1A1A2E",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                  }}>
                                    <span>{opt}</span>
                                    {opt === q.correctAnswer && <span style={{ display: "flex", alignItems: "center", color: "#10B981" }}><FiCheck /></span>}
                                  </div>
                                ))}
                              </div>
                              {q.explanation && (
                                <p style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "#4A4A6A", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <FiInfo style={{ color: "#E91E8C" }} /> {q.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interview */}
                      {interviewQuestions.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: mcqQuestions.length > 0 ? '1.5rem' : 0 }}>
                          <h5 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1rem", color: '#1A1A2E' }}>Interview Questions</h5>
                          {interviewQuestions.map((q, i) => (
                            <div key={i} style={{ padding: "1.25rem", background: "#FFF0F5", borderRadius: "14px", border: "1px solid #F9C0D8" }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span className={`badge ${q.difficulty === "hard" ? "badge-red" : q.difficulty === "easy" ? "badge-em" : "badge-gold"}`}>
                                  {q.difficulty}
                                </span>
                                <span className="badge badge-neutral">{q.type}</span>
                              </div>
                              <p style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: "0.5rem", color: '#1A1A2E' }}>{i + 1}. {q.question}</p>
                              {q.hint && (
                                <p style={{ fontSize: "0.82rem", color: "#4A4A6A", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <FiInfo style={{ color: "#E91E8C" }} /> Hint: {q.hint}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
