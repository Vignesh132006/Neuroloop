import React, { useEffect } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

export default function ConfirmDeleteModal({ isOpen, title, message, onConfirm, onCancel }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Warning Icon Banner */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--red)',
          fontSize: '1.5rem'
        }}>
          <FiAlertTriangle />
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: 'var(--t1)',
          marginBottom: '10px'
        }}>
          {title || "Confirm Delete"}
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '0.88rem',
          color: 'var(--t2)',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          {message || "Are you sure you want to perform this action?"}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-ghost"
            onClick={onCancel}
            style={{ flex: 1, padding: '10px', fontSize: '0.88rem', fontWeight: '500' }}
          >
            Cancel
          </button>
          <button
            className="btn-gold"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.88rem',
              fontWeight: '600',
              background: 'var(--red)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--red)'}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
