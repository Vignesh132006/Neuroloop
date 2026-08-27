import { useState, useEffect } from 'react'
import NeuroLoopLogo from './NeuroLoopLogo'

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
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
          padding: 8px 18px;
          background: linear-gradient(135deg, #ff3b30, #e02e24);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(255, 59, 48, 0.35);
          transition: all 0.2s ease;
        }
        .pwa-install-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 59, 48, 0.5);
          background: linear-gradient(135deg, #ff5247, #ff3b30);
        }
        .pwa-install-btn:active {
          transform: translateY(0);
        }
        .pwa-dismiss-btn {
          padding: 6px 18px;
          background: rgba(255, 255, 255, 0.04);
          color: #a1a1aa;
          border: 1px solid rgba(255, 59, 48, 0.2);
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .pwa-dismiss-btn:hover {
          background: rgba(255, 59, 48, 0.1);
          color: #f5f5f7;
          border-color: rgba(255, 59, 48, 0.4);
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '480px',
        background: '#121214',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 59, 48, 0.3)',
        borderRadius: '20px',
        padding: '16px 20px',
        zIndex: 9999,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 59, 48, 0.15)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        {/* App icon */}
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15), rgba(255, 107, 118, 0.05))',
          border: '1px solid rgba(255, 59, 48, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(255, 59, 48, 0.2)'
        }}>
          <NeuroLoopLogo size={32} showWordmark={false} />
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#f5f5f7',
            marginBottom: '2px',
            letterSpacing: '-0.01em'
          }}>
            Install NeuroLoop
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a1a1aa',
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
