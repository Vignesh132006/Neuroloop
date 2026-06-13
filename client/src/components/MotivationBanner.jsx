import { useState, useEffect } from 'react'
import { FiZap } from 'react-icons/fi'

const quotes = [
  "Your brain gets stronger every time you review!",
  "Consistency beats perfection -- keep your streak alive!",
  "20 minutes of focused study > 2 hours of distracted reading.",
  "Top learners review before they forget. You're doing that right now.",
  "Every note you write plants a seed in your long-term memory.",
  "The more connections you make between topics, the deeper you understand.",
  "Focus on understanding, not memorizing -- mastery follows naturally.",
  "You're building compound knowledge -- each day multiplies your progress.",
  "Struggling with a topic? That's your brain building new neural pathways!",
  "Review, quiz, repeat -- the NeuroLoop formula for lasting knowledge.",
]

export default function MotivationBanner({ streak = 0 }) {
  const [visible, setVisible] = useState(false)
  const [quoteIdx, setQuoteIdx] = useState(0)

  useEffect(() => {
    const lastDismissed = localStorage.getItem('motivationBannerDismissed')
    const today = new Date().toDateString()
    if (lastDismissed !== today) {
      setVisible(true)
    }
    setQuoteIdx(Math.floor(Math.random() * quotes.length))
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem('motivationBannerDismissed', new Date().toDateString())
  }

  if (!visible) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.04))',
      border: '1px solid rgba(212,175,55,0.2)',
      borderRadius: 12,
      padding: '11px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 28,
      fontSize: '0.875rem',
      color: '#a09880',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {streak > 0 && (
          <div style={{
            background: 'rgba(212,175,55,0.15)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#d4af37',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <FiZap size={12} fill="#d4af37" /> {streak} day{streak !== 1 ? 's' : ''}
          </div>
        )}
        <p style={{ margin: 0, color: '#a09880', fontSize: '0.875rem' }}>{quotes[quoteIdx]}</p>
      </div>
      <button 
        onClick={handleDismiss} 
        style={{
          background: 'none', border: 'none', color: '#5a5040', 
          cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center',
          padding: '4px'
        }}
      >&times;</button>
    </div>
  )
}
