export default function NeuroLoopLogo({ size = 36, showWordmark = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring (loop) */}
        <circle
          cx="18" cy="18" r="16"
          stroke="url(#nl-grad-logo)"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="70 30"
          strokeLinecap="round"
        />
        {/* Inner neural nodes */}
        <circle cx="18" cy="8"  r="2.5" fill="#E91E8C" />
        <circle cx="27" cy="22" r="2.5" fill="#FF6B9D" />
        <circle cx="9"  cy="22" r="2.5" fill="#E91E8C" />
        {/* Connecting lines (synapses) */}
        <line x1="18" y1="10.5" x2="25" y2="20" stroke="#E91E8C" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <line x1="18" y1="10.5" x2="11" y2="20" stroke="#FF6B9D" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <line x1="11" y1="22"   x2="25" y2="22" stroke="#E91E8C" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <defs>
          <linearGradient id="nl-grad-logo" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E91E8C" />
            <stop offset="50%"  stopColor="#FF6B9D" />
            <stop offset="100%" stopColor="#E91E8C" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && (
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: `${Math.max(size * 0.034, 1.2)}rem`,
            color: '#E91E8C',
          }}
        >
          Neuro<span style={{ color: '#1A1A2E' }}>Loop</span>
        </span>
      )}
    </div>
  )
}
