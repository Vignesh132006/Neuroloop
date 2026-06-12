import { useEffect } from 'react';

const QuizScoreCard = ({ score, total, topic, weakAreas, onRetry, onClose }) => {
  const percentage = Math.round((score / total) * 100);

  const getResult = (pct) => {
    if (pct === 100) return { emoji: '🏆', title: 'Perfect Score!',    color: '#F59E0B', msg: `Flawless! You have completely mastered ${topic}. Absolutely unstoppable!` };
    if (pct >= 90)  return { emoji: '🌟', title: 'Outstanding!',       color: '#10B981', msg: `${pct}% — you are deeply mastering ${topic}. Elite performance!` };
    if (pct >= 80)  return { emoji: '🚀', title: 'Great Work!',        color: '#3B82F6', msg: `${pct}% — strong knowledge building. You are well above the curve!` };
    if (pct >= 60)  return { emoji: '💪', title: 'Good Effort!',       color: '#06B6D4', msg: `${pct}% — you are in the growth zone. Review the weak spots and come back stronger!` };
    if (pct >= 40)  return { emoji: '🧠', title: 'Keep Going!',        color: '#A78BFA', msg: `Every mistake is your brain forming new pathways. Study the flagged areas and retry!` };
    return           { emoji: '🌱', title: 'Just Starting!',           color: '#F59E0B', msg: `This is the beginning of your journey. Your study plan has been updated. You will get there!` };
  };

  const result = getResult(percentage);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (percentage / 100) * circumference;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <style>{`
        .qs-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.82);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          animation: qsOverlayIn 0.25s ease;
        }
        @keyframes qsOverlayIn { from{opacity:0} to{opacity:1} }

        .qs-card {
          background: #13132A;
          border: 1px solid rgba(124,58,237,0.35);
          border-radius: 28px;
          padding: 2.5rem 2rem;
          width: 90%; max-width: 460px;
          text-align: center;
          position: relative;
          animation: qsCardIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        }
        @keyframes qsCardIn {
          from { opacity:0; transform: scale(0.65) translateY(40px); }
          to   { opacity:1; transform: scale(1)    translateY(0); }
        }

        .qs-top-bar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px; border-radius: 28px 28px 0 0;
        }

        .qs-emoji {
          font-size: 3.2rem;
          display: block; margin-bottom: 0.5rem;
          animation: emojiPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
        }
        @keyframes emojiPop {
          from { transform: scale(0) rotate(-25deg); }
          to   { transform: scale(1) rotate(0); }
        }

        .qs-ring { margin: 0.5rem auto 1rem; display: block; }

        .qs-title {
          font-size: 1.7rem; font-weight: 800;
          letter-spacing: -0.02em; margin: 0 0 0.5rem;
        }
        .qs-topic {
          color: rgba(255,255,255,0.45); font-size: 0.82rem;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin: 0 0 0.75rem;
        }
        .qs-message {
          color: rgba(255,255,255,0.75); font-size: 0.88rem;
          line-height: 1.65; margin: 0 0 1.25rem;
          background: rgba(255,255,255,0.04);
          border-left: 3px solid rgba(124,58,237,0.6);
          border-radius: 0 10px 10px 0;
          padding: 10px 14px; text-align: left;
        }

        .qs-stats {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 1.25rem;
        }
        .qs-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 12px;
        }
        .qs-stat-val { font-size: 1.4rem; font-weight: 700; }
        .qs-stat-lbl { font-size: 0.75rem; color: rgba(255,255,255,0.45); margin-top: 2px; }

        .qs-xp {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.35);
          color: #F59E0B; border-radius: 9999px;
          padding: 5px 16px; font-size: 0.82rem; font-weight: 600;
          margin-bottom: 1rem;
        }

        .qs-weak {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 12px 14px;
          margin-bottom: 1.25rem; text-align: left;
        }
        .qs-weak-title { color: #FCA5A5; font-size: 0.8rem; font-weight: 600; margin: 0 0 8px; }
        .qs-weak-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .qs-weak-tag {
          background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
          color: #FCA5A5; border-radius: 9999px;
          padding: 3px 11px; font-size: 0.75rem;
        }

        .qs-actions { display: flex; gap: 10px; }
        .qs-btn-retry {
          flex: 1; padding: 12px; border-radius: 9999px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          color: white; font-size: 0.88rem; cursor: pointer;
          transition: background 0.2s;
        }
        .qs-btn-retry:hover { background: rgba(255,255,255,0.13); }
        .qs-btn-continue {
          flex: 1.6; padding: 12px; border-radius: 9999px;
          background: linear-gradient(135deg,#7C3AED,#06B6D4);
          border: none; color: white; font-size: 0.88rem;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .qs-btn-continue:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(124,58,237,0.38);
        }
      `}</style>

      <div className="qs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="qs-card">
          <div className="qs-top-bar"
               style={{ background: `linear-gradient(90deg, #7C3AED, ${result.color})` }} />

          <span className="qs-emoji">{result.emoji}</span>

          <svg className="qs-ring" width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={radius} fill="none"
                    stroke="rgba(255,255,255,0.07)" strokeWidth="9"/>
            <circle cx="65" cy="65" r={radius} fill="none"
                    stroke={result.color} strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${filled} ${circumference - filled}`}
                    strokeDashoffset={circumference * 0.25}
                    style={{ transition: 'stroke-dasharray 1.4s ease',
                             filter: `drop-shadow(0 0 8px ${result.color})` }}/>
            <text x="65" y="57" textAnchor="middle" fill="white"
                  fontSize="28" fontWeight="800">{percentage}%</text>
            <text x="65" y="76" textAnchor="middle"
                  fill="rgba(255,255,255,0.45)" fontSize="11">
              {score} / {total} correct
            </text>
          </svg>

          <h2 className="qs-title" style={{ color: result.color }}>{result.title}</h2>
          <p className="qs-topic">Topic: {topic}</p>
          <p className="qs-message">{result.msg}</p>

          <div className="qs-stats">
            <div className="qs-stat">
              <div className="qs-stat-val" style={{ color: result.color }}>{score}</div>
              <div className="qs-stat-lbl">Correct answers</div>
            </div>
            <div className="qs-stat">
              <div className="qs-stat-val" style={{ color: '#EF4444' }}>{total - score}</div>
              <div className="qs-stat-lbl">Incorrect answers</div>
            </div>
          </div>

          <div className="qs-xp">⚡ +{Math.round(percentage * 0.5)} XP earned</div>

          {weakAreas && weakAreas.length > 0 && percentage < 80 && (
            <div className="qs-weak">
              <p className="qs-weak-title">🎯 Focus areas for next session:</p>
              <div className="qs-weak-tags">
                {weakAreas.map(a => <span key={a} className="qs-weak-tag">{a}</span>)}
              </div>
            </div>
          )}

          <div className="qs-actions">
            <button className="qs-btn-retry" onClick={onRetry}>🔄 Retry Quiz</button>
            <button className="qs-btn-continue" onClick={onClose}>Continue Learning →</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizScoreCard;
