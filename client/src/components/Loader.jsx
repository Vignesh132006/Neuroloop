import NeuroLoopLogo from "./NeuroLoopLogo"

export default function Loader({ text = "Loading NeuroLoop..." }) {
  return (
    <div className="loading-screen" id="neuroloop-page-loader">
      <div className="loader-container">
        {/* Outer and Inner rotating rings */}
        <div className="loader-ring-outer"></div>
        <div className="loader-ring-inner"></div>
        <div className="loader-sparkle"></div>
        
        {/* Pulsing NeuroLoop Logo in the center */}
        <div className="loader-logo">
          <NeuroLoopLogo size={56} showWordmark={false} />
        </div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  )
}
