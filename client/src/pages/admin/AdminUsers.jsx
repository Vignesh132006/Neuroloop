import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const adminApi = () => axios.create({
  baseURL: API,
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
})

export default function AdminUsers() {
  const [data, setData] = useState({ users: [], total: 0, pages: 1 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminApi().get(`/api/admin/users?page=${page}&search=${search}`)
      setData(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page, search])

  const handleDelete = async (id, email) => {
    if (!confirm(`Delete user ${email} and ALL their data permanently?`)) return
    try {
      await adminApi().delete(`/api/admin/users/${id}`)
      fetchUsers()
    } catch (err) { alert('Delete failed') }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Users</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{data.total} total users</p>
        </div>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{
            padding: '9px 14px', width: '260px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', color: '#f1f5f9', fontSize: '13px', outline: 'none'
          }}
        />
      </div>

      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['User', 'Email', 'Streak', 'Notes', 'Quizzes', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left',
                  color: '#64748b', fontSize: '11px', fontWeight: '500',
                  textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
            ) : data.users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '13px', fontWeight: '600', flexShrink: 0
                    }}>{user.name?.charAt(0).toUpperCase()}</div>
                    <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '500' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px' }}>{user.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: '#fbbf24', fontSize: '13px' }}>🔥 {user.streak || 0}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px' }}>{user.noteCount}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px' }}>{user.quizCount}</td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => navigate(`/admin/users/${user._id}`)}
                      style={{ padding: '5px 12px', background: 'rgba(124,58,237,0.12)',
                        border: '1px solid rgba(124,58,237,0.2)', borderRadius: '6px',
                        color: '#a78bfa', fontSize: '12px', cursor: 'pointer' }}>View</button>
                    <button onClick={() => handleDelete(user._id, user.email)}
                      style={{ padding: '5px 12px', background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px',
                        color: '#fca5a5', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.pages > 1 && (
          <div style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center',
            borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none',
                  background: p === page ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.06)',
                  color: 'white', cursor: 'pointer', fontSize: '13px' }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
