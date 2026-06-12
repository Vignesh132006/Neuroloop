import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const getStrength = (pwd) => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score
}
const strengthColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981']
const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

export default function Login() {
  const [activeTab, setActiveTab] = useState('login')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Signup fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupGithub, setSignupGithub] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        githubUsername: signupGithub || undefined,
      })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    alert("Google login is coming soon!")
  }

  const pwdStrength = getStrength(signupPassword)
  const isLogin = activeTab === 'login'
  const setIsLogin = (val) => {
    setActiveTab(val ? 'login' : 'signup')
    setError('')
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#0a0a0a'}}>
      <style>{`
        .lp-left{
          flex:1.2;display:flex;flex-direction:column;
          justify-content:space-between;padding:48px 56px;
          position:relative;overflow:hidden;
          border-right:1px solid rgba(255,255,255,0.06);
        }
        @media (max-width: 900px) {
          .lp-left { display: none; }
        }
        .lp-left-glow{
          position:absolute;width:500px;height:500px;
          border-radius:50%;pointer-events:none;
          background:radial-gradient(circle,rgba(212,175,55,0.08) 0%,transparent 70%);
          top:-150px;left:-150px;
        }
        .lp-left-glow2{
          position:absolute;width:350px;height:350px;
          border-radius:50%;pointer-events:none;
          background:radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%);
          bottom:-100px;right:0;
        }
        .lp-right{
          width:480px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          padding:40px;background:#0d0d0d;
        }
        @media (max-width: 900px) {
          .lp-right { width: 100%; }
        }
        .lp-form-wrap{width:100%;max-width:360px;}

        .lp-headline{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:3rem;line-height:1.15;
          color:#f5f0e8;margin-bottom:10px;
          font-weight:400;
        }
        .lp-headline em{
          font-style:italic;color:#d4af37;
        }
        .lp-tagline{color:#a09880;font-size:0.95rem;line-height:1.6;max-width:420px;}

        .lp-stat-grid{
          display:grid;grid-template-columns:1fr 1fr;gap:12px;
          margin-top:44px;
        }
        .lp-stat{
          background:#111111;
          border:1px solid rgba(255,255,255,0.07);
          border-radius:13px;padding:16px;
          display:flex;align-items:center;gap:12px;
          transition:all 0.2s;
        }
        .lp-stat:hover{
          border-color:rgba(212,175,55,0.2);
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(0,0,0,0.3);
        }
        .lp-stat-ic{
          width:38px;height:38px;border-radius:9px;
          display:flex;align-items:center;justify-content:center;
          font-size:1.15rem;flex-shrink:0;
        }
        .lp-stat-v{font-weight:700;font-size:1.05rem;color:#f5f0e8;}
        .lp-stat-l{font-size:0.7rem;color:#5a5040;margin-top:1px;}

        .lp-quote-block{margin-top:40px;}
        .lp-quote-line{
          width:32px;height:2px;background:#d4af37;
          margin-bottom:14px;border-radius:99px;
        }
        .lp-quote-text{
          font-family:'DM Serif Display',serif;
          font-size:1.25rem;color:#f5f0e8;
          line-height:1.5;font-weight:400;
          font-style:italic;margin-bottom:8px;
        }
        .lp-quote-auth{font-size:0.78rem;color:#d4af37;font-weight:600;}

        .lp-join{
          display:flex;align-items:center;gap:10px;
          margin-top:32px;
        }
        .lp-avs{display:flex;}
        .lp-av{
          width:28px;height:28px;border-radius:50%;
          border:2px solid #0a0a0a;
          margin-right:-7px;
          font-size:0.7rem;font-weight:700;
          display:flex;align-items:center;justify-content:center;
          color:#0a0a0a;
        }
        .lp-join-t{
          font-size:0.8rem;color:#a09880;
          margin-left:13px;
        }
        .lp-join-t strong{color:#f5f0e8;}

        .lp-form-title{
          font-family:'DM Serif Display',serif;
          font-size:1.6rem;color:#f5f0e8;
          font-weight:400;margin-bottom:4px;
        }
        .lp-form-sub{color:#a09880;font-size:0.85rem;margin-bottom:24px;}

        .lp-tabs{
          display:flex;
          background:#161616;
          border:1px solid rgba(255,255,255,0.07);
          border-radius:10px;padding:4px;margin-bottom:24px;
        }
        .lp-tab{
          flex:1;padding:9px;border-radius:7px;
          border:none;font-size:0.85rem;font-weight:600;
          color:#5a5040;background:transparent;transition:all 0.2s;
        }
        .lp-tab.active{
          background:#d4af37;color:#0a0a0a;
          box-shadow:0 3px 12px rgba(212,175,55,0.35);
        }

        .lp-field{margin-bottom:14px;}
        .lp-lbl{
          display:block;font-size:0.68rem;font-weight:600;
          color:#a09880;letter-spacing:0.1em;
          text-transform:uppercase;margin-bottom:7px;
        }
        .lp-inp{
          width:100%;padding:12px 15px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:9px;color:#f5f0e8;font-size:0.9rem;
          transition:all 0.2s;
        }
        .lp-inp:focus{
          border-color:rgba(212,175,55,0.55);
          box-shadow:0 0 0 3px rgba(212,175,55,0.1);
          background:rgba(212,175,55,0.03);
          outline:none;
        }
        .lp-inp::placeholder{color:#3a3028;}

        .lp-btn{
          width:100%;padding:13px;border-radius:9px;border:none;
          background:#d4af37;color:#0a0a0a;
          font-size:0.92rem;font-weight:700;
          letter-spacing:0.03em;
          box-shadow:0 4px 20px rgba(212,175,55,0.35);
          margin-top:4px;transition:all 0.2s;
          cursor:pointer;
        }
        .lp-btn:hover{
          background:#f0d060;
          transform:translateY(-1px);
          box-shadow:0 8px 28px rgba(212,175,55,0.45);
        }

        .lp-divider{
          display:flex;align-items:center;gap:12px;
          margin:18px 0;color:#3a3028;font-size:0.75rem;
        }
        .lp-divider::before,.lp-divider::after{
          content:'';flex:1;height:1px;
          background:rgba(255,255,255,0.07);
        }

        .lp-google{
          width:100%;padding:11px;border-radius:9px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.09);
          color:#a09880;font-size:0.86rem;font-weight:500;
          display:flex;align-items:center;justify-content:center;gap:10px;
          transition:all 0.2s;
          cursor:pointer;
        }
        .lp-google:hover{
          background:rgba(255,255,255,0.08);
          color:#f5f0e8;
          border-color:rgba(255,255,255,0.16);
        }
      `}</style>

      {/* LEFT */}
      <div className="lp-left">
        <div className="lp-left-glow"/>
        <div className="lp-left-glow2"/>

        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{
            width:36,height:36,borderRadius:9,
            background:'linear-gradient(135deg,#d4af37,#a08020)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:18,boxShadow:'0 4px 14px rgba(212,175,55,0.4)',
          }}>🧠</div>
          <span style={{
            fontFamily:"'DM Serif Display',serif",
            fontSize:'1.2rem',color:'#f5f0e8',
          }}>Neuro<span style={{color:'#d4af37'}}>Loop</span></span>
        </div>

        {/* Headline */}
        <div>
          <h1 className="lp-headline">
            Learn smarter.<br/><em>Remember forever.</em>
          </h1>
          <p className="lp-tagline">
            AI-powered spaced repetition, quizzes, and study plans
            that adapt to how your brain actually learns.
          </p>

          <div className="lp-stat-grid">
            {[
              {ic:'🔥',bg:'rgba(239,68,68,0.12)',v:'47 days',l:'Top streak'},
              {ic:'🧠',bg:'rgba(212,175,55,0.12)',v:'1,240',l:'Notes created'},
              {ic:'⚡',bg:'rgba(16,185,129,0.12)',v:'98%',l:'Quiz accuracy'},
              {ic:'🏆',bg:'rgba(212,175,55,0.1)',v:'#1',l:'Leaderboard'},
            ].map(s=>(
              <div key={s.l} className="lp-stat">
                <div className="lp-stat-ic" style={{background:s.bg}}>{s.ic}</div>
                <div>
                  <div className="lp-stat-v">{s.v}</div>
                  <div className="lp-stat-l">{s.l}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-quote-block">
            <div className="lp-quote-line"/>
            <div className="lp-quote-text">
              "An investment in knowledge pays the best interest."
            </div>
            <div className="lp-quote-auth">— Benjamin Franklin</div>
          </div>
        </div>

        {/* Join row */}
        <div className="lp-join">
          <div className="lp-avs">
            {[
              {bg:'#d4af37',t:'V'},{bg:'#10b981',t:'A'},
              {bg:'#3b82f6',t:'R'},{bg:'#8b5cf6',t:'S'},
              {bg:'#ef4444',t:'M'},
            ].map(a=>(
              <div key={a.t} className="lp-av" style={{background:a.bg}}>{a.t}</div>
            ))}
          </div>
          <div className="lp-join-t">
            <strong>10,000+</strong> learners building their knowledge loop
          </div>
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="lp-right">
        <div className="lp-form-wrap">
          {/* Mobile logo (hidden on desktop where left panel shows) */}
          <div style={{ display: 'none', marginBottom: '1.5rem', justifyContent: 'center' }} className="mobile-logo">
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{
                width:32,height:32,borderRadius:8,
                background:'linear-gradient(135deg,#d4af37,#a08020)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:16,boxShadow:'0 4px 10px rgba(212,175,55,0.4)',
              }}>🧠</div>
              <span style={{
                fontFamily:"'DM Serif Display',serif",
                fontSize:'1.1rem',color:'#f5f0e8',
              }}>Neuro<span style={{color:'#d4af37'}}>Loop</span></span>
            </div>
          </div>

          <div className="lp-form-title">{isLogin ? 'Welcome back' : 'Get Started'}</div>
          <div className="lp-form-sub">{isLogin ? 'Sign in to continue your learning loop' : 'Create an account to start learning'}</div>

          <div className="lp-tabs">
            <button className={`lp-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
              Log In
            </button>
            <button className={`lp-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
              Sign Up
            </button>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem', fontSize: '0.85rem', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="lp-field">
                <label className="lp-lbl">Email address</label>
                <input
                  id="login-email"
                  className="lp-inp"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="lp-field">
                <label className="lp-lbl">Password</label>
                <input
                  id="login-password"
                  className="lp-inp"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              
              {/* Remember me + Forgot password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#a09880' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: '#d4af37' }}
                  />
                  Remember me
                </label>
                <span style={{ color: '#d4af37', cursor: 'pointer', fontWeight: 500 }}>
                  Forgot password?
                </span>
              </div>

              <button id="login-submit" className="lp-btn" type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="lp-field">
                <label className="lp-lbl">Full name</label>
                <input
                  id="signup-name"
                  className="lp-inp"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
              <div className="lp-field">
                <label className="lp-lbl">Email address</label>
                <input
                  id="signup-email"
                  className="lp-inp"
                  type="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="lp-field">
                <label className="lp-lbl">Password</label>
                <input
                  id="signup-password"
                  className="lp-inp"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password strength meter */}
              {signupPassword.length > 0 && (
                <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
                  <div className="strength-meter" style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{
                          height: '4px',
                          flex: 1,
                          borderRadius: '2px',
                          background: i < pwdStrength ? strengthColors[pwdStrength - 1] : 'rgba(255,255,255,0.08)',
                          transition: 'background 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                  <p style={{
                    fontSize: '0.72rem',
                    marginTop: '4px',
                    color: pwdStrength > 0 ? strengthColors[pwdStrength - 1] : '#a09880',
                    fontWeight: 600,
                  }}>
                    {pwdStrength > 0 ? strengthLabels[pwdStrength - 1] : 'Enter a password'}
                  </p>
                </div>
              )}

              <div className="lp-field">
                <label className="lp-lbl">GitHub username (optional)</label>
                <input
                  id="signup-github"
                  className="lp-inp"
                  type="text"
                  placeholder="username"
                  value={signupGithub}
                  onChange={(e) => setSignupGithub(e.target.value)}
                />
              </div>

              <button id="signup-submit" className="lp-btn" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>
          )}

          <div className="lp-divider">or</div>

          <button className="lp-google" onClick={handleGoogleLogin}>
            <svg width="17" height="17" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.5-2.9-11.3-7.1l-6.5 5C9.5 39.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4-4.2 5.2l6.2 5.2C41 34.9 44 29.9 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Mobile logo override style */}
      <style>{`
        @media (max-width: 900px) {
          .mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}