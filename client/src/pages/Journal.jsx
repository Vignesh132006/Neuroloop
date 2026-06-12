import { useState, useEffect, useCallback } from "react"
import Sidebar from "../components/Sidebar"
import TaskCompleteToast from "../components/TaskCompleteToast"
import api from "../api/axios"
import { FiEdit3, FiPlus, FiUpload, FiSave, FiCpu, FiBookOpen } from "react-icons/fi"

export default function Journal() {
  const [topic, setTopic] = useState("")
  const [notes, setNotes] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [tags, setTags] = useState("")
  const [journals, setJournals] = useState([])
  const [summary, setSummary] = useState("")
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [celebrationToast, setCelebrationToast] = useState({ visible: false, topic: '' })

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchJournals = async () => {
    try {
      const res = await api.get("/notes")
      setJournals(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { fetchJournals() }, [])

  const dismissCelebration = useCallback(() => {
    setCelebrationToast({ visible: false, topic: '' })
  }, [])

  const handleSave = async () => {
    if (!topic.trim() || !notes.trim()) {
      showToast("Topic and notes are required", "error"); return
    }
    setLoading(true)
    try {
      const payload = {
        topic, notes, difficulty,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        aiSummary: summary,
      }
      if (editId) {
        await api.put(`/notes/${editId}`, payload)
        showToast("Journal updated!")
        setEditId(null)
      } else {
        await api.post("/notes/add", payload)
        setCelebrationToast({ visible: true, topic: topic })
      }
      setTopic(""); setNotes(""); setTags(""); setSummary(""); setDifficulty("medium")
      fetchJournals()
    } catch (e) {
      showToast(e.response?.data?.error || "Save failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this journal entry?")) return
    try {
      await api.delete(`/notes/${id}`)
      showToast("Journal deleted")
      fetchJournals()
    } catch (e) {
      showToast("Delete failed", "error")
    }
  }

  const handleEdit = (journal) => {
    setTopic(journal.topic)
    setNotes(journal.notes)
    setDifficulty(journal.difficulty || "medium")
    setTags((journal.tags || []).join(", "))
    setSummary(journal.aiSummary || "")
    setEditId(journal._id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const generateSummary = async () => {
    if (!notes.trim()) { showToast("Write some notes first", "error"); return }
    setSummaryLoading(true)
    try {
      const res = await api.post("/ai/summary", { notes })
      setSummary(res.data.summary)
      showToast("Summary generated!")
    } catch (e) {
      showToast("AI unavailable — try again", "error")
    } finally {
      setSummaryLoading(false)
    }
  }

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file", "error")
      return
    }
    const formData = new FormData()
    formData.append("pdf", file)
    setPdfLoading(true)
    showToast("Parsing PDF and generating summary...", "info")
    try {
      const res = await api.post("/notes/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setTopic(res.data.topic || "")
      setNotes(res.data.text || "")
      setSummary(res.data.summary || "")
      showToast("PDF parsed and summarized successfully!")
    } catch (err) {
      showToast(err.response?.data?.error || "PDF upload failed", "error")
    } finally {
      setPdfLoading(false)
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

        <TaskCompleteToast
          topic={celebrationToast.topic}
          isVisible={celebrationToast.visible}
          onDismiss={dismissCelebration}
        />

        <div className="page-header">
          <div className="page-eyebrow">NeuroLoop</div>
          <h1 className="page-title">Daily Learning Journal</h1>
          <p className="page-subtitle">Write, reflect, and let AI summarise your learning</p>
        </div>

        {/* Editor Card */}
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editId ? <FiEdit3 /> : <FiPlus />} {editId ? "Edit Entry" : "New Entry"}
          </h2>

          {/* PDF Upload Section */}
          {!editId && (
            <div className="upload-zone">
              <input
                type="file"
                accept="application/pdf"
                id="pdf-file-upload"
                onChange={handlePdfUpload}
                disabled={pdfLoading}
                style={{ display: "none" }}
              />
              <label htmlFor="pdf-file-upload" style={{ cursor: "pointer", display: "block" }}>
                <div className="upload-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiUpload /></div>
                <div className="upload-title">PDF Note Upload</div>
                <div className="upload-sub">Upload a PDF note and let AI automatically extract the topic, notes, and summary.</div>
                <button className="btn-gold" type="button" style={{ pointerEvents: 'none' }}>
                  {pdfLoading ? "Extracting..." : "Select PDF Note"}
                </button>
              </label>
            </div>
          )}

          <div className="grid-2" style={{ gap: "1rem", marginBottom: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Topic</label>
              <input
                id="journal-topic"
                className="form-input"
                placeholder="What did you learn today?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Difficulty</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              id="journal-notes"
              className="form-textarea"
              placeholder="Write everything you learned, understood, or want to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ minHeight: "200px" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              className="form-input"
              placeholder="react, hooks, state management"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <button id="journal-save" className="btn-gold" onClick={handleSave} disabled={loading} style={{ padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FiSave /> {loading ? "Saving..." : editId ? "Update Entry" : "Save Journal"}
            </button>
            <button className="btn-outline" onClick={generateSummary} disabled={summaryLoading} style={{ padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FiCpu /> {summaryLoading ? "Generating..." : "AI Summary"}
            </button>
            {editId && (
              <button className="btn-ghost" onClick={() => { setEditId(null); setTopic(""); setNotes(""); setSummary(""); setTags(""); setDifficulty("medium") }}>
                Cancel Edit
              </button>
            )}
          </div>

          {/* AI Summary Output */}
          {summary && (
            <div className="ai-output" style={{ marginTop: '20px', background: 'var(--s2)', border: '1px solid var(--bd)' }}>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: 'var(--t1)' }}>
                <FiCpu style={{ color: 'var(--gold)' }} /> AI Summary
              </div>
              <div style={{ color: 'var(--t2)', fontSize: '0.88rem' }}>{summary}</div>
            </div>
          )}
        </div>

        {/* Journal List */}
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontWeight: 600, fontSize: "1.1rem", color: 'var(--t1)' }}>Saved Entries</h2>
            <span className="badge badge-gold">{journals.length} entries</span>
          </div>

          {journals.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiBookOpen /></div>
                <h3 className="empty-title">Your learning journey starts with one note!</h3>
                <p className="empty-sub">Write your first entry above to get started</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {journals.map((j) => (
                <div key={j._id} className="card" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: j.difficulty === 'easy' ? 'var(--em)' : j.difficulty === 'hard' ? 'var(--red)' : 'var(--gold)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontWeight: 600, fontSize: "1rem", color: "var(--t1)" }}>{j.topic}</h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span className={`badge ${j.difficulty === "easy" ? "badge-em" : j.difficulty === "hard" ? "badge-red" : "badge-gold"}`}>
                        {j.difficulty}
                      </span>
                      <span className="badge badge-neutral">Rev: {j.revisionCount}</span>
                    </div>
                  </div>
                  <p style={{ color: "var(--t2)", fontSize: "0.85rem", marginBottom: "12px", lineHeight: 1.6 }}>
                    {j.notes.length > 200 ? j.notes.slice(0, 200) + "..." : j.notes}
                  </p>
                  {(j.tags || []).length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "12px" }}>
                      {j.tags.map((t) => <span key={t} className="badge badge-neutral">{t}</span>)}
                    </div>
                  )}
                  {j.aiSummary && (
                    <div style={{ background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: "10px", padding: "12px", fontSize: "0.82rem", marginBottom: "12px", color: "var(--t2)", display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <FiCpu style={{ color: 'var(--gold)', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>AI Summary:</strong> {j.aiSummary.slice(0, 150)}...
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--t3)", fontSize: "0.78rem" }}>
                      {new Date(j.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleEdit(j)} title="Edit">Edit</button>
                      <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleDelete(j._id)} title="Delete">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}