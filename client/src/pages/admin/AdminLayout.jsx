import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/users', icon: '👥', label: 'Users' },
  { path: '/admin/tickets', icon: '🎧', label: 'Support Tickets' },
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes adminSideFade {
          from { opacity: 0; transform: translateX(-15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes adminContentFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-sidebar {
          animation: adminSideFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .admin-content-outlet {
          animation: adminContentFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          margin-bottom: 4px;
          color: #a09880;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.25s ease;
          border-left: 2px solid transparent;
        }
        .admin-nav-item:hover {
          color: #f5f0e8;
          background: rgba(255, 255, 255, 0.02);
        }
        .admin-nav-item.active {
          background: rgba(255, 59, 48, 0.08);
          border-left: 2px solid #ff3b30;
          color: #ff3b30;
          font-weight: 600;
        }
        .admin-logout-btn {
          width: 100%;
          padding: 9px 12px;
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 13px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.25s ease;
        }
        .admin-logout-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.25);
          color: #ffffff;
        }
      `}</style>

      {/* Sidebar */}
      <div className="admin-sidebar" style={{
        width: '240px', flexShrink: 0,
        background: '#0d0d0d',
        borderRight: '1px solid rgba(255,59,48,0.08)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 14px',
        position: 'fixed', height: '100vh', top: 0, left: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff3b30, #a3151a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              color: '#ffffff', boxShadow: '0 4px 10px rgba(255,59,48,0.2)'
            }}>🛡️</div>
            <div>
              <div style={{ color: '#f5f0e8', fontSize: '14px', fontWeight: '700', fontFamily: "'DM Serif Display', serif" }}>Admin Panel</div>
              <div style={{ color: '#a09880', fontSize: '11px', letterSpacing: '0.05em' }}>NEUROLOOP</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <div key={item.path}
              onClick={() => navigate(item.path)}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div style={{ padding: '0 8px 14px' }}>
            <div style={{ color: '#f5f0e8', fontSize: '12px', fontWeight: '500', wordBreak: 'break-all' }}>{admin?.email}</div>
            <div style={{ color: '#5a5040', fontSize: '11px', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrator</div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-content-outlet" style={{ marginLeft: '240px', flex: 1, padding: '40px', maxWidth: 'calc(100vw - 240px)', boxSizing: 'border-box' }}>
        <Outlet />
      </div>
    </div>
  )
}
