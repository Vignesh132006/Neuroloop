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
    <>
      <style>{`
        .revision-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          animation: modalBgIn 0.25s ease;
        }
        .revision-modal {
          background: var(--s1);
          border: 1px solid var(--bd);
          border-radius: var(--rl);
          padding: 32px 24px;
          width: 90%; max-width: 440px;
          text-align: center;
          position: relative;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
          animation: modalCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .revision-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 12px;
        }
        .revision-topic-name {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 8px;
        }
        .revision-message {
          font-size: 0.88rem;
          color: var(--t2);
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .mastery-section {
          background: var(--s2);
          border: 1px solid var(--bd);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          text-align: left;
        }
        .mastery-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--t1);
        }
        .mastery-track {
          height: 6px;
          background: var(--s3);
          border-radius: 99px;
          overflow: hidden;
        }
        .mastery-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.8s ease;
        }
        .next-review-badge {
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.2);
          color: #06B6D4;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 0.82rem;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .btn-continue {
          padding: 12px;
          border-radius: 99px;
          border: none;
          background: var(--gold);
          color: #0a0a0a;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-continue:hover {
          background: var(--goldl);
          transform: translateY(-1px);
        }
      `}</style>

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
    </>
  )
}
