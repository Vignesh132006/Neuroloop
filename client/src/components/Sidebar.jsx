import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useState, useEffect } from "react"
import api from "../api/axios"
import { FiGrid, FiBookOpen, FiFileText, FiRefreshCw, FiCheckSquare, FiCalendar, FiMessageSquare, FiAward, FiSettings, FiZap, FiLogOut, FiSun, FiMoon } from "react-icons/fi"
import NeuroLoopLogo from "./NeuroLoopLogo"

const S = `
  .sb{
    width:220px;min-height:100vh;
    background:#FFFFFF;
    border-right:1px solid #F9C0D8;
    display:flex;flex-direction:column;
    padding:20px 12px;
    position:fixed;left:0;top:0;z-index:900;
    box-shadow: 4px 0 24px rgba(233, 30, 140, 0.04);
  }

  .sb-logo{
    display:flex;align-items:center;gap:10px;
    padding:6px 8px 22px;
    border-bottom:1px solid #F9C0D8;
    margin-bottom:20px;
  }

  .sb-group-label{
    font-size:0.65rem;font-weight:700;
    letter-spacing:0.12em;text-transform:uppercase;
    color:#8888AA;
    padding:0 8px;margin:14px 0 6px;
  }

  .sb-link{
    display:flex;align-items:center;gap:10px;
    padding:10px 12px;border-radius:12px;
    color:#4A4A6A;
    font-size:0.86rem;font-weight:500;
    margin-bottom:3px;
    border:1px solid transparent;
    transition:all 0.2s ease;
    text-decoration:none;position:relative;
  }
  .sb-link:hover{
    background:#FCE4F0;
    color:#E91E8C;
  }
  .sb-link.active{
    background:#FCE4F0;
    color:#E91E8C;
    border-left:3px solid #E91E8C;
    font-weight:600;
  }
  .sb-link-icon{
    font-size:1.05rem;width:20px;
    text-align:center;flex-shrink:0;
    color:#E91E8C;
  }
  .sb-badge{
    margin-left:auto;
    background:linear-gradient(135deg, #E91E8C, #FF6B9D);
    color:#fff;
    font-size:0.65rem;font-weight:700;
    border-radius:99px;padding:2px 7px;
    min-width:18px;text-align:center;
  }

  .sb-bottom{margin-top:auto;display:flex;flex-direction:column;gap:10px;}

  .sb-streak{
    background:#FFFFFF;
    border:1px solid #F9C0D8;
    border-radius:14px;padding:12px 14px;
    display:flex;align-items:center;gap:10px;
    margin-top: 10px;
    box-shadow: 0 2px 12px rgba(233, 30, 140, 0.05);
  }
  .sb-streak-fire{
    font-size:1.35rem;
    color:#F59E0B;
    animation:fireAnim 2.2s ease-in-out infinite;
  }
  @keyframes fireAnim{
    0%,100%{transform:scale(1) rotate(-4deg);}
    50%{transform:scale(1.15) rotate(4deg);}
  }
  .sb-streak-num{font-weight:700;font-size:1.05rem;color:#F59E0B;}
  .sb-streak-lbl{font-size:0.7rem;color:#8888AA;font-weight:500;}

  .sb-user{
    display:flex;align-items:center;gap:10px;
    padding:10px 12px;border-radius:14px;
    background:#FCE4F0;
    border:1px solid #F9C0D8;
  }
  .sb-avatar{
    width:34px;height:34px;border-radius:50%;
    background:linear-gradient(135deg,#E91E8C,#FF6B9D);
    display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:0.85rem;color:#ffffff;
    flex-shrink:0;
    box-shadow: 0 2px 8px rgba(233,30,140,0.3);
  }
  .sb-user-name{font-size:0.84rem;font-weight:600;color:#1A1A2E;}
  .sb-user-email{font-size:0.7rem;color:#8888AA;}

  .sb-logout{
    display:flex;align-items:center;justify-content:center;gap:8px;
    padding:10px;border-radius:50px;
    background:transparent;
    border:1.5px solid #F9C0D8;
    color:#E91E8C;font-size:0.84rem;font-weight:600;
    width:100%;transition:all 0.2s;
    cursor: pointer;
  }
  .sb-logout:hover{
    background:#FCE4F0;
    border-color:#E91E8C;
    color:#E91E8C;
  }

  .sb-admin-btn{
    display:flex;align-items:center;justify-content:center;gap:8px;
    padding:10px;border-radius:50px;
    background:linear-gradient(135deg, #E91E8C, #FF6B9D);
    border:none;
    color:#FFFFFF;font-size:0.84rem;font-weight:600;
    width:100%;transition:all 0.2s;
    cursor: pointer;
    box-shadow:0 4px 14px rgba(233,30,140,0.25);
    text-decoration:none;
  }
  .sb-admin-btn:hover{
    transform:translateY(-1px);
    box-shadow:0 6px 18px rgba(233,30,140,0.35);
  }

  .sb-desktop-only {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
  }

  @media (max-width: 768px) {
    .sidebar, .sb {
      position: fixed !important;
      top: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 240px !important;
      height: 100vh !important;
      border-right: 1px solid #F9C0D8;
      padding: 20px 12px !important;
      z-index: 9999 !important;
      transform: translateX(-100%) !important;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      display: flex !important;
      overflow-y: auto !important;
      background: #FFFFFF !important;
    }
    .sidebar.open, .sb.open {
      transform: translateX(0) !important;
    }
    #mobile-menu-toggle {
      display: flex !important;
    }
  }
`;

