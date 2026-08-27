import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { FiAward, FiRefreshCw, FiZap } from "react-icons/fi"
import Loader from "../components/Loader"

function PodiumSection({ top3 }) {
  if (!top3 || top3.length < 3) return null

  const slots = [
    { user: top3[0], rank: 1, avatarSize: 72, blockHeight: 125, color: 'var(--gold)' },
    { user: top3[1], rank: 2, avatarSize: 56, blockHeight: 90, color: '#9CA3AF' },
    { user: top3[2], rank: 3, avatarSize: 48, blockHeight: 70, color: '#B45309' },
  ]

  return (
    <div className="podium-container">
      {slots.map((slot) => (
        <div key={slot.rank} className="podium-slot">
          {slot.rank === 1 && <div className="crown-float" style={{fontSize:'1.2rem'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="#ff3b30" stroke="none"><path d="M2 8l4 4 6-6 6 6 4-4-2 12H4L2 8z"/><rect x="4" y="18" width="16" height="2" rx="1"/></svg></div>}
          <div
            className="podium-avatar"
            style={{
              width: slot.avatarSize,
              height: slot.avatarSize,
              background: `linear-gradient(135deg, ${slot.color}22, ${slot.color}66)`,
              border: `3px solid ${slot.color}`,
              fontSize: `${slot.avatarSize * 0.35}px`,
            }}
          >
            {slot.user.name?.charAt(0).toUpperCase()}
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--t1)', textAlign: 'center', margin: '4px 0 2px' }}>
            {slot.user.name}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <FiZap size={12} fill="#ff3b30" /> {slot.user.streak} days
          </span>
          <div className="podium-block" style={{
            height: `${slot.blockHeight}px`,
            background: `linear-gradient(180deg, ${slot.color}15, ${slot.color}05)`,
            border: `1px solid ${slot.color}22`,
            borderBottom: 'none',
          }}>
            <span style={{fontWeight:700,color:slot.color,fontSize:'1.3rem'}}>#{slot.rank}</span>
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
      <div className="page-wrap fade-in">
        {toast && <div className={`alert alert-${toast.type}`} style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999, maxWidth: "360px" }}>{toast.msg}</div>}

        <div className="page-header flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <div className="page-eyebrow" style={{ color: "#E91E8C", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Community & Progress</div>
            <h1 className="page-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 700, color: "#1A1A2E", display: 'flex', alignItems: 'center', gap: '10px', margin: "4px 0" }}><FiAward style={{ color: "#E91E8C" }} /> Streak Leaderboard</h1>
            <p className="page-subtitle" style={{ color: "#4A4A6A", fontSize: "14px" }}>Compete with friends and keep your daily learning streak alive!</p>
          </div>
          <button onClick={fetchLeaderboard} disabled={loading} style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", color: "#E91E8C", padding: "8px 20px", borderRadius: "50px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: "6px" }}>
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {loading ? (
          <Loader text="Loading leaderboard..." />
        ) : (
          <>
            {/* Podium */}
            {users.length >= 3 && <PodiumSection top3={users.slice(0, 3)} />}

            {/* Table */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F9C0D8", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 24px rgba(233, 30, 140, 0.06)" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #F9C0D8" }}>
                      {['Rank', 'Name', 'GitHub', 'Streak'].map(h => (
                        <th key={h} style={{
                          textAlign: h === 'Streak' ? 'right' : 'left',
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#8888AA",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => {
                      const isSelf = user && (u.name === user.name)
                      const rank = idx + 1
                      const rankLabels = ['1st', '2nd', '3rd']

                      return (
                        <tr
                          key={u._id}
                          style={{
                            background: isSelf ? '#FCE4F0' : 'transparent',
                            borderBottom: '1px solid #F9C0D8',
                            borderLeft: isSelf ? '4px solid #E91E8C' : undefined,
                            transition: 'background 0.2s'
                          }}
                        >
                          <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: '1rem', width: '80px' }}>
                            {rank <= 3 ? <span style={{ color: '#E91E8C', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>{rankLabels[rank - 1]}</span> : <span style={{ color: '#8888AA', fontSize: '0.9rem', paddingLeft: '4px' }}>{rank}</span>}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                background: isSelf ? 'linear-gradient(135deg, #E91E8C, #FF6B9D)' : '#FCE4F0',
                                border: isSelf ? 'none' : '1px solid #F9C0D8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isSelf ? '#ffffff' : '#E91E8C', fontWeight: 700, fontSize: '0.85rem',
                              }}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: '0.92rem', color: isSelf ? '#E91E8C' : '#1A1A2E' }}>{u.name}</span>
                                {isSelf && <span style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '50px', background: 'linear-gradient(135deg, #E91E8C, #FF6B9D)', color: '#ffffff', fontWeight: 700 }}>You</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {u.githubUsername ? (
                              <span style={{ background: "#FCE4F0", color: "#E91E8C", border: "1px solid #F9C0D8", padding: "4px 12px", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600 }}>
                                @{u.githubUsername}
                              </span>
                            ) : (
                              <span style={{ color: '#8888AA', fontSize: '0.85rem' }}>Not linked</span>
                            )}
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: 'right' }}>
                            <span style={{
                              fontWeight: 700, fontSize: '0.95rem', color: '#E91E8C',
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                            }}>
                              <FiZap size={14} fill="#FF6B9D" /> {u.streak} day{u.streak !== 1 ? 's' : ''}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 24px" }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontSize: '2.5rem', marginBottom: '12px' }}><FiAward /></div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", color: "#1A1A2E", marginBottom: "6px" }}>No players on the leaderboard yet</h3>
                  <p style={{ color: "#4A4A6A", fontSize: "0.9rem" }}>Register and login to start your streak!</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
