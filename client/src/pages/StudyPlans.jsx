import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { FiCalendar, FiPrinter, FiTrash2 } from "react-icons/fi"

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

  useEffect(() => { fetchPlans() }, [])

  const downloadPDF = (plan) => {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>Study Plan - ${plan.topic}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #1f2937; line-height: 1.6; padding: 2rem;
              max-width: 800px; margin: 0 auto;
            }
            .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem; }
            .title { font-size: 1.75rem; font-weight: 700; color: #d4af37; margin: 0; }
            .meta { font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; }
            .pills { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
            .pill { background-color: #fef3c7; color: #d4af37; border: 1px solid #f59e0b; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
            .content { white-space: pre-wrap; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; font-size: 0.95rem; }
            @media print { body { padding: 0; } .content { border: none; background: transparent; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">NeuroLoop Study Plan</h1>
            <div class="meta">Topic: <strong>${plan.topic}</strong> &middot; Created on ${formatDate(plan.createdAt)}</div>
            ${plan.weakSubtopics && plan.weakSubtopics.length > 0 ? `
              <div class="pills">${plan.weakSubtopics.map(sub => `<span class="pill">${sub}</span>`).join('')}</div>
            ` : ''}
          </div>
          <div class="content">${plan.plan}</div>
          <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };</script>
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
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
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

        <div className="page-header">
          <div className="page-eyebrow">NeuroLoop</div>
          <h1 className="page-title">My Study Plans</h1>
          <p className="page-subtitle">Your AI-generated personalized learning roadmaps</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div className="skeleton" style={{ height: "150px", width: "100%" }} />
          </div>
        ) : plans.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiCalendar /></div>
              <h3 className="empty-title">No study plans yet</h3>
              <p className="empty-sub">Go to Revision → Weak Topics to generate one.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {plans.map((plan) => (
              <div key={plan._id} className="card" style={{ position: "relative" }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold)' }} />
                {/* Action buttons */}
                <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn-outline"
                    onClick={() => downloadPDF(plan)}
                    title="Download PDF"
                    style={{ padding: '6px 10px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  ><FiPrinter /> Print</button>
                  <button
                    className="btn-ghost"
                    onClick={() => handleDelete(plan._id)}
                    title="Delete"
                    style={{ padding: '6px 10px', fontSize: '0.82rem', color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  ><FiTrash2 /> Delete</button>
                </div>

                <h3 style={{ fontWeight: 600, fontSize: "1.15rem", color: "var(--t1)", marginRight: "8rem" }}>
                  {plan.topic}
                </h3>

                {/* Subtopic pills */}
                {plan.weakSubtopics && plan.weakSubtopics.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                    {plan.weakSubtopics.map((sub, idx) => (
                      <span key={idx} className="badge badge-gold">{sub}</span>
                    ))}
                  </div>
                )}

                <p style={{ color: "var(--t3)", fontSize: "0.78rem", marginBottom: "1rem" }}>
                  Created on {formatDate(plan.createdAt)}
                </p>

                <div className="ai-output" style={{ background: 'var(--s2)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: '0.88rem' }}>
                  {plan.plan}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
