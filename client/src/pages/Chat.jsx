import { useState, useEffect, useRef } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { FiTrash2, FiSend } from "react-icons/fi"

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${user?.name?.split(" ")[0] || ""}. I am Neuro, your AI study companion.\n\nI use the Socratic method to help you understand concepts deeply rather than simply memorising them. Ask me anything — a topic you are struggling with, want to explore deeper, or need explained differently.\n\nWhat would you like to discuss today?`,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState("")
  const [notes, setNotes] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    api.get("/notes").then((r) => setNotes(r.data)).catch(() => {})
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      // Build history for API (exclude the initial greeting for brevity)
      const history = newMessages.slice(1, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }))

      const res = await api.post("/ai/chat", {
        message: input.trim(),
        history,
        context,
      })

      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I am having trouble connecting right now. Please try again in a moment." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: `Chat cleared. I am ready to explore new topics with you. What would you like to cover?`,
    }])
  }

  const formatMessage = (content) => {
    // Basic markdown-like rendering
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code style="background:var(--bg-secondary);padding:0.1em 0.3em;border-radius:4px;font-family:monospace;border:1px solid var(--border)">$1</code>')
      .replace(/\n/g, "<br/>")
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 0px)", padding: "2rem 3rem" }}>
        {/* Header */}
        <div className="flex-between mb-4">
          <div>
            <h1 className="page-title">Neuro AI Tutor</h1>
            <p className="page-subtitle">Socratic learning assistant • Ask anything</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select
              className="form-select"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              style={{ width: "auto", minWidth: "180px" }}
            >
              <option value="">No context</option>
              {notes.map((n) => (
                <option key={n._id} value={`Topic: ${n.topic}. Notes: ${n.notes.slice(0, 200)}`}>
                  {n.topic}
                </option>
              ))}
            </select>
            <button className="btn btn-secondary" onClick={clearChat} title="Clear chat" style={{ gap: "0.35rem" }}>
              <FiTrash2 /> Clear
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1rem",
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <div style={{
                    width: "28px", height: "28px",
                    background: "var(--accent-blue)",
                    color: "#ffffff",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 700,
                  }}>N</div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-blue)" }}>Neuro</span>
                </div>
              )}
              <div
                className={`chat-bubble ${msg.role === "user" ? "user" : "assistant"}`}
                style={{ animation: "fadeIn 0.3s ease" }}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "28px", height: "28px",
                background: "var(--accent-blue)",
                color: "#ffffff",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", fontWeight: 700,
              }}>N</div>
              <div className="chat-bubble assistant">
                <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div key={i} style={{
                      width: "6px", height: "6px",
                      borderRadius: "50%",
                      background: "var(--text-muted)",
                      animation: `spin 1.2s ease-in-out ${delay}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "0.75rem",
        }}>
          <textarea
            id="chat-input"
            className="form-textarea"
            placeholder="Ask Neuro anything... (Shift+Enter for new line, Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{ flex: 1, minHeight: "unset", resize: "none", border: "none", background: "transparent", padding: "0.25rem 0.5rem" }}
          />
          <button
            id="chat-send"
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{ alignSelf: "flex-end", padding: "0.625rem 1.25rem", gap: "0.35rem" }}
          >
            <FiSend /> Send
          </button>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
          Neuro uses the Socratic method to guide deep understanding
        </p>
      </main>
    </div>
  )
}
