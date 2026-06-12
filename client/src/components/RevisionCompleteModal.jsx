import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const motivationalMessages = {
  5: { icon: '🔥', msg: "Perfect recall! Your mastery is skyrocketing. This topic is becoming second nature!", color: '#F59E0B' },
  4: { icon: '⚡', msg: "Strong recall! You're building rock-solid understanding. Keep this streak alive!", color: '#10B981' },
  3: { icon: '💡', msg: "Good progress! You're actively strengthening this neural pathway. Every review counts!", color: '#3B82F6' },
  2: { icon: '🌱', msg: "Growing steadily! Don't worry — spaced repetition is working its magic beneath the surface!", color: '#06B6D4' },
  1: { icon: '🧩', msg: "Keep pushing! The toughest topics teach the most. Your review is scheduled to help you conquer this!", color: '#A78BFA' },
}

export default function RevisionCompleteModal({ topic, confidence, nextRevisionDays, masteryScore, revisionsCount, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 50, spread: 60,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#7C3AED', '#06B6D4', '#10B981', '#A78BFA'],
      ticks: 180,
    })
  }, [])

  const m = motivationalMessages[confidence] || motivationalMessages[3]
  const masteryPercent = Math.min(masteryScore || 0, 100)

  return (
    <div className="revision-modal-overlay">
      <div className="revision-modal">
        <span className="revision-icon">{m.icon}</span>
        <h3 style={{ color: m.color, fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Revision #{revisionsCount} Complete!
        </h3>
        <p className="revision-topic-name">"{topic}"</p>
        <p className="revision-message">{m.msg}</p>

        {/* Mastery bar */}
        <div className="mastery-section">
          <div className="mastery-header">
            <span>Mastery Level</span>
            <span style={{ color: m.color }}>{masteryPercent}%</span>
          </div>
          <div className="mastery-track">
            <div className="mastery-fill"
                 style={{ width: `${masteryPercent}%`, background: `linear-gradient(90deg, #7C3AED, ${m.color})` }} />
          </div>
        </div>

        {/* Next review badge */}
        <div className="next-review-badge">
          📅 Next review in <strong>{nextRevisionDays} day{nextRevisionDays !== 1 ? 's' : ''}</strong> — your brain is optimizing!
        </div>

        <button onClick={onClose} className="btn-continue" style={{ marginTop: '1rem', width: '100%' }}>
          Keep Going! →
        </button>
      </div>
    </div>
  )
}
