import { useState, useEffect } from 'react'
import NeuroLoopLogo from './NeuroLoopLogo'

const floatingStats = [
  { icon: '🔥', value: '47 days', label: 'Top streak' },
  { icon: '🧠', value: '1,240', label: 'Notes created' },
  { icon: '⚡', value: '98%', label: 'Quiz accuracy' },
  { icon: '🏆', value: '#1', label: 'Leaderboard' },
]

const quotes = [
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { text: 'The beautiful thing about learning is nobody can take it away.', author: 'B.B. King' },
  { text: 'Education is the passport to the future.', author: 'Malcolm X' },
  { text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' },
]

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 4,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 8,
  opacity: 0.08 + Math.random() * 0.15,
}))

export default function AuthLeftPanel() {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setQuoteIdx((prev) => (prev + 1) % quotes.length)
        setFadeIn(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const quote = quotes[quoteIdx]

  return (
    <div style={{
      flex: 1,
      background: 'linear-gradient(135deg, #FFF0F5 0%, #FCE4F0 100%)',
      padding: '3rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      borderRight: '1px solid #F9C0D8'
    }}>
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: '#E91E8C',
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Logo */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <NeuroLoopLogo size={40} />
      </div>

      {/* Quote */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        maxWidth: '480px',
      }}>
        <div
          style={{
            transition: 'all 0.4s ease',
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.65rem',
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#1A1A2E',
            marginBottom: '0.75rem',
            letterSpacing: '-0.01em',
          }}>
            "{quote.text}"
          </p>
          <p style={{
            color: '#E91E8C',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}>
            — {quote.author}
          </p>
        </div>

        {/* Floating Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          marginTop: '3rem',
        }}>
          {floatingStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #F9C0D8',
                borderRadius: '16px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 20px rgba(233, 30, 140, 0.06)'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1A1A2E', lineHeight: 1.2 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#8888AA', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Avatar stack */}
          <div style={{ display: 'flex' }}>
            {['#E91E8C', '#FF6B9D', '#F59E0B', '#10B981', '#E91E8C'].map((color, i) => (
              <div
                key={i}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: color,
                  border: '2px solid #FFFFFF',
                  marginLeft: i === 0 ? 0 : '-8px',
                  position: 'relative',
                  zIndex: 5 - i,
                }}
              />
            ))}
          </div>
          <p style={{ color: '#4A4A6A', fontSize: '0.82rem' }}>
            Join <strong style={{ color: '#1A1A2E' }}>10,000+</strong> learners building their knowledge loop
          </p>
        </div>
      </div>
    </div>
  )
}
