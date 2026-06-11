import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { FiTrash2, FiBookOpen, FiDownload } from "react-icons/fi"

export default function StudyPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await api.get("/study-plans")
      setPlans(res.data)
    } catch (e) {
      console.error(e)
      showToast("Failed to fetch study plans", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const downloadPDF = (plan) => {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>Study Plan - ${plan.topic}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1f2937;
              line-height: 1.6;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 1rem;
              margin-bottom: 1.5rem;
            }
            .title {
              font-size: 1.75rem;
              font-weight: 700;
              color: #4f46e5;
              margin: 0;
            }
            .meta {
              font-size: 0.875rem;
              color: #6b7280;
              margin-top: 0.5rem;
            }
            .pills {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
              margin: 1rem 0;
            }
            .pill {
              background-color: #ffedd5;
              color: #ea580c;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 600;
            }
            .content {
              white-space: pre-wrap;
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 1.5rem;
              font-size: 0.95rem;
            }
            @media print {
              body {
                padding: 0;
              }
              .content {
                border: none;
                background-color: transparent;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">NeuroLoop Study Plan</h1>
            <div class="meta">Topic: <strong>${plan.topic}</strong> &middot; Created on ${formatDate(plan.createdAt)}</div>
            ${plan.weakSubtopics && plan.weakSubtopics.length > 0 ? `
              <div class="pills">
                ${plan.weakSubtopics.map(sub => `<span class="pill">${sub}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          <div class="content">${plan.plan}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this study plan?")) return
    try {
      await api.delete(`/study-plans/${id}`)
      setPlans((prev) => prev.filter((p) => p._id !== id))
      showToast("Study plan deleted")
    } catch (e) {
      console.error(e)
      showToast("Failed to delete study plan", "error")
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {toast && (
          <div
            className={`alert alert-${toast.type}`}
            style={{
              position: "fixed",
              top: "1.5rem",
              right: "1.5rem",
              zIndex: 9999,
              maxWidth: "360px",
            }}
          >
            {toast.msg}
          </div>
        )}

        <div className="page-header">
          <h1 className="page-title">My Study Plans</h1>
          <p className="page-subtitle">Your AI-generated personalized learning roadmaps</p>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Loading study plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiBookOpen size={32} />
              </div>
              <h3>No study plans yet.</h3>
              <p>Go to Weak Topics to generate one.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="card"
                style={{
                  position: "relative",
                  borderLeft: "4px solid var(--accent-purple)",
                }}
              >
                {/* Download Button top-right */}
                <button
                  className="btn btn-primary"
                  onClick={() => downloadPDF(plan)}
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    right: "3.25rem",
                    padding: "0.4rem",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Download PDF"
                >
                  <FiDownload size={16} />
                </button>

                {/* Delete Button top-right */}
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(plan._id)}
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    right: "1.25rem",
                    padding: "0.4rem",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Delete Study Plan"
                >
                  <FiTrash2 size={16} />
                </button>

                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    color: "var(--text-primary)",
                    marginRight: "5.5rem",
                  }}
                >
                  {plan.topic}
                </h3>

                {/* Subtopic pills */}
                {plan.weakSubtopics && plan.weakSubtopics.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.4rem",
                      marginTop: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {plan.weakSubtopics.map((sub, idx) => (
                      <span
                        key={idx}
                        className="badge"
                        style={{
                          backgroundColor: "rgba(249, 115, 22, 0.15)",
                          color: "rgb(249, 115, 22)",
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "9999px",
                        }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date Created */}
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    marginBottom: "1rem",
                  }}
                >
                  Created on {formatDate(plan.createdAt)}
                </p>

                {/* Plan Text */}
                <div
                  className="ai-output"
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--bg-secondary)",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                >
                  {plan.plan}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
