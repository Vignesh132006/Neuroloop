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
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
    const user = localStorage.getItem('adminUser') || localStorage.getItem('user')
    if (!token || !user) { navigate('/login'); return }
    try {
      const parsed = JSON.parse(user)
      if (!['admin', 'subadmin'].includes(parsed.role)) {
        navigate('/login')
        return
      }
      setAdmin(parsed)
    } catch (e) {
      navigate('/login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFF0F5', fontFamily: 'Inter, sans-serif' }}>
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
          padding: 12px 16px;
          border-radius: 14px;
          cursor: pointer;
          margin-bottom: 6px;
          color: #4A4A6A;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.25s ease;
          border-left: 3px solid transparent;
        }
        .admin-nav-item:hover {
          color: #E91E8C;
          background: #FCE4F0;
        }
        .admin-nav-item.active {
          background: #FCE4F0;
          border-left: 3px solid #E91E8C;
          color: #E91E8C;
          font-weight: 700;
        }
        .admin-logout-btn {
          width: 100%;
          padding: 10px 16px;
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 50px;
          color: #dc2626;
          font-size: 13px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.25s ease;
        }
        .admin-logout-btn:hover {
          background: #fee2e2;
          border-color: #ef4444;
          color: #dc2626;
        }
      `}</style>

      {/* Sidebar */}
      <div className="admin-sidebar" style={{
        width: '240px', flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1.5px solid #F9C0D8',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed', height: '100vh', top: 0, left: 0,
        boxSizing: 'border-box',
        boxShadow: '4px 0 24px rgba(233, 30, 140, 0.06)'
      }}>
        <div style={{ padding: '0 8px 24px', borderBottom: '1.5px solid #F9C0D8', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #E91E8C, #FF6B9D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              color: '#ffffff', boxShadow: '0 4px 14px rgba(233, 30, 140, 0.25)'
            }}>🛡️</div>
            <div>
              <div style={{ color: '#1A1A2E', fontSize: '15px', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Admin Panel</div>
              <div style={{ color: '#E91E8C', fontSize: '11px', letterSpacing: '0.08em', fontWeight: 700 }}>NEUROLOOP</div>
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

        <div style={{ borderTop: '1.5px solid #F9C0D8', paddingTop: '20px' }}>
          <div style={{ padding: '0 8px 14px' }}>
            <div style={{ color: '#1A1A2E', fontSize: '12px', fontWeight: '600', wordBreak: 'break-all' }}>{admin?.email}</div>
            <div style={{
              display: 'inline-block',
              marginTop: '6px',
              padding: '3px 10px',
              borderRadius: '50px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: '#FCE4F0',
              color: '#E91E8C',
              border: '1px solid #F9C0D8'
            }}>
              {admin?.role === 'subadmin' ? 'Sub Administrator' : 'Administrator'}
            </div>
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
