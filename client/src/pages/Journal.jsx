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
        <div className="card" style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "24px", padding: "28px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.08)" }}>
          <h2 className="card-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.35rem", fontWeight: 700, color: "#1A1A2E", display: 'flex', alignItems: 'center', gap: '10px', marginBottom: "20px" }}>
            {editId ? <FiEdit3 style={{ color: "#E91E8C" }} /> : <FiPlus style={{ color: "#E91E8C" }} />} {editId ? "Edit Journal Entry" : "New Journal Entry"}
          </h2>

          {/* PDF Upload Section */}
          {!editId && (
            <div className="upload-zone" style={{ background: "#FFF0F5", border: "2px dashed #F9C0D8", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "24px" }}>
              <input
                type="file"
                accept="application/pdf"
                id="pdf-file-upload"
                onChange={handlePdfUpload}
                disabled={pdfLoading}
                style={{ display: "none" }}
              />
              <label htmlFor="pdf-file-upload" style={{ cursor: "pointer", display: "block" }}>
                <div className="upload-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontSize: '2.2rem', marginBottom: '10px' }}><FiUpload /></div>
                <div className="upload-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#1A1A2E", marginBottom: "4px" }}>PDF Note Upload</div>
                <div className="upload-sub" style={{ color: "#4A4A6A", fontSize: "0.85rem", marginBottom: "16px" }}>Upload a PDF note and let AI automatically extract the topic, notes, and summary.</div>
                <button className="btn-gold" type="button" style={{ pointerEvents: 'none', background: "linear-gradient(135deg, #E91E8C, #FF6B9D)", border: "none", color: "#ffffff", padding: "8px 24px", borderRadius: "50px", fontWeight: 600, fontSize: "0.85rem" }}>
                  {pdfLoading ? "Extracting..." : "Select PDF Note"}
                </button>
              </label>
            </div>
          )}

          <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8888AA", marginBottom: "6px", display: "block" }}>Topic</label>
              <input
                id="journal-topic"
                className="form-input"
                placeholder="What did you learn today?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "12px", padding: "12px 16px", color: "#1A1A2E", fontSize: "0.92rem", width: "100%" }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8888AA", marginBottom: "6px", display: "block" }}>Difficulty</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "12px", padding: "12px 16px", color: "#1A1A2E", fontSize: "0.92rem", width: "100%" }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8888AA", marginBottom: "6px", display: "block" }}>Notes</label>
            <textarea
              id="journal-notes"
              className="form-textarea"
              placeholder="Write everything you learned, understood, or want to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ minHeight: "200px", background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "14px", padding: "14px 16px", color: "#1A1A2E", fontSize: "0.92rem", width: "100%", lineHeight: 1.6 }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8888AA", marginBottom: "6px", display: "block" }}>Tags (comma separated)</label>
            <input
              className="form-input"
              placeholder="react, hooks, state management"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "12px", padding: "12px 16px", color: "#1A1A2E", fontSize: "0.92rem", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button id="journal-save" className="btn-gold" onClick={handleSave} disabled={loading} style={{ padding: '12px 28px', borderRadius: "50px", background: "linear-gradient(135deg, #E91E8C, #FF6B9D)", border: "none", color: "#ffffff", fontWeight: 600, fontSize: "0.92rem", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: "0 4px 18px rgba(233, 30, 140, 0.25)" }}>
              <FiSave /> {loading ? "Saving..." : editId ? "Update Entry" : "Save Journal"}
            </button>
            <button className="btn-outline" onClick={generateSummary} disabled={summaryLoading} style={{ padding: '12px 28px', borderRadius: "50px", background: "#FFFFFF", border: "1.5px solid #F9C0D8", color: "#E91E8C", fontWeight: 600, fontSize: "0.92rem", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FiCpu /> {summaryLoading ? "Generating..." : "AI Summary"}
            </button>
            {editId && (
              <button className="btn-ghost" onClick={() => { setEditId(null); setTopic(""); setNotes(""); setSummary(""); setTags(""); setDifficulty("medium") }} style={{ padding: '12px 20px', borderRadius: "50px", color: "#8888AA", background: "none", border: "none", cursor: "pointer" }}>
                Cancel Edit
              </button>
            )}
          </div>

          {/* AI Summary Output */}
          {summary && (
            <div className="ai-output" style={{ marginTop: '24px', background: '#FCE4F0', border: '1.5px solid #F9C0D8', borderRadius: '16px', padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: '#1A1A2E', fontSize: "1rem" }}>
                <FiCpu style={{ color: '#E91E8C' }} /> AI Summary
              </div>
              <div style={{ color: '#4A4A6A', fontSize: '0.9rem', lineHeight: 1.6 }}>{summary}</div>
            </div>
          )}
        </div>

        {/* Journal List */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1.4rem", color: '#1A1A2E', margin: 0 }}>Saved Entries</h2>
            <span style={{ background: "#FCE4F0", color: "#E91E8C", border: "1px solid #F9C0D8", padding: "4px 16px", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600 }}>{journals.length} entries</span>
          </div>

          {journals.length === 0 ? (
            <div style={{ background: "#FFFFFF", border: "1.5px dashed #F9C0D8", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
              <div className="empty-state">
                <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontSize: '2.5rem', marginBottom: '12px' }}><FiBookOpen /></div>
                <h3 className="empty-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", color: "#1A1A2E", marginBottom: "6px" }}>Your learning journey starts with one note!</h3>
                <p className="empty-sub" style={{ color: "#4A4A6A", fontSize: "0.9rem" }}>Write your first entry above to get started</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {journals.map((j) => (
                <div key={j._id} style={{ position: 'relative', background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
                  <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: '5px',
                    borderTopLeftRadius: '20px',
                    borderBottomLeftRadius: '20px',
                    background: j.difficulty === 'easy' ? '#10B981' : j.difficulty === 'hard' ? '#EF4444' : '#F59E0B'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1.15rem", color: "#1A1A2E", margin: 0 }}>{j.topic}</h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{
                        background: j.difficulty === "easy" ? "rgba(16, 185, 129, 0.12)" : j.difficulty === "hard" ? "rgba(239, 68, 68, 0.12)" : "#FCE4F0",
                        color: j.difficulty === "easy" ? "#059669" : j.difficulty === "hard" ? "#dc2626" : "#E91E8C",
                        border: `1px solid ${j.difficulty === "easy" ? "rgba(16, 185, 129, 0.3)" : j.difficulty === "hard" ? "rgba(239, 68, 68, 0.3)" : "#F9C0D8"}`,
                        padding: "3px 12px",
                        borderRadius: "50px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        textTransform: "uppercase"
                      }}>
                        {j.difficulty}
                      </span>
                      <span style={{ background: "#FCE4F0", color: "#E91E8C", border: "1px solid #F9C0D8", padding: "3px 12px", borderRadius: "50px", fontSize: "0.72rem", fontWeight: 600 }}>Rev: {j.revisionCount}</span>
                    </div>
                  </div>
                  <p style={{ color: "#4A4A6A", fontSize: "0.9rem", marginBottom: "12px", lineHeight: 1.6 }}>
                    {j.notes.length > 200 ? j.notes.slice(0, 200) + "..." : j.notes}
                  </p>
                  {(j.tags || []).length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "12px" }}>
                      {j.tags.map((t) => <span key={t} style={{ background: "#FFF0F5", color: "#8888AA", border: "1px solid #F9C0D8", padding: "2px 10px", borderRadius: "50px", fontSize: "0.72rem", fontWeight: 500 }}>#{t}</span>)}
                    </div>
                  )}
                  {j.aiSummary && (
                    <div style={{ background: "#FFF0F5", border: "1px solid #F9C0D8", borderRadius: "14px", padding: "12px 16px", fontSize: "0.85rem", marginBottom: "12px", color: "#4A4A6A", display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <FiCpu style={{ color: '#E91E8C', marginTop: '3px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: "#1A1A2E" }}>AI Summary:</strong> {j.aiSummary.slice(0, 150)}...
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#8888AA", fontSize: "0.78rem" }}>
                      {new Date(j.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", color: "#E91E8C", padding: '6px 16px', borderRadius: "50px", fontSize: '0.8rem', fontWeight: 600, cursor: "pointer" }} onClick={() => handleEdit(j)} title="Edit">Edit</button>
                      <button style={{ background: "none", border: "none", color: "#dc2626", padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: "pointer" }} onClick={() => handleDelete(j._id)} title="Delete">Delete</button>
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