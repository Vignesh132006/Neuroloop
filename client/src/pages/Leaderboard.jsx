import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { FiRefreshCw, FiGithub, FiAward, FiActivity } from "react-icons/fi"

export default function Leaderboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await api.get("/auth/leaderboard")
      setUsers(res.data)
    } catch (e) {
      showToast("Failed to fetch leaderboard statistics", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const renderRank = (rank) => {
    const badgeStyle = {
      display: "inline-flex",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      color: "#000000",
      fontWeight: 750,
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.75rem",
    }
    if (rank === 1) return <span style={{ ...badgeStyle, background: "#ffd700" }}>1</span>
    if (rank === 2) return <span style={{ ...badgeStyle, background: "#c0c0c0" }}>2</span>
    if (rank === 3) return <span style={{ ...badgeStyle, background: "#cd7f32" }}>3</span>
    return <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem", paddingLeft: "0.5rem" }}>{rank}</span>
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Streak Leaderboard</h1>
            <p className="page-subtitle">Compete with friends and keep your daily learning streak alive!</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchLeaderboard} disabled={loading} style={{ gap: "0.35rem" }}>
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Loading leaderboard...</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "1rem 0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rank</th>
                    <th style={{ padding: "1rem 0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                    <th style={{ padding: "1rem 0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>GitHub Linked</th>
                    <th style={{ padding: "1rem 0.5rem", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => {
                    const isSelf = user && (u.name === user.name)
                    const rank = idx + 1
                    
                    return (
                      <tr 
                        key={u._id} 
                        style={{ 
                          borderBottom: "1px solid var(--border)", 
                          background: isSelf ? "var(--bg-card-hover)" : "transparent",
                          fontWeight: isSelf ? "600" : "normal"
                        }}
                      >
                        <td style={{ padding: "1rem 0.5rem" }}>
                          {renderRank(rank)}
                        </td>
                        <td style={{ padding: "1rem 0.5rem", color: "var(--text-primary)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {u.name}
                            {isSelf && <span className="badge badge-purple" style={{ textTransform: "none" }}>You</span>}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          {u.githubUsername ? (
                            <span className="badge badge-blue" style={{ textTransform: "none", gap: "0.3rem", display: "inline-flex", alignItems: "center" }}>
                              <FiGithub size={12} /> @{u.githubUsername}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Not Linked</span>
                          )}
                        </td>
                        <td style={{ padding: "1rem 0.5rem", textAlign: "right", fontSize: "1rem", fontWeight: 700, color: "var(--accent-orange)" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <FiActivity size={14} /> {u.streak} day{u.streak !== 1 ? "s" : ""}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><FiAward size={32} /></div>
                <h3>No players on the leaderboard yet</h3>
                <p>Register and login to start your streak!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
