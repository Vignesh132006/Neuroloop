import { useState, useEffect } from 'react';
import api from '../api/axios';

const EmailVerificationScreen = ({ email, name, onVerified }) => {
  const [otp,         setOtp]         = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend,   setCanResend]   = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-email', { email, otp });
      setSuccess('Email verified! Welcome to NeuroLoop.');
      setTimeout(() => onVerified(data.token, data.user), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/auth/resend-verification', { email });
      setSuccess('New code sent! Check your inbox.');
      setResendTimer(60);
      setCanResend(false);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .evs-wrap {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 8px 0;
        }
        .evs-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05));
          border: 1px solid rgba(212,175,55,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; margin-bottom: 16px;
          animation: iconPop 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes iconPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .evs-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.3rem; color: #f5f0e8;
          margin: 0 0 6px; font-weight: 400;
        }
        .evs-sub {
          font-size: 0.82rem; color: #a09880;
          margin: 0 0 6px; line-height: 1.5;
        }
        .evs-email-badge {
          display: inline-block;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 99px; padding: 3px 14px;
          font-size: 0.8rem; color: #d4af37;
          font-weight: 600; margin-bottom: 24px;
        }
        .evs-otp-wrap {
          display: flex; gap: 8px;
          justify-content: center; margin-bottom: 16px;
        }
        .evs-otp-box {
          width: 44px; height: 52px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #f5f0e8; font-size: 1.4rem;
          font-weight: 700; text-align: center;
          transition: all 0.2s; outline: none;
          caret-color: #d4af37;
        }
        .evs-otp-box:focus {
          border-color: rgba(212,175,55,0.6);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.12);
          background: rgba(212,175,55,0.04);
        }
        .evs-otp-box.filled {
          border-color: rgba(212,175,55,0.4);
          color: #d4af37;
        }
        .evs-error {
          width: 100%; font-size: 0.78rem; color: #fca5a5;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px; padding: 8px 12px;
          margin-bottom: 12px; text-align: left;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%,100%{ transform: translateX(0); }
          25%    { transform: translateX(-5px); }
          75%    { transform: translateX(5px); }
        }
        .evs-success {
          width: 100%; font-size: 0.82rem; color: #6ee7b7;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 8px; padding: 8px 12px;
          margin-bottom: 12px; text-align: center;
        }
        .evs-btn {
          width: 100%; padding: 13px; border-radius: 10px;
          border: none; background: #d4af37;
          color: #0a0a0a; font-size: 0.92rem; font-weight: 700;
          letter-spacing: 0.02em; cursor: pointer;
          box-shadow: 0 4px 20px rgba(212,175,55,0.35);
          transition: all 0.2s; margin-bottom: 14px;
        }
        .evs-btn:hover:not(:disabled) {
          background: #f0d060;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(212,175,55,0.45);
        }
        .evs-btn:disabled {
          opacity: 0.55; cursor: not-allowed; transform: none;
        }
        .evs-resend-row {
          font-size: 0.78rem; color: #5a5040;
          display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .evs-resend-btn {
          background: none; border: none;
          color: #d4af37; font-size: 0.78rem;
          cursor: pointer; text-decoration: underline;
          transition: opacity 0.2s;
        }
        .evs-resend-btn:disabled {
          color: #5a5040; text-decoration: none; cursor: not-allowed;
        }
        .evs-back {
          background: none; border: none;
          color: #5a5040; font-size: 0.75rem;
          cursor: pointer; margin-top: 12px;
          transition: color 0.2s;
        }
        .evs-back:hover { color: #a09880; }

        .evs-steps {
          display: flex; align-items: center;
          gap: 6px; margin-bottom: 20px;
        }
        .evs-step-dot {
          width: 6px; height: 6px; border-radius: 50%;
          transition: all 0.3s;
        }
        .evs-step-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.06);
        }
      `}</style>

      <div className="evs-wrap">

        {/* Step indicator */}
        <div className="evs-steps" style={{width:'100%'}}>
          <div className="evs-step-dot"
               style={{background:'#10b981',boxShadow:'0 0 6px #10b981'}}/>
          <div className="evs-step-line"/>
          <div className="evs-step-dot"
               style={{background:'#d4af37',boxShadow:'0 0 6px #d4af37',
                       transform:'scale(1.4)'}}/>
          <div className="evs-step-line"/>
          <div className="evs-step-dot"
               style={{background:'rgba(255,255,255,0.15)'}}/>
        </div>

        <div className="evs-icon">📬</div>

        <h2 className="evs-title">Check your inbox</h2>
        <p className="evs-sub">
          We sent a 6-digit verification code to
        </p>
        <div className="evs-email-badge">{email}</div>

        {/* 6 individual OTP boxes */}
        <div className="evs-otp-wrap">
          {[0,1,2,3,4,5].map(i => (
            <input
              key={i}
              id={`otp-box-${i}`}
              className={`evs-otp-box ${otp[i] ? 'filled' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i] || ''}
              onChange={e => {
                const val = e.target.value.replace(/\D/g,'');
                if (!val) {
                  const next = otp.split('');
                  next[i] = '';
                  setOtp(next.join(''));
                  return;
                }
                // Handle paste
                if (val.length > 1) {
                  const pasted = val.slice(0,6).padEnd(6,'');
                  setOtp(pasted);
                  document.getElementById(`otp-box-5`)?.focus();
                  return;
                }
                const next = otp.split('').concat(Array(6).fill('')).slice(0,6);
                next[i] = val;
                setOtp(next.join(''));
                if (i < 5) document.getElementById(`otp-box-${i+1}`)?.focus();
              }}
              onKeyDown={e => {
                if (e.key === 'Backspace' && !otp[i] && i > 0) {
                  document.getElementById(`otp-box-${i-1}`)?.focus();
                }
              }}
              onPaste={e => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
                setOtp(pasted.padEnd(6,''));
                document.getElementById(`otp-box-${Math.min(pasted.length,5)}`)?.focus();
              }}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error   && <div className="evs-error">{error}</div>}
        {success && <div className="evs-success">{success}</div>}

        <button
          className="evs-btn"
          onClick={handleVerify}
          disabled={loading || otp.replace(/\s/g,'').length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Email & Continue'}
        </button>

        <div className="evs-resend-row">
          <span>Didn't receive it?</span>
          <button
            className="evs-resend-btn"
            onClick={handleResend}
            disabled={!canResend || loading}
          >
            {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
          </button>
        </div>

        <button className="evs-back" onClick={() => window.location.reload()}>
          ← Use a different email
        </button>
      </div>
    </>
  );
};

export default EmailVerificationScreen;
