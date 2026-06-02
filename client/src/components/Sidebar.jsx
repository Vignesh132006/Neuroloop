import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState, useEffect } from "react"

const navItems = [
  { to: "/dashboard", icon: "⚡", label: "Dashboard" },
  { to: "/journal",   icon: "📖", label: "Journal" },
  { to: "/notes",     icon: "📝", label: "Notes" },
  { to: "/quiz",      icon: "🧠", label: "Quiz" },
  { to: "/revision",  icon: "🔁", label: "Revision" },
  { to: "/chat",      icon: "💬", label: "Neuro Chat" },
  { to: "/leaderboard", icon: "🏆", label: "Leaderboard" },
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
        }}
        id="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        ☰
      </button>

      <nav
        className="sidebar"
        style={{
          position: "fixed", top: 0, left: 0,
          width: "260px", height: "100vh",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          padding: "1.5rem 1rem",
          zIndex: 900,
          overflowY: "auto",
          transform: mobileOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "2rem", padding: "0 0.5rem" }}>
          <h1 style={{
            fontSize: "1.5rem", fontWeight: 900,
            fontFamily: "'Space Grotesk', sans-serif",
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            🧠 NeuroLoop
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
            Learn · Remember · Master
          </p>
        </div>

        {/* User Info */}
        {user && (
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "0.875rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              width: "36px", height: "36px",
              background: "var(--gradient-primary)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "1rem",
              marginBottom: "0.5rem",
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{user.name}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{user.email}</p>
          </div>
        )}

        {/* Nav Links */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
                background: isActive ? "rgba(139,92,246,0.15)" : "transparent",
                color: isActive ? "var(--accent-purple)" : "var(--text-secondary)",
                border: isActive ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
              })}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
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
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-danger w-full"
          style={{ marginTop: "0.5rem", justifyContent: "center" }}
        >
          🚪 Logout
        </button>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 850,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle { display: flex !important; }
          nav.sidebar { transform: translateX(${mobileOpen ? "0" : "-100%"}); transition: transform 0.3s ease; }
        }
      `}</style>
    </>
  )
}