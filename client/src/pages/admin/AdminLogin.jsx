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
      background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.08) 0%, transparent 60%), #0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative'
    }}>
      <style>{`
        @keyframes adminCardReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminLogoPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(212,175,55,0.3); }
          50% { transform: scale(1.06); box-shadow: 0 0 25px rgba(212,175,55,0.5); }
        }
        .admin-login-card {
          animation: adminCardReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .admin-logo-box {
          animation: adminLogoPulse 3s ease-in-out infinite;
        }
        .admin-inp {
          width: 100%; padding: 11px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #f5f0e8; fontSize: '14px';
          outline: 'none'; boxSizing: 'border-box';
          transition: all 0.25s;
        }
        .admin-inp:focus {
          border-color: rgba(212,175,55,0.55);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
          background: rgba(212,175,55,0.02);
        }
        .admin-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #d4af37, #8a6f1e);
          color: #0a0a0a; border: none; borderRadius: '10px';
          fontSize: '15px'; fontWeight: '700'; cursor: 'pointer';
          box-shadow: 0 4px 15px rgba(212,175,55,0.25);
          transition: all 0.25s;
        }
        .admin-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #f0d060, #d4af37);
          box-shadow: 0 6px 20px rgba(212,175,55,0.4);
          transform: translateY(-1px);
        }
        .admin-btn:disabled {
          opacity: 0.7; cursor: not-allowed;
        }
      `}</style>

      {/* Floating back background elements to match main app */}
      <div style={{
        position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
        border: '1px solid rgba(212,175,55,0.05)', top: '10%', left: '10%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        border: '1px solid rgba(212,175,55,0.03)', bottom: '10%', right: '10%', pointerEvents: 'none'
      }} />

      <div className="admin-login-card" style={{
        width: '100%', maxWidth: '400px', margin: '0 16px',
        background: '#0d0d0d',
        border: '1px solid rgba(212,175,55,0.12)',
        borderRadius: '20px', padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        zIndex: 2
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="admin-logo-box" style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #d4af37, #8a6f1e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            color: '#0a0a0a'
          }}>🛡️</div>
          <h1 style={{ color: '#f5f0e8', fontSize: '22px', fontWeight: '600', margin: '0 0 6px', fontFamily: "'DM Serif Display', serif" }}>
            Admin Panel
          </h1>
          <p style={{ color: '#a09880', fontSize: '13px', margin: 0, letterSpacing: '0.05em' }}>
            NEUROLOOP ADMINISTRATION
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#a09880', fontSize: '11px', fontWeight: '600',
              textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Admin Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="neuroloopadmin@gmail.com" required
              className="admin-inp"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#a09880', fontSize: '11px', fontWeight: '600',
              textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password" required
              className="admin-inp"
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
              color: '#fca5a5', fontSize: '13px', borderLeft: '3px solid #ef4444'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="admin-btn">
            {loading ? 'Signing in...' : '🛡️ Sign In as Admin'}
          </button>
        </form>

        <p style={{ color: '#5a5040', fontSize: '11px', textAlign: 'center', marginTop: '24px', letterSpacing: '0.03em' }}>
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  )
}
