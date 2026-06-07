import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { 
  FiSearch, 
  FiFileText, 
  FiCpu, 
  FiCheck, 
  FiInfo 
} from "react-icons/fi"

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState("")
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

  const filtered = notes.filter((n) => {
    const matchSearch = n.topic.toLowerCase().includes(search.toLowerCase()) ||
      n.notes.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || n.difficulty === filter
    return matchSearch && matchFilter
  })

  const generateMCQ = async (note) => {
    setAiLoading("mcq")
    setMcqQuestions([])
    setInterviewQuestions([])
    try {
      const res = await api.post("/ai/mcq", { notes: note.notes, topic: note.topic, count: 5 })
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
      <main className="main-content fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header">
          <h1 className="page-title">Notes Library</h1>
          <p className="page-subtitle">Browse, search, and generate AI questions from your notes</p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="form-input"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
          {["all", "easy", "medium", "hard"].map((f) => (
            <button
              key={f}
              className={`btn ${filter === f ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter(f)}
              style={{ textTransform: "capitalize" }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /><p>Loading notes...</p></div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><FiFileText size={32} /></div>
              <h3>No notes found</h3>
              <p>Try adjusting your search or add notes in the Journal</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filtered.map((note) => (
              <div key={note._id}>
                <div
                  className="card"
                  style={{ cursor: "pointer", borderLeft: `3px solid var(--accent-${note.difficulty === "easy" ? "green" : note.difficulty === "hard" ? "pink" : "blue"})` }}
                  onClick={() => setSelected(selected?._id === note._id ? null : note)}
                >
                  <div className="flex-between mb-2">
                    <h3 style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--text-primary)" }}>{note.topic}</h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span className={`badge badge-${note.difficulty === "easy" ? "green" : note.difficulty === "hard" ? "pink" : "blue"}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <span className={`dot dot-${note.difficulty}`}></span>
                        {note.difficulty}
                      </span>
                      <span className="badge badge-purple">Mastery: {note.masteryScore}%</span>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                    {note.notes.slice(0, 160)}...
                  </p>

                  {/* Progress */}
                  <div className="progress-bar mt-2">
                    <div className="progress-fill" style={{ width: `${note.masteryScore}%` }} />
                  </div>

                  <div className="flex-between mt-2">
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {(note.tags || []).slice(0, 3).map((t) => (
                        <span key={t} className="badge badge-blue">{t}</span>
                      ))}
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      Rev: {note.revisionCount} · {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Expanded AI Panel */}
                {selected?._id === note._id && (
                  <div className="card" style={{ marginTop: "0.5rem", background: "var(--bg-secondary)" }}>
                    <h4 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", marginBottom: "1rem" }}>
                      <FiCpu style={{ color: "var(--accent-purple)" }} /> AI Tools for "{note.topic}"
                    </h4>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => generateMCQ(note)}
                        disabled={!!aiLoading}
                      >
                        {aiLoading === "mcq" ? "Generating..." : "Generate MCQ"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => generateInterview(note)}
                        disabled={!!aiLoading}
                      >
                        {aiLoading === "interview" ? "Generating..." : "Interview Questions"}
                      </button>
                    </div>

                    {/* Full notes */}
                    <div className="ai-output" style={{ marginBottom: "1.5rem", fontSize: "0.875rem", lineHeight: 1.6 }}>
                      {note.notes}
                    </div>

                    {/* MCQ Questions */}
                    {mcqQuestions.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <h5 style={{ fontWeight: 600, fontSize: "0.95rem" }}>MCQ Questions</h5>
                        {mcqQuestions.map((q, i) => (
                          <div key={i} style={{ padding: "1.25rem", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                            <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.75rem", color: "var(--text-primary)" }}>{i + 1}. {q.question}</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {(q.options || []).map((opt, j) => (
                                <div key={j} style={{
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "6px",
                                  fontSize: "0.875rem",
                                  background: opt === q.correctAnswer ? "rgba(48, 209, 88, 0.08)" : "var(--bg-secondary)",
                                  border: opt === q.correctAnswer ? "1px solid var(--accent-green)" : "1px solid var(--border)",
                                  color: opt === q.correctAnswer ? "var(--accent-green)" : "var(--text-primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between"
                                }}>
                                  <span>{opt}</span>
                                  {opt === q.correctAnswer && <FiCheck />}
                                </div>
                              ))}
                            </div>
                            {q.explanation && (
                              <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <FiInfo /> {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interview Questions */}
                    {interviewQuestions.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <h5 style={{ fontWeight: 600, fontSize: "0.95rem" }}>Interview Questions</h5>
                        {interviewQuestions.map((q, i) => (
                          <div key={i} style={{ padding: "1.25rem", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                            <div className="flex-between mb-2">
                              <span className={`badge badge-${q.difficulty === "hard" ? "pink" : q.difficulty === "easy" ? "green" : "blue"}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                <span className={`dot dot-${q.difficulty}`}></span>
                                {q.difficulty}
                              </span>
                              <span className="badge badge-purple">{q.type}</span>
                            </div>
                            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{i + 1}. {q.question}</p>
                            {q.hint && (
                              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <FiInfo /> Hint: {q.hint}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
