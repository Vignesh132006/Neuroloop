import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/admin/login`, { email, password })
      localStorage.setItem('adminToken', res.data.token)
      localStorage.setItem('adminUser', JSON.stringify(res.data.admin))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.1) 0%, transparent 60%), #050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', margin: '0 16px',
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px', padding: '40px',
        boxShadow: '0 0 60px rgba(124,58,237,0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px'
          }}>🛡️</div>
          <h1 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: '600', margin: '0 0 6px' }}>
            Admin Panel
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            NeuroLoop Administration
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500',
              textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              Admin Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="neuroloopadmin@gmail.com" required
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500',
              textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password" required
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
              color: '#fca5a5', fontSize: '13px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Signing in...' : '🛡️ Sign In as Admin'}
          </button>
        </form>

        <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '24px' }}>
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  )
}
