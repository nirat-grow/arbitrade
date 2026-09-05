import React from 'react';
import NexusLogo from './NexusLogo';

export const Navbar = ({
  userProfile,
  currentView,
  onViewChange,
  onOpenLogin,
  onStartTrade,
  isReadOnlyProfile,
  wsConnected = true,
  onOpenAdmin,
  isAdminRoute = false,
}) => {
  return (
    <header className="nexus-navbar">
      {/* Brand Left */}
      <div className="nav-brand" onClick={() => (isAdminRoute ? onOpenAdmin(false) : onViewChange('global'))}>
        <NexusLogo size={42} />
        <div className="brand-text-wrap">
          <div className="brand-title">
            NEXUS <span style={{ color: 'var(--gold-bright)', fontSize: '0.8rem' }}>QUANTUM</span>
          </div>
          <div className="brand-kicker">Autonomous Arbitrage Matrix</div>
        </div>
      </div>

      {/* Center Mode Switcher (Hide if in Admin Mode) */}
      {!isAdminRoute && (
        <div className="nav-mode-switcher">
          <button
            className={`mode-btn ${currentView === 'global' ? 'active' : ''}`}
            onClick={() => onViewChange('global')}
          >
            <span className="mode-pip" />
            Global Matrix
          </button>
          <button
            className={`mode-btn ${currentView === 'personal' ? 'active' : ''}`}
            onClick={() => {
              if (userProfile) {
                onViewChange('personal');
              } else {
                onOpenLogin();
              }
            }}
          >
            <span className="mode-pip" />
            Personal Ledger {userProfile && <span style={{ color: 'var(--gold-bright)' }}>•</span>}
          </button>
        </div>
      )}

      {/* Right Telemetry & Actions */}
      <div className="nav-actions">
        {/* WebSocket Heartbeat */}
        <div className="telemetry-pill">
          <span className="pulse-dot" style={{ background: wsConnected ? 'var(--profit-green)' : 'var(--danger-core)' }} />
          <span>{wsConnected ? 'PORT 8082 SYNC' : 'OFFLINE'}</span>
        </div>

        {/* User Capsule */}
        {userProfile ? (
          <div className="user-telemetry-badge">
            <span className="user-id-tag">👤 {userProfile.userId}</span>
            <span className="user-balance-value">
              ${userProfile.balance ? userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </span>
            {(() => {
              const pct = userProfile.balance > 0
                ? ((userProfile.currentProfit / userProfile.balance) * 100).toFixed(2)
                : (userProfile.currentProfitPercentage || 0).toFixed(2);

              if (userProfile.sessionActive) {
                return (
                  <span className="user-profit-pill" title={`+$${Number(userProfile.currentProfit).toFixed(2)}`}>
                    ⚡ +{pct}%
                  </span>
                );
              } else if (userProfile.currentProfit > 0) {
                return (
                  <span
                    className="user-profit-pill"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--profit-green)' }}
                    title={`+$${Number(userProfile.currentProfit).toFixed(2)}`}
                  >
                    Target Met: +{pct}%
                  </span>
                );
              } else {
                return (
                  <button
                    className="nexus-btn nexus-btn-cyan"
                    style={{ padding: '4px 12px', fontSize: '0.74rem' }}
                    onClick={() => onStartTrade(userProfile.userId)}
                  >
                    ▶ Launch 24h
                  </button>
                );
              }
            })()}
          </div>
        ) : (
          <button className="nexus-btn nexus-btn-cyan" onClick={onOpenLogin}>
            ⚡ Launch Auto-Trade
          </button>
        )}

        {/* Admin Suite Toggle */}
        <button
          className={`nexus-btn ${isAdminRoute ? 'nexus-btn-cyan' : 'nexus-btn-ghost'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => onOpenAdmin(!isAdminRoute)}
        >
          {isAdminRoute ? 'Back to Terminal' : '⚙ Admin Portal'}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
