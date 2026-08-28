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

// Neural network nodes — 8 balanced perimeter nodes encircling center logo
const nodes = [
  { x: 200, y: 180 },
  { x: 500, y: 120 },
  { x: 800, y: 180 },
  { x: 880, y: 500 },
  { x: 800, y: 820 },
  { x: 500, y: 880 },
  { x: 200, y: 820 },
  { x: 120, y: 500 },
];
const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  [0, 2], [1, 3], [3, 5], [4, 6], [5, 7], [7, 1]
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

  // Task 2 new states
  const [showPassword, setShowPassword] = useState(false);

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

      const { token, user } = res.data
      login(user, token)

      if (user.role === 'admin' || user.role === 'subadmin') {
        localStorage.setItem('adminToken', token)
        localStorage.setItem('adminUser', JSON.stringify(user))
        navigate('/admin/dashboard', { replace: true })
      } else if (!user.onboardingCompleted) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
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
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerified = (token, user) => {
    login(token, user);
    if (user?.role === 'admin' || user?.role === 'subadmin') {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      navigate('/admin/dashboard', { replace: true });
    } else if (!user?.onboardingCompleted) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };


  const pwdStrength = getStrength(signupPassword)
  const isLogin = activeTab === 'login'
  const setIsLogin = (val) => {
    setActiveTab(val ? 'login' : 'signup')
    setError('')
  }

  return (
    <div className="login-page-root">
      <style>{`
        .login-page-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background: #FFF0F5;
          color: #1A1A2E;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }

        /* Left visual panel */
        .lp-left {
          flex: 1.2;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          background: linear-gradient(135deg, #FFE0EE 0%, #FFCCE0 50%, #FFB3D1 100%);
          border-right: 1px solid #F9C0D8;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .lp-left {
            display: none !important;
          }
        }

        /* Right form container */
        .lp-right {
          flex: 1;
          min-width: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: linear-gradient(160deg, #FFFFFF 0%, #FFF0F5 60%, #FCE4F0 100%);
          border-left: 1px solid #F9C0D8;
          box-shadow: -10px 0 30px rgba(233, 30, 140, 0.03);
        }

        @media (max-width: 768px) {
          .lp-right {
            min-width: 100%;
            width: 100%;
            padding: 32px 20px;
            background: #FFF0F5;
            border-left: none;
          }
        }

        .mobile-logo {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-logo {
            display: flex !important;
          }
        }

        .lp-form-wrap {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
        }

        .lp-form-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px;
          color: #1A1A2E;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .lp-form-sub {
          color: #8888AA;
          font-size: 14px;
          margin-bottom: 28px;
          line-height: 1.4;
        }

        /* Tab buttons */
        .lp-tabs {
          display: flex;
          background: #FCE4F0;
          border-radius: 50px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .lp-tab {
          flex: 1;
          padding: 10px 16px;
          border-radius: 50px;
          border: none;
          font-size: 0.88rem;
          font-weight: 600;
          color: #8888AA;
          background: transparent;
          transition: all 0.25s ease;
          cursor: pointer;
          text-align: center;
        }
        .lp-tab.active {
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          color: #ffffff;
          border-radius: 50px;
          box-shadow: 0 4px 14px rgba(233, 30, 140, 0.25);
        }

        /* Input fields */
        .lp-field {
          margin-bottom: 18px;
        }
        .lp-lbl {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #8888AA;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .lp-inp {
          width: 100%;
          padding: 12px 16px;
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 12px;
          color: #1A1A2E;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }
        .lp-inp:focus {
          border-color: #E91E8C;
          box-shadow: 0 0 0 3px rgba(233, 30, 140, 0.08);
          background: #FFFFFF;
        }
        .lp-inp::placeholder {
          color: #AAAACC;
        }

        .lp-pwd-wrap {
          position: relative;
          width: 100%;
        }
        .lp-pwd-wrap .lp-inp {
          padding-right: 44px;
        }
        .lp-pwd-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #8888AA;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
          border-radius: 6px;
        }
        .lp-pwd-toggle:hover {
          color: #E91E8C;
        }

        /* Action Buttons */
        .lp-btn {
          width: 100%;
          padding: 14px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 18px rgba(233, 30, 140, 0.25);
          margin-top: 6px;
          transition: all 0.25s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .lp-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(233, 30, 140, 0.35);
        }
        .lp-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Divider & Google Auth */
        .lp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: #C0C0C0;
          font-size: 13px;
          font-weight: 500;
        }
        .lp-divider::before, .lp-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #F9C0D8;
        }

        .lp-google {
          width: 100%;
          padding: 12px;
          border-radius: 50px;
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          color: #1A1A2E;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
          box-sizing: border-box;
        }
        .lp-google:hover {
          background: #FFF0F5;
          border-color: #E91E8C;
          box-shadow: 0 4px 12px rgba(233, 30, 140, 0.1);
        }

        /* Left visual background animations */
        .lp-spotlight {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(233,30,140,0.15) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: left 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 1;
        }

        .lp-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(233,30,140,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,30,140,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridDrift 25s linear infinite;
        }
        @keyframes gridDrift {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }

        .lp-particle {
          position: absolute;
          border-radius: 50%;
          background: #E91E8C;
          pointer-events: none;
          animation: particleFloat 6s ease-in-out infinite alternate;
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.2; }
          100% { transform: translateY(-24px) scale(1.4); opacity: 0.7; }
        }

        /* Prevent Chrome light-blue autofill background override */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
          -webkit-text-fill-color: #1A1A2E !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* Corner accent brackets */
        .lp-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: rgba(233, 30, 140, 0.4);
          border-style: solid;
          pointer-events: none;
          z-index: 3;
        }
        .lp-corner-tl { top: 24px; left: 24px; border-width: 2px 0 0 2px; }
        .lp-corner-tr { top: 24px; right: 24px; border-width: 2px 2px 0 0; }
        .lp-corner-bl { bottom: 24px; left: 24px; border-width: 0 0 2px 2px; }
        .lp-corner-br { bottom: 24px; right: 24px; border-width: 0 2px 2px 0; }

        /* Top-left brand badge */
        .lp-top-badge {
          position: absolute;
          top: 24px;
          left: 28px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 4;
        }
        .lp-top-badge-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(233, 30, 140, 0.25);
        }
        .lp-top-badge-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1A1A2E;
        }
        .lp-top-badge-name span {
          color: #E91E8C;
        }

        .lp-neural {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }
        .neural-line {
          stroke: rgba(233, 30, 140, 0.22);
          stroke-width: 2px;
          stroke-dasharray: 8 6;
          animation: dashMove 25s linear infinite;
        }
        @keyframes dashMove {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }

        .neural-node-glow {
          fill: rgba(233, 30, 140, 0.08);
          stroke: rgba(233, 30, 140, 0.25);
          stroke-width: 1.5px;
          animation: pulseGlow 3s ease-in-out infinite alternate;
        }
        .neural-node {
          fill: #E91E8C;
          filter: drop-shadow(0 2px 8px rgba(233, 30, 140, 0.4));
        }

        @keyframes pulseGlow {
          0% { r: 18px; opacity: 0.4; }
          100% { r: 28px; opacity: 0.9; }
        }

        /* Rotating rings */
        .lp-ring {
          position: absolute;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px dashed;
          pointer-events: none;
          z-index: 1;
          animation: ringSpin linear infinite;
        }
        @keyframes ringSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .lp-ring-1 {
          width: 240px; height: 240px;
          border-color: rgba(233,30,140,0.18);
          animation-duration: 25s;
        }
        .lp-ring-2 {
          width: 400px; height: 400px;
          border-color: rgba(233,30,140,0.12);
          animation-duration: 35s;
          animation-direction: reverse;
        }
        .lp-ring-3 {
          width: 560px; height: 560px;
          border-color: rgba(233,30,140,0.07);
          animation-duration: 48s;
        }

        .lp-center-orb {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .lp-orb-core {
          width: 88px;
          height: 88px;
          border-radius: 26px;
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 36px rgba(233, 30, 140, 0.4);
          animation: coreBreath 3.5s ease-in-out infinite alternate;
        }
        @keyframes coreBreath {
          from { transform: scale(1); box-shadow: 0 12px 36px rgba(233,30,140,0.35); }
          to { transform: scale(1.08); box-shadow: 0 18px 48px rgba(233,30,140,0.55); }
        }

        .lp-brand-word {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.2rem;
          color: #1A1A2E;
          text-align: center;
          letter-spacing: -0.01em;
          font-weight: 700;
          line-height: 1;
        }
        .lp-brand-word span { color: #E91E8C; }

        .lp-brand-sub {
          font-size: 11px;
          color: #8888AA;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          text-align: center;
        }

        .lp-bottom-quote {
          position: absolute;
          bottom: 24px;
          left: 0;
          right: 0;
          padding: 0 36px;
          z-index: 4;
          text-align: center;
        }
        .lp-q-line {
          width: 28px;
          height: 2px;
          background: #E91E8C;
          margin: 0 auto 12px;
          opacity: 0.7;
          border-radius: 2px;
        }
        .lp-q-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px;
          color: #4A4A6A;
          font-style: italic;
          line-height: 1.5;
          margin-bottom: 6px;
          transition: opacity 0.4s ease;
        }
        .lp-q-auth {
          font-size: 0.72rem;
          color: #E91E8C;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Inline Forgot Password Drawer */
        .fp-wrap {
          margin-top: 10px;
          margin-bottom: 16px;
          border: 1.5px solid #F9C0D8;
          border-radius: 14px;
          background: #FFF0F5;
          overflow: hidden;
          animation: fpExpand 0.3s ease;
        }
        @keyframes fpExpand {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #FFFFFF;
          border-bottom: 1px solid #F9C0D8;
        }
        .fp-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #E91E8C;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .fp-close {
          background: none;
          border: none;
          color: #8888AA;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .fp-close:hover { color: #E91E8C; }
        .fp-body { padding: 16px; }
        .fp-step-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
        }
        .fp-step-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #E2D0DC;
          transition: all 0.3s ease;
        }
        .fp-step-dot.done { background: #10B981; }
        .fp-step-dot.active { background: #E91E8C; transform: scale(1.25); }
        .fp-step-line { flex: 1; height: 2px; background: #F9C0D8; }
        .fp-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #4A4A6A;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
          display: block;
        }
        .fp-inp {
          width: 100%;
          padding: 10px 14px;
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 10px;
          color: #1A1A2E;
          font-size: 0.9rem;
          margin-bottom: 12px;
          outline: none;
          box-sizing: border-box;
        }
        .fp-inp:focus { border-color: #E91E8C; }
        .fp-btn {
          width: 100%;
          padding: 11px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .fp-btn:hover:not(:disabled) { opacity: 0.95; transform: translateY(-1px); }
        .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .fp-error {
          font-size: 0.8rem;
          color: #DC2626;
          margin-bottom: 10px;
          padding: 8px 12px;
          background: #FEE2E2;
          border-radius: 8px;
          border-left: 3px solid #DC2626;
        }
        .fp-success {
          font-size: 0.85rem;
          color: #059669;
          text-align: center;
          padding: 12px;
          background: #D1FAE5;
          border-radius: 10px;
          border: 1px solid #A7F3D0;
        }
        .fp-notice {
          font-size: 0.8rem;
          color: #7C2D12;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: #FFEDD5;
          border-radius: 8px;
          border-left: 3px solid #F97316;
          line-height: 1.4;
        }
        .fp-otp-inp {
          width: 100%;
          padding: 12px 6px;
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 10px;
          color: #1A1A2E;
          font-size: 1.2rem;
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.2em;
          margin-bottom: 12px;
          outline: none;
          box-sizing: border-box;
        }
        .fp-otp-inp:focus { border-color: #E91E8C; }
        .fp-timer { font-size: 0.78rem; color: #666688; text-align: center; margin-bottom: 10px; }
        .fp-timer strong { color: #E91E8C; }
        .fp-resend { background: none; border: none; color: #E91E8C; font-size: 0.8rem; cursor: pointer; text-decoration: underline; }
        .fp-trigger {
          display: block;
          background: none;
          border: none;
          color: #E91E8C;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: right;
          width: 100%;
          margin-top: 6px;
          margin-bottom: 14px;
          transition: opacity 0.2s;
        }
        .fp-trigger:hover { opacity: 0.8; text-decoration: underline; }
      `}</style>

      {/* LEFT — Animated Visual Panel */}
      <div className="lp-left">
        {/* Grid */}
        <div className="lp-grid"/>

        {/* Mouse-following spotlight */}
        <div className="lp-spotlight" style={{ left: mousePos.x, top: mousePos.y }}/>

        {/* Corner accents */}
        <div className="lp-corner lp-corner-tl"/>
        <div className="lp-corner lp-corner-tr"/>
        <div className="lp-corner lp-corner-bl"/>
        <div className="lp-corner lp-corner-br"/>

        {/* Top brand badge */}
        <div className="lp-top-badge">
          <div className="lp-top-badge-icon">
            <svg width="18" height="18" viewBox="0 0 60 60">
              <rect x="8" y="8" width="44" height="44" rx="14"
                fill="none" stroke="#FFFFFF" strokeWidth="3.5" />
              <path d="M18 42 L18 18 L42 42 L42 18"
                fill="none" stroke="#FFFFFF" strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="lp-top-badge-name">Neuro<span>Loop</span></div>
        </div>

        {/* Neural network SVG */}
        <svg className="lp-neural" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {connections.map(([a,b],i) => (
            <line
              key={i}
              className="neural-line"
              x1={nodes[a].x} y1={nodes[a].y}
              x2={nodes[b].x} y2={nodes[b].y}
            />
          ))}
          {nodes.map((node,i) => (
            <g key={i}>
              <circle className="neural-node-glow" cx={node.x} cy={node.y} r="24" style={{ animationDelay: `${i * 0.4}s` }} />
              <circle className="neural-node" cx={node.x} cy={node.y} r="8" />
              <circle cx={node.x} cy={node.y} r="3" fill="#FFFFFF" />
            </g>
          ))}
        </svg>

        {/* Floating particles */}
        {particles.map(p => (
          <div key={p.id} className="lp-particle" style={{
            left:`${p.x}%`, top:`${p.y}%`,
            width:p.size, height:p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}/>
        ))}

        {/* Rotating rings */}
        <div className="lp-ring lp-ring-1"/>
        <div className="lp-ring lp-ring-2"/>
        <div className="lp-ring lp-ring-3"/>

        {/* Center logo orb */}
        <div className="lp-center-orb">
          <div className="lp-orb-core">
            <svg width="44" height="44" viewBox="0 0 60 60">
              <rect x="8" y="8" width="44" height="44" rx="14"
                fill="rgba(255,255,255,0.18)" stroke="#FFFFFF" strokeWidth="3" />
              <path d="M18 42 L18 18 L42 42 L42 18"
                fill="none" stroke="#FFFFFF" strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="lp-brand-word">Neuro<span>Loop</span></div>
          <div className="lp-brand-sub">AI-Powered Learning Journal</div>
        </div>

        {/* Bottom rotating quote */}
        <div className="lp-bottom-quote">
          <div className="lp-q-line"/>
          <div className="lp-q-text" style={{opacity: quoteVisible ? 1 : 0}}>
            "{quotes[quoteIndex].q}"
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
              {/* Mobile logo (hidden on desktop) */}
              <div style={{ marginBottom: '1.5rem', justifyContent: 'center', alignItems: 'center' }} className="mobile-logo">
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{
                    width:38,height:38,borderRadius:12,
                    background:'linear-gradient(135deg,#E91E8C,#FF6B9D)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    boxShadow:'0 4px 14px rgba(233,30,140,0.3)',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 60 60">
                      <rect x="8" y="8" width="44" height="44" rx="14"
                        fill="none" stroke="#FFFFFF" strokeWidth="3.5" />
                      <path d="M18 42 L18 18 L42 42 L42 18"
                        fill="none" stroke="#FFFFFF" strokeWidth="4"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{
                    fontFamily:"'Playfair Display', Georgia, serif",
                    fontSize:'1.3rem',color:'#1A1A2E',fontWeight:700
                  }}>Neuro<span style={{color:'#E91E8C'}}>Loop</span></span>
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
                <div style={{
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  fontWeight: 500,
                }}>
                  ⚠️ {error}
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

                  {/* Forgot trigger */}
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
                            <div className="lp-pwd-wrap" style={{marginBottom:10}}>
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
                                className="lp-pwd-toggle"
                                onClick={() => setShowNewPassword(v => !v)}
                              >
                                {showNewPassword ? <EyeOpen/> : <EyeClosed/>}
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
                                        background: i <= strength ? colors[strength-1] : '#E2D0DC',
                                        transition:'all 0.3s ease',
                                      }}/>
                                    );
                                  })}
                                </div>
                                <div style={{fontSize:'0.68rem',color:'#666688'}}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4A4A6A', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ width: '15px', height: '15px', accentColor: '#E91E8C', cursor: 'pointer' }}
                      />
                      Remember me
                    </label>
                  </div>

                  <button
                    id="login-submit"
                    className="lp-btn"
                    type="submit"
                    disabled={loading}
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

                  <div className="lp-divider">or</div>

                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google?frontend_origin=${window.location.origin}`}
                    className="lp-google"
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
                  
                  <div className="lp-field">
                    <label className="lp-lbl" htmlFor="signup-email">Email address</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="signup-email"
                        className="lp-inp"
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
                          paddingRight: emailTouched && signupEmail ? '40px' : '16px',
                          borderColor: emailError && emailTouched ? '#EF4444' : signupEmail && !emailError && emailTouched ? '#10B981' : undefined
                        }}
                      />
                      {/* Validation icon */}
                      {emailTouched && signupEmail && (
                        <div style={{
                          position: 'absolute', right: '14px', top: '50%',
                          transform: 'translateY(-50%)', fontSize: '14px'
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
                        background: '#FEE2E2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '8px'
                      }}>
                        <span style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: 500 }}>⚠️ {emailError}</span>
                      </div>
                    )}
                    {emailTouched && !emailError && signupEmail && (
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>✓ Valid email address</span>
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
                    <div style={{ marginTop: '-0.25rem', marginBottom: '1rem' }}>
                      <div className="strength-meter" style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="strength-bar"
                            style={{
                              height: '4px',
                              flex: 1,
                              borderRadius: '2px',
                              background: i < pwdStrength ? '#E91E8C' : '#E2D0DC',
                              transition: 'background 0.3s ease'
                            }}
                          />
                        ))}
                      </div>
                      <p style={{
                        fontSize: '0.75rem',
                        marginTop: '4px',
                        color: pwdStrength > 0 ? '#E91E8C' : '#8888AA',
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

                  <div className="lp-divider">or</div>

                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google?frontend_origin=${window.location.origin}`}
                    className="lp-google"
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
    </div>
  )
}