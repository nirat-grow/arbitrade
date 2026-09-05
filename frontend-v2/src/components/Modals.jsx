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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    onLogin(userId.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-quantum-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '10px', 
            borderRadius: '16px', 
            background: 'var(--cyan-surface)', 
            border: '1px solid var(--border-bright)', 
            marginBottom: '12px' 
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-core)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.04em' }}>
            AUTHENTICATE CONDUIT
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '6px' }}>
            Input client user ID to verify capital package and initialize the 24-hour autonomous trading engine.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-field-group">
            <label className="input-field-label">User Identifier</label>
            <input
              type="text"
              className="nexus-input"
              placeholder="e.g. user_750 or user_test1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="nexus-btn nexus-btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="nexus-btn nexus-btn-cyan" style={{ flex: 1.5 }}>
              Initialize Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SuccessModal = ({ isOpen, onClose, profit = 0, percentage = 8 }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-quantum-card" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
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
        <h2 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>
          PROFIT TARGET SECURED
        </h2>
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '1.8rem', 
          fontWeight: '800', 
          color: 'var(--profit-green)',
          margin: '12px 0'
        }}>
          +{percentage}% (+${Number(profit).toFixed(2)})
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '24px' }}>
          The active 24-hour smart trading session reached the configured profit threshold and automatically halted execution to protect your returns.
        </p>
        <button className="nexus-btn nexus-btn-cyan" style={{ width: '100%', padding: '12px' }} onClick={onClose}>
          Acknowledge & View Ledger
        </button>
      </div>
    </div>
  );
};
