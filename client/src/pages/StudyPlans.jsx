import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { FiTrash2, FiBookOpen } from "react-icons/fi"

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
                    marginRight: "2.5rem",
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
