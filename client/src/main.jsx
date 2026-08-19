import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

// Capture PWA install prompt early before React components mount
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredPWAInstallPrompt = e
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service worker registered:', reg.scope)
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err)
      })
  }

  if (document.readyState === 'complete') {
    registerSW()
  } else {
    window.addEventListener('load', registerSW)
  }
}