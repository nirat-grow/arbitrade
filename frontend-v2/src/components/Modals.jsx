import React, { useState, useEffect } from 'react';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`nexus-toast ${type}`}>
      <span style={{ fontSize: '1.1rem' }}>{type === 'success' ? '⚡' : '⚠️'}</span>
      <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: '500' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          marginLeft: '8px',
          fontSize: '1rem',
        }}
      >
        ×
      </button>
    </div>
  );
};

export const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!userId.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onLogin(userId.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-quantum-card" onClick={(e) => e.stopPropagation()}>
        {/* 4 Observatory Corner Brackets */}
        <span className="modal-corner modal-corner-tl" />
        <span className="modal-corner modal-corner-tr" />
        <span className="modal-corner modal-corner-bl" />
        <span className="modal-corner modal-corner-br" />

        {/* Sleek Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Modal Center Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {/* 3D Quantum Vault / Shield Icon */}
          <div className="modal-icon-badge-wrap">
            <div className="modal-icon-pulse-glow" />
            <div className="modal-icon-hexagon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="modal-vault-icon">
                <defs>
                  <linearGradient id="modalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFBEB" />
                    <stop offset="30%" stopColor="#FEF08A" />
                    <stop offset="65%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#modalGoldGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="rgba(234, 179, 8, 0.12)" />
                <rect x="9" y="11" width="6" height="5" rx="1.2" stroke="url(#modalGoldGrad)" strokeWidth="1.8" fill="rgba(234, 179, 8, 0.3)" />
                <path d="M10 11V9a2 2 0 1 1 4 0v2" stroke="url(#modalGoldGrad)" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="13.5" r="0.8" fill="#FFFBEB" />
              </svg>
            </div>
          </div>

          {/* Security Protocol Kicker */}
          <div className="modal-kicker-bar">
            <span className="modal-kicker-pip" />
            <span className="modal-kicker-title">KAROMETA • QUANTUM CONDUIT</span>
            <span className="modal-kicker-secure">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              VERIFIED
            </span>
          </div>

          <h2 className="modal-heading-title">
            AUTHENTICATE CONDUIT
          </h2>
          <p className="modal-subtext">
            Input client identifier to verify capital tranche &amp; initialize the 24-hour autonomous trading engine.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="modal-input-block">
            <div className="modal-input-top">
              <label htmlFor="modal-user-id" className="modal-input-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                CLIENT USER IDENTIFIER
              </label>
              <span className="modal-input-req">REQUIRED</span>
            </div>

            <div className="modal-input-wrapper">
              <div className="modal-input-prefix-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                id="modal-user-id"
                type="text"
                className="modal-luxury-input"
                placeholder="e.g. user_750 or user_test1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoFocus
                required
                autoComplete="off"
                spellCheck="false"
              />
              {userId && (
                <button 
                  type="button" 
                  className="modal-input-clear-btn" 
                  onClick={() => setUserId('')}
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="modal-quick-select-row">
              <span className="quick-select-label">Quick Fill:</span>
              <button type="button" className="quick-select-chip" onClick={() => setUserId('user_750')}>user_750</button>
              <button type="button" className="quick-select-chip" onClick={() => setUserId('user_751')}>user_751</button>
              <button type="button" className="quick-select-chip" onClick={() => setUserId('user_752')}>user_752</button>
              <button type="button" className="quick-select-chip" onClick={() => setUserId('user_700')}>user_700</button>
            </div>
          </div>

          <div className="modal-btn-row">
            <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`modal-btn-submit ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting || !userId.trim()}
              style={{
                opacity: (!userId.trim() && !isSubmitting) ? 0.75 : 1,
                cursor: isSubmitting ? 'wait' : 'pointer'
              }}
            >
              <span className="btn-shimmer" />
              {isSubmitting ? (
                <span className="btn-spinner" />
              ) : (
                <svg className="btn-icon-bolt" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              )}
              <span className="btn-text">
                {isSubmitting ? 'AUTHENTICATING CONDUIT...' : 'INITIALIZE SESSION'}
              </span>
            </button>
          </div>
        </form>

        {/* Security Trust Assurance */}
        <div className="modal-trust-footer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>256-BIT ENCRYPTED CONDUIT • 24H AUTONOMOUS DISENGAGEMENT</span>
        </div>
      </div>
    </div>
  );
};

export const SuccessModal = ({ isOpen, onClose, profit = 0, percentage = 8 }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-quantum-card" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
        {/* 4 Observatory Corner Brackets */}
        <span className="modal-corner modal-corner-tl" />
        <span className="modal-corner modal-corner-tr" />
        <span className="modal-corner modal-corner-bl" />
        <span className="modal-corner modal-corner-br" />

        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="celebration-glow-ring">
          ✓
        </div>
        <div style={{ 
          display: 'inline-block',
          fontFamily: 'var(--font-tech)', 
          fontSize: '0.72rem', 
          fontWeight: '700', 
          letterSpacing: '0.14em', 
          color: 'var(--profit-green)', 
          background: 'var(--profit-bg)',
          padding: '4px 12px',
          borderRadius: '20px',
          marginBottom: '10px'
        }}>
          AUTONOMOUS DISENGAGEMENT
        </div>
        <h2 className="modal-heading-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          ARBITRAGE HARVEST SECURED
        </h2>
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '1.8rem', 
          fontWeight: '800', 
          color: 'var(--profit-green)',
          margin: '12px 0',
          textShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
        }}>
          +{percentage}% (+${Number(profit).toFixed(2)})
        </div>
        <p className="modal-subtext" style={{ marginBottom: '24px' }}>
          The active 24-hour autonomous trading session concluded successfully and automatically halted execution to lock in your returns.
        </p>
        <button className="modal-btn-submit" style={{ width: '100%' }} onClick={onClose}>
          <span className="btn-shimmer" />
          <span className="btn-text">ACKNOWLEDGE &amp; VIEW LEDGER</span>
        </button>
      </div>
    </div>
  );
};
