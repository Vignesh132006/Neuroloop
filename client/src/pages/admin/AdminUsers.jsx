import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const adminApi = () => axios.create({
  baseURL: API,
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` }
})

export default function AdminUsers() {
  const [data, setData] = useState({ users: [], total: 0, pages: 1 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('user') || '{}')
  const isFullAdmin = adminUser.role === 'admin'

  const [roleModalUser, setRoleModalUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('user')
  const [roleSubmitting, setRoleSubmitting] = useState(false)

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

  const handleRoleChangeSubmit = async (e) => {
    e.preventDefault()
    if (!roleModalUser) return
    setRoleSubmitting(true)
    try {
      await adminApi().put(`/api/admin/users/${roleModalUser._id}/role`, { role: selectedRole })
      setRoleModalUser(null)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role')
    } finally {
      setRoleSubmitting(false)
    }
  }

  return (
    <div>
      <style>{`
        @keyframes adminFadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminModalIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .admin-users-header {
          animation: adminFadeInUp 0.4s ease both;
        }
        .admin-users-table-container {
          background: #0d0d0d;
          border: 1px solid rgba(255, 59, 48, 0.08);
          border-radius: 16px;
          overflow: hidden;
          animation: adminFadeInUp 0.5s ease both;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .admin-search-inp {
          padding: 9px 14px;
          width: 260px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #f5f0e8;
          font-size: 13px;
          outline: none;
          transition: all 0.25s;
        }
        .admin-search-inp:focus {
          border-color: rgba(255, 59, 48, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
          background: rgba(255, 59, 48, 0.01);
        }
        .admin-user-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          transition: background 0.2s ease;
        }
        .admin-user-row:hover {
          background: rgba(255, 59, 48, 0.02) !important;
        }
        .admin-btn-action-view {
          padding: 5px 12px;
          background: rgba(255, 59, 48, 0.08);
          border: 1px solid rgba(255, 59, 48, 0.2);
          border-radius: 6px;
          color: #ff3b30;
          font-size: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-btn-action-view:hover {
          background: #ff3b30;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(255, 59, 48, 0.2);
        }
        .admin-btn-action-role {
          padding: 5px 12px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 6px;
          color: #fcd34d;
          font-size: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-btn-action-role:hover {
          background: #f59e0b;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
        }
        .admin-btn-action-delete {
          padding: 5px 12px;
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 6px;
          color: #fca5a5;
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .admin-btn-action-delete:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ffffff;
        }
        .admin-page-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          background: rgba(255, 255, 255, 0.04);
          color: #a09880;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .admin-page-btn.active {
          background: linear-gradient(135deg, #ff3b30, #a3151a);
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(255, 59, 48, 0.2);
        }
        .role-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .role-badge-admin {
          background: rgba(239, 68, 68, 0.12);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .role-badge-subadmin {
          background: rgba(245, 158, 11, 0.12);
          color: #fcd34d;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .role-badge-user {
          background: rgba(59, 130, 246, 0.12);
          color: #93c5fd;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
      `}</style>

      <div className="admin-users-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#f5f0e8', fontSize: '24px', fontWeight: '400', margin: '0 0 4px', fontFamily: "'DM Serif Display', serif" }}>Users</h1>
          <p style={{ color: '#a09880', fontSize: '13px', margin: 0 }}>{data.total} total users</p>
        </div>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="admin-search-inp"
        />
      </div>

      <div className="admin-users-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,59,48,0.1)', background: 'rgba(255,59,48,0.02)' }}>
              {['User', 'Email', 'Role', 'Streak', 'Notes', 'Quizzes', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 18px', textAlign: 'left',
                  color: '#a09880', fontSize: '11px', fontWeight: '600',
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#a09880', fontSize: '13px' }}>Loading users data...</td></tr>
            ) : data.users.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#a09880', fontSize: '13px' }}>No users found</td></tr>
            ) : data.users.map(user => {
              const roleClass = user.role === 'admin' ? 'role-badge-admin' : user.role === 'subadmin' ? 'role-badge-subadmin' : 'role-badge-user'
              return (
                <tr key={user._id} className="admin-user-row">
                  <td style={{ padding: '12px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff3b30, #a3151a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ffffff', fontSize: '13px', fontWeight: '700', flexShrink: 0
                      }}>{user.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ color: '#f5f0e8', fontSize: '13px', fontWeight: '600' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', color: '#a09880', fontSize: '13px' }}>{user.email}</td>
                  <td style={{ padding: '12px 18px' }}>
                    <span className={`role-badge ${roleClass}`}>{user.role || 'user'}</span>
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '500' }}>🔥 {user.streak || 0}</span>
                  </td>
                  <td style={{ padding: '12px 18px', color: '#a09880', fontSize: '13px' }}>{user.noteCount}</td>
                  <td style={{ padding: '12px 18px', color: '#a09880', fontSize: '13px' }}>{user.quizCount}</td>
                  <td style={{ padding: '12px 18px', color: '#5a5040', fontSize: '12px', fontWeight: '500' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/admin/users/${user._id}`)}
                        className="admin-btn-action-view">View</button>
                      {isFullAdmin && (
                        <button onClick={() => { setRoleModalUser(user); setSelectedRole(user.role === 'subadmin' ? 'subadmin' : 'user') }}
                          className="admin-btn-action-role">Change Role</button>
                      )}
                      {isFullAdmin && (
                        <button onClick={() => handleDelete(user._id, user.email)}
                          className="admin-btn-action-delete">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {data.pages > 1 && (
          <div style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center',
            borderTop: '1px solid rgba(255,59,48,0.08)', background: 'rgba(0,0,0,0.2)' }}>
            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`admin-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Role Change Modal (Admin only) */}
      {roleModalUser && (
        <div onClick={() => setRoleModalUser(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0d0d0d', border: '1px solid rgba(255,59,48,0.15)',
            borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'adminModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both'
          }}>
            <h2 style={{ color: '#f5f0e8', fontSize: '20px', margin: '0 0 6px', fontFamily: "'DM Serif Display', serif" }}>
              Change Role
            </h2>
            <p style={{ color: '#a09880', fontSize: '13px', margin: '0 0 20px' }}>
              Assign role for <strong style={{ color: '#f5f0e8' }}>{roleModalUser.name}</strong> ({roleModalUser.email})
            </p>

            <form onSubmit={handleRoleChangeSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#a09880', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Select Role
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                    color: '#f5f0e8', fontSize: '14px', outline: 'none'
                  }}
                >
                  <option value="user" style={{ background: '#141414', color: '#f5f0e8' }}>User (Normal App User)</option>
                  <option value="subadmin" style={{ background: '#141414', color: '#fcd34d' }}>SubAdmin (Limited Admin Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRoleModalUser(null)} style={{
                  padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#a09880', fontSize: '13px', cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" disabled={roleSubmitting} style={{
                  padding: '9px 16px', background: 'linear-gradient(135deg, #ff3b30, #a3151a)',
                  border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                }}>
                  {roleSubmitting ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
