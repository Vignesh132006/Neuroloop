import { useState } from 'react';

const PRESETS = [
  { label: 'Tomorrow',  days: 1,  icon: '📅' },
  { label: '3 Days',    days: 3,  icon: '⚡' },
  { label: '1 Week',    days: 7,  icon: '🗓️' },
  { label: '2 Weeks',   days: 14, icon: '📆' },
  { label: '1 Month',   days: 30, icon: '🌙' },
];

const RevisionIntervalPicker = ({ noteId, currentNextDate, onIntervalChange }) => {
  const [open, setOpen]         = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [saved, setSaved]       = useState(false);

  const applyPreset = async (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    await onIntervalChange(noteId, date.toISOString());
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); }, 1500);
  };

  const applyCustom = async () => {
    if (!customDate) return;
    await onIntervalChange(noteId, new Date(customDate).toISOString());
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); }, 1500);
  };

  const formattedDate = currentNextDate
    ? new Date(currentNextDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not scheduled';

  return (
    <>
      <style>{`
        .rip-trigger {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(6,182,212,0.1);
          border: 1px solid rgba(6,182,212,0.3);
          color: #06B6D4; border-radius: 9999px;
          padding: 5px 13px; font-size: 0.78rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .rip-trigger:hover {
          background: rgba(6,182,212,0.2);
          border-color: rgba(6,182,212,0.5);
          box-shadow: 0 0 12px rgba(6,182,212,0.2);
        }

        .rip-panel {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: #1A1A35;
          border: 1px solid rgba(124,58,237,0.35);
          border-radius: 16px; padding: 1rem;
          z-index: 100;
          animation: ripIn 0.2s ease;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }
        @keyframes ripIn {
          from { opacity:0; transform: translateY(-6px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .rip-label {
          font-size: 0.72rem; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.4);
          margin: 0 0 8px; font-weight: 600;
        }

        .rip-presets {
          display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
          margin-bottom: 10px;
        }
        .rip-preset {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 8px 10px;
          color: rgba(255,255,255,0.75); font-size: 0.82rem;
          cursor: pointer; transition: all 0.15s;
        }
        .rip-preset:hover {
          background: rgba(124,58,237,0.18);
          border-color: rgba(124,58,237,0.4);
          color: white;
        }

        .rip-divider {
          border: none; border-top: 1px solid rgba(255,255,255,0.07);
          margin: 10px 0;
        }

        .rip-custom-row {
          display: flex; gap: 6px;
        }
        .rip-date-input {
          flex: 1; padding: 8px 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 9px; color: white; font-size: 0.82rem;
          outline: none; transition: border-color 0.2s;
        }
        .rip-date-input:focus { border-color: #7C3AED; }
        .rip-apply-btn {
          padding: 8px 14px; border-radius: 9px;
          background: linear-gradient(135deg,#7C3AED,#06B6D4);
          border: none; color: white; font-size: 0.82rem;
          font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: opacity 0.2s;
        }
        .rip-apply-btn:hover { opacity: 0.88; }

        .rip-saved {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; color: #10B981; font-size: 0.85rem;
          font-weight: 600; padding: 8px 0;
          animation: ripIn 0.2s ease;
        }
      `}</style>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button className="rip-trigger" onClick={() => setOpen(o => !o)}>
          📅 {formattedDate}
        </button>

        {open && (
          <div className="rip-panel">
            {saved ? (
              <div className="rip-saved">✅ Revision date updated!</div>
            ) : (
              <>
                <p className="rip-label">Quick intervals</p>
                <div className="rip-presets">
                  {PRESETS.map(p => (
                    <button key={p.days} className="rip-preset" onClick={() => applyPreset(p.days)}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
                <hr className="rip-divider"/>
                <p className="rip-label">Pick a custom date</p>
                <div className="rip-custom-row">
                  <input
                    type="date"
                    className="rip-date-input"
                    value={customDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setCustomDate(e.target.value)}
                  />
                  <button className="rip-apply-btn" onClick={applyCustom}>Set</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default RevisionIntervalPicker;
