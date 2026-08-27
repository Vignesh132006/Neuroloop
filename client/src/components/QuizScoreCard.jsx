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
          background: rgba(255, 240, 245, 0.88);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          animation: qsOverlayIn 0.25s ease;
          padding: 16px;
        }
        @keyframes qsOverlayIn { from{opacity:0} to{opacity:1} }

        .qs-card {
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          border-radius: 24px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          animation: qsCardIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 16px 48px rgba(233, 30, 140, 0.15);
          overflow: hidden;
        }
        @keyframes qsCardIn {
          from { opacity:0; transform: scale(0.85) translateY(20px); }
          to   { opacity:1; transform: scale(1)    translateY(0); }
        }

        .qs-top-bar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px; border-radius: 24px 24px 0 0;
          flex-shrink: 0;
          background: linear-gradient(90deg, #E91E8C, #FF6B9D);
        }

        .qs-tab-bar {
          display: flex;
          background: #FFF0F5;
          border-bottom: 1.5px solid #F9C0D8;
          flex-shrink: 0;
          margin-top: 4px;
        }
        .qs-tab {
          flex: 1; padding: 12px 8px;
          background: none; border: none;
          color: #8888AA;
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          border-bottom: 2px solid transparent;
          letter-spacing: 0.03em;
        }
        .qs-tab.active {
          color: #E91E8C;
          border-bottom-color: #E91E8C;
        }
        .qs-tab:hover:not(.active) { color: #1A1A2E; }

        .qs-scroll-body {
          overflow-y: auto;
          flex: 1;
          padding: 1.5rem 1.75rem;
          scrollbar-width: thin;
          scrollbar-color: #F9C0D8 transparent;
        }

        /* Score tab */
        .qs-emoji {
          font-size: 3rem;
          display: block; margin-bottom: 0.5rem; text-align: center;
          animation: emojiPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
        }

        .qs-ring { margin: 0.5rem auto 1rem; display: block; }

        .qs-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.6rem; font-weight: 700;
          letter-spacing: -0.02em; margin: 0 0 0.4rem;
          text-align: center; color: #1A1A2E;
        }
        .qs-topic {
          color: #8888AA; font-size: 0.8rem;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin: 0 0 0.75rem; text-align: center; font-weight: 600;
        }
        .qs-message {
          color: #4A4A6A; font-size: 0.88rem;
          line-height: 1.65; margin: 0 0 1.2rem;
          background: #FFF0F5;
          border-left: 3.5px solid #E91E8C;
          border-radius: 0 12px 12px 0;
          padding: 12px 16px; text-align: left;
        }
        .qs-stats {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 10px; margin-bottom: 1.2rem;
        }
        .qs-stat {
          background: #FCE4F0;
          border: 1px solid #F9C0D8;
          border-radius: 14px; padding: 12px; text-align: center;
        }
        .qs-stat-val { font-family: 'Playfair Display', Georgia, serif; font-size: 1.4rem; font-weight: 700; }
        .qs-stat-lbl { font-size: 0.75rem; color: #8888AA; margin-top: 2px; font-weight: 600; text-transform: uppercase; }

        .qs-xp {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FCE4F0;
          border: 1px solid #F9C0D8;
          color: #E91E8C; border-radius: 50px;
          padding: 6px 18px; font-size: 0.85rem; font-weight: 600;
          margin-bottom: 1rem; display: flex; justify-content: center;
        }
        .qs-weak {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 14px; padding: 12px 14px;
          margin-bottom: 1.2rem; text-align: left;
        }
        .qs-weak-title { color: #dc2626; font-size: 0.8rem; font-weight: 600; margin: 0 0 8px; }
        .qs-weak-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .qs-weak-tag {
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3);
          color: #dc2626; border-radius: 50px;
          padding: 3px 12px; font-size: 0.75rem; font-weight: 500;
        }

        /* Review tab */
        .qs-review-q {
          background: #FFF0F5;
          border: 1.5px solid #F9C0D8;
          border-radius: 18px;
          padding: 1.2rem 1.35rem;
          margin-bottom: 1rem;
        }
        .qs-review-qnum {
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: #8888AA;
          margin-bottom: 6px;
        }
        .qs-review-qtxt {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.98rem; font-weight: 700;
          color: #1A1A2E; margin-bottom: 12px; line-height: 1.5;
        }
        .qs-opt {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 14px; border-radius: 12px;
          margin-bottom: 6px; font-size: 0.88rem;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .qs-opt-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .qs-opt-text { flex: 1; line-height: 1.45; }
        .qs-opt.correct {
          background: rgba(16,185,129,0.1);
          border-color: rgba(16,185,129,0.35);
          color: #059669; font-weight: 600;
        }
        .qs-opt.wrong-picked {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.35);
          color: #dc2626; font-weight: 600;
        }
        .qs-opt.neutral {
          background: #FFFFFF;
          border-color: #F9C0D8;
          color: #4A4A6A;
        }

        .qs-answer-def {
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 12px;
          padding: 10px 14px;
          margin-top: 12px;
          font-size: 0.86rem;
          color: #059669;
          line-height: 1.6;
        }
        .qs-answer-def-label {
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: #10B981; margin-bottom: 5px;
        }

        .qs-explanation {
          background: #FCE4F0;
          border: 1px solid #F9C0D8;
          border-radius: 12px;
          padding: 10px 14px;
          margin-top: 8px;
          font-size: 0.86rem;
          color: #4A4A6A;
          line-height: 1.6;
        }
        .qs-explanation-label {
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: #E91E8C; margin-bottom: 5px;
        }

        .qs-qstatus {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.75rem; font-weight: 700; padding: 4px 14px;
          border-radius: 50px; margin-bottom: 10px;
        }
        .qs-qstatus.pass {
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          color: #059669;
        }
        .qs-qstatus.fail {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #dc2626;
        }

        .qs-footer {
          padding: 1rem 1.75rem 1.5rem;
          display: flex; gap: 12px;
          border-top: 1.5px solid #F9C0D8;
          flex-shrink: 0;
          background: #FFFFFF;
        }
        .qs-btn-retry {
          flex: 1; padding: 12px; border-radius: 50px;
          background: #FFFFFF;
          border: 1.5px solid #F9C0D8;
          color: #E91E8C; font-size: 0.88rem; cursor: pointer;
          transition: all 0.2s; font-weight: 600;
        }
        .qs-btn-retry:hover { background: #FCE4F0; }
        .qs-btn-continue {
          flex: 1.6; padding: 12px; border-radius: 50px;
          background: linear-gradient(135deg, #E91E8C, #FF6B9D);
          border: none; color: white; font-size: 0.88rem;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 18px rgba(233, 30, 140, 0.25);
        }
        .qs-btn-continue:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 26px rgba(233, 30, 140, 0.4);
        }
        .qs-review-hint {
          display: flex; align-items: center; gap: 8px;
          background: #FCE4F0;
          border: 1px solid #F9C0D8;
          border-radius: 12px; padding: 10px 14px;
          font-size: 0.82rem; color: #4A4A6A;
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
