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
  const [quizSource, setQuizSource] = useState('') // 'note' or 'custom'
  const [customTopic, setCustomTopic] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [quizType, setQuizType] = useState('mcq')

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    api.get("/notes").then((r) => setNotes(r.data)).catch(console.error)
    api.get("/quiz/history").then((r) => setHistory(r.data)).catch(console.error)
  }, [])

  const generateQuiz = async () => {
    if (!quizSource) { showToast("Select a quiz source first", "error"); return }
    if (quizSource === 'note' && !selectedNote) { showToast("Select a note first", "error"); return }
    if (quizSource === 'custom' && (!customTopic || customTopic.trim().length <= 2)) {
      showToast("Enter a valid topic name (at least 3 characters)", "error"); return
    }

    setGenerating(true)
    setQuestions([])
    setUserAnswers({})
    setSubmitted(false)
    setShowResultModal(false)
    try {
      let noteContent = ''
      let topicName = ''

      if (quizSource === 'note') {
        noteContent = selectedNote?.notes || ''
        topicName = selectedNote?.topic || ''
      } else if (quizSource === 'custom') {
        topicName = customTopic
        noteContent = `Generate ${questionCount} questions about the topic: ${customTopic}. This is a computer science topic. Create questions that test deep understanding.`
      }

      const endpoint = quizType === 'mcq' ? '/ai/mcq' : '/ai/interview'
      const res = await api.post(endpoint, {
        notes: noteContent,
        topic: topicName,
        count: questionCount
      })

      if (res.data && res.data.questions) {
        setQuestions(res.data.questions)
        setStartTime(Date.now())
        showToast("Quiz ready!")
      } else {
        showToast("No questions returned", "error")
      }
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
      const isCorrect = q.correctAnswer ? userAnswers[i] === q.correctAnswer : !!userAnswers[i]?.trim()
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
        topic: selectedNote?.topic || customTopic || 'Custom Topic',
        noteId: selectedNote?._id || null,
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
    setQuizSource('')
    setCustomTopic('')
    setQuestionCount(5)
    setQuizType('mcq')
  }

  return (
    <div className="app-layout">
      <style>{`
        .quiz-source-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 600px) {
          .quiz-source-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
            topic={selectedNote?.topic || customTopic || 'Quiz'}
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
                <h3 className="card-title" style={{ marginBottom: '24px' }}>Smart Quiz Generator Wizard 🧠</h3>
                
                {/* STEP A: Choose quiz source */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary, var(--t2))', marginBottom: '10px', fontWeight: '500' }}>
                    Step 1 — Where do you want questions from?
                  </p>
                  <div className="quiz-source-grid">
                    {/* Option 1: From my notes */}
                    <div
                      onClick={() => setQuizSource('note')}
                      style={{
                        padding: '16px', borderRadius: '12px', cursor: 'pointer',
                        border: `1.5px solid ${quizSource === 'note' ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                        background: quizSource === 'note' ? 'rgba(229,9,20,0.08)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary, var(--t1))', marginBottom: '4px' }}>
                        From my notes
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted, var(--t3))' }}>
                        AI generates questions from your saved notes
                      </div>
                    </div>

                    {/* Option 2: Custom topic */}
                    <div
                      onClick={() => setQuizSource('custom')}
                      style={{
                        padding: '16px', borderRadius: '12px', cursor: 'pointer',
                        border: `1.5px solid ${quizSource === 'custom' ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                        background: quizSource === 'custom' ? 'rgba(229,9,20,0.08)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>✏️</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary, var(--t1))', marginBottom: '4px' }}>
                        Custom topic
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted, var(--t3))' }}>
                        Type any topic — AI creates questions for it
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP B: If 'note' selected, show note dropdown (existing dropdown) */}
                {quizSource === 'note' && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, var(--t2))', marginBottom: '8px', fontWeight: '500' }}>
                      Step 2 — Select a note
                    </p>
                    {notes.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiFileText /></div>
                        <h3 className="empty-title">No notes yet</h3>
                        <p className="empty-sub">Add notes in the Journal to start quizzing!</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "250px", overflowY: "auto", marginBottom: "1rem" }}>
                        {notes.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => setSelectedNote(n)}
                            style={{
                              padding: "12px 14px",
                              borderRadius: "12px",
                              cursor: "pointer",
                              border: `1.5px solid ${selectedNote?._id === n._id ? "var(--gold)" : "rgba(255,255,255,0.08)"}`,
                              background: selectedNote?._id === n._id ? "var(--goldg)" : "rgba(255,255,255,0.02)",
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
                    )}
                  </div>
                )}

                {/* If 'custom' selected, show text input */}
                {quizSource === 'custom' && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, var(--t2))', marginBottom: '8px', fontWeight: '500' }}>
                      Step 2 — Enter your topic
                    </p>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g. Binary Search Trees, React Hooks, OS Scheduling..."
                      style={{
                        width: '100%', padding: '11px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px', color: 'var(--text-primary, var(--t1))',
                        fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted, var(--t3))', marginTop: '6px' }}>
                      AI will generate questions based on general knowledge of this topic.
                    </p>
                  </div>
                )}

                {/* STEP C: Question type selector */}
                {quizSource && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, var(--t2))', marginBottom: '8px', fontWeight: '500' }}>
                      Step 3 — Question type
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { value: 'mcq', label: '🔤 MCQ', desc: 'Multiple choice' },
                        { value: 'interview', label: '💼 Interview', desc: 'Open-ended' }
                      ].map(type => (
                        <button
                          key={type.value}
                          onClick={() => setQuizType(type.value)}
                          style={{
                            flex: 1, padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                            border: `1.5px solid ${quizType === type.value ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                            background: quizType === type.value ? 'rgba(229,9,20,0.08)' : 'transparent',
                            color: quizType === type.value ? 'var(--gold)' : 'var(--text-secondary, var(--t2))',
                            fontSize: '13px', fontWeight: '500', textAlign: 'center', transition: 'all 0.2s'
                          }}
                        >
                          {type.label}
                          <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{type.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP D: HOW MANY QUESTIONS slider */}
                {quizSource && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary, var(--t2))', fontWeight: '500', margin: 0 }}>
                        Step 4 — How many questions?
                      </p>
                      <span style={{
                        fontSize: '20px', fontWeight: '500', color: 'var(--gold)',
                        background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.25)',
                        padding: '2px 12px', borderRadius: '8px'
                      }}>
                        {questionCount}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="3"
                      max="20"
                      step="1"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted, var(--t3))', marginTop: '4px' }}>
                      <span>3 (Quick)</span>
                      <span>10 (Standard)</span>
                      <span>20 (Deep dive)</span>
                    </div>

                    {/* Smart label based on count */}
                    <div style={{ marginTop: '8px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '12px', padding: '3px 10px', borderRadius: '20px',
                        background: questionCount <= 5 ? 'rgba(16,185,129,0.1)' : questionCount <= 10 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: questionCount <= 5 ? '#6ee7b7' : questionCount <= 10 ? '#fcd34d' : '#fca5a5',
                        border: `1px solid ${questionCount <= 5 ? 'rgba(16,185,129,0.2)' : questionCount <= 10 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
                      }}>
                        {questionCount <= 5 ? '⚡ Quick test — ~5 minutes' :
                         questionCount <= 10 ? '📚 Standard test — ~10 minutes' :
                         '🧠 Deep dive — ~20 minutes'}
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP E: GENERATE BUTTON */}
                {quizSource && (quizSource === 'custom' ? customTopic.trim().length > 2 : selectedNote) && (
                  <button
                    onClick={generateQuiz}
                    disabled={generating}
                    style={{
                      width: '100%', padding: '14px',
                      background: 'linear-gradient(135deg, #e50914, #99060d)',
                      color: '#ffffff', border: 'none', borderRadius: '12px',
                      fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                      opacity: generating ? 0.7 : 1
                    }}
                  >
                    {generating ? 'Generating questions...' : `Generate ${questionCount} Questions 🧠`}
                  </button>
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
                        {q.options && q.options.length > 0 ? (
                          q.options.map((opt, j) => {
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
                          })
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea
                              placeholder="Type your answer here..."
                              value={userAnswers[i] || ""}
                              onChange={(e) => handleAnswer(i, e.target.value)}
                              disabled={submitted}
                              style={{
                                width: "100%", padding: "12px 14px",
                                background: "var(--s2)", border: "1px solid var(--bd)",
                                borderRadius: "var(--r)", color: "var(--t1)",
                                fontSize: "0.9rem", resize: "vertical", outline: "none",
                                fontFamily: "inherit"
                              }}
                            />
                            {submitted && (
                              <div style={{
                                padding: "8px 12px", background: "rgba(16,185,129,0.08)",
                                border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px",
                                fontSize: "0.85rem", color: "var(--em)"
                              }}>
                                <strong>Your response:</strong> {userAnswers[i] || "(No response provided)"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {submitted && q.explanation && (
                        <div style={{ background: 'var(--s3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: '0.85rem', padding: '12px 16px', borderRadius: '8px', marginTop: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><FiInfo style={{ color: 'var(--gold)', flexShrink: 0 }} /> <span>{q.explanation}</span></div>
                        </div>
                      )}
                      {submitted && q.hint && (
                        <div style={{ background: 'var(--s3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: '0.85rem', padding: '12px 16px', borderRadius: '8px', marginTop: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><FiInfo style={{ color: 'var(--gold)', flexShrink: 0 }} /> <span><strong>Hint/Concept:</strong> {q.hint}</span></div>
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
