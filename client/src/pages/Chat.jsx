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
      .replace(/`(.*?)`/g, '<code style="background:#FFFFFF;padding:0.2em 0.4em;border-radius:6px;font-family:monospace;border:1px solid #F9C0D8;color:#E91E8C;font-size:0.85em;">$1</code>')
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
        .chat-container-layout {
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(233, 30, 140, 0.08);
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        .chat-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        .chat-bubble-wrapper.user {
          align-self: flex-end;
          align-items: flex-end;
        }
        .chat-bubble-wrapper.assistant {
          align-self: flex-start;
          align-items: flex-start;
        }
        .chat-bubble-container.user {
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          color: #ffffff;
          border-radius: 20px 20px 4px 20px;
          padding: 14px 18px;
          font-size: 0.92rem;
          line-height: 1.6;
          box-shadow: 0 4px 14px rgba(233, 30, 140, 0.2);
        }
        .chat-bubble-container.assistant {
          background: #FCE4F0;
          color: #1A1A2E;
          border: 1.5px solid #F9C0D8;
          border-radius: 20px 20px 20px 4px;
          padding: 14px 18px;
          font-size: 0.92rem;
          line-height: 1.6;
        }
        .chat-suggestions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 8px;
        }
        @media (max-width: 768px) {
          .chat-suggestions-grid {
            grid-template-columns: 1fr;
          }
        }
        .chat-suggestion-item {
          background: #FFF0F5;
          border: 1.5px solid #F9C0D8;
          border-radius: 16px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chat-suggestion-item:hover {
          border-color: #E91E8C;
          background: #FCE4F0;
        }
        .chat-suggestion-item strong {
          display: block;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.95rem;
          color: #1A1A2E;
          margin-bottom: 4px;
        }
        .chat-suggestion-item span {
          font-size: 0.8rem;
          color: #4A4A6A;
          line-height: 1.4;
          display: block;
        }
        .chat-input-panel {
          padding: 16px 20px;
          border-top: 1.5px solid #F9C0D8;
          background: #FFFFFF;
        }
        .chat-input-textarea {
          width: 100%;
          border: 1.5px solid #F9C0D8;
          border-radius: 20px;
          padding: 12px 18px;
          font-family: inherit;
          font-size: 0.92rem;
          color: #1A1A2E;
          background: #FFFFFF;
          outline: none;
          resize: none;
          min-height: 48px;
          transition: border-color 0.2s;
        }
        .chat-input-textarea:focus {
          border-color: #E91E8C;
        }
        .chat-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
      `}</style>
      <Sidebar />
      <div className="page-wrap chat-page-wrap fade-in">
        {/* Header */}
        <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <div className="page-eyebrow" style={{ color: "#E91E8C", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Interactive Learning</div>
            <h1 className="page-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#1A1A2E", display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}><FiMessageSquare style={{ color: "#E91E8C" }} /> Neuro Chat</h1>
            <p className="page-subtitle" style={{ color: "#4A4A6A", fontSize: "14px" }}>Socratic learning assistant • Deepen your understanding</p>
          </div>
          <div>
            <button onClick={clearChat} style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", color: "#E91E8C", padding: "8px 18px", borderRadius: "50px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: "6px" }}>
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
                      width: "26px", height: "26px",
                      background: "linear-gradient(135deg, #E91E8C, #FF6B9D)",
                      color: "#ffffff", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 700,
                    }}>N</div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#E91E8C" }}>Neuro</span>
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
                <p style={{ fontSize: "0.85rem", color: "#8888AA", fontWeight: 600, marginBottom: "0.75rem" }}>Try one of these Socratic prompts to start:</p>
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
                    width: "26px", height: "26px",
                    background: "linear-gradient(135deg, #E91E8C, #FF6B9D)",
                    color: "#ffffff", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}>N</div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#8888AA" }}>Neuro is thinking...</span>
                </div>
                <div className="chat-bubble-container assistant" style={{ padding: "0.75rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "#E91E8C",
                        animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
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
                <span style={{ fontSize: "0.78rem", color: "#8888AA", fontWeight: 600 }}>Select Context Notes:</span>
                <select
                  className="form-select"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  style={{ width: "auto", minWidth: "160px", padding: "6px 14px", fontSize: "0.82rem", height: "36px", background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "50px", color: "#1A1A2E" }}
                >
                  <option value="">No Context Notes</option>
                  {notes.map((n) => (
                    <option key={n._id} value={`Topic: ${n.topic}. Notes: ${n.notes.slice(0, 200)}`}>{n.topic}</option>
                  ))}
                </select>
              </div>
              <button
                id="chat-send"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ padding: "8px 24px", borderRadius: "50px", background: "linear-gradient(135deg, #E91E8C, #FF6B9D)", border: "none", color: "#ffffff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: "6px", boxShadow: "0 4px 14px rgba(233, 30, 140, 0.25)", opacity: (loading || !input.trim()) ? 0.55 : 1 }}
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
