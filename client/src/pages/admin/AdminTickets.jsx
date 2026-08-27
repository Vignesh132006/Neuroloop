import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const adminApi = () => axios.create({
  baseURL: API,
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` }
})

const STATUS_COLORS = {
  open: { bg: '#FCE4F0', color: '#E91E8C', border: '#F9C0D8' },
  'in-progress': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  resolved: { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  closed: { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' }
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('user') || '{}')
  const isFullAdmin = adminUser.role === 'admin'

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
          padding: 8px 18px;
          border-radius: 50px;
          fontSize: 13px;
          fontWeight: 600;
          cursor: pointer;
          border: 1.5px solid #F9C0D8;
          background: #FFFFFF;
          color: #E91E8C;
          transition: all 0.2s;
        }
        .admin-filter-btn:hover {
          color: #E91E8C;
          border-color: #E91E8C;
          background: #FCE4F0;
        }
        .admin-filter-btn.active {
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(233, 30, 140, 0.25);
        }
        .admin-ticket-card {
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 20px;
          padding: 20px 24px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          animation: adminFadeInUp 0.5s ease both;
          box-shadow: 0 4px 24px rgba(233, 30, 140, 0.06);
        }
        .admin-ticket-card:hover {
          border-color: #E91E8C;
          background: #FFF0F5;
          box-shadow: 0 8px 28px rgba(233, 30, 140, 0.12);
          transform: translateY(-2px);
        }
        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 240, 245, 0.6);
          backdrop-filter: blur(6px);
          zIndex: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-modal-content {
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 24px;
          padding: 32px;
          max-width: 580px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 12px 40px rgba(233, 30, 140, 0.12);
          animation: adminModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .admin-modal-close {
          background: #FCE4F0;
          border: 1px solid #F9C0D8;
          border-radius: 50%;
          color: #E91E8C;
          width: 32px;
          height: 32px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .admin-modal-close:hover {
          background: #E91E8C;
          color: #ffffff;
        }
        .admin-status-option {
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-ticket-delete-btn {
          width: 100%;
          padding: 12px;
          background: #FFFFFF;
          border: 1.5px solid #FECACA;
          border-radius: 50px;
          color: #DC2626;
          font-size: 13px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-ticket-delete-btn:hover {
          background: #DC2626;
          color: #ffffff;
        }
      `}</style>

      <div className="admin-tickets-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#1A1A2E', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', fontFamily: "'Playfair Display', Georgia, serif" }}>Support Tickets</h1>
          <p style={{ color: '#4A4A6A', fontSize: '13px', margin: 0 }}>{tickets.length} tickets</p>
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

      <div style={{ display: 'grid', gap: '14px' }}>
        {loading ? <div style={{ color: '#8888AA', textAlign: 'center', padding: '40px', fontSize: '13px', fontWeight: 600 }}>Loading tickets data...</div>
        : tickets.length === 0 ? <div style={{ color: '#8888AA', textAlign: 'center', padding: '40px', fontSize: '13px', fontWeight: 600 }}>No tickets found</div>
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
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#8888AA', fontWeight: '600' }}>{ticket.ticketId}</span>
                    <span style={{
                      padding: '3px 12px', borderRadius: '50px', fontSize: '10.5px', fontWeight: '700',
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>{ticket.status}</span>
                    <span style={{ fontSize: '12px', color: '#8888AA', fontWeight: '500' }}>
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div style={{ color: '#1A1A2E', fontSize: '15px', fontWeight: '700', marginBottom: '6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {ticket.subject}
                  </div>
                  <div style={{ color: '#4A4A6A', fontSize: '13px' }}>
                    From: <span style={{ fontWeight: '600', color: '#1A1A2E' }}>{ticket.userName}</span> ({ticket.userEmail || ticket.user?.email})
                  </div>
                </div>
                <div style={{ fontSize: '22px', color: '#E91E8C', marginLeft: '12px', fontWeight: 700 }}>›</div>
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
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#8888AA', fontWeight: '600', marginBottom: '4px' }}>
                  {selected.ticketId}
                </div>
                <h2 style={{ color: '#1A1A2E', fontSize: '22px', fontWeight: '700', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {selected.subject}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} className="admin-modal-close">✕</button>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '700',
                background: '#FCE4F0', color: '#E91E8C', border: '1px solid #F9C0D8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selected.category}
              </span>
              <span style={{ padding: '4px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '700',
                background: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.color,
                border: `1px solid ${STATUS_COLORS[selected.status]?.border}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selected.status}
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#8888AA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>From</div>
              <div style={{ color: '#1A1A2E', fontSize: '14px', fontWeight: 600 }}>
                {selected.userName} — <span style={{ color: '#E91E8C', fontWeight: '600' }}>{selected.userEmail || selected.user?.email}</span>
              </div>
            </div>

            <div style={{ background: '#FFF0F5', border: '1.5px solid #F9C0D8', borderRadius: '16px', padding: '18px', marginBottom: '24px' }}>
              <div style={{ color: '#8888AA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Message</div>
              <p style={{ color: '#4A4A6A', fontSize: '14px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#8888AA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Update Status</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['open', 'in-progress', 'resolved', 'closed'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    className="admin-status-option"
                    style={{
                      border: `1.5px solid ${STATUS_COLORS[s]?.border}`,
                      background: selected.status === s ? STATUS_COLORS[s]?.bg : '#FFFFFF',
                      color: STATUS_COLORS[s]?.color
                    }}>{s.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {isFullAdmin && (
              <button onClick={() => deleteTicket(selected._id)} className="admin-ticket-delete-btn">
                🗑️ Delete Ticket
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
