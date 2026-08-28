import { useState, useEffect } from 'react'
import NeuroLoopLogo from './NeuroLoopLogo'

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Do not show install banner on landing/login/auth pages
    if (['/', '/login', '/signup', '/loading', '/auth/google/success'].includes(window.location.pathname)) {
      return
    }

    // Check if already installed or running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (isStandalone) return

    // Check if dismissed previously
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed')
    if (wasDismissed) return

    // Check if an install prompt was captured prior to component mounting
    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt)
      setShowBanner(true)
    }

    const handler = (e) => {
      e.preventDefault()
      window.deferredPWAInstallPrompt = e
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt
    if (!promptEvent) return
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    console.log('[PWA] Install outcome:', outcome)
    setShowBanner(false)
    setDeferredPrompt(null)
    window.deferredPWAInstallPrompt = null
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }

  if (!showBanner || dismissed) return null

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .pwa-install-btn {
          padding: 8px 20px;
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          color: #ffffff;
          border: none;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(233, 30, 140, 0.25);
          transition: all 0.2s ease;
        }
        .pwa-install-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(233, 30, 140, 0.4);
          background: linear-gradient(135deg, #FF6B9D, #E91E8C);
        }
        .pwa-install-btn:active {
          transform: translateY(0);
        }
        .pwa-dismiss-btn {
          padding: 6px 20px;
          background: transparent;
          color: #E91E8C;
          border: 1.5px solid #F9C0D8;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .pwa-dismiss-btn:hover {
          background: #FCE4F0;
          border-color: #E91E8C;
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '480px',
        background: '#FFFFFF',
        border: '1.5px solid #F9C0D8',
        borderRadius: '24px',
        padding: '16px 20px',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(233, 30, 140, 0.15)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        {/* App icon */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #E91E8C, #FF6B9D)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(233, 30, 140, 0.3)'
        }}>
          <NeuroLoopLogo size={30} showWordmark={false} />
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#1A1A2E',
            marginBottom: '2px'
          }}>
            Install NeuroLoop
          </div>
          <div style={{
            fontSize: '12px',
            color: '#4A4A6A',
            lineHeight: '1.4'
          }}>
            Add to your home screen for quick access to your learning dashboard.
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={handleInstall}
            className="pwa-install-btn"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="pwa-dismiss-btn"
          >
            Not now
          </button>
        </div>
      </div>
    </>
  )
}
