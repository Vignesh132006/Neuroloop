import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const adminApi = () => axios.create({
  baseURL: API,
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
})

const STATUS_COLORS = {
  open: { bg: 'rgba(229,9,20,0.08)', color: '#e50914', border: 'rgba(229,9,20,0.2)' },
  'in-progress': { bg: 'rgba(245,158,11,0.08)', color: '#fcd34d', border: 'rgba(245,158,11,0.2)' },
  resolved: { bg: 'rgba(16,185,129,0.08)', color: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },
  closed: { bg: 'rgba(100,116,139,0.08)', color: '#94a3b8', border: 'rgba(100,116,139,0.2)' }
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await adminApi().get(`/api/admin/tickets${filter ? `?status=${filter}` : ''}`)
      setTickets(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTickets() }, [filter])

  const updateStatus = async (id, status) => {
    try {
      await adminApi().put(`/api/admin/tickets/${id}`, { status })
      fetchTickets()
      setSelected(null)
    } catch (err) { alert('Update failed') }
  }

  const deleteTicket = async (id) => {
    if (!confirm('Delete this ticket permanently?')) return
    try {
      await adminApi().delete(`/api/admin/tickets/${id}`)
      fetchTickets()
      setSelected(null)
    } catch (err) { alert('Delete failed') }
  }

  return (
    <div>
      <style>{`
        @keyframes adminFadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminModalIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .admin-tickets-header {
          animation: adminFadeInUp 0.4s ease both;
        }
        .admin-filter-btn {
          padding: 6px 14px;
          border-radius: 8px;
          fontSize: 12px;
          fontWeight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: #a09880;
          transition: all 0.2s;
        }
        .admin-filter-btn:hover {
          color: #f5f0e8;
          border-color: rgba(229,9,20,0.2);
        }
        .admin-filter-btn.active {
          background: linear-gradient(135deg, #e50914, #99060d);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 10px rgba(229,9,20,0.2);
        }
        .admin-ticket-card {
          background: #0d0d0d;
          border: 1px solid rgba(229, 9, 20, 0.08);
          border-radius: 14px;
          padding: 18px 22px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          animation: adminFadeInUp 0.5s ease both;
        }
        .admin-ticket-card:hover {
          border-color: rgba(229,9,20,0.35);
          background: #111111;
          box-shadow: 0 8px 24px rgba(229,9,20,0.05);
          transform: translateY(-2px);
        }
        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          zIndex: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-modal-content {
          background: #0d0d0d;
          border: 1px solid rgba(229, 9, 20, 0.15);
          border-radius: 20px;
          padding: 32px;
          max-width: 560px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(229,9,20,0.05);
          animation: adminModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .admin-modal-close {
          background: transparent;
          border: none;
          color: #a09880;
          font-size: 22px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .admin-modal-close:hover {
          color: #f5f0e8;
        }
        .admin-status-option {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-ticket-delete-btn {
          width: 100%;
          padding: 10px;
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 13px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-ticket-delete-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ffffff;
        }
      `}</style>

      <div className="admin-tickets-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#f5f0e8', fontSize: '24px', fontWeight: '400', margin: '0 0 4px', fontFamily: "'DM Serif Display', serif" }}>Support Tickets</h1>
          <p style={{ color: '#a09880', fontSize: '13px', margin: 0 }}>{tickets.length} tickets</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['', 'open', 'in-progress', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`admin-filter-btn ${filter === s ? 'active' : ''}`}>
              {s ? (s.charAt(0).toUpperCase() + s.slice(1)) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {loading ? <div style={{ color: '#a09880', textAlign: 'center', padding: '40px', fontSize: '13px' }}>Loading tickets data...</div>
        : tickets.length === 0 ? <div style={{ color: '#a09880', textAlign: 'center', padding: '40px', fontSize: '13px' }}>No tickets found</div>
        : tickets.map((ticket, i) => {
          const sc = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
          return (
            <div key={ticket._id}
              onClick={() => setSelected(ticket)}
              className="admin-ticket-card"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#5a5040', fontWeight: '600' }}>{ticket.ticketId}</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>{ticket.status}</span>
                    <span style={{ fontSize: '11px', color: '#5a5040', fontWeight: '500' }}>
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div style={{ color: '#f5f0e8', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    {ticket.subject}
                  </div>
                  <div style={{ color: '#a09880', fontSize: '12px' }}>
                    From: <span style={{ fontWeight: '500', color: '#f5f0e8' }}>{ticket.userName}</span> ({ticket.userEmail || ticket.user?.email})
                  </div>
                </div>
                <div style={{ fontSize: '20px', color: '#e50914', marginLeft: '12px' }}>›</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ticket Detail Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} className="admin-modal-overlay">
          <div onClick={e => e.stopPropagation()} className="admin-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#5a5040', fontWeight: '600', marginBottom: '4px' }}>
                  {selected.ticketId}
                </div>
                <h2 style={{ color: '#f5f0e8', fontSize: '20px', fontWeight: '400', margin: 0, fontFamily: "'DM Serif Display', serif" }}>
                  {selected.subject}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} className="admin-modal-close">✕</button>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                background: 'rgba(229,9,20,0.08)', color: '#e50914', border: '1px solid rgba(229,9,20,0.2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selected.category}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                background: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.color,
                border: `1px solid ${STATUS_COLORS[selected.status]?.border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selected.status}
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#5a5040', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>From</div>
              <div style={{ color: '#f5f0e8', fontSize: '13px' }}>
                {selected.userName} — <span style={{ color: '#e50914', fontWeight: '500' }}>{selected.userEmail || selected.user?.email}</span>
              </div>
            </div>

            <div style={{ background: '#070707', border: '1px solid rgba(229,9,20,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ color: '#5a5040', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Message</div>
              <p style={{ color: '#a09880', fontSize: '13px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#5a5040', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Update Status</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['open', 'in-progress', 'resolved', 'closed'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    className="admin-status-option"
                    style={{
                      border: `1px solid ${STATUS_COLORS[s]?.border}`,
                      background: selected.status === s ? STATUS_COLORS[s]?.bg : 'rgba(255,255,255,0.02)',
                      color: STATUS_COLORS[s]?.color
                    }}>{s.toUpperCase()}</button>
                ))}
              </div>
            </div>

            <button onClick={() => deleteTicket(selected._id)} className="admin-ticket-delete-btn">
              🗑️ Delete Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
