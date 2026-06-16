import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const adminApi = () => axios.create({
  baseURL: API,
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
})

const STATUS_COLORS = {
  open: { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: 'rgba(59,130,246,0.2)' },
  'in-progress': { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.2)' },
  resolved: { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },
  closed: { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.2)' }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Support Tickets</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{tickets.length} tickets</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['', 'open', 'in-progress', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                fontWeight: '500', cursor: 'pointer', border: 'none',
                background: filter === s ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.06)',
                color: filter === s ? 'white' : '#94a3b8'
              }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        {loading ? <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading...</div>
        : tickets.length === 0 ? <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No tickets found</div>
        : tickets.map(ticket => {
          const sc = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
          return (
            <div key={ticket._id}
              onClick={() => setSelected(ticket)}
              style={{
                background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '16px 20px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = '#16161f' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#111118' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>{ticket.ticketId}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                    }}>{ticket.status}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    {ticket.subject}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>
                    From: {ticket.userName} ({ticket.userEmail || ticket.user?.email})
                  </div>
                </div>
                <div style={{ fontSize: '20px', marginLeft: '12px' }}>›</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ticket Detail Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '32px',
            maxWidth: '560px', width: '90%', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  {selected.ticketId}
                </div>
                <h2 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {selected.subject}
                </h2>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                {selected.category}
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                background: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.color,
                border: `1px solid ${STATUS_COLORS[selected.status]?.border}` }}>
                {selected.status}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>From</div>
              <div style={{ color: '#f1f5f9', fontSize: '13px' }}>
                {selected.userName} — <span style={{ color: '#67e8f9' }}>{selected.userEmail || selected.user?.email}</span>
              </div>
            </div>

            <div style={{ background: '#0d0d14', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>Message</div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>Update Status</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['open', 'in-progress', 'resolved', 'closed'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                      fontWeight: '500', cursor: 'pointer',
                      border: `1px solid ${STATUS_COLORS[s]?.border}`,
                      background: selected.status === s ? STATUS_COLORS[s]?.bg : 'transparent',
                      color: STATUS_COLORS[s]?.color
                    }}>{s}</button>
                ))}
              </div>
            </div>

            <button onClick={() => deleteTicket(selected._id)}
              style={{
                width: '100%', padding: '10px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', color: '#fca5a5',
                fontSize: '13px', cursor: 'pointer', fontWeight: '500'
              }}>
              🗑️ Delete Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
