import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function LoadingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="loading-container">
      <style>{`
        .loading-container {
          background-color: #09090b;
          color: var(--t1);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* Keyframes */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes logoReveal {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes textFade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* Layout styles */
        .logo-wrapper {
          animation: logoReveal 0.5s ease both;
        }

        .app-name {
          font-size: 22px;
          font-weight: 600;
          margin-top: 16px;
          color: var(--gold);
          animation: fadeUp 0.5s ease 0.2s both;
        }

        .tagline {
          font-size: 13px;
          color: var(--t2);
          margin-top: 8px;
          animation: fadeIn 0.5s ease 0.4s both;
        }

        .loading-bar-container {
          margin-top: 48px;
          width: 240px;
          animation: fadeIn 0.5s ease 0.5s both;
        }

        .loading-bar-track {
          height: 2px;
          background: rgba(229,9,20, 0.12);
          border-radius: 1px;
          overflow: hidden;
          width: 100%;
        }

        .loading-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold), var(--goldl));
          border-radius: 1px;
          animation: progressFill 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
          width: 0%;
        }

        .dots-row {
          margin-top: 24px;
          display: flex;
          gap: 6px;
          justify-content: center;
          animation: fadeIn 0.5s ease 0.6s both;
        }

        .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(229,9,20, 0.6);
          animation: textFade 1.2s ease infinite;
        }

        .dot-1 {
          animation-delay: 0s;
        }

        .dot-2 {
          animation-delay: 0.2s;
        }

        .dot-3 {
          animation-delay: 0.4s;
        }

        .version-text {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: var(--t3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      `}</style>

      {/* Logo Mark */}
      <div className="logo-wrapper">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e50914" />
              <stop offset="100%" stopColor="#ff4d4d" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="44" height="44" rx="12"
            fill="none" stroke="url(#logoGrad)" strokeWidth="2" />
          <path d="M18 42 L18 18 L30 36 L42 18 L42 42"
            fill="none" stroke="url(#logoGrad)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* App Name */}
      <h2 className="app-name">NeuroLoop</h2>

      {/* Tagline */}
      <p className="tagline">Preparing your learning environment</p>

      {/* Loading Bar */}
      <div className="loading-bar-container">
        <div className="loading-bar-track">
          <div className="loading-bar-fill"></div>
        </div>
      </div>

      {/* Loading Dots */}
      <div className="dots-row">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
      </div>

      {/* Version Text */}
      <span className="version-text">NeuroLoop v1.0</span>
    </div>
  )
}
