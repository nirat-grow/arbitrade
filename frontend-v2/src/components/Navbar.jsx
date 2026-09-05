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
            KAROMETA
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

              const now = new Date();
              const isCooldown = !userProfile.sessionActive && userProfile.endTime && new Date(userProfile.endTime) > now;

              if (userProfile.sessionActive) {
                return (
                  <span className="user-profit-pill" title={`+$${Number(userProfile.currentProfit).toFixed(2)}`}>
                    ⚡ +{pct}%
                  </span>
                );
              } else if (isCooldown || userProfile.currentProfit > 0) {
                return (
                  <span
                    className="user-profit-pill"
                    style={{ 
                      background: isCooldown ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                      borderColor: isCooldown ? 'var(--gold-core)' : 'var(--profit-green)',
                      color: isCooldown ? 'var(--gold-bright)' : 'var(--profit-green)'
                    }}
                    title={isCooldown ? `Daily 24-hour limit active. Next trade unlocks at ${new Date(userProfile.endTime).toLocaleTimeString()}` : `+$${Number(userProfile.currentProfit).toFixed(2)}`}
                  >
                    {isCooldown ? '🔒 ' : ''}Session Yield: +{pct}%
                  </span>
                );
              } else {
                return (
                  <button
                    className="nexus-btn nexus-btn-cyan"
                    style={{ padding: '4px 12px', fontSize: '0.74rem' }}
                    onClick={() => onStartTrade(userProfile.userId)}
                  >
                    ▶ Start 24h
                  </button>
                );
              }
            })()}
          </div>
        ) : (
          <button className="nav-btn-start" onClick={onOpenLogin} title="Launch Karometa Trading Engine">
            <span className="btn-shimmer" />
            <svg className="btn-icon-bolt" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="btn-text">Start</span>
          </button>
        )}

        {/* Admin Suite Toggle */}
        <button
          className={`nav-btn-admin ${isAdminRoute ? 'active' : ''}`}
          onClick={() => onOpenAdmin(!isAdminRoute)}
          title={isAdminRoute ? "Return to Terminal" : "Access Karometa Admin Console"}
        >
          <span className="admin-status-dot" />
          <svg className="btn-icon-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="btn-text">{isAdminRoute ? 'Back to Terminal' : 'Admin Portal'}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
