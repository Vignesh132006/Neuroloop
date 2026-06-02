import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

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

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">🔥 Streak Leaderboard</h1>
            <p className="page-subtitle">Compete with friends and keep your daily learning streak alive!</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchLeaderboard} disabled={loading}>
            🔄 Refresh
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
                    <th style={{ padding: "1rem 0.5rem", fontWeight: 700 }}>Rank</th>
                    <th style={{ padding: "1rem 0.5rem", fontWeight: 700 }}>Name</th>
                    <th style={{ padding: "1rem 0.5rem", fontWeight: 700 }}>GitHub Linked</th>
                    <th style={{ padding: "1rem 0.5rem", fontWeight: 700, textAlign: "right" }}>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => {
                    const isSelf = user && (u.name === user.name)
                    const rank = idx + 1
                    let rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`
                    
                    return (
                      <tr 
                        key={u._id} 
                        style={{ 
                          borderBottom: "1px solid var(--border)", 
                          background: isSelf ? "rgba(139, 92, 246, 0.08)" : "transparent",
                          fontWeight: isSelf ? "bold" : "normal"
                        }}
                      >
                        <td style={{ padding: "1rem 0.5rem", fontSize: "1.1rem" }}>
                          {rankEmoji}
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {u.name}
                            {isSelf && <span className="badge badge-purple" style={{ textTransform: "none" }}>You</span>}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          {u.githubUsername ? (
                            <span className="badge badge-blue" style={{ textTransform: "none" }}>
                              🔗 @{u.githubUsername}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Not Linked</span>
                          )}
                        </td>
                        <td style={{ padding: "1rem 0.5rem", textAlign: "right", fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-orange)" }}>
                          🔥 {u.streak} day{u.streak !== 1 ? "s" : ""}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🔥</div>
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
