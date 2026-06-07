import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState, useEffect } from "react"
import { 
  FiActivity, 
  FiBookOpen, 
  FiFileText, 
  FiHelpCircle, 
  FiRefreshCw, 
  FiMessageSquare, 
  FiAward, 
  FiSun, 
  FiMoon, 
  FiLogOut, 
  FiMenu 
} from "react-icons/fi"

const navItems = [
  { to: "/dashboard", icon: <FiActivity />, label: "Dashboard" },
  { to: "/journal",   icon: <FiBookOpen />, label: "Journal" },
  { to: "/notes",     icon: <FiFileText />, label: "Notes" },
  { to: "/quiz",      icon: <FiHelpCircle />, label: "Quiz" },
  { to: "/revision",  icon: <FiRefreshCw />, label: "Revision" },
  { to: "/chat",      icon: <FiMessageSquare />, label: "Neuro Chat" },
  { to: "/leaderboard", icon: <FiAward />, label: "Leaderboard" },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="btn btn-secondary"
        style={{
          position: "fixed", top: "1rem", left: "1rem",
          zIndex: 1000, display: "none",
          padding: "0.5rem",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          alignItems: "center",
          justifyContent: "center",
        }}
        id="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <FiMenu size={20} />
      </button>

      <nav
        className="sidebar"
        style={{
          position: "fixed", top: 0, left: 0,
          width: "260px", height: "100vh",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          padding: "2rem 1.25rem",
          zIndex: 900,
          overflowY: "auto",
          transform: mobileOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "2.5rem", padding: "0 0.5rem" }}>
          <h1 style={{
            fontSize: "1.35rem", fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
          }}>
            NeuroLoop
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 500 }}>
            Learn · Remember · Master
          </p>
        </div>

        {/* User Info */}
        {user && (
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "2rem",
          }}>
            <div style={{
              width: "36px", height: "36px",
              background: "var(--accent-blue)",
              color: "#ffffff",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 600, fontSize: "0.95rem",
              marginBottom: "0.75rem",
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{user.name}</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.15rem" }}>{user.email}</p>
          </div>
        )}

        {/* Nav Links */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.7rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                background: isActive ? "var(--bg-card-hover)" : "transparent",
                color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                border: "1px solid transparent",
              })}
            >
              <span style={{ display: "inline-flex", fontSize: "1.1rem" }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary w-full"
          style={{ marginTop: "1rem", justifyContent: "center", gap: "0.5rem" }}
        >
          {theme === "dark" ? <><FiSun /> Light</> : <><FiMoon /> Dark</>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-danger w-full"
          style={{ marginTop: "0.5rem", justifyContent: "center", gap: "0.5rem" }}
        >
          <FiLogOut /> Logout
        </button>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 850,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle { display: flex !important; }
          nav.sidebar { transform: translateX(${mobileOpen ? "0" : "-100%"}); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        }
      `}</style>
    </>
  )
}