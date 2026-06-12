import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import QuizScoreCard from "../components/QuizScoreCard"
import api from "../api/axios"
import { FiCheckSquare, FiFileText, FiInfo, FiSmile, FiCpu, FiAward } from "react-icons/fi"

export default function Quiz() {
  const navigate = useNavigate()
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
  const [activeTab, setActiveTab] = useState("quiz")
  const [showResultModal, setShowResultModal] = useState(false)
  const [weakAreas, setWeakAreas] = useState([])

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
    setShowResultModal(false)
    try {
      const res = await api.post("/ai/mcq", {
        notes: selectedNote.notes,
        topic: selectedNote.topic,
        count: 5,
      })
      setQuestions(res.data.questions)
      setStartTime(Date.now())
      showToast("Quiz ready!")
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
    const wrong = []
    const detailedQuestions = questions.map((q, i) => {
      const isCorrect = userAnswers[i] === q.correctAnswer
      if (isCorrect) correct++
      else wrong.push(q.question?.split(' ').slice(0, 4).join(' '))
      return { ...q, userAnswer: userAnswers[i], isCorrect }
    })

    setScore(correct)
    setSubmitted(true)
    setWeakAreas(wrong)
    setShowResultModal(true)

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
    setShowResultModal(false)
    setWeakAreas([])
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

        {showResultModal && (
          <QuizScoreCard
            score={score}
            total={questions.length}
            topic={selectedNote?.topic || 'Quiz'}
            weakAreas={weakAreas}
            onRetry={() => { setShowResultModal(false); generateQuiz(); }}
            onClose={() => { setShowResultModal(false); navigate('/dashboard'); }}
          />
        )}

        <div className="page-header">
          <div className="page-eyebrow">NeuroLoop</div>
          <h1 className="page-title">AI Quiz</h1>
          <p className="page-subtitle">Test your knowledge with AI-generated multiple choice questions</p>
        </div>

        {/* Tabs */}
        <div className="filter-row" style={{ marginBottom: "24px" }}>
          {["quiz", "history"].map((tab) => (
            <button
              key={tab}
              className={`filter-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
              style={{ textTransform: "capitalize" }}
            >
              {tab === "quiz" ? "Take Quiz" : "History"}
            </button>
          ))}
        </div>

        {activeTab === "history" ? (
          <div className="card">
            <h3 className="card-title">Quiz History</h3>
            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiCheckSquare /></div>
                <h3 className="empty-title">No quizzes taken yet</h3>
                <p className="empty-sub">Take your first quiz to see your progress here!</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bd)', color: 'var(--t2)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topic</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((quiz) => (
                      <tr key={quiz._id} style={{ borderBottom: '1px solid var(--bd)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--t3)' }}>
                          {new Date(quiz.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '500', color: 'var(--t1)' }}>{quiz.topic}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: 'var(--t1)' }}>
                          {quiz.score}/{quiz.totalQuestions} ({Math.round(quiz.percentage)}%)
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--t3)' }}>
                          {quiz.timeTaken ? `${Math.round(quiz.timeTaken / 60)}m ${quiz.timeTaken % 60}s` : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span className={`badge ${quiz.percentage >= 60 ? 'badge-em' : 'badge-red'}`}>
                            {quiz.percentage >= 60 ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {questions.length === 0 ? (
              <div className="card">
                <h3 className="card-title">Select a note to quiz yourself on:</h3>
                {notes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiFileText /></div>
                    <h3 className="empty-title">No notes yet</h3>
                    <p className="empty-sub">Add notes in the Journal to start quizzing!</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "400px", overflowY: "auto", marginBottom: "1.5rem" }}>
                      {notes.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => setSelectedNote(n)}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            border: `1px solid ${selectedNote?._id === n._id ? "var(--gold)" : "var(--bd)"}`,
                            background: selectedNote?._id === n._id ? "var(--goldg)" : "var(--s2)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 500, color: "var(--t1)" }}>{n.topic}</span>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <span className={`badge ${n.difficulty === "easy" ? "badge-em" : n.difficulty === "hard" ? "badge-red" : "badge-gold"}`}>
                                {n.difficulty}
                              </span>
                              <span className="badge badge-neutral">Mastery: {n.masteryScore}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn-gold"
                      onClick={generateQuiz}
                      disabled={!selectedNote || generating}
                      style={{ padding: "11px 32px" }}
                    >
                      {generating ? "Generating quiz..." : "Generate Quiz"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                {/* Questions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {questions.map((q, i) => (
                    <div key={i} className="card" style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold)' }} />
                      <p style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem", color: "var(--t1)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="badge badge-gold">Q{i + 1}</span>
                        {q.question}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {(q.options || []).map((opt, j) => {
                          let isSel = userAnswers[i] === opt
                          let style = {
                            padding: "0.875rem 1.25rem",
                            border: "1px solid var(--bd)",
                            borderRadius: "var(--r)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            background: "var(--s2)",
                            fontSize: "0.9rem",
                            color: "var(--t1)",
                          }
                          if (submitted) {
                            if (opt === q.correctAnswer) {
                              style.borderColor = "var(--em)"
                              style.background = "var(--emg)"
                              style.color = "var(--em)"
                            } else if (isSel) {
                              style.borderColor = "var(--red)"
                              style.background = "var(--redg)"
                              style.color = "var(--red)"
                            }
                          } else if (isSel) {
                            style.borderColor = "var(--gold)"
                            style.background = "var(--goldg)"
                          }
                          return (
                            <div key={j} style={style} onClick={() => handleAnswer(i, opt)}>
                              {opt}
                            </div>
                          )
                        })}
                      </div>
                      {submitted && q.explanation && (
                        <div style={{ background: 'var(--s3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: '0.85rem', padding: '12px 16px', borderRadius: '8px', marginTop: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><FiInfo style={{ color: 'var(--gold)', flexShrink: 0 }} /> <span>{q.explanation}</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!submitted && (
                  <button
                    className="btn-gold"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ marginTop: "1.5rem", padding: "11px 32px" }}
                  >
                    {loading ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}

                {submitted && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-ghost" onClick={resetQuiz}>Take Another Quiz</button>
                    <button className="btn-gold" onClick={() => setShowResultModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <FiAward /> View Results
                    </button>
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
