import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/users', icon: '👥', label: 'Users' },
  { path: '/admin/tickets', icon: '🎧', label: 'Support Tickets' },
  { path: '/admin/activity', icon: '⚡', label: 'Recent Activity' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')
    if (!token || !user) { navigate('/admin/login'); return }
    setAdmin(JSON.parse(user))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050508', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <div style={{
        width: '220px', flexShrink: 0,
        background: '#0d0d14',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 12px',
        position: 'fixed', height: '100vh', top: 0, left: 0
      }}>
        <div style={{ padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
            }}>🛡️</div>
            <div>
              <div style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600' }}>Admin Panel</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>NeuroLoop</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <div key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                marginBottom: '2px',
                background: location.pathname === item.path
                  ? 'rgba(124,58,237,0.12)' : 'transparent',
                borderLeft: location.pathname === item.path
                  ? '2px solid #7c3aed' : '2px solid transparent',
                color: location.pathname === item.path ? '#a78bfa' : '#94a3b8',
                fontSize: '13px', fontWeight: '500'
              }}>
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
          <div style={{ padding: '0 8px 12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>{admin?.email}</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>Administrator</div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px 12px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '8px', color: '#fca5a5',
            fontSize: '13px', cursor: 'pointer', fontWeight: '500'
          }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '220px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 220px)' }}>
        <Outlet />
      </div>
    </div>
  )
}
