import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccessPage = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const { login }  = useAuth();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    const token  = params.get('token');
    const name   = params.get('name');
    const email  = params.get('email');
    const avatar = params.get('avatar');
    const error  = params.get('error');

    if (error) {
      setStatus('Sign in failed. Redirecting...');
      setTimeout(() => navigate('/login?error=google_failed'), 1500);
      return;
    }

    if (token) {
      // Store token and user data in context (which handles localStorage and state updates)
      login(token, { name, email, avatar });

      setStatus('Welcome back! Loading your dashboard...');
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      gap: '20px',
    }}>
      <style>{`
        .auth-spinner {
          width: 44px; height: 44px;
          border: 3px solid rgba(212,175,55,0.15);
          border-top: 3px solid #d4af37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .auth-logo {
          width: 48px; height: 48px; border-radius: 13px;
          background: linear-gradient(135deg, #d4af37, #8a6f1e);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(212,175,55,0.3);
        }
      `}</style>

      <div className="auth-logo">
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="8"  r="3.5" fill="rgba(10,10,10,0.85)"/>
          <circle cx="28" cy="24" r="3.5" fill="rgba(10,10,10,0.85)"/>
          <circle cx="8"  cy="24" r="3.5" fill="rgba(10,10,10,0.85)"/>
          <line x1="18" y1="11.5" x2="26" y2="22"
                stroke="rgba(10,10,10,0.7)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="18" y1="11.5" x2="10" y2="22"
                stroke="rgba(10,10,10,0.7)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="10" y1="24"   x2="26" y2="24"
                stroke="rgba(10,10,10,0.7)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="auth-spinner"/>

      <div style={{
        color: '#a09880', fontSize: '0.9rem',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.02em',
      }}>
        {status}
      </div>
    </div>
  );
};

export default AuthSuccessPage;
