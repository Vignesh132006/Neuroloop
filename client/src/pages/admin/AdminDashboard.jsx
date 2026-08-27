import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const adminApi = () => axios.create({
  baseURL: API,
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` }
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
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#E91E8C', sub: `+${stats.newUsersWeek} this week` },
    { label: 'Active (7 days)', value: stats.activeUsers, icon: '🟢', color: '#10B981', sub: `${stats.todayUsers} joined today` },
    { label: 'Total Notes', value: stats.totalNotes, icon: '📝', color: '#3B82F6', sub: 'Across all users' },
    { label: 'Quizzes Taken', value: stats.totalQuizzes, icon: '🧠', color: '#F59E0B', sub: `Avg score: ${stats.avgQuizScore}%` },
    { label: 'Study Plans', value: stats.totalStudyPlans, icon: '📋', color: '#8B5CF6', sub: 'AI generated' },
    { label: 'Open Tickets', value: stats.openTickets, icon: '🎧', color: stats.openTickets > 0 ? '#EF4444' : '#10B981', sub: `${stats.totalSupportTickets} total tickets` },
  ] : []

  if (loading) return (
    <div style={{ color: '#8888AA', textAlign: 'center', paddingTop: '80px', fontSize: '14px', letterSpacing: '0.05em', fontWeight: 600 }}>
      Loading stats...
    </div>
  )

  return (
    <div>
      <style>{`
        @keyframes adminFadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-dashboard-title {
          animation: adminFadeInUp 0.5s ease both;
        }
        .admin-stat-card {
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          animation: adminFadeInUp 0.5s ease both;
          box-shadow: 0 4px 24px rgba(233, 30, 140, 0.06);
        }
        .admin-stat-card:hover {
          transform: translateY(-4px);
          border-color: #E91E8C;
          box-shadow: 0 8px 28px rgba(233, 30, 140, 0.12);
        }
      `}</style>

      <div className="admin-dashboard-title" style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#1A1A2E', fontSize: '28px', fontWeight: '700', margin: '0 0 6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#4A4A6A', fontSize: '14px', margin: 0 }}>
          NeuroLoop platform overview
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, i) => (
          <div key={i} className="admin-stat-card" style={{
            borderTop: `3px solid ${card.color}`,
            animationDelay: `${i * 0.08}s`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: '0.08em', color: '#8888AA' }}>{card.label}</span>
              <span style={{ fontSize: '24px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: card.color, marginBottom: '6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: '#4A4A6A', fontWeight: '500' }}>{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
