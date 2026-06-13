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
          <div className="search-bar" style={{ flex: 1, minWidth: "200px", marginBottom: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--t2)", display: "flex", alignItems: "center" }}><FiSearch /></span>
            <input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-row" style={{ marginBottom: 0 }}>
            {["all", "easy", "medium", "hard"].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                style={{ textTransform: "capitalize" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div className="skeleton" style={{ height: "150px", width: "100%" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginBottom: '0.25rem' }}>
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} found
            </p>
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiFileText /></div>
                <h3 className="empty-title">No notes found</h3>
                <p className="empty-sub">Try adjusting your search or add notes in the Journal</p>
              </div>
            ) : (
              filteredNotes.map((note, i) => (
                <div key={note._id}>
                  <div
                    className="card anim-card"
                    style={{ cursor: "pointer", position: "relative", '--i': i }}
                    onClick={() => setSelected(selected?._id === note._id ? null : note)}
                  >
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: note.difficulty === 'easy' ? 'var(--em)' : note.difficulty === 'hard' ? 'var(--red)' : 'var(--gold)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontWeight: 600, fontSize: "1rem", color: "var(--t1)" }}>{note.topic}</h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <span className={`badge ${note.difficulty === "easy" ? "badge-em" : note.difficulty === "hard" ? "badge-red" : "badge-gold"}`}>
                          {note.difficulty}
                        </span>
                        <span className="badge badge-neutral">Mastery: {note.masteryScore}%</span>
                      </div>
                    </div>
                    <p style={{ color: "var(--t2)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                      {note.notes.slice(0, 160)}...
                    </p>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', marginTop: '8px' }}>
                      <div style={{ height: '100%', background: 'var(--gold)', width: `${note.masteryScore}%`, transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {(note.tags || []).slice(0, 3).map((t) => (
                          <span key={t} className="badge badge-neutral">{t}</span>
                        ))}
                      </div>
                      <span style={{ color: "var(--t3)", fontSize: "0.78rem" }}>
                        Rev: {note.revisionCount} · {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded AI Panel */}
                  {selected?._id === note._id && (
                    <div className="card" style={{ marginTop: "0.5rem", background: "var(--s2)", border: '1px solid var(--bd)' }}>
                      <h4 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", marginBottom: "1rem", color: 'var(--t1)' }}>
                        <FiCpu style={{ color: 'var(--gold)' }} /> AI Tools for "{note.topic}"
                      </h4>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                        <button className="btn-gold" onClick={() => generateMCQ(note)} disabled={!!aiLoading}>
                          {aiLoading === "mcq" ? "Generating..." : "Generate MCQ"}
                        </button>
                        <button className="btn-outline" onClick={() => generateInterview(note)} disabled={!!aiLoading}>
                          {aiLoading === "interview" ? "Generating..." : "Interview Questions"}
                        </button>
                      </div>

                      <div className="ai-output" style={{ marginBottom: "1.5rem", fontSize: "0.85rem", lineHeight: 1.6, background: 'var(--s1)', border: '1px solid var(--bd)', color: 'var(--t2)' }}>
                        {note.notes}
                      </div>

                      {/* MCQ */}
                      {mcqQuestions.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          <h5 style={{ fontWeight: 600, fontSize: "0.95rem", color: 'var(--t1)' }}>MCQ Questions</h5>
                          {mcqQuestions.map((q, i) => (
                            <div key={i} style={{ padding: "1rem", background: "var(--s3)", borderRadius: "12px", border: "1px solid var(--bd)" }}>
                              <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.75rem", color: 'var(--t1)' }}>{i + 1}. {q.question}</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {(q.options || []).map((opt, j) => (
                                  <div key={j} style={{
                                    padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.85rem",
                                    background: opt === q.correctAnswer ? "var(--emg)" : "rgba(255,255,255,0.03)",
                                    border: opt === q.correctAnswer ? "1px solid var(--em)" : "1px solid var(--bd)",
                                    color: opt === q.correctAnswer ? "var(--em)" : "var(--t1)",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                  }}>
                                    <span>{opt}</span>
                                    {opt === q.correctAnswer && <span style={{ display: "flex", alignItems: "center", color: "var(--em)" }}><FiCheck /></span>}
                                  </div>
                                ))}
                              </div>
                              {q.explanation && (
                                <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--t2)", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <FiInfo style={{ color: "var(--gold)" }} /> {q.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interview */}
                      {interviewQuestions.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: mcqQuestions.length > 0 ? '1.5rem' : 0 }}>
                          <h5 style={{ fontWeight: 600, fontSize: "0.95rem", color: 'var(--t1)' }}>Interview Questions</h5>
                          {interviewQuestions.map((q, i) => (
                            <div key={i} style={{ padding: "1rem", background: "var(--s3)", borderRadius: "12px", border: "1px solid var(--bd)" }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span className={`badge ${q.difficulty === "hard" ? "badge-red" : q.difficulty === "easy" ? "badge-em" : "badge-gold"}`}>
                                  {q.difficulty}
                                </span>
                                <span className="badge badge-neutral">{q.type}</span>
                              </div>
                              <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem", color: 'var(--t1)' }}>{i + 1}. {q.question}</p>
                              {q.hint && (
                                <p style={{ fontSize: "0.8rem", color: "var(--t2)", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <FiInfo style={{ color: "var(--gold)" }} /> Hint: {q.hint}
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
