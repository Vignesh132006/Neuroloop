import { useState, useEffect } from 'react'
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

const dots = [
  {top:'15%',left:'20%',size:4,delay:'0s',dur:'3s'},
  {top:'25%',left:'75%',size:3,delay:'0.5s',dur:'4s'},
  {top:'60%',left:'15%',size:5,delay:'1s',dur:'3.5s'},
  {top:'70%',left:'80%',size:3,delay:'1.5s',dur:'5s'},
  {top:'40%',left:'60%',size:4,delay:'0.8s',dur:'4.2s'},
  {top:'85%',left:'35%',size:3,delay:'2s',dur:'3.8s'},
  {top:'10%',left:'50%',size:4,delay:'0.3s',dur:'4.5s'},
  {top:'50%',left:'88%',size:3,delay:'1.2s',dur:'3.2s'},
]

const quotes = [
  {q:'Learning is not attained by chance. It must be sought with ardor and attended with diligence.',a:'Abigail Adams'},
  {q:'The beautiful thing about learning is that nobody can take it away from you.',a:'B.B. King'},
  {q:'An investment in knowledge pays the best interest.',a:'Benjamin Franklin'},
  {q:'Education is the most powerful weapon you can use to change the world.',a:'Nelson Mandela'},
  {q:'The more that you read, the more things you will know.',a:'Dr. Seuss'},
]

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

  // Quote rotation
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)

  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % quotes.length)
        setQuoteVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
          justify-content:space-between;padding:0;
          position:relative;overflow:hidden;
          border-right:1px solid rgba(255,255,255,0.06);
          background:#0a0a0a;
        }
        @media (max-width: 900px) {
          .lp-left { display: none; }
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
          cursor:pointer;
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

        /* Animated neural network background */
        .lp-canvas-wrap{
          position:absolute;inset:0;overflow:hidden;
        }

        /* Floating orbs */
        .lp-orb{
          position:absolute;border-radius:50%;
          filter:blur(80px);pointer-events:none;
          animation:orbFloat linear infinite;
        }
        .lp-orb-1{
          width:400px;height:400px;
          background:rgba(212,175,55,0.12);
          top:-100px;left:-100px;
          animation-duration:18s;
          animation-name:orbFloat1;
        }
        .lp-orb-2{
          width:300px;height:300px;
          background:rgba(16,185,129,0.08);
          bottom:-80px;right:-80px;
          animation-duration:22s;
          animation-name:orbFloat2;
        }
        .lp-orb-3{
          width:200px;height:200px;
          background:rgba(212,175,55,0.07);
          top:40%;left:40%;
          animation-duration:15s;
          animation-name:orbFloat3;
        }

        @keyframes orbFloat1{
          0%{transform:translate(0,0) scale(1);}
          33%{transform:translate(60px,40px) scale(1.1);}
          66%{transform:translate(-30px,70px) scale(0.95);}
          100%{transform:translate(0,0) scale(1);}
        }
        @keyframes orbFloat2{
          0%{transform:translate(0,0) scale(1);}
          33%{transform:translate(-50px,-40px) scale(1.08);}
          66%{transform:translate(30px,-60px) scale(0.92);}
          100%{transform:translate(0,0) scale(1);}
        }
        @keyframes orbFloat3{
          0%{transform:translate(0,0) scale(1);}
          50%{transform:translate(-40px,30px) scale(1.15);}
          100%{transform:translate(0,0) scale(1);}
        }

        /* Animated grid lines */
        .lp-grid{
          position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(212,175,55,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(212,175,55,0.04) 1px,transparent 1px);
          background-size:60px 60px;
          animation:gridShift 20s linear infinite;
        }
        @keyframes gridShift{
          0%{background-position:0 0;}
          100%{background-position:60px 60px;}
        }

        /* Animated dots */
        .lp-dot{
          position:absolute;border-radius:50%;
          background:var(--gold);
          animation:dotPulse ease-in-out infinite;
        }
        @keyframes dotPulse{
          0%,100%{opacity:0.15;transform:scale(1);}
          50%{opacity:0.6;transform:scale(1.5);}
        }

        /* Rotating ring */
        .lp-ring{
          position:absolute;border-radius:50%;
          border:1px solid rgba(212,175,55,0.12);
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          animation:ringRotate linear infinite;
        }
        .lp-ring-1{width:320px;height:320px;animation-duration:25s;}
        .lp-ring-2{width:480px;height:480px;animation-duration:35s;animation-direction:reverse;}
        .lp-ring-3{width:620px;height:620px;animation-duration:45s;
                   border-color:rgba(16,185,129,0.08);}
        @keyframes ringRotate{
          from{transform:translate(-50%,-50%) rotate(0deg);}
          to{transform:translate(-50%,-50%) rotate(360deg);}
        }

        /* Center logo mark */
        .lp-center-mark{
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          display:flex;flex-direction:column;
          align-items:center;gap:16px;
          z-index:2;
        }
        .lp-logo-hex{
          width:72px;height:72px;border-radius:20px;
          background:linear-gradient(135deg,#d4af37,#a08020);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 0 1px rgba(212,175,55,0.3),
                     0 0 40px rgba(212,175,55,0.25),
                     0 0 80px rgba(212,175,55,0.1);
          animation:logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse{
          0%,100%{box-shadow:0 0 0 1px rgba(212,175,55,0.3),0 0 40px rgba(212,175,55,0.25),0 0 80px rgba(212,175,55,0.1);}
          50%{box-shadow:0 0 0 1px rgba(212,175,55,0.5),0 0 60px rgba(212,175,55,0.35),0 0 100px rgba(212,175,55,0.15);}
        }
        .lp-logo-svg{width:36px;height:36px;}

        .lp-brand-name{
          font-family:'DM Serif Display',serif;
          font-size:1.6rem;color:#f5f0e8;
          text-align:center;letter-spacing:-0.01em;
        }
        .lp-brand-name span{color:#d4af37;}

        .lp-brand-tagline{
          font-size:0.82rem;color:rgba(255,255,255,0.35);
          text-align:center;letter-spacing:0.06em;
          text-transform:uppercase;
        }

        /* Rotating text ring */
        .lp-text-ring{
          position:absolute;bottom:48px;left:0;right:0;
          display:flex;justify-content:center;
          z-index:2;
        }
        .lp-quote-fade{
          text-align:center;
          max-width:360px;
          animation:quoteFade 0.6s ease;
        }
        @keyframes quoteFade{
          from{opacity:0;transform:translateY(8px);}
          to{opacity:1;transform:translateY(0);}
        }
        .lp-quote-mark{
          font-family:'DM Serif Display',serif;
          font-size:3rem;color:rgba(212,175,55,0.2);
          line-height:0.5;margin-bottom:12px;display:block;
        }
        .lp-quote-q{
          font-family:'DM Serif Display',serif;
          font-size:1rem;color:rgba(255,255,255,0.65);
          font-style:italic;line-height:1.6;margin-bottom:8px;
        }
        .lp-quote-a{
          font-size:0.72rem;color:#d4af37;
          font-weight:600;letter-spacing:0.08em;
          text-transform:uppercase;
        }

        /* Top left branding */
        .lp-top-brand{
          position:absolute;top:32px;left:36px;
          display:flex;align-items:center;gap:10px;
          z-index:3;
        }
        .lp-top-brand-icon{
          width:32px;height:32px;border-radius:8px;
          background:linear-gradient(135deg,#d4af37,#a08020);
          display:flex;align-items:center;justify-content:center;
        }
        .lp-top-brand-name{
          font-family:'DM Serif Display',serif;
          font-size:1.1rem;color:#f5f0e8;
        }
        .lp-top-brand-name span{color:#d4af37;}
      `}</style>

      {/* LEFT — Animated Visual Panel */}
      <div className="lp-left" style={{position:'relative',overflow:'hidden',background:'#0a0a0a'}}>
        {/* Grid */}
        <div className="lp-grid"/>
        {/* Orbs */}
        <div className="lp-orb lp-orb-1"/>
        <div className="lp-orb lp-orb-2"/>
        <div className="lp-orb lp-orb-3"/>
        {/* Rings */}
        <div className="lp-ring lp-ring-1"/>
        <div className="lp-ring lp-ring-2"/>
        <div className="lp-ring lp-ring-3"/>
        {/* Dots */}
        {dots.map((d,i)=>(
          <div key={i} className="lp-dot" style={{
            top:d.top,left:d.left,
            width:d.size,height:d.size,
            animationDelay:d.delay,
            animationDuration:d.dur,
          }}/>
        ))}
        {/* Top brand */}
        <div className="lp-top-brand">
          <div className="lp-top-brand-icon">
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="8" r="3" fill="#0a0a0a"/>
              <circle cx="28" cy="24" r="3" fill="#0a0a0a"/>
              <circle cx="8" cy="24" r="3" fill="#0a0a0a"/>
              <line x1="18" y1="11" x2="26" y2="22" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="11" x2="10" y2="22" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10" y1="24" x2="26" y2="24" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="lp-top-brand-name">Neuro<span>Loop</span></div>
        </div>
        {/* Center logo */}
        <div className="lp-center-mark">
          <div className="lp-logo-hex">
            <svg className="lp-logo-svg" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="8" r="3.5" fill="rgba(10,10,10,0.9)"/>
              <circle cx="28" cy="24" r="3.5" fill="rgba(10,10,10,0.9)"/>
              <circle cx="8" cy="24" r="3.5" fill="rgba(10,10,10,0.9)"/>
              <line x1="18" y1="11.5" x2="26" y2="22" stroke="rgba(10,10,10,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="11.5" x2="10" y2="22" stroke="rgba(10,10,10,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10" y1="24" x2="26" y2="24" stroke="rgba(10,10,10,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="lp-brand-name">Neuro<span>Loop</span></div>
          <div className="lp-brand-tagline">AI Learning Journal</div>
        </div>
        {/* Rotating quote */}
        <div className="lp-text-ring">
          {quoteVisible && (
            <div className="lp-quote-fade">
              <span className="lp-quote-mark">&ldquo;</span>
              <div className="lp-quote-q">{quotes[quoteIndex].q}</div>
              <div className="lp-quote-a">&mdash; {quotes[quoteIndex].a}</div>
            </div>
          )}
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
                boxShadow:'0 4px 10px rgba(212,175,55,0.4)',
              }}>
                <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="8" r="3" fill="#0a0a0a"/>
                  <circle cx="28" cy="24" r="3" fill="#0a0a0a"/>
                  <circle cx="8" cy="24" r="3" fill="#0a0a0a"/>
                  <line x1="18" y1="11" x2="26" y2="22" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="18" y1="11" x2="10" y2="22" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="10" y1="24" x2="26" y2="24" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
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
              {error}
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
                  autoComplete="username"
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
                  autoComplete="current-password"
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
                {loading ? 'Signing In...' : 'Sign In'}
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
                  autoComplete="name"
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
                  autoComplete="email"
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
                  autoComplete="new-password"
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
                {loading ? 'Creating account...' : 'Create Account'}
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