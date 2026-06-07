import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { 
  FiBookOpen, 
  FiUpload, 
  FiEdit2, 
  FiTrash2, 
  FiCpu 
} from "react-icons/fi"

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
        showToast("Journal saved!")
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
      <main className="main-content fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header">
          <h1 className="page-title">Daily Learning Journal</h1>
          <p className="page-subtitle">Write, reflect, and let AI summarise your learning</p>
        </div>

        {/* Editor Card */}
        <div className="card mb-6">
          <h2 style={{ fontWeight: 600, fontSize: "1.15rem", marginBottom: "1.5rem" }}>
            {editId ? "Edit Entry" : "New Entry"}
          </h2>

          {/* PDF Upload Section */}
          {!editId && (
            <div style={{
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius)",
              padding: "2rem",
              textAlign: "center",
              marginBottom: "1.5rem",
              background: "var(--bg-secondary)"
            }}>
              <FiUpload size={32} style={{ color: "var(--accent-blue)", marginBottom: "0.5rem" }} />
              <h4 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>PDF Note Upload</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Upload a PDF note and let AI automatically extract the topic, notes, and summary.
              </p>
              <input
                type="file"
                accept="application/pdf"
                id="pdf-file-upload"
                onChange={handlePdfUpload}
                disabled={pdfLoading}
                style={{ display: "none" }}
              />
              <label 
                htmlFor="pdf-file-upload" 
                className={`btn ${pdfLoading ? "btn-secondary" : "btn-primary"}`}
                style={{ cursor: "pointer", display: "inline-flex", margin: "0 auto" }}
              >
                {pdfLoading ? "Extracting..." : "Select PDF Note"}
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

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button id="journal-save" className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : editId ? "Update Entry" : "Save Journal"}
            </button>
            <button className="btn btn-secondary" onClick={generateSummary} disabled={summaryLoading} style={{ gap: "0.4rem" }}>
              <FiCpu /> {summaryLoading ? "Generating..." : "AI Summary"}
            </button>
            {editId && (
              <button className="btn btn-danger" onClick={() => { setEditId(null); setTopic(""); setNotes(""); setSummary(""); }}>
                Cancel Edit
              </button>
            )}
          </div>

          {/* AI Summary Output */}
          {summary && (
            <div className="ai-output mt-4">
              <div style={{ fontWeight: 600, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <FiCpu style={{ color: "var(--accent-purple)" }} /> AI Summary
              </div>
              {summary}
            </div>
          )}
        </div>

        {/* Journal List */}
        <div>
          <div className="flex-between mb-4">
            <h2 style={{ fontWeight: 600, fontSize: "1.15rem" }}>Saved Entries</h2>
            <span className="badge badge-blue">{journals.length} entries</span>
          </div>

          {journals.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><FiBookOpen size={32} /></div>
                <h3>No journal entries yet</h3>
                <p>Write your first entry above to get started</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {journals.map((j) => (
                <div key={j._id} className="card" style={{ borderLeft: `3px solid var(--accent-${j.difficulty === "easy" ? "green" : j.difficulty === "hard" ? "pink" : "blue"})` }}>
                  <div className="flex-between mb-2">
                    <h3 style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>{j.topic}</h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span className={`badge badge-${j.difficulty === "easy" ? "green" : j.difficulty === "hard" ? "pink" : "blue"}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <span className={`dot dot-${j.difficulty}`}></span>
                        {j.difficulty}
                      </span>
                      <span className="badge badge-purple">Rev: {j.revisionCount}</span>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.75rem", lineHeight: 1.6 }}>
                    {j.notes.length > 200 ? j.notes.slice(0, 200) + "..." : j.notes}
                  </p>
                  {(j.tags || []).length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                      {j.tags.map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
                    </div>
                  )}
                  {j.aiSummary && (
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.75rem", fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>
                      AI Summary: {j.aiSummary.slice(0, 150)}...
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(j.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-secondary btn-icon" onClick={() => handleEdit(j)} title="Edit">
                        <FiEdit2 size={14} />
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDelete(j._id)} title="Delete">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}