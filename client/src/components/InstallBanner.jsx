import { useState, useEffect } from 'react'

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
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '480px',
        background: '#111118',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '16px',
        padding: '16px 20px',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.4s ease both',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        {/* App icon */}
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontSize: '24px', fontWeight: '700', color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>N</div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px', fontWeight: '600',
            color: '#f1f5f9', marginBottom: '2px'
          }}>
            Install NeuroLoop
          </div>
          <div style={{
            fontSize: '12px', color: '#64748b', lineHeight: '1.4'
          }}>
            Add to your home screen for quick access to your learning dashboard.
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={handleInstall}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            style={{
              padding: '6px 16px',
              background: 'transparent',
              color: '#64748b',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </>
  )
}
