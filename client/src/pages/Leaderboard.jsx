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
          {slot.rank === 1 && <div className="crown-float" style={{fontSize:'1.2rem'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="#d4af37" stroke="none"><path d="M2 8l4 4 6-6 6 6 4-4-2 12H4L2 8z"/><rect x="4" y="18" width="16" height="2" rx="1"/></svg></div>}
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
            <FiZap size={12} fill="#d4af37" /> {slot.user.streak} days
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

        <div className="page-header flex-between">
          <div>
            <div className="page-eyebrow">Community & Progress</div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiAward /> Streak Leaderboard</h1>
            <p className="page-subtitle">Compete with friends and keep your daily learning streak alive!</p>
          </div>
          <button className="btn btn-ghost" onClick={fetchLeaderboard} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: "0.35rem" }}>
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
            <div className="card">
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {['Rank', 'Name', 'GitHub', 'Streak'].map(h => (
                        <th key={h} style={{
                          textAlign: h === 'Streak' ? 'right' : 'left',
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
                          className="lb-row"
                          style={{
                            '--i': idx,
                            background: isSelf ? 'var(--goldg)' : 'transparent',
                            borderLeft: isSelf ? '3px solid var(--gold)' : undefined,
                          }}
                        >
                          <td style={{ fontWeight: 700, fontSize: '1rem', width: '80px' }}>
                            {rank <= 3 ? <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{rankLabels[rank - 1]}</span> : <span style={{ color: 'var(--t3)', fontSize: '0.85rem', paddingLeft: '4px' }}>{rank}</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: isSelf ? 'linear-gradient(135deg, var(--gold), #af8f27)' : 'rgba(212,175,55,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isSelf ? '#0d0d0d' : '#fff', fontWeight: 700, fontSize: '0.8rem',
                              }}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isSelf ? 'var(--goldl)' : 'var(--t1)' }}>{u.name}</span>
                                {isSelf && <span className="badge badge-gold" style={{ marginLeft: '8px', fontSize: '0.65rem', padding: '2px 6px' }}>You</span>}
                              </div>
                            </div>
                          </td>
                          <td>
                            {u.githubUsername ? (
                              <span className="tag tag-gold" style={{ gap: '4px' }}>
                                @{u.githubUsername}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--t3)', fontSize: '0.82rem' }}>Not linked</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
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
      </div>
    </div>
  )
}
