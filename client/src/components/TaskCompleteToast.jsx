import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function TaskCompleteToast({ topic, isVisible, onDismiss }) {
  useEffect(() => {
    if (isVisible) {
      confetti({
        particleCount: 25, angle: 135, spread: 45,
        origin: { x: 0.95, y: 0.95 },
        colors: ['#7C3AED', '#10B981', '#06B6D4'],
        ticks: 120, scalar: 0.8,
      })
      const timer = setTimeout(onDismiss, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  if (!isVisible) return null

  return (
    <div className="task-toast">
      <div className="toast-icon-ring">✅</div>
      <div style={{ flex: 1 }}>
        <p className="toast-title">Journal Entry Saved!</p>
        <p className="toast-subtitle">"{topic}" added to your learning loop 🧠</p>
        <p className="toast-motivation">+1 to your daily streak! You're on a roll!</p>
      </div>
      <button onClick={onDismiss} className="toast-close">✕</button>
    </div>
  )
}