const learningItems = [
  { to: '/dashboard',    icon: <FiGrid />, label: 'Dashboard' },
  { to: '/journal',      icon: <FiBookOpen />, label: 'Journal' },
  { to: '/notes',        icon: <FiFileText />, label: 'Notes' },
  { to: '/revision',     icon: <FiRefreshCw />, label: 'Revision',   hasBadge: true },
  { to: '/quiz',         icon: <FiCheckSquare />, label: 'Quiz' },
]

const toolsItems = [
  { to: '/study-plans',  icon: <FiCalendar />, label: 'Study Plans' },
  { to: '/chat',         icon: <FiMessageSquare />, label: 'Neuro Chat' },
  { to: '/leaderboard',  icon: <FiAward />, label: 'Leaderboard' },
  { to: '/settings',     icon: <FiSettings />, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dueCount, setDueCount] = useState(0)
  const [displayStreak, setDisplayStreak] = useState(0)

  useEffect(() => {
    api.get("/revision")
      .then((r) => setDueCount(r.data?.length || 0))
      .catch(() => {})
  }, [])

  // Animate streak counter on mount
  const streakCount = user?.streak || 0
  useEffect(() => {
    if (streakCount === 0) { setDisplayStreak(0); return }
    let start = 0
    const timer = setInterval(() => {
      start++
      setDisplayStreak(start)
      if (start >= streakCount) clearInterval(timer)
    }, 80)
    return () => clearInterval(timer)
  }, [streakCount])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      <style>{S}</style>
      
      {/* Mobile Hamburger */}
      <button
        id="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: '1rem', left: '1rem',
          zIndex: 9990, display: 'none',
          width: '40px', height: '40px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1.5px solid #F9C0D8',
          color: '#E91E8C',
          fontSize: '1.2rem',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(233, 30, 140, 0.15)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <nav className={`sb ${mobileOpen ? 'open' : ''}`}>
        <div className="sb-desktop-only">
          {/* Logo */}
          <div className="sb-logo">
            <NeuroLoopLogo size={32} showWordmark={true} />
          </div>

          {/* Navigation */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
            <div className="sb-group-label">Learning</div>
            {learningItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
              >
                <span className="sb-link-icon" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.hasBadge && dueCount > 0 && (
                  <span className="sb-badge">{dueCount}</span>
                )}
              </NavLink>
            ))}

            <div className="sb-group-label">Tools</div>
            {toolsItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
              >
                <span className="sb-link-icon" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.hasBadge && dueCount > 0 && (
                  <span className="sb-badge">{dueCount}</span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="sb-bottom">
            {/* Streak Widget */}
            <div className="sb-streak">
              <span className="sb-streak-fire" style={{ display: 'flex', alignItems: 'center' }}>
                <FiZap size={18} fill="#F59E0B" />
              </span>
              <div>
                <div className="sb-streak-num">
                  {displayStreak} day{displayStreak !== 1 ? 's' : ''}
                </div>
                <div className="sb-streak-lbl">
                  Current streak
                </div>
              </div>
            </div>

            {/* Admin link if user is admin */}
            {user?.role === 'admin' && (
              <NavLink to="/admin/dashboard" className="sb-admin-btn">
                Admin Panel
              </NavLink>
            )}

            {/* User section */}
            {user && (
              <div className="sb-user">
                <div className="sb-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div className="sb-user-name">{user.name}</div>
                  <div className="sb-user-email">{user.email}</div>
                </div>
              </div>
            )}

            {/* Logout */}
            <button onClick={handleLogout} className="sb-logout">
              <FiLogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
          }}
        />
      )}
    </>
  )
}