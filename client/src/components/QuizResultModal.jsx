import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

const getMessage = (pct, topic) => {
  if (pct === 100) return {
    emoji: '🏆', title: 'PERFECT SCORE!', subtitle: 'You absolutely crushed it!',
    body: `Incredible! You scored 100% on ${topic}. You have completely mastered this topic. Your dedication is paying off — you're unstoppable!`,
    color: '#F59E0B', tier: 'legendary'
  }
  if (pct >= 90) return {
    emoji: '🌟', title: 'Outstanding!', subtitle: "Near perfection — you're on fire!",
    body: `${pct}% on ${topic}! You're deeply mastering this material. Just a tiny bit more and you'll own it completely. Keep this momentum going!`,
    color: '#10B981', tier: 'excellent'
  }
  if (pct >= 80) return {
    emoji: '🚀', title: 'Great Work!', subtitle: 'Strong performance — keep climbing!',
    body: `${pct}% — you're well above average and building real expertise in ${topic}. Your knowledge loop is strengthening. You've got this!`,
    color: '#3B82F6', tier: 'great'
  }
  if (pct >= 60) return {
    emoji: '💪', title: 'Good Effort!', subtitle: 'Progress made — every attempt builds strength!',
    body: `${pct}% on ${topic}. You're in the learning zone — this is exactly where growth happens. Review the weak spots and come back stronger. You WILL get there!`,
    color: '#06B6D4', tier: 'good'
  }
  if (pct >= 40) return {
    emoji: '🧠', title: 'Keep Going!', subtitle: 'The struggle is the secret to mastery!',
    body: `${pct}% — don't be discouraged. Every mistake is your brain forming new pathways. The AI has flagged your weak areas. Study them and you'll come back 2x stronger!`,
    color: '#A78BFA', tier: 'growing'
  }
  return {
    emoji: '🌱', title: 'Just Getting Started!', subtitle: 'Every expert was once where you are now!',
    body: `This is just the beginning of your journey with ${topic}. Your personalized study plan has been updated. Take it one concept at a time — you'll get there!`,
    color: '#F59E0B', tier: 'beginner'
  }
}

export default function QuizResultModal({ score, total, topic, weakAreas, onClose, onRetry }) {
  const percentage = Math.round((score / total) * 100)
  const canvasRef = useRef(null)
  const msg = getMessage(percentage, topic)

  useEffect(() => {
    if (percentage === 100) {
      const duration = 4000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 4, angle: 60, spread: 55,
          origin: { x: 0, y: 0.85 },
          colors: ['#7C3AED','#A78BFA','#F59E0B','#06B6D4','#10B981','#FFFFFF'],
          shapes: ['circle','square'], scalar: 1.2, ticks: 200,
        })
        confetti({
          particleCount: 4, angle: 120, spread: 55,
          origin: { x: 1, y: 0.85 },
          colors: ['#7C3AED','#A78BFA','#F59E0B','#06B6D4','#EF4444','#FFFFFF'],
          shapes: ['circle','square'], scalar: 1.2, ticks: 200,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
      setTimeout(() => {
        confetti({
          particleCount: 120, spread: 100,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#7C3AED','#A78BFA','#F59E0B','#06B6D4','#10B981'],
          scalar: 1.4, ticks: 300,
        })
      }, 600)
    } else if (percentage >= 80) {
      confetti({
        particleCount: 60, spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#7C3AED','#06B6D4','#10B981','#A78BFA'], ticks: 200,
      })
    } else if (percentage >= 60) {
      confetti({
        particleCount: 30, spread: 50,
        origin: { x: 0.5, y: 0.1 },
        colors: ['#06B6D4','#A78BFA'], gravity: 0.6, ticks: 150,
      })
    }
  }, [percentage])

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDash = (percentage / 100) * circumference

  return (
    <div className="quiz-result-overlay">
      <canvas ref={canvasRef} className="confetti-canvas" />

      <div className={`quiz-result-modal tier-${msg.tier}`}>
        {/* Animated emoji */}
        <div className="result-emoji-wrapper">
          <span className="result-emoji">{msg.emoji}</span>
          {percentage === 100 && <div className="emoji-ring-pulse" />}
        </div>

        {/* Score ring */}
        <div className="score-ring-container">
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={radius} fill="none"
                    stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle cx="65" cy="65" r={radius} fill="none"
                    stroke={msg.color} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                    strokeDashoffset={circumference * 0.25}
                    style={{ transition: 'stroke-dasharray 1.5s ease', filter: `drop-shadow(0 0 8px ${msg.color})` }} />
            <text x="65" y="58" textAnchor="middle" fill="white"
                  fontSize="26" fontWeight="700">{percentage}%</text>
            <text x="65" y="76" textAnchor="middle" fill="rgba(255,255,255,0.55)"
                  fontSize="12">{score}/{total} correct</text>
          </svg>
        </div>

        {/* Title & message */}
        <h2 className="result-title" style={{ color: msg.color }}>{msg.title}</h2>
        <p className="result-subtitle">{msg.subtitle}</p>
        <p className="result-body">{msg.body}</p>

        {/* XP badge */}
        <div className="xp-badge">
          <span>⚡</span>
          <span>+{Math.round(percentage * 0.5)} XP earned</span>
        </div>

        {/* Weak areas */}
        {weakAreas && weakAreas.length > 0 && percentage < 80 && (
          <div className="weak-areas-panel">
            <p className="weak-areas-title">🎯 Focus areas for your next session:</p>
            <div className="weak-tags">
              {weakAreas.map(area => (
                <span key={area} className="weak-tag">{area}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="result-actions">
          <button onClick={onRetry} className="btn-retry">🔄 Try Again</button>
          <button onClick={onClose} className="btn-continue">Continue Learning →</button>
        </div>
      </div>
    </div>
  )
}
