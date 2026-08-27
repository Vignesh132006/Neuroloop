import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { FiCalendar, FiPrinter, FiTrash2 } from "react-icons/fi"
import ConfirmDeleteModal from "../components/ConfirmDeleteModal"

export default function StudyPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [planToDelete, setPlanToDelete] = useState(null)

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
            .title { font-size: 1.75rem; font-weight: 700; color: #ff3b30; margin: 0; }
            .meta { font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; }
            .pills { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
            .pill { background-color: #fee2e2; color: #ff3b30; border: 1px solid #f87171; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
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

  const handleDelete = (plan) => {
    setPlanToDelete(plan)
  }

  const confirmDelete = async () => {
    if (!planToDelete) return
    try {
      await api.delete(`/study-plans/${planToDelete._id}`)
      setPlans((prev) => prev.filter((p) => p._id !== planToDelete._id))
      showToast("Study plan deleted")
    } catch (e) {
      console.error(e)
      showToast("Failed to delete study plan", "error")
    } finally {
      setPlanToDelete(null)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="app-layout">
      <style>{`
        .study-plan-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          gap: 12px;
        }
        .study-plan-actions {
          display: flex;
          gap: 0.5rem;
        }
        @media (max-width: 600px) {
          .study-plan-card-header {
            flex-direction: column;
            align-items: stretch;
          }
          .study-plan-actions {
            margin-top: 4px;
            justify-content: flex-start;
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

        <div className="page-header">
          <div className="page-eyebrow" style={{ color: "#E91E8C", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>NeuroLoop</div>
          <h1 className="page-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 700, color: "#1A1A2E", margin: "4px 0" }}>My Study Plans</h1>
          <p className="page-subtitle" style={{ color: "#4A4A6A", fontSize: "14px" }}>Your AI-generated personalized learning roadmaps</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div className="skeleton" style={{ height: "150px", width: "100%", borderRadius: "20px" }} />
          </div>
        ) : plans.length === 0 ? (
          <div style={{ background: "#FFFFFF", border: "1.5px dashed #F9C0D8", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
            <div className="empty-state">
              <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontSize: '2.5rem', marginBottom: '12px' }}><FiCalendar /></div>
              <h3 className="empty-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", color: "#1A1A2E", marginBottom: "6px" }}>No study plans yet</h3>
              <p className="empty-sub" style={{ color: "#4A4A6A", fontSize: "0.9rem" }}>Go to Revision → Weak Topics to generate one.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {plans.map((plan) => (
              <div key={plan._id} style={{ position: "relative", background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px', background: 'linear-gradient(180deg, #E91E8C, #FF6B9D)' }} />
                <div className="study-plan-card-header">
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1.25rem", color: "#1A1A2E", margin: 0 }}>
                    {plan.topic}
                  </h3>

                  {/* Action buttons */}
                  <div className="study-plan-actions">
                    <button
                      onClick={() => downloadPDF(plan)}
                      title="Download PDF"
                      style={{ padding: '8px 18px', borderRadius: "50px", background: "#FFFFFF", border: "1.5px solid #F9C0D8", color: "#E91E8C", fontWeight: 600, fontSize: '0.82rem', cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    ><FiPrinter /> Print</button>
                    <button
                      onClick={() => handleDelete(plan)}
                      title="Delete"
                      style={{ padding: '8px 16px', borderRadius: "50px", background: "none", border: "none", color: '#dc2626', fontWeight: 600, fontSize: '0.82rem', cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    ><FiTrash2 /> Delete</button>
                  </div>
                </div>

                {/* Subtopic pills */}
                {plan.weakSubtopics && plan.weakSubtopics.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                    {plan.weakSubtopics.map((sub, idx) => (
                      <span key={idx} style={{ background: "#FCE4F0", color: "#E91E8C", border: "1px solid #F9C0D8", padding: "3px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 600 }}>{sub}</span>
                    ))}
                  </div>
                )}

                <p style={{ color: "#8888AA", fontSize: "0.8rem", marginBottom: "1rem", fontWeight: 500 }}>
                  Created on {formatDate(plan.createdAt)}
                </p>

                <div className="ai-output" style={{ background: '#FFF0F5', border: '1.5px solid #F9C0D8', borderRadius: '16px', padding: '20px', color: '#4A4A6A', fontSize: '0.9rem' }}>
                  {renderStudyPlan(plan.plan)}
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDeleteModal
          isOpen={!!planToDelete}
          title="Delete Study Plan?"
          message={planToDelete ? `Are you sure you want to delete the study plan for "${planToDelete.topic}"? This action cannot be undone.` : ""}
          onConfirm={confirmDelete}
          onCancel={() => setPlanToDelete(null)}
        />
      </div>
    </div>
  )
}

function renderStudyPlan(planText) {
  if (!planText) return null
  
  const days = planText.split(/(?=DAY \d+)/g).filter(s => s.trim())
  
  if (days.length <= 1) {
    return (
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#4A4A6A', fontSize: '14px' }}>
        {planText}
      </div>
    )
  }

  const mainDays = days.filter(d => d.startsWith('DAY'))
  const footer = planText.split(/OVERALL GOAL:|WEEKLY GOAL:|SUCCESS METRIC:/)[1] || ''

  return (
    <div>
      {mainDays.map((day, i) => {
        const lines = day.trim().split('\n')
        const heading = lines[0] || ''
        const rest = lines.slice(1).join('\n')
        
        return (
          <div key={i} style={{
            marginBottom: '16px',
            background: '#FFFFFF',
            border: '1.5px solid #F9C0D8',
            borderLeft: `4px solid #E91E8C`,
            borderRadius: '16px',
            padding: '18px 20px'
          }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '15px',
              fontWeight: '700',
              color: '#1A1A2E',
              marginBottom: '10px',
              letterSpacing: '0.02em'
            }}>
              {heading}
            </div>
            {rest.split('\n').map((line, j) => {
              if (!line.trim()) return null
              const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-')
              const isLabel = line.includes(':') && !line.startsWith('•') && line.split(':')[0].length < 20
              return (
                <div key={j} style={{
                  fontSize: '13.5px',
                  color: isBullet ? '#4A4A6A' : '#1A1A2E',
                  fontWeight: isLabel ? '600' : '400',
                  marginBottom: '4px',
                  paddingLeft: isBullet ? '8px' : '0',
                  lineHeight: 1.6
                }}>
                  {line.trim()}
                </div>
              )
            })}
          </div>
        )
      })}
      {footer && (
        <div style={{
          background: '#FCE4F0',
          border: '1.5px solid #F9C0D8',
          borderRadius: '16px',
          padding: '16px 20px',
          fontSize: '14px',
          color: '#E91E8C',
          marginTop: '12px',
          fontWeight: '600'
        }}>
          <span style={{ fontWeight: '700', color: '#1A1A2E' }}>🎯 Overall Goal: </span>
          {footer.split('\n')[0]?.trim()}
        </div>
      )}
    </div>
  )
}
