import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import EmailVerificationScreen from '../components/EmailVerificationScreen'

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

// Particle system — 30 floating particles
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 8,
  opacity: Math.random() * 0.4 + 0.1,
}));

// Neural network nodes — 8 nodes with connections
const nodes = [
  { x: 20, y: 20 }, { x: 45, y: 12 }, { x: 70, y: 25 },
  { x: 15, y: 50 }, { x: 50, y: 50 }, { x: 80, y: 45 },
  { x: 30, y: 78 }, { x: 65, y: 75 },
];
const connections = [
  [0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[3,6],[4,7],[5,7],[6,7],[1,5],[2,4],
];

// Eye open SVG icon:
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Eye closed SVG icon:
const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function isValidEmail(email) {
  // Check basic format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) return { valid: false, message: 'Please enter a valid email address.' }

  // Check for common typos in popular domains
  const domain = email.split('@')[1]?.toLowerCase()
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com']
  const typoMap = {
    'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com',
    'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.om': 'gmail.com',
    'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com',
    'outloo.com': 'outlook.com', 'outlok.com': 'outlook.com',
    'hotmai.com': 'hotmail.com', 'hotmal.com': 'hotmail.com'
  }

  if (typoMap[domain]) {
    return { valid: false, message: `Did you mean @${typoMap[domain]}?` }
  }

  // Check for missing dot in domain
  if (!domain?.includes('.')) {
    return { valid: false, message: 'Email domain looks incomplete. Example: name@gmail.com' }
  }

  // Check minimum length
  if (email.length < 6) {
    return { valid: false, message: 'Email is too short.' }
  }

  return { valid: true, message: '' }
}

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

  const [verifyMode,  setVerifyMode]  = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingName,  setPendingName]  = useState('');

  const [emailError, setEmailError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Quote rotation
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)

  // Task 1 new states
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Task 2 new states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Task 3 new states
  const [forgotStep, setForgotStep] = useState(null);
  // null = hidden, 'email' = enter email, 'otp' = enter otp, 'reset' = new password

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [forgotIsFirstTime, setForgotIsFirstTime] = useState(false);

  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // OTP countdown timer:
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  // Handlers — wire these to your actual backend routes:
  const handleForgotSendOtp = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true); setForgotError('');
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotIsFirstTime(!!response.data.isFirstTime);
      setForgotStep('otp');
      setOtpTimer(60);
    } catch(err) {
      setForgotError(err.response?.data?.message || 'Email not found');
    } finally { setForgotLoading(false); }
  };

  const handleForgotVerifyOtp = async () => {
    if (!forgotOtp) return;
    setForgotLoading(true); setForgotError('');
    try {
      await api.post('/auth/verify-reset-otp', { email: forgotEmail, otp: forgotOtp });
      setForgotStep('reset');
    } catch(err) {
      setForgotError(err.response?.data?.message || 'Invalid OTP');
    } finally { setForgotLoading(false); }
  };

  const handleForgotReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters');
      return;
    }
    setForgotLoading(true); setForgotError('');
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail, otp: forgotOtp, newPassword
      });
      setForgotSuccess('Password reset! You can now log in.');
      setTimeout(() => {
        setForgotStep(null);
        setForgotEmail(''); setForgotOtp(''); setNewPassword('');
        setForgotSuccess('');
        setForgotIsFirstTime(false);
      }, 2500);
    } catch(err) {
      setForgotError(err.response?.data?.message || 'Reset failed');
    } finally { setForgotLoading(false); }
  };

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
      const { data } = res

      // Handle unverified email
      if (data.status === 'pending_verification') {
        setPendingEmail(data.email);
        setPendingName(data.name || '');
        setVerifyMode(true);
        return;
      }

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
    const emailCheck = isValidEmail(signupEmail)
    if (!emailCheck.valid) {
      setEmailTouched(true)
      setEmailError(emailCheck.message)
      return
    }
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
      const { data } = res

      if (data.status === 'pending_verification') {
        // Show verification screen instead of logging in
        setPendingEmail(data.email);
        setPendingName(data.name);
        setVerifyMode(true);
        return;
      }

      // If somehow token is returned directly (fallback)
      if (data.token) {
        login(data.token, data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerified = (token, user) => {
    // Use the SAME login function your existing login form uses
    login(token, user);
    navigate('/dashboard');
  };


  const pwdStrength = getStrength(signupPassword)
  const isLogin = activeTab === 'login'
  const setIsLogin = (val) => {
    setActiveTab(val ? 'login' : 'signup')
    setError('')
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'var(--bg)'}}>
      <style>{`
        :root {
          --green: #10b981;
        }

        .lp-left{
          flex:1.2;position:relative;overflow:hidden;
          background:var(--bg);
          display:flex;flex-direction:column;
          border-right:1px solid var(--bd);
        }
        @media (max-width: 900px) {
          .lp-left { display: none; }
        }

        .lp-right{
          width:480px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          padding:40px;background:var(--s1);
        }
        @media (max-width: 900px) {
          .lp-right { width: 100%; }
        }
        .lp-form-wrap{width:100%;max-width:360px;}

        .lp-form-title{
          font-family:'DM Serif Display',serif;
          font-size:1.6rem;color:var(--t1);
          font-weight:400;margin-bottom:4px;
        }
        .lp-form-sub{color:var(--t2);font-size:0.85rem;margin-bottom:24px;}

        .lp-tabs{
          display:flex;
          background:var(--s2);
          border:1px solid var(--bd);
          border-radius:10px;padding:4px;margin-bottom:24px;
        }
        .lp-tab{
          flex:1;padding:9px;border-radius:7px;
          border:none;font-size:0.85rem;font-weight:600;
          color:var(--t3);background:transparent;transition:all 0.2s;
          cursor:pointer;
        }
        .lp-tab.active{
          background:var(--gold);color:#ffffff;
          box-shadow:0 3px 12px var(--goldg);
        }

        .lp-field{margin-bottom:14px;}
        .lp-lbl{
          display:block;font-size:0.68rem;font-weight:600;
          color:var(--t2);letter-spacing:0.1em;
          text-transform:uppercase;margin-bottom:7px;
        }
        .lp-inp{
          width:100%;padding:12px 15px;
          background:var(--s1);
          border:1px solid rgba(229,9,20,0.28);
          border-radius:9px;color:var(--t1);font-size:0.9rem;
          transition:all 0.2s;
        }
        .lp-inp:focus{
          border-color:var(--gold);
          box-shadow:0 0 0 3px var(--goldg);
          background:var(--s1);
          outline:none;
        }
        .lp-inp::placeholder{color:var(--t3);}

        .lp-btn{
          width:100%;padding:13px;border-radius:9px;border:none;
          background:var(--gold);color:#ffffff;
          font-size:0.92rem;font-weight:700;
          letter-spacing:0.03em;
          box-shadow:0 4px 20px var(--goldg);
          margin-top:4px;transition:all 0.2s;
          cursor:pointer;
        }
        .lp-btn:hover{
          background:var(--goldl);
          transform:translateY(-1px);
          box-shadow:0 8px 28px var(--goldg);
        }

        .lp-divider{
          display:flex;align-items:center;gap:12px;
          margin:18px 0;color:var(--t3);font-size:0.75rem;
        }
        .lp-divider::before,.lp-divider::after{
          content:'';flex:1;height:1px;
          background:var(--bd);
        }

        .lp-google{
          width:100%;padding:11px;border-radius:9px;
          background:var(--s2);
          border:1px solid var(--bd);
          color:var(--t2);font-size:0.86rem;font-weight:500;
          display:flex;align-items:center;justify-content:center;gap:10px;
          transition:all 0.2s;
          cursor:pointer;
        }
        .lp-google:hover{
          background:var(--s3);
          color:var(--t1);
          border-color:var(--bd);
        }

        /* Parallax spotlight that follows mouse */
        .lp-spotlight{
          position:absolute;
          width:600px;height:600px;
          border-radius:50%;
          pointer-events:none;
          background:radial-gradient(circle,var(--goldg) 0%,transparent 65%);
          transform:translate(-50%,-50%);
          transition:left 0.8s cubic-bezier(0.22,1,0.36,1),
                      top 0.8s cubic-bezier(0.22,1,0.36,1);
          z-index:1;
        }

        /* Animated grid */
        .lp-grid{
          position:absolute;inset:0;z-index:0;
          background-image:
            linear-gradient(rgba(229,9,20,0.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(229,9,20,0.03) 1px,transparent 1px);
          background-size:48px 48px;
          animation:gridDrift 30s linear infinite;
        }
        @keyframes gridDrift{
          0%{background-position:0 0;}
          100%{background-position:48px 48px;}
        }

        /* Floating particles */
        .lp-particle{
          position:absolute;border-radius:50%;
          background:var(--gold);
          pointer-events:none;
          animation:particleDrift linear infinite;
        }
        @keyframes particleDrift{
          0%{transform:translateY(0) translateX(0) scale(1);opacity:var(--op);}
          25%{transform:translateY(-30px) translateX(15px) scale(1.2);}
          50%{transform:translateY(-15px) translateX(-10px) scale(0.8);opacity:calc(var(--op)*1.5);}
          75%{transform:translateY(-40px) translateX(20px) scale(1.1);}
          100%{transform:translateY(0) translateX(0) scale(1);opacity:var(--op);}
        }

        /* Neural network SVG */
        .lp-neural{
          position:absolute;inset:0;z-index:1;
          pointer-events:none;
        }
        .neural-line{
          stroke:rgba(229,9,20,0.12);
          stroke-width:1;
          animation:neuralPulse ease-in-out infinite alternate;
        }
        @keyframes neuralPulse{
          from{stroke-opacity:0.06;stroke-width:0.8;}
          to{stroke-opacity:0.2;stroke-width:1.2;}
        }
        .neural-node{
          fill:rgba(229,9,20,0.25);
          animation:nodePulse ease-in-out infinite alternate;
        }
        @keyframes nodePulse{
          from{r:3;opacity:0.2;}
          to{r:5;opacity:0.6;}
        }
        .neural-node-glow{
          fill:none;stroke:rgba(229,9,20,0.15);
          animation:nodeGlow ease-in-out infinite alternate;
        }
        @keyframes nodeGlow{
          from{r:6;stroke-opacity:0.1;}
          to{r:10;stroke-opacity:0.3;}
        }

        /* Rotating rings */
        .lp-ring{
          position:absolute;border-radius:50%;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          border:1px solid;
          pointer-events:none;z-index:1;
          animation:ringSpin linear infinite;
        }
        .lp-ring-1{
          width:280px;height:280px;
          border-color:rgba(229,9,20,0.1);
          animation-duration:20s;
        }
        .lp-ring-2{
          width:440px;height:440px;
          border-color:rgba(229,9,20,0.06);
          animation-duration:30s;
          animation-direction:reverse;
        }
        .lp-ring-3{
          width:600px;height:600px;
          border-color:rgba(229,9,20,0.05);
          animation-duration:42s;
        }
        .lp-ring-4{
          width:760px;height:760px;
          border-color:rgba(229,9,20,0.03);
          animation-duration:55s;
          animation-direction:reverse;
        }
        @keyframes ringSpin{
          from{transform:translate(-50%,-50%) rotate(0deg);}
          to{transform:translate(-50%,-50%) rotate(360deg);}
        }

        /* Dot on ring 1 */
        .lp-ring-dot{
          position:absolute;top:50%;left:50%;
          width:6px;height:6px;border-radius:50%;
          background:var(--gold);
          box-shadow:0 0 10px var(--gold),0 0 20px var(--goldg);
          animation:ringDotOrbit 20s linear infinite;
          transform-origin:0 0;
        }
        @keyframes ringDotOrbit{
          from{transform:rotate(0deg) translateX(140px) rotate(0deg);}
          to{transform:rotate(360deg) translateX(140px) rotate(-360deg);}
        }
        .lp-ring-dot-2{
          position:absolute;top:50%;left:50%;
          width:4px;height:4px;border-radius:50%;
          background:var(--em);
          box-shadow:0 0 8px var(--em);
          animation:ringDotOrbit2 30s linear infinite reverse;
          transform-origin:0 0;
        }
        @keyframes ringDotOrbit2{
          from{transform:rotate(0deg) translateX(220px) rotate(0deg);}
          to{transform:rotate(360deg) translateX(220px) rotate(-360deg);}
        }

        /* Pulsing center orb */
        .lp-center-orb{
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          z-index:2;display:flex;flex-direction:column;
          align-items:center;gap:14px;
        }
        .lp-orb-core{
          width:80px;height:80px;border-radius:22px;
          background:linear-gradient(135deg,var(--gold),var(--goldl));
          display:flex;align-items:center;justify-content:center;
          box-shadow:
            0 0 0 1px var(--gold),
            0 0 30px var(--goldg),
            0 0 80px rgba(229,9,20,0.15),
            0 0 120px rgba(229,9,20,0.08);
          animation:coreBreath 3s ease-in-out infinite;
        }
        @keyframes coreBreath{
          0%,100%{
            box-shadow:0 0 0 1px var(--gold),0 0 30px var(--goldg),
                       0 0 80px rgba(229,9,20,0.15),0 0 120px rgba(229,9,20,0.08);
            transform:scale(1);
          }
          50%{
            box-shadow:0 0 0 1px var(--goldl),0 0 50px var(--goldg),
                       0 0 100px rgba(229,9,20,0.2),0 0 150px rgba(229,9,20,0.1);
            transform:scale(1.05);
          }
        }

        .lp-brand-word{
          font-family:'DM Serif Display',serif;
          font-size:1.7rem;color:var(--t1);
          text-align:center;letter-spacing:-0.01em;
          animation:brandReveal 1s cubic-bezier(0.22,1,0.36,1) 0.3s both;
        }
        .lp-brand-word span{color:var(--gold);}
        @keyframes brandReveal{
          from{opacity:0;transform:translateY(10px);}
          to{opacity:1;transform:translateY(0);}
        }

        .lp-brand-sub{
          font-size:0.72rem;color:var(--t1);font-weight:500;
          text-transform:uppercase;letter-spacing:0.14em;
          text-align:center;
          animation:brandReveal 1s cubic-bezier(0.22,1,0.36,1) 0.5s both;
        }

        /* Scan line effect */
        .lp-scan{
          position:absolute;left:0;right:0;
          height:1px;
          background:linear-gradient(90deg,transparent,rgba(229,9,20,0.4),transparent);
          animation:scanMove 6s linear infinite;
          pointer-events:none;z-index:3;
        }
        @keyframes scanMove{
          0%{top:-1px;opacity:0;}
          5%{opacity:1;}
          95%{opacity:1;}
          100%{top:100%;opacity:0;}
        }

        /* Corner accents */
        .lp-corner{
          position:absolute;width:32px;height:32px;
          pointer-events:none;z-index:3;
        }
        .lp-corner-tl{
          top:24px;left:24px;
          border-top:2px solid rgba(229,9,20,0.4);
          border-left:2px solid rgba(229,9,20,0.4);
          border-radius:4px 0 0 0;
          animation:cornerPulse 3s ease-in-out infinite;
        }
        .lp-corner-tr{
          top:24px;right:24px;
          border-top:2px solid rgba(229,9,20,0.4);
          border-right:2px solid rgba(229,9,20,0.4);
          border-radius:0 4px 0 0;
          animation:cornerPulse 3s ease-in-out infinite 0.75s;
        }
        .lp-corner-bl{
          bottom:24px;left:24px;
          border-bottom:2px solid rgba(229,9,20,0.4);
          border-left:2px solid rgba(229,9,20,0.4);
          border-radius:0 0 0 4px;
          animation:cornerPulse 3s ease-in-out infinite 1.5s;
        }
        .lp-corner-br{
          bottom:24px;right:24px;
          border-bottom:2px solid rgba(229,9,20,0.4);
          border-right:2px solid rgba(229,9,20,0.4);
          border-radius:0 0 4px 0;
          animation:cornerPulse 3s ease-in-out infinite 2.25s;
        }
        @keyframes cornerPulse{
          0%,100%{opacity:0.3;}
          50%{opacity:0.9;}
        }

        /* Bottom quote */
        .lp-bottom-quote{
          position:absolute;bottom:32px;left:0;right:0;
          padding:0 48px;z-index:4;text-align:center;
        }
        .lp-q-line{
          width:24px;height:1px;background:var(--gold);
          margin:0 auto 12px;opacity:0.6;
        }
        .lp-q-text{
          font-family:'DM Serif Display',serif;
          font-size:0.92rem;color:var(--t2);
          font-style:italic;line-height:1.6;margin-bottom:6px;
          transition:opacity 0.4s ease;
        }
        .lp-q-auth{
          font-size:0.68rem;color:rgba(229,9,20,0.7);
          font-weight:600;letter-spacing:0.08em;text-transform:uppercase;
        }

        /* Top brand badge */
        .lp-top-badge{
          position:absolute;top:28px;left:28px;
          display:flex;align-items:center;gap:9px;
          z-index:5;
          animation:badgeDrop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
        }
        @keyframes badgeDrop{
          from{opacity:0;transform:translateY(-12px);}
          to{opacity:1;transform:translateY(0);}
        }
        .lp-top-badge-icon{
          width:30px;height:30px;border-radius:8px;
          background:linear-gradient(135deg,var(--gold),var(--goldl));
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 12px var(--goldg);
        }
        .lp-top-badge-name{
          font-family:'DM Serif Display',serif;
          font-size:1rem;color:var(--t1);
        }
        .lp-top-badge-name span{color:var(--gold);}

        /* Right panel enter animation */
        .lp-right{
          animation:rightSlide 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }
        @keyframes rightSlide{
          from{opacity:0;transform:translateX(24px);}
          to{opacity:1;transform:translateX(0);}
        }

        /* Form field shake on error */
        .lp-inp.error{
          border-color:var(--red)!important;
          animation:shake 0.4s ease;
        }
        @keyframes shake{
          0%,100%{transform:translateX(0);}
          20%{transform:translateX(-6px);}
          40%{transform:translateX(6px);}
          60%{transform:translateX(-4px);}
          80%{transform:translateX(4px);}
        }

        /* Loading button state */
        .lp-btn-loading{
          position:relative;overflow:hidden;
          pointer-events:none;opacity:0.85;
        }
        .lp-btn-loading::after{
          content:'';
          position:absolute;inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
          animation:btnShimmer 1s ease infinite;
        }
        @keyframes btnShimmer{
          from{transform:translateX(-100%);}
          to{transform:translateX(100%);}
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Password Wrapper styles */
        .lp-pwd-wrap{
          position:relative;margin-bottom:14px;
        }
        .lp-pwd-wrap .lp-inp{
          padding-right:44px;
          margin-bottom:0;
        }
        .lp-pwd-toggle{
          position:absolute;right:14px;top:50%;
          transform:translateY(-50%);
          background:none;border:none;
          color:rgba(255,255,255,0.3);
          cursor:pointer;padding:4px;
          display:flex;align-items:center;justify-content:center;
          transition:color 0.2s;
          border-radius:4px;
        }
        .lp-pwd-toggle:hover{color:var(--gold);}

        /* Inline Forgot Password Panel styles */
        .fp-wrap{
          margin-top:4px;
          border:1px solid rgba(229,9,20,0.2);
          border-radius:12px;
          background:rgba(229,9,20,0.03);
          overflow:hidden;
          animation:fpExpand 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes fpExpand{
          from{opacity:0;transform:translateY(-8px);}
          to{opacity:1;transform:translateY(0);}
        }

        .fp-header{
          display:flex;align-items:center;
          justify-content:space-between;
          padding:12px 16px;
          border-bottom:1px solid rgba(229,9,20,0.12);
        }
        .fp-title{
          font-size:0.8rem;font-weight:600;
          color:var(--gold);display:flex;
          align-items:center;gap:7px;
        }
        .fp-close{
          background:none;border:none;
          color:rgba(255,255,255,0.3);
          cursor:pointer;font-size:1rem;
          padding:2px 6px;border-radius:4px;
          transition:color 0.2s;line-height:1;
        }
        .fp-close:hover{color:rgba(255,255,255,0.7);}

        .fp-body{padding:16px;}

        .fp-step-indicator{
          display:flex;align-items:center;gap:6px;
          margin-bottom:14px;
        }
        .fp-step-dot{
          width:6px;height:6px;border-radius:50%;
          background:rgba(255,255,255,0.15);
          transition:all 0.3s ease;
        }
        .fp-step-dot.done{background:var(--green);box-shadow:0 0 6px var(--green);}
        .fp-step-dot.active{background:var(--gold);box-shadow:0 0 6px var(--gold);
                            transform:scale(1.3);}
        .fp-step-line{flex:1;height:1px;background:rgba(255,255,255,0.08);}

        .fp-label{
          font-size:0.68rem;font-weight:600;
          color:rgba(255,255,255,0.4);
          text-transform:uppercase;letter-spacing:0.1em;
          margin-bottom:7px;display:block;
        }
        .fp-inp{
          width:100%;padding:10px 14px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:9px;color:var(--t1);
          font-size:0.88rem;transition:all 0.2s;
          margin-bottom:10px;
        }
        .fp-inp:focus{
          border-color:rgba(229,9,20,0.5);
          box-shadow:0 0 0 3px rgba(229,9,20,0.1);
          background:rgba(229,9,20,0.03);
          outline:none;
        }
        .fp-inp-pwd-wrap{position:relative;margin-bottom:10px;}
        .fp-inp-pwd-wrap .fp-inp{padding-right:40px;margin-bottom:0;}
        .fp-pwd-eye{
          position:absolute;right:12px;top:50%;
          transform:translateY(-50%);
          background:none;border:none;
          color:rgba(255,255,255,0.3);cursor:pointer;
          display:flex;align-items:center;
          transition:color 0.2s;
        }
        .fp-pwd-eye:hover{color:var(--gold);}

        .fp-btn{
          width:100%;padding:10px;border-radius:9px;
          border:none;background:var(--gold);
          color:#0a0a0a;font-size:0.85rem;font-weight:700;
          transition:all 0.2s;
          box-shadow:0 3px 12px rgba(229,9,20,0.3);
        }
        .fp-btn:hover:not(:disabled){
          background:var(--goldl);
          transform:translateY(-1px);
          box-shadow:0 6px 18px rgba(229,9,20,0.4);
        }
        .fp-btn:disabled{opacity:0.6;cursor:not-allowed;}

        .fp-error{
          font-size:0.75rem;color:#fca5a5;
          margin-bottom:10px;padding:7px 10px;
          background:rgba(239,68,68,0.08);
          border-radius:7px;border-left:2px solid var(--red);
          animation:fpExpand 0.2s ease;
        }
        .fp-success{
          font-size:0.82rem;color:var(--green);
          text-align:center;padding:12px;
          background:rgba(16,185,129,0.08);
          border-radius:9px;border:1px solid rgba(16,185,129,0.2);
          animation:fpExpand 0.3s ease;
        }
        .fp-notice{
          font-size:0.78rem;color:#a09880;
          margin-bottom:12px;padding:8px 12px;
          background:rgba(229,9,20,0.08);
          border-radius:8px;border-left:3px solid var(--gold);
          animation:fpExpand 0.25s ease;
          line-height:1.4;
        }

        .fp-otp-grid{
          display:flex;gap:8px;margin-bottom:10px;
        }
        .fp-otp-inp{
          flex:1;padding:12px 6px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:9px;color:var(--t1);
          font-size:1.1rem;font-weight:700;
          text-align:center;letter-spacing:0.1em;
          transition:all 0.2s;
        }
        .fp-otp-inp:focus{
          border-color:rgba(229,9,20,0.5);
          box-shadow:0 0 0 3px rgba(229,9,20,0.1);
          outline:none;
          background:rgba(229,9,20,0.04);
        }

        .fp-timer{
          font-size:0.72rem;color:rgba(255,255,255,0.3);
          text-align:center;margin-bottom:10px;
        }
        .fp-timer strong{color:var(--gold);}

        .fp-resend{
          background:none;border:none;
          color:var(--gold);font-size:0.75rem;
          cursor:pointer;text-decoration:underline;
          transition:opacity 0.2s;
        }
        .fp-resend:disabled{color:rgba(255,255,255,0.2);
          text-decoration:none;cursor:not-allowed;}

        .fp-trigger{
          display:block;
          background:none;border:none;
          color:rgba(255,255,255,0.3);
          font-size:0.75rem;cursor:pointer;
          text-align:right;width:100%;
          margin-top:6px;margin-bottom:2px;
          transition:color 0.2s;
        }
        .fp-trigger:hover{color:var(--gold);}
      `}</style>

      {/* LEFT — Animated Visual Panel */}
      <div className="lp-left">
        {/* Grid */}
        <div className="lp-grid"/>

        {/* Mouse-following spotlight */}
        <div className="lp-spotlight" style={{
          left: mousePos.x,
          top: mousePos.y,
        }}/>

        {/* Scan line */}
        <div className="lp-scan"/>

        {/* Corner accents */}
        <div className="lp-corner lp-corner-tl"/>
        <div className="lp-corner lp-corner-tr"/>
        <div className="lp-corner lp-corner-bl"/>
        <div className="lp-corner lp-corner-br"/>

        {/* Neural network SVG */}
        <svg className="lp-neural" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map(([a,b],i) => (
            <line
              key={i}
              className="neural-line"
              x1={nodes[a].x} y1={nodes[a].y}
              x2={nodes[b].x} y2={nodes[b].y}
              style={{animationDuration:`${2+i*0.3}s`, animationDelay:`${i*0.2}s`}}
            />
          ))}
          {nodes.map((node,i) => (
            <g key={i}>
              <circle className="neural-node-glow" cx={node.x} cy={node.y}
                style={{animationDuration:`${1.5+i*0.25}s`,animationDelay:`${i*0.15}s`}}/>
              <circle className="neural-node" cx={node.x} cy={node.y}
                style={{animationDuration:`${1.5+i*0.25}s`,animationDelay:`${i*0.15}s`}}/>
            </g>
          ))}
        </svg>

        {/* Floating particles */}
        {particles.map(p => (
          <div key={p.id} className="lp-particle" style={{
            left:`${p.x}%`, top:`${p.y}%`,
            width:p.size, height:p.size,
            '--op': p.opacity,
            opacity: p.opacity,
            animationDuration:`${p.duration}s`,
            animationDelay:`${p.delay}s`,
          }}/>
        ))}

        {/* Rotating rings */}
        <div className="lp-ring lp-ring-1"/>
        <div className="lp-ring lp-ring-2"/>
        <div className="lp-ring lp-ring-3"/>
        <div className="lp-ring lp-ring-4"/>
        <div className="lp-ring-dot"/>
        <div className="lp-ring-dot-2"/>

        {/* Top brand */}
        <div className="lp-top-badge">
          <div className="lp-top-badge-icon">
            <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="8" r="3" fill="#ffffff"/>
              <circle cx="28" cy="24" r="3" fill="#ffffff"/>
              <circle cx="8" cy="24" r="3" fill="#ffffff"/>
              <line x1="18" y1="11" x2="26" y2="22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
              <line x1="18" y1="11" x2="10" y2="22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
              <line x1="10" y1="24" x2="26" y2="24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="lp-top-badge-name">Neuro<span>Loop</span></div>
        </div>

        {/* Center logo orb */}
        <div className="lp-center-orb">
          <div className="lp-orb-core">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="8" r="3.5" fill="#ffffff"/>
              <circle cx="28" cy="24" r="3.5" fill="#ffffff"/>
              <circle cx="8" cy="24" r="3.5" fill="#ffffff"/>
              <line x1="18" y1="11.5" x2="26" y2="22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
              <line x1="18" y1="11.5" x2="10" y2="22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
              <line x1="10" y1="24" x2="26" y2="24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="lp-brand-word">Neuro<span>Loop</span></div>
          <div className="lp-brand-sub">AI-Powered Learning Journal</div>
        </div>

        {/* Bottom rotating quote */}
        <div className="lp-bottom-quote">
          <div className="lp-q-line"/>
          <div className="lp-q-text" style={{opacity: quoteVisible ? 1 : 0}}>
            {quotes[quoteIndex].q}
          </div>
          <div className="lp-q-auth">— {quotes[quoteIndex].a}</div>
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="lp-right">
        <div className="lp-form-wrap">
          {verifyMode ? (
            <EmailVerificationScreen
              email={pendingEmail}
              name={pendingName}
              onVerified={handleVerified}
            />
          ) : (
            <>
              {/* Mobile logo (hidden on desktop where left panel shows) */}
              <div style={{ display: 'none', marginBottom: '1.5rem', justifyContent: 'center' }} className="mobile-logo">
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{
                    width:32,height:32,borderRadius:8,
                    background:'linear-gradient(135deg,var(--gold),var(--goldl))',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    boxShadow:'0 4px 10px var(--goldg)',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="8" r="3" fill="#ffffff"/>
                      <circle cx="28" cy="24" r="3" fill="#ffffff"/>
                      <circle cx="8" cy="24" r="3" fill="#ffffff"/>
                      <line x1="18" y1="11" x2="26" y2="22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="18" y1="11" x2="10" y2="22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="10" y1="24" x2="26" y2="24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span style={{
                    fontFamily:"'DM Serif Display',serif",
                    fontSize:'1.1rem',color:'var(--t1)',
                  }}>Neuro<span style={{color:'var(--gold)'}}>Loop</span></span>
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
                    <label className="lp-lbl" htmlFor="login-email">Email address</label>
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
                    <label className="lp-lbl" htmlFor="login-password">Password</label>
                    <div className="lp-pwd-wrap">
                      <input
                        id="login-password"
                        className="lp-inp"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="lp-pwd-toggle"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOpen/> : <EyeClosed/>}
                      </button>
                    </div>
                  </div>

                  {/* Forgot trigger — shows only when forgotStep is null */}
                  {isLogin && forgotStep === null && (
                    <button
                      type="button"
                      className="fp-trigger"
                      onClick={() => { setForgotStep('email'); setForgotError(''); }}
                    >
                      Forgot password?
                    </button>
                  )}

                  {/* Inline forgot password panel */}
                  {isLogin && forgotStep !== null && (
                    <div className="fp-wrap">
                      <div className="fp-header">
                        <div className="fp-title">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                          {forgotStep === 'email' && 'Reset your password'}
                          {forgotStep === 'otp' && 'Enter verification code'}
                          {forgotStep === 'reset' && 'Set new password'}
                        </div>
                        <button type="button" className="fp-close" onClick={() => {
                          setForgotStep(null); setForgotError('');
                          setForgotEmail(''); setForgotOtp(''); setNewPassword('');
                          setForgotIsFirstTime(false);
                        }}>
                          ×
                        </button>
                      </div>

                      <div className="fp-body">
                        {/* Step indicator */}
                        <div className="fp-step-indicator">
                          <div className={`fp-step-dot ${forgotStep==='email'?'active':['otp','reset'].includes(forgotStep)?'done':''}`}/>
                          <div className="fp-step-line"/>
                          <div className={`fp-step-dot ${forgotStep==='otp'?'active':forgotStep==='reset'?'done':''}`}/>
                          <div className="fp-step-line"/>
                          <div className={`fp-step-dot ${forgotStep==='reset'?'active':''}`}/>
                        </div>

                        {/* Error */}
                        {forgotError && <div className="fp-error">{forgotError}</div>}

                        {/* Success */}
                        {forgotSuccess && <div className="fp-success">{forgotSuccess}</div>}

                        {/* STEP 1 — Email */}
                        {forgotStep === 'email' && !forgotSuccess && (
                          <>
                            <label className="fp-label" htmlFor="forgot-email">Your account email</label>
                            <input
                              id="forgot-email"
                              className="fp-inp"
                              type="email"
                              placeholder="you@example.com"
                              value={forgotEmail}
                              onChange={e => setForgotEmail(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleForgotSendOtp()}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="fp-btn"
                              onClick={handleForgotSendOtp}
                              disabled={forgotLoading || !forgotEmail}
                            >
                              {forgotLoading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                          </>
                        )}

                        {/* STEP 2 — OTP */}
                        {forgotStep === 'otp' && !forgotSuccess && (
                          <>
                            <label className="fp-label" htmlFor="forgot-otp">6-digit code sent to {forgotEmail}</label>
                            {forgotIsFirstTime && (
                              <div className="fp-notice">
                                ℹ️ Check in spam message and report not a spam and take the code otherwise check the email is valid
                              </div>
                            )}
                            <input
                              id="forgot-otp"
                              className="fp-otp-inp"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="000000"
                              value={forgotOtp}
                              onChange={e => setForgotOtp(e.target.value.replace(/\D/g,''))}
                              onKeyDown={e => e.key === 'Enter' && handleForgotVerifyOtp()}
                              autoFocus
                              style={{width:'100%',marginBottom:10}}
                            />
                            {otpTimer > 0 ? (
                              <div className="fp-timer">
                                Resend code in <strong>{otpTimer}s</strong>
                              </div>
                            ) : (
                              <div style={{textAlign:'center',marginBottom:10}}>
                                <button type="button" className="fp-resend" onClick={() => {
                                  handleForgotSendOtp();
                                  setOtpTimer(60);
                                }}>
                                  Resend code
                                </button>
                              </div>
                            )}
                            <button
                              type="button"
                              className="fp-btn"
                              onClick={handleForgotVerifyOtp}
                              disabled={forgotLoading || forgotOtp.length !== 6}
                            >
                              {forgotLoading ? 'Verifying...' : 'Verify Code'}
                            </button>
                          </>
                        )}

                        {/* STEP 3 — New password */}
                        {forgotStep === 'reset' && !forgotSuccess && (
                          <>
                            <label className="fp-label" htmlFor="forgot-new-password">New password</label>
                            <div className="fp-inp-pwd-wrap">
                              <input
                                id="forgot-new-password"
                                className="fp-inp"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Min 8 characters"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleForgotReset()}
                                autoFocus
                              />
                              <button
                                type="button"
                                className="fp-pwd-eye"
                                onClick={() => setShowNewPassword(v => !v)}
                              >
                                {showNewPassword ? (
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                  </svg>
                                ) : (
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                  </svg>
                                )}
                              </button>
                            </div>
                            {/* Password strength bar */}
                            {newPassword.length > 0 && (
                              <div style={{marginBottom:10}}>
                                <div style={{display:'flex',gap:4,marginBottom:4}}>
                                  {[1,2,3,4].map(i => {
                                    const strength = [
                                      newPassword.length >= 8,
                                      /[A-Z]/.test(newPassword),
                                      /[0-9]/.test(newPassword),
                                      /[^A-Za-z0-9]/.test(newPassword),
                                    ].filter(Boolean).length;
                                    const colors = ['#ef4444','#f59e0b','#3b82f6','#10b981'];
                                    return (
                                      <div key={i} style={{
                                        flex:1,height:3,borderRadius:99,
                                        background: i <= strength ? colors[strength-1] : 'rgba(255,255,255,0.08)',
                                        transition:'all 0.3s ease',
                                      }}/>
                                    );
                                  })}
                                </div>
                                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.3)'}}>
                                  {[
                                    newPassword.length >= 8,
                                    /[A-Z]/.test(newPassword),
                                    /[0-9]/.test(newPassword),
                                    /[^A-Za-z0-9]/.test(newPassword),
                                  ].filter(Boolean).length < 2
                                    ? 'Add uppercase, numbers, symbols for stronger password'
                                    : 'Good password strength'}
                                </div>
                              </div>
                            )}
                            <button
                              type="button"
                              className="fp-btn"
                              onClick={handleForgotReset}
                              disabled={forgotLoading || newPassword.length < 8}
                            >
                              {forgotLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remember me */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--t2)' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ width: '14px', height: '14px', accentColor: 'var(--gold)' }}
                      />
                      Remember me
                    </label>
                  </div>

                  <button
                    id="login-submit"
                    className="lp-btn"
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: loading ? 'rgba(229,9,20,0.6)' : 'var(--gold)',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: '16px', height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid #ffffff',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite'
                        }} />
                        Logging in...
                      </>
                    ) : (
                      'Log In'
                    )}
                  </button>

                  <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
                    <span style={{ color: 'var(--t2)', fontSize: '12px' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
                  </div>

                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google?frontend_origin=${window.location.origin}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '11px 20px',
                      background: 'var(--s1)',
                      border: '1px solid var(--bd)',
                      borderRadius: '10px',
                      color: 'var(--t1)',
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--s1)'}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.767 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                    </svg>
                    Continue with Google
                  </a>
                </form>
              ) : (
                <form onSubmit={handleSignup}>
                  <div className="lp-field">
                    <label className="lp-lbl" htmlFor="signup-name">Full name</label>
                    <input
                      id="signup-name"
                      className="lp-inp"
                      type="text"
                      placeholder="Enter your Name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label htmlFor="signup-email" style={{
                      display: 'block', fontSize: '12px', fontWeight: '500',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--text-secondary)', marginBottom: '6px'
                    }}>Email address</label>

                    <div style={{ position: 'relative' }}>
                      <input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => {
                          setSignupEmail(e.target.value)
                          if (emailTouched) {
                            const result = isValidEmail(e.target.value)
                            setEmailError(result.valid ? '' : result.message)
                          }
                        }}
                        onBlur={() => {
                          setEmailTouched(true)
                          const result = isValidEmail(signupEmail)
                          setEmailError(result.valid ? '' : result.message)
                        }}
                        placeholder="name@gmail.com"
                        style={{
                          width: '100%', padding: '11px 40px 11px 14px',
                          background: 'var(--bg-glass, rgba(255,255,255,0.04))',
                          border: `1px solid ${emailError && emailTouched ? 'rgba(239,68,68,0.5)' : signupEmail && !emailError && emailTouched ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '10px', color: 'var(--text-primary)',
                          fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                      />
                      {/* Validation icon */}
                      {emailTouched && signupEmail && (
                        <div style={{
                          position: 'absolute', right: '12px', top: '50%',
                          transform: 'translateY(-50%)', fontSize: '16px'
                        }}>
                          {emailError ? '❌' : '✅'}
                        </div>
                      )}
                    </div>

                    {/* Error or success message */}
                    {emailTouched && emailError && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginTop: '6px', padding: '6px 10px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '6px'
                      }}>
                        <span style={{ fontSize: '12px', color: '#fca5a5' }}>⚠️ {emailError}</span>
                      </div>
                    )}
                    {emailTouched && !emailError && signupEmail && (
                      <div style={{ marginTop: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#6ee7b7' }}>✓ Valid email address</span>
                      </div>
                    )}
                  </div>
                  <div className="lp-field">
                    <label className="lp-lbl" htmlFor="signup-password">Password</label>
                    <div className="lp-pwd-wrap">
                      <input
                        id="signup-password"
                        className="lp-inp"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="lp-pwd-toggle"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOpen/> : <EyeClosed/>}
                      </button>
                    </div>
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
                    <label className="lp-lbl" htmlFor="signup-github">GitHub username (optional)</label>
                    <input
                      id="signup-github"
                      className="lp-inp"
                      type="text"
                      placeholder="username"
                      value={signupGithub}
                      onChange={(e) => setSignupGithub(e.target.value)}
                    />
                  </div>

                  <button
                    id="signup-submit"
                    className="lp-btn"
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: loading ? 'rgba(229,9,20,0.6)' : 'var(--gold)',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: '16px', height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid #ffffff',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite'
                        }} />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
                    <span style={{ color: 'var(--t2)', fontSize: '12px' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
                  </div>

                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google?frontend_origin=${window.location.origin}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '11px 20px',
                      background: 'var(--s1)',
                      border: '1px solid var(--bd)',
                      borderRadius: '10px',
                      color: 'var(--t1)',
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--s1)'}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.767 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                    </svg>
                    Continue with Google
                  </a>
                </form>
              )}

            </>
          )}
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