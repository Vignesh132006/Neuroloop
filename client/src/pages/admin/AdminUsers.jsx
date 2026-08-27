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
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 20px;
          overflow: hidden;
          animation: adminFadeInUp 0.5s ease both;
          box-shadow: 0 4px 24px rgba(233, 30, 140, 0.06);
        }
        .admin-search-inp {
          padding: 10px 16px;
          width: 280px;
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 50px;
          color: #1A1A2E;
          font-size: 13px;
          outline: none;
          transition: all 0.25s;
        }
        .admin-search-inp:focus {
          border-color: #E91E8C;
          box-shadow: 0 0 0 3px rgba(233, 30, 140, 0.1);
        }
        .admin-user-row {
          border-bottom: 1px solid #F9C0D8;
          transition: background 0.2s ease;
        }
        .admin-user-row:hover {
          background: #FFF0F5 !important;
        }
        .admin-btn-action-view {
          padding: 6px 14px;
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 50px;
          color: #E91E8C;
          font-size: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-btn-action-view:hover {
          background: #E91E8C;
          color: #ffffff;
        }
        .admin-btn-action-role {
          padding: 6px 14px;
          background: #FFFFFF;
          border: 1.5px solid #FDE68A;
          border-radius: 50px;
          color: #D97706;
          font-size: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-btn-action-role:hover {
          background: #D97706;
          color: #ffffff;
        }
        .admin-btn-action-delete {
          padding: 6px 14px;
          background: #FFFFFF;
          border: 1.5px solid #FECACA;
          border-radius: 50px;
          color: #DC2626;
          font-size: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-btn-action-delete:hover {
          background: #DC2626;
          color: #ffffff;
        }
        .admin-page-btn {
          width: 34px;
          height: 34px;
          border-radius: 50px;
          border: 1.5px solid #F9C0D8;
          background: #FFFFFF;
          color: #E91E8C;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-page-btn.active {
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 10px rgba(233, 30, 140, 0.2);
        }
        .role-badge {
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .role-badge-admin {
          background: #FCE4F0;
          color: #E91E8C;
          border: 1px solid #F9C0D8;
        }
        .role-badge-subadmin {
          background: #FEF3C7;
          color: #D97706;
          border: 1px solid #FDE68A;
        }
        .role-badge-user {
          background: #E0F2FE;
          color: #0284C7;
          border: 1px solid #BAE6FD;
        }
      `}</style>

      <div className="admin-users-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#1A1A2E', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', fontFamily: "'Playfair Display', Georgia, serif" }}>Users</h1>
          <p style={{ color: '#4A4A6A', fontSize: '13px', margin: 0 }}>{data.total} total users</p>
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
            <tr style={{ borderBottom: '1.5px solid #F9C0D8', background: '#FFF0F5' }}>
              {['User', 'Email', 'Role', 'Streak', 'Notes', 'Quizzes', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 18px', textAlign: 'left',
                  color: '#8888AA', fontSize: '11px', fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#8888AA', fontSize: '13px' }}>Loading users data...</td></tr>
            ) : data.users.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#8888AA', fontSize: '13px' }}>No users found</td></tr>
            ) : data.users.map(user => {
              const roleClass = user.role === 'admin' ? 'role-badge-admin' : user.role === 'subadmin' ? 'role-badge-subadmin' : 'role-badge-user'
              return (
                <tr key={user._id} className="admin-user-row">
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #E91E8C, #FF6B9D)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ffffff', fontSize: '13px', fontWeight: '700', flexShrink: 0
                      }}>{user.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ color: '#1A1A2E', fontSize: '14px', fontWeight: '600' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#4A4A6A', fontSize: '13px' }}>{user.email}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`role-badge ${roleClass}`}>{user.role || 'user'}</span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ color: '#E91E8C', fontSize: '13px', fontWeight: '700' }}>🔥 {user.streak || 0}</span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#4A4A6A', fontSize: '13px' }}>{user.noteCount}</td>
                  <td style={{ padding: '14px 18px', color: '#4A4A6A', fontSize: '13px' }}>{user.quizCount}</td>
                  <td style={{ padding: '14px 18px', color: '#8888AA', fontSize: '12px', fontWeight: '500' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/admin/users/${user._id}`)}
                        className="admin-btn-action-view">View</button>
                      {isFullAdmin && (
                        <button onClick={() => { setRoleModalUser(user); setSelectedRole(user.role === 'subadmin' ? 'subadmin' : 'user') }}
                          className="admin-btn-action-role">Role</button>
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
            borderTop: '1.5px solid #F9C0D8', background: '#FFF0F5' }}>
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
          position: 'fixed', inset: 0, background: 'rgba(255, 240, 245, 0.6)',
          backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF', border: '1.5px solid #F9C0D8',
            borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '90%',
            boxShadow: '0 12px 40px rgba(233, 30, 140, 0.12)', animation: 'adminModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both'
          }}>
            <h2 style={{ color: '#1A1A2E', fontSize: '22px', margin: '0 0 6px', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}>
              Change Role
            </h2>
            <p style={{ color: '#4A4A6A', fontSize: '13px', margin: '0 0 20px' }}>
              Assign role for <strong style={{ color: '#1A1A2E' }}>{roleModalUser.name}</strong> ({roleModalUser.email})
            </p>

            <form onSubmit={handleRoleChangeSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#8888AA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Select Role
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', background: '#FFFFFF',
                    border: '1.5px solid #F9C0D8', borderRadius: '12px',
                    color: '#1A1A2E', fontSize: '14px', outline: 'none'
                  }}
                >
                  <option value="user">User (Normal App User)</option>
                  <option value="subadmin">SubAdmin (Limited Admin Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRoleModalUser(null)} style={{
                  padding: '10px 20px', background: '#FFFFFF', border: '1.5px solid #F9C0D8',
                  borderRadius: '50px', color: '#E91E8C', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" disabled={roleSubmitting} style={{
                  padding: '10px 24px', background: 'linear-gradient(135deg, #E91E8C, #FF6B9D)',
                  border: 'none', borderRadius: '50px', color: '#ffffff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(233, 30, 140, 0.25)'
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
