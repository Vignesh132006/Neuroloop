import { useEffect, useState } from 'react';

const QuizScoreCard = ({ score, total, topic, weakAreas, questions = [], onRetry, onClose }) => {
  const percentage = Math.round((score / total) * 100);
  const [activeTab, setActiveTab] = useState('score'); // 'score' | 'review'

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

  const hasReview = questions && questions.length > 0;

  return (
    <>
      <style>{`
        .qs-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          animation: qsOverlayIn 0.25s ease;
          padding: 16px;
        }
        @keyframes qsOverlayIn { from{opacity:0} to{opacity:1} }

        .qs-card {
          background: #13132A;
          border: 1px solid rgba(124,58,237,0.35);
          border-radius: 28px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          animation: qsCardIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
          overflow: hidden;
        }
        @keyframes qsCardIn {
          from { opacity:0; transform: scale(0.65) translateY(40px); }
          to   { opacity:1; transform: scale(1)    translateY(0); }
        }

        .qs-top-bar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px; border-radius: 28px 28px 0 0;
          flex-shrink: 0;
        }

        .qs-tab-bar {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          margin-top: 4px;
        }
        .qs-tab {
          flex: 1; padding: 12px 8px;
          background: none; border: none;
          color: rgba(255,255,255,0.45);
          font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          border-bottom: 2px solid transparent;
          letter-spacing: 0.03em;
        }
        .qs-tab.active {
          color: white;
          border-bottom-color: #7C3AED;
        }
        .qs-tab:hover:not(.active) { color: rgba(255,255,255,0.7); }

        .qs-scroll-body {
          overflow-y: auto;
          flex: 1;
          padding: 1.5rem 1.75rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(124,58,237,0.4) transparent;
        }
        .qs-scroll-body::-webkit-scrollbar { width: 5px; }
        .qs-scroll-body::-webkit-scrollbar-track { background: transparent; }
        .qs-scroll-body::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 4px; }

        /* Score tab */
        .qs-emoji {
          font-size: 3rem;
          display: block; margin-bottom: 0.5rem; text-align: center;
          animation: emojiPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
        }
        @keyframes emojiPop {
          from { transform: scale(0) rotate(-25deg); }
          to   { transform: scale(1) rotate(0); }
        }

        .qs-ring { margin: 0.5rem auto 1rem; display: block; }

        .qs-title {
          font-size: 1.6rem; font-weight: 800;
          letter-spacing: -0.02em; margin: 0 0 0.4rem;
          text-align: center;
        }
        .qs-topic {
          color: rgba(255,255,255,0.45); font-size: 0.78rem;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin: 0 0 0.75rem; text-align: center;
        }
        .qs-message {
          color: rgba(255,255,255,0.75); font-size: 0.86rem;
          line-height: 1.65; margin: 0 0 1.2rem;
          background: rgba(255,255,255,0.04);
          border-left: 3px solid rgba(124,58,237,0.6);
          border-radius: 0 10px 10px 0;
          padding: 10px 14px; text-align: left;
        }
        .qs-stats {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 10px; margin-bottom: 1.2rem;
        }
        .qs-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 12px; text-align: center;
        }
        .qs-stat-val { font-size: 1.3rem; font-weight: 700; }
        .qs-stat-lbl { font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 2px; }

        .qs-xp {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.35);
          color: #F59E0B; border-radius: 9999px;
          padding: 5px 16px; font-size: 0.82rem; font-weight: 600;
          margin-bottom: 1rem; display: flex; justify-content: center;
        }
        .qs-weak {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 12px 14px;
          margin-bottom: 1.2rem; text-align: left;
        }
        .qs-weak-title { color: #FCA5A5; font-size: 0.78rem; font-weight: 600; margin: 0 0 8px; }
        .qs-weak-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .qs-weak-tag {
          background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
          color: #FCA5A5; border-radius: 9999px;
          padding: 3px 11px; font-size: 0.73rem;
        }

        /* Review tab */
        .qs-review-q {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.1rem 1.25rem;
          margin-bottom: 1rem;
        }
        .qs-review-qnum {
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 6px;
        }
        .qs-review-qtxt {
          font-size: 0.9rem; font-weight: 600;
          color: white; margin-bottom: 12px; line-height: 1.5;
        }
        .qs-opt {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          margin-bottom: 6px; font-size: 0.85rem;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .qs-opt-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .qs-opt-text { flex: 1; line-height: 1.45; }
        .qs-opt.correct {
          background: rgba(16,185,129,0.1);
          border-color: rgba(16,185,129,0.35);
          color: #6ee7b7;
        }
        .qs-opt.wrong-picked {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.35);
          color: #fca5a5;
        }
        .qs-opt.neutral {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.55);
        }

        /* Correct answer definition box */
        .qs-answer-def {
          background: rgba(16,185,129,0.07);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 10px;
          padding: 10px 14px;
          margin-top: 12px;
          font-size: 0.84rem;
          color: #a7f3d0;
          line-height: 1.6;
        }
        .qs-answer-def-label {
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: #10B981; margin-bottom: 5px;
        }

        /* Explanation box */
        .qs-explanation {
          background: rgba(124,58,237,0.07);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 10px;
          padding: 10px 14px;
          margin-top: 8px;
          font-size: 0.84rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
        }
        .qs-explanation-label {
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: #A78BFA; margin-bottom: 5px;
        }

        /* Status badges */
        .qs-qstatus {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.71rem; font-weight: 700; padding: 3px 10px;
          border-radius: 99px; margin-bottom: 10px;
        }
        .qs-qstatus.pass {
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          color: #6ee7b7;
        }
        .qs-qstatus.fail {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
        }

        .qs-footer {
          padding: 1rem 1.75rem 1.5rem;
          display: flex; gap: 10px;
          border-top: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .qs-btn-retry {
          flex: 1; padding: 12px; border-radius: 9999px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          color: white; font-size: 0.86rem; cursor: pointer;
          transition: background 0.2s; font-weight: 500;
        }
        .qs-btn-retry:hover { background: rgba(255,255,255,0.13); }
        .qs-btn-continue {
          flex: 1.6; padding: 12px; border-radius: 9999px;
          background: linear-gradient(135deg,#7C3AED,#06B6D4);
          border: none; color: white; font-size: 0.86rem;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .qs-btn-continue:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(124,58,237,0.38);
        }
        .qs-review-hint {
          display: flex; align-items: center; gap: 8px;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 10px; padding: 10px 14px;
          font-size: 0.8rem; color: rgba(255,255,255,0.6);
          margin-bottom: 1rem;
        }

        @media (max-width: 480px) {
          .qs-card { border-radius: 20px; }
          .qs-scroll-body { padding: 1rem; }
          .qs-title { font-size: 1.35rem !important; }
          .qs-stats { grid-template-columns: 1fr 1fr !important; }
          .qs-footer { padding: 0.75rem 1rem 1.25rem; flex-direction: column; gap: 8px; }
          .qs-btn-retry, .qs-btn-continue { flex: none !important; width: 100% !important; }
        }
      `}</style>

      <div className="qs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="qs-card">
          <div className="qs-top-bar"
               style={{ background: `linear-gradient(90deg, #7C3AED, ${result.color})` }} />

          {/* Tab bar */}
          <div className="qs-tab-bar" style={{ paddingTop: '12px' }}>
            <button className={`qs-tab ${activeTab === 'score' ? 'active' : ''}`} onClick={() => setActiveTab('score')}>
              📊 Score Overview
            </button>
            {hasReview && (
              <button className={`qs-tab ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
                📖 Review Answers ({questions.length})
              </button>
            )}
          </div>

          {/* ── SCORE TAB ─────────────────────────────────── */}
          {activeTab === 'score' && (
            <div className="qs-scroll-body">
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
                  <div className="qs-stat-val" style={{ color: '#10B981' }}>{score}</div>
                  <div className="qs-stat-lbl">Correct</div>
                </div>
                <div className="qs-stat">
                  <div className="qs-stat-val" style={{ color: '#EF4444' }}>{total - score}</div>
                  <div className="qs-stat-lbl">Incorrect</div>
                </div>
                <div className="qs-stat">
                  <div className="qs-stat-val" style={{ color: result.color }}>{percentage}%</div>
                  <div className="qs-stat-lbl">Score</div>
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

              {hasReview && (
                <div className="qs-review-hint">
                  💡 Switch to the <strong style={{ color: '#A78BFA', margin: '0 4px' }}>Review Answers</strong> tab to see explanations for every question.
                </div>
              )}
            </div>
          )}

          {/* ── REVIEW TAB ─────────────────────────────────── */}
          {activeTab === 'review' && (
            <div className="qs-scroll-body">
              {questions.map((q, i) => {
                const isCorrect = q.isCorrect;
                const userAnswer = q.userAnswer;
                const correctAnswer = q.correctAnswer;

                return (
                  <div key={i} className="qs-review-q">
                    {/* Question number + status */}
                    <div className="qs-review-qnum">Question {i + 1} of {questions.length}</div>
                    <span className={`qs-qstatus ${isCorrect ? 'pass' : 'fail'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>

                    {/* Question text */}
                    <div className="qs-review-qtxt">{q.question}</div>

                    {/* Options list */}
                    {q.options && q.options.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
                        {q.options.map((opt, j) => {
                          const isCorrectOpt = opt === correctAnswer;
                          const isUserPicked = opt === userAnswer;
                          const isWrongPick = isUserPicked && !isCorrectOpt;

                          let cls = 'neutral';
                          let icon = '○';
                          if (isCorrectOpt) { cls = 'correct'; icon = '✓'; }
                          else if (isWrongPick) { cls = 'wrong-picked'; icon = '✗'; }

                          return (
                            <div key={j} className={`qs-opt ${cls}`}>
                              <span className="qs-opt-icon">{icon}</span>
                              <span className="qs-opt-text">
                                {opt}
                                {isCorrectOpt && <span style={{ fontSize: '0.7rem', marginLeft: '8px', opacity: 0.7, fontWeight: 600 }}>← Correct Answer</span>}
                                {isWrongPick && <span style={{ fontSize: '0.7rem', marginLeft: '8px', opacity: 0.7, fontWeight: 600 }}>← Your Answer</span>}
                                {isCorrectOpt && isUserPicked && <span style={{ fontSize: '0.7rem', marginLeft: '8px', opacity: 0.7, fontWeight: 600 }}>← Your Answer ✓</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Interview-style open-ended answer */
                      <div style={{ marginBottom: '4px' }}>
                        <div className="qs-opt wrong-picked">
                          <span className="qs-opt-icon">📝</span>
                          <span className="qs-opt-text">
                            <strong>Your response:</strong> {userAnswer || '(No response)'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Correct Answer Definition */}
                    {correctAnswer && (
                      <div className="qs-answer-def">
                        <div className="qs-answer-def-label">✓ Correct Answer</div>
                        {correctAnswer}
                      </div>
                    )}

                    {/* AI Explanation */}
                    {q.explanation && (
                      <div className="qs-explanation">
                        <div className="qs-explanation-label">💡 Explanation</div>
                        {q.explanation}
                      </div>
                    )}

                    {/* Hint (for interview questions) */}
                    {q.hint && (
                      <div className="qs-explanation">
                        <div className="qs-explanation-label">🔑 Concept / Hint</div>
                        {q.hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer buttons */}
          <div className="qs-footer">
            <button className="qs-btn-retry" onClick={onRetry}>🔄 Retry Quiz</button>
            <button className="qs-btn-continue" onClick={onClose}>Continue Learning →</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizScoreCard;
