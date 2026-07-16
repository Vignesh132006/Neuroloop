import { useState, useEffect, useRef } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { FiMessageSquare, FiTrash2, FiSend } from "react-icons/fi"

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
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    api.get("/notes").then((r) => setNotes(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)
    try {
      const history = newMessages.slice(1, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }))
      const res = await api.post("/ai/chat", { message: input.trim(), history, context })
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }])
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I am having trouble connecting right now. Please try again in a moment." }])
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

  const handleSuggestionClick = (promptText) => {
    setInput(promptText)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)
  }

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code style="background:rgba(229,9,20,0.12);padding:0.1em 0.3em;border-radius:4px;font-family:monospace;border:1px solid var(--bd);color:var(--goldl)">$1</code>')
      .replace(/\n/g, "<br/>")
  }

  const suggestions = [
    {
      title: "Socratic Dialogue",
      desc: "Break down a topic using the Socratic method step-by-step.",
      prompt: "Let's explore a topic of my choice. Ask me questions one by one using the Socratic method to test my deep understanding."
    },
    {
      title: "Clarify a Concept",
      desc: "Deeply understand a concept you are struggling with.",
      prompt: "I am struggling to understand the difference between deep learning and machine learning. Help me break it down Socrates-style."
    },
    {
      title: "Spot Logical Gaps",
      desc: "Have Neuro critique your thesis or logic on a topic.",
      prompt: "I have an idea about how spaced repetition prevents memory decay. Let's discuss it, and you point out any flaws in my logic."
    }
  ]

  return (
    <div className="app-layout">
      <style>{`
        .chat-page-wrap {
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          padding-bottom: 24px;
        }
        @media (max-width: 768px) {
          .chat-page-wrap {
            padding-bottom: 24px !important;
          }
          .chat-container-layout {
            height: calc(100vh - 170px);
            height: calc(100dvh - 170px);
          }
        }
        @media (max-width: 600px) {
          .chat-controls {
            flex-direction: column;
            align-items: stretch !important;
            gap: 10px;
          }
          .chat-controls > div {
            flex-direction: column;
            align-items: stretch !important;
            gap: 6px;
          }
          .chat-controls select {
            width: 100% !important;
          }
        }
      `}</style>
      <Sidebar />
      <div className="page-wrap chat-page-wrap fade-in">
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: "1rem" }}>
          <div>
            <div className="page-eyebrow">Interactive Learning</div>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}><FiMessageSquare /> Neuro Chat</h1>
            <p className="page-subtitle">Socratic learning assistant • Deepen your understanding</p>
          </div>
          <div>
            <button className="btn btn-ghost" onClick={clearChat} style={{ display: 'inline-flex', alignItems: 'center', gap: "0.35rem" }}>
              <FiTrash2 /> Clear Chat
            </button>
          </div>
        </div>

        {/* Chat Layout Container */}
        <div className="chat-container-layout">
          {/* Messages scroll area */}
          <div className="chat-messages-area">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-wrapper ${msg.role === "user" ? "user" : "assistant"}`}>
                {msg.role === "assistant" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <div style={{
                      width: "24px", height: "24px",
                      background: "linear-gradient(135deg, var(--gold), #af8f27)",
                      color: "#0d0d0d", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 700,
                    }}>N</div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--gold)" }}>Neuro</span>
                  </div>
                )}
                <div
                  className={`chat-bubble-container ${msg.role === "user" ? "user" : "assistant"}`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}

            {/* Suggestions on Empty / Start State */}
            {messages.length === 1 && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--t2)", fontWeight: 500, marginBottom: "0.5rem" }}>Try one of these Socratic prompts to start:</p>
                <div className="chat-suggestions-grid">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      className="chat-suggestion-item"
                      onClick={() => handleSuggestionClick(s.prompt)}
                    >
                      <strong>{s.title}</strong>
                      <span>{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="chat-bubble-wrapper assistant">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <div style={{
                    width: "24px", height: "24px",
                    background: "linear-gradient(135deg, var(--gold), #af8f27)",
                    color: "#0d0d0d", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 700,
                  }}>N</div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--t2)" }}>Neuro is thinking...</span>
                </div>
                <div className="chat-bubble-container assistant" style={{ padding: "0.75rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "var(--gold)",
                        animation: `glowPulse 1.2s ease-in-out ${delay}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="chat-input-panel">
            <div className="chat-input-row">
              <textarea
                ref={textareaRef}
                id="chat-input"
                className="chat-input-textarea"
                placeholder="Ask Neuro anything... (Shift+Enter for new line, Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
            </div>
            
            <div className="chat-controls">
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--t2)", fontWeight: 500 }}>Select Context Notes:</span>
                <select
                  className="form-select"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  style={{ width: "auto", minWidth: "160px", padding: "6px 12px", fontSize: "0.8rem", height: "32px", background: "var(--s3)" }}
                >
                  <option value="">No Context Notes</option>
                  {notes.map((n) => (
                    <option key={n._id} value={`Topic: ${n.topic}. Notes: ${n.notes.slice(0, 200)}`}>{n.topic}</option>
                  ))}
                </select>
              </div>
              <button
                id="chat-send"
                className="btn btn-gold"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ padding: "0.4rem 1.2rem", display: 'inline-flex', alignItems: 'center', gap: "0.4rem", height: "32px", fontSize: "0.85rem" }}
              >
                <FiSend /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
