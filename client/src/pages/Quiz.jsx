import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"

export default function Quiz() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [questions, setQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [history, setHistory] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState("quiz") // "quiz" | "history"

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    api.get("/notes").then((r) => setNotes(r.data)).catch(console.error)
    api.get("/quiz/history").then((r) => setHistory(r.data)).catch(console.error)
  }, [])

  const generateQuiz = async () => {
    if (!selectedNote) { showToast("Select a note first", "error"); return }
    setGenerating(true)
    setQuestions([])
    setUserAnswers({})
    setSubmitted(false)
    try {
      const res = await api.post("/ai/mcq", {
        notes: selectedNote.notes,
        topic: selectedNote.topic,
        count: 5,
      })
      setQuestions(res.data.questions)
      setStartTime(Date.now())
      showToast("Quiz ready! Good luck 🎯")
    } catch (e) {
      showToast("Quiz generation failed", "error")
    } finally {
      setGenerating(false)
    }
  }

  const handleAnswer = (qIdx, option) => {
    if (submitted) return
    setUserAnswers((prev) => ({ ...prev, [qIdx]: option }))
  }

  const handleSubmit = async () => {
    if (Object.keys(userAnswers).length < questions.length) {
      showToast("Answer all questions first", "error"); return
    }
    setLoading(true)

    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    let correct = 0
    const detailedQuestions = questions.map((q, i) => {
      const isCorrect = userAnswers[i] === q.correctAnswer
      if (isCorrect) correct++
      return { ...q, userAnswer: userAnswers[i], isCorrect }
    })

    setScore(correct)
    setSubmitted(true)

    try {
      await api.post("/quiz/submit", {
        topic: selectedNote.topic,
        noteId: selectedNote._id,
        questions: detailedQuestions,
        score: correct,
        totalQuestions: questions.length,
        timeTaken,
      })
      const histRes = await api.get("/quiz/history")
      setHistory(histRes.data)
      showToast(`Quiz submitted! Score: ${correct}/${questions.length} 🎉`)
    } catch (e) {
      showToast("Failed to save quiz result", "error")
    } finally {
      setLoading(false)
    }
  }

  const resetQuiz = () => {
    setQuestions([])
    setUserAnswers({})
    setSubmitted(false)
    setScore(0)
    setSelectedNote(null)
  }

  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header">
          <h1 className="page-title">🧠 AI Quiz</h1>
          <p className="page-subtitle">Test your knowledge with AI-generated multiple choice questions</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {["quiz", "history"].map((tab) => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab(tab)}
              style={{ textTransform: "capitalize" }}
            >
              {tab === "quiz" ? "🎯 Take Quiz" : "📊 History"}
            </button>
          ))}
        </div>

        {activeTab === "history" ? (
          <div>
            {history.length === 0 ? (
              <div className="card"><div className="empty-state"><div className="empty-state-icon">📊</div><h3>No quiz history yet</h3><p>Take your first quiz!</p></div></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {history.map((q) => (
                  <div key={q._id} className="card">
                    <div className="flex-between mb-2">
                      <h3 style={{ fontWeight: 700 }}>{q.topic}</h3>
                      <span style={{
                        fontWeight: 800, fontSize: "1.5rem",
                        color: q.percentage >= 80 ? "var(--accent-green)" : q.percentage >= 60 ? "var(--accent-blue)" : "#f87171",
                      }}>
                        {q.percentage}%
                      </span>
                    </div>
                    <div className="progress-bar mb-2">
                      <div className="progress-fill" style={{
                        width: `${q.percentage}%`,
                        background: q.percentage >= 80 ? "var(--gradient-green)" : q.percentage >= 60 ? "var(--gradient-blue)" : "linear-gradient(135deg,#ef4444,#f97316)",
                      }} />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      <span>✅ {q.score}/{q.totalQuestions} correct</span>
                      <span>⏱️ {q.timeTaken}s</span>
                      <span>📅 {new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {questions.length === 0 ? (
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Select a note to quiz yourself on:</h3>
                {notes.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon">📝</div><h3>No notes yet</h3><p>Add notes in the Journal first</p></div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "400px", overflowY: "auto", marginBottom: "1.5rem" }}>
                      {notes.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => setSelectedNote(n)}
                          style={{
                            padding: "1rem",
                            borderRadius: "10px",
                            cursor: "pointer",
                            border: `1px solid ${selectedNote?._id === n._id ? "var(--accent-purple)" : "var(--border)"}`,
                            background: selectedNote?._id === n._id ? "rgba(139,92,246,0.1)" : "var(--bg-secondary)",
                            transition: "all 0.2s",
                          }}
                        >
                          <div className="flex-between">
                            <span style={{ fontWeight: 600 }}>{n.topic}</span>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <span className={`badge badge-${n.difficulty === "easy" ? "green" : n.difficulty === "hard" ? "pink" : "blue"}`}>{n.difficulty}</span>
                              <span className="badge badge-purple">🎯 {n.masteryScore}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={generateQuiz}
                      disabled={!selectedNote || generating}
                      style={{ padding: "0.875rem 2rem" }}
                    >
                      {generating ? "Generating quiz..." : "🚀 Generate Quiz →"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                {/* Score Banner (after submit) */}
                {submitted && (
                  <div className="card mb-4" style={{
                    background: percentage >= 80 ? "rgba(16,185,129,0.1)" : percentage >= 60 ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${percentage >= 80 ? "var(--accent-green)" : percentage >= 60 ? "var(--accent-blue)" : "#ef4444"}`,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                      {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📚"}
                    </div>
                    <h2 style={{ fontWeight: 800, fontSize: "2rem", color: percentage >= 80 ? "var(--accent-green)" : percentage >= 60 ? "var(--accent-blue)" : "#f87171" }}>
                      {score}/{questions.length} — {percentage}%
                    </h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                      {percentage >= 80 ? "Excellent! You've mastered this topic!" : percentage >= 60 ? "Good effort! Keep reviewing." : "Keep studying — you'll get there!"}
                    </p>
                    <button className="btn btn-secondary mt-4" onClick={resetQuiz}>Take Another Quiz</button>
                  </div>
                )}

                {/* Questions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {questions.map((q, i) => (
                    <div key={i} className="card">
                      <p style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
                        <span className="badge badge-purple" style={{ marginRight: "0.75rem" }}>Q{i + 1}</span>
                        {q.question}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {(q.options || []).map((opt, j) => {
                          let cls = "quiz-option"
                          if (submitted) {
                            if (opt === q.correctAnswer) cls += " correct"
                            else if (opt === userAnswers[i] && opt !== q.correctAnswer) cls += " wrong"
                          } else if (userAnswers[i] === opt) {
                            cls += " selected"
                          }
                          return (
                            <div key={j} className={cls} onClick={() => handleAnswer(i, opt)}>
                              {opt}
                            </div>
                          )
                        })}
                      </div>
                      {submitted && q.explanation && (
                        <div className="alert alert-info mt-2" style={{ fontSize: "0.85rem" }}>
                          💡 {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!submitted && (
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ marginTop: "1.5rem", padding: "0.875rem 2rem" }}
                  >
                    {loading ? "Submitting..." : "✅ Submit Quiz"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
