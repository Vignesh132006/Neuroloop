import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { FiAward, FiRefreshCw, FiZap } from "react-icons/fi"

function PodiumSection({ top3 }) {
  if (!top3 || top3.length < 3) return null

  const slots = [
    { user: top3[1], rank: 2, medal: '🥈', avatarSize: 56, blockHeight: 80, color: '#9CA3AF' },
    { user: top3[0], rank: 1, medal: '🥇', avatarSize: 72, blockHeight: 120, color: '#F59E0B' },
    { user: top3[2], rank: 3, medal: '🥉', avatarSize: 48, blockHeight: 60, color: '#B45309' },
  ]

  const bgColors = ['#9CA3AF', '#F59E0B', '#B45309']

  return (
    <div className="podium-container">
      {slots.map((slot, idx) => (
        <div key={slot.rank} className="podium-slot">
          {slot.rank === 1 && <div className="crown-float">👑</div>}
          <div
            className="podium-avatar"
            style={{
              width: slot.avatarSize,
              height: slot.avatarSize,
              background: `linear-gradient(135deg, ${slot.color}44, ${slot.color}88)`,
              border: `3px solid ${slot.color}`,
              fontSize: `${slot.avatarSize * 0.35}px`,
            }}
          >
            {slot.user.name?.charAt(0).toUpperCase()}
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'center' }}>
            {slot.user.name}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <FiZap size={12} fill="#d4af37" /> {slot.user.streak} days
          </span>
          <div className="podium-block" style={{
            height: `${slot.blockHeight}px`,
            background: `linear-gradient(180deg, ${slot.color}22, ${slot.color}11)`,
            border: `1px solid ${slot.color}33`,
          }}>
            <span>{slot.medal}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

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

  useEffect(() => { fetchLeaderboard() }, [])

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header flex-between">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiAward /> Streak Leaderboard</h1>
            <p className="page-subtitle">Compete with friends and keep your daily learning streak alive!</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchLeaderboard} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: "0.35rem" }}>
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /><p>Loading leaderboard...</p></div>
        ) : (
          <>
            {/* Podium */}
            {users.length >= 3 && <PodiumSection top3={users.slice(0, 3)} />}

            {/* Table */}
            <div className="card">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      {['Rank', 'Name', 'GitHub', 'Streak'].map(h => (
                        <th key={h} style={{
                          padding: '0.75rem 0.5rem', fontWeight: 600, fontSize: '0.7rem',
                          textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
                          textAlign: h === 'Streak' ? 'right' : 'left',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => {
                      const isSelf = user && (u.name === user.name)
                      const rank = idx + 1
                      const medals = ['🥇', '🥈', '🥉']

                      return (
                        <tr
                          key={u._id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isSelf ? 'rgba(124,58,237,0.08)' : 'transparent',
                            border: isSelf ? '1px solid var(--border-glow)' : undefined,
                          }}
                        >
                          <td style={{ padding: '0.875rem 0.5rem', fontWeight: 700, fontSize: '1rem' }}>
                            {rank <= 3 ? medals[rank - 1] : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', paddingLeft: '4px' }}>{rank}</span>}
                          </td>
                          <td style={{ padding: '0.875rem 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: isSelf ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(124,58,237,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                              }}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{u.name}</span>
                                {isSelf && <span className="badge badge-purple" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>You</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.875rem 0.5rem' }}>
                            {u.githubUsername ? (
                              <span className="badge badge-cyan" style={{ gap: '4px' }}>
                                @{u.githubUsername}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Not linked</span>
                            )}
                          </td>
                          <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right' }}>
                            <span style={{
                              fontWeight: 700, fontSize: '0.95rem', color: 'var(--gold)',
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                            }}>
                              <FiZap size={14} fill="#d4af37" /> {u.streak} day{u.streak !== 1 ? 's' : ''}
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
                  <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}><FiAward /></div>
                  <h3 className="empty-title">No players on the leaderboard yet</h3>
                  <p>Register and login to start your streak!</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
