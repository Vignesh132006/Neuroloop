import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const adminApi = () => axios.create({
  baseURL: API,
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
})

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi().get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#7c3aed', sub: `+${stats.newUsersWeek} this week` },
    { label: 'Active (7 days)', value: stats.activeUsers, icon: '🟢', color: '#10b981', sub: `${stats.todayUsers} joined today` },
    { label: 'Total Notes', value: stats.totalNotes, icon: '📝', color: '#2563eb', sub: 'Across all users' },
    { label: 'Quizzes Taken', value: stats.totalQuizzes, icon: '🧠', color: '#d97706', sub: `Avg score: ${stats.avgQuizScore}%` },
    { label: 'Study Plans', value: stats.totalStudyPlans, icon: '📋', color: '#06b6d4', sub: 'AI generated' },
    { label: 'Open Tickets', value: stats.openTickets, icon: '🎧', color: stats.openTickets > 0 ? '#ef4444' : '#10b981', sub: `${stats.totalSupportTickets} total tickets` },
  ] : []

  if (loading) return (
    <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '80px' }}>
      Loading stats...
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '600', margin: '0 0 4px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          NeuroLoop platform overview
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '20px',
            borderTop: `2px solid ${card.color}`,
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#64748b' }}>{card.label}</span>
              <span style={{ fontSize: '22px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: card.color, marginBottom: '4px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
