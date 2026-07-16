import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState, useEffect } from "react"
import api from "../api/axios"
import { FiGrid, FiBookOpen, FiFileText, FiRefreshCw, FiCheckSquare, FiCalendar, FiMessageSquare, FiAward, FiSettings, FiZap, FiLogOut } from "react-icons/fi"
import NeuroLoopLogo from "./NeuroLoopLogo"

const S = `
  .sb{
    width:220px;min-height:100vh;
    background:#0d0d0d;
    border-right:1px solid rgba(255,255,255,0.06);
    display:flex;flex-direction:column;
    padding:20px 12px;
    position:fixed;left:0;top:0;z-index:900;
  }

  .sb-logo{
    display:flex;align-items:center;gap:10px;
    padding:6px 8px 22px;
    border-bottom:1px solid rgba(255,255,255,0.06);
    margin-bottom:20px;
  }
  .sb-logo-mark{
    width:34px;height:34px;border-radius:9px;
    background:linear-gradient(135deg,#e50914,#99060d);
    display:flex;align-items:center;justify-content:center;
    font-size:17px;
    box-shadow:0 4px 14px rgba(229,9,20,0.35);
    flex-shrink:0;
  }
  .sb-logo-name{
    font-family:'DM Serif Display',Georgia,serif;
    font-size:1.15rem;color:#f5f0e8;
    letter-spacing:-0.01em;
  }
  .sb-logo-name span{color:#e50914;}

  .sb-group-label{
    font-size:0.6rem;font-weight:700;
    letter-spacing:0.14em;text-transform:uppercase;
    color:rgba(255,255,255,0.18);
    padding:0 8px;margin:12px 0 4px;
  }

  .sb-link{
    display:flex;align-items:center;gap:10px;
    padding:9px 10px;border-radius:9px;
    color:rgba(255,255,255,0.4);
    font-size:0.84rem;font-weight:500;
    margin-bottom:1px;
    border:1px solid transparent;
    transition:all 0.17s ease;
    text-decoration:none;position:relative;
  }
  .sb-link::after{
    content:'';
    position:absolute;left:0;top:20%;bottom:20%;
    width:2px;border-radius:99px;
    background:#e50914;
    transform:scaleY(0);
    transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
    transform-origin:center;
  }
  .sb-link:hover{
    background:rgba(255,255,255,0.04);
    color:rgba(255,255,255,0.75);
  }
  .sb-link:hover::after{transform:scaleY(0.5);opacity:0.5;}
  .sb-link.active{
    background:rgba(229,9,20,0.1);
    color:#e50914;
    border-color:rgba(229,9,20,0.25);
  }
  .sb-link.active::after{transform:scaleY(1);}
  .sb-link.active .sb-link-icon{
    filter:drop-shadow(0 0 5px rgba(229,9,20,0.7));
  }
  .sb-link-icon{
    font-size:1rem;width:20px;
    text-align:center;flex-shrink:0;
  }
  .sb-badge{
    margin-left:auto;
    background:#ef4444;color:#fff;
    font-size:0.62rem;font-weight:700;
    border-radius:99px;padding:1px 6px;
    min-width:18px;text-align:center;
  }

  .sb-bottom{margin-top:auto;display:flex;flex-direction:column;gap:8px;}

  .sb-streak{
    background:linear-gradient(135deg,rgba(229,9,20,0.1),rgba(229,9,20,0.04));
    border:1px solid rgba(229,9,20,0.22);
    border-radius:11px;padding:11px 13px;
    display:flex;align-items:center;gap:9px;
    margin-top: 10px;
  }
  .sb-streak-fire{
    font-size:1.35rem;
    animation:fireAnim 2.2s ease-in-out infinite;
  }
  @keyframes fireAnim{
    0%,100%{transform:scale(1) rotate(-4deg);}
    50%{transform:scale(1.2) rotate(4deg);}
  }
  .sb-streak-num{font-weight:700;font-size:1rem;color:#e50914;}
  .sb-streak-lbl{font-size:0.7rem;color:rgba(255,255,255,0.3);}

  .sb-user{
    display:flex;align-items:center;gap:9px;
    padding:10px 10px;border-radius:11px;
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.06);
  }
  .sb-avatar{
    width:33px;height:33px;border-radius:50%;
    background:linear-gradient(135deg,#e50914,#99060d);
    display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:0.85rem;color:#ffffff;
    flex-shrink:0;
  }
  .sb-user-name{font-size:0.82rem;font-weight:600;color:#f5f0e8;}
  .sb-user-email{font-size:0.68rem;color:rgba(255,255,255,0.28);}

  .sb-logout{
    display:flex;align-items:center;justify-content:center;gap:7px;
    padding:9px;border-radius:9px;
    background:rgba(239,68,68,0.07);
    border:1px solid rgba(239,68,68,0.18);
    color:#f87171;font-size:0.82rem;font-weight:600;
    width:100%;transition:all 0.2s;
    cursor: pointer;
  }
  .sb-logout:hover{
    background:rgba(239,68,68,0.14);
    border-color:rgba(239,68,68,0.35);
    color:#fca5a5;
  }

  .sb-desktop-only {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
  }
  .sb-mobile-only {
    display: none;
  }
  .sb-mobile-link {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: rgba(255,255,255,0.4);
    transition: all 0.2s;
  }
  .sb-mobile-link.active {
    color: #e50914;
    background: rgba(229,9,20,0.12);
  }

  @media (max-width: 768px) {
    .sidebar, .sb {
      position: fixed !important;
      top: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      right: auto !important;
      width: 240px !important;
      height: 100vh !important;
      min-height: 100vh !important;
      flex-direction: column !important;
      border-right: 1px solid rgba(255,255,255,0.06) !important;
      border-top: none !important;
      padding: 20px 12px !important;
      z-index: 9999 !important;
      transform: translateX(-100%) !important;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      display: flex !important;
      overflow-y: auto !important;
      background: #0d0d1a !important;
    }
    .sidebar.open, .sb.open {
      transform: translateX(0) !important;
    }
    .sb-desktop-only {
      display: flex !important;
      flex-direction: column;
      height: 100%;
      flex: 1;
      width: 100%;
    }
    .sb-mobile-only {
      display: none !important;
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
          background: 'rgba(13,13,26,0.9)',
          border: '1px solid var(--bd)',
          color: 'var(--t1)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(12px)',
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
              <span className="sb-streak-fire" style={{ display: 'flex', alignItems: 'center', color: '#e50914' }}>
                <FiZap size={18} fill="#e50914" />
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

            {/* Admin Panel button */}
            <a
              href="/admin/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.15)',
                color: '#a78bfa',
                fontSize: '12px',
                fontWeight: '500',
                textDecoration: 'none',
                marginBottom: '8px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                justifyContent: 'center'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.15)'
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)'
              }}
            >
              <i className="ti ti-shield-lock" aria-hidden="true" style={{ fontSize: '14px' }}></i>
              Admin Panel
            </a>

            {/* Logout */}
            <button onClick={handleLogout} className="sb-logout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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