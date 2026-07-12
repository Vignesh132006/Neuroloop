import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function GoogleAuthSuccess() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    console.log('[GoogleAuthSuccess] Success page loaded. URL:', window.location.href);
    const params   = new URLSearchParams(window.location.search)
    const token    = params.get('token')
    const userStr  = params.get('user')
    const error    = params.get('error')
    console.log('[GoogleAuthSuccess] Params parsed:', { token: token ? 'Present' : 'Missing', user: userStr ? 'Present' : 'Missing', error });

    if (error || !token) {
      console.warn('[GoogleAuthSuccess] Redirecting to login: missing token or error present');
      navigate('/login?error=google_failed')
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr))
      console.log('[GoogleAuthSuccess] User JSON parsed successfully:', user);
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      login(user, token)
      console.log('[GoogleAuthSuccess] login context called. Navigating to dashboard...');
      navigate('/dashboard', { replace: true })
    } catch (e) {
      console.error('[GoogleAuthSuccess] Exception in parsing/login:', e);
      navigate('/login?error=parse_failed')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(124,58,237,0.2)',
        borderTop: '3px solid #7c3aed',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
        Signing you in with Google...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
