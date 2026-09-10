import React from 'react';

export const TelemetryHUD = ({ adminStats }) => {
  const activePct = adminStats?.activePercentage || 3;
  const refAmount = adminStats?.latestAmount || 0;
  const activeSessions = adminStats?.activeSessions || 0;
  const totalVolume = adminStats?.totalVolume || 0;
  const totalPackages = adminStats?.totalPackages || 0;

  return (
    <div className="hud-telemetry-grid">
      {/* Card 1: Target Profit Rate */}
      <div className="hud-card" style={{ '--card-accent': 'var(--profit-green)' }}>
        <div className="hud-card-header">
          <span className="hud-label">TARGET PROFIT THRESHOLD</span>
          <div className="hud-icon">⚡</div>
        </div>
        <div className="hud-value-row">
          <span className="hud-value" style={{ color: 'var(--profit-green)' }}>
            +{Number(activePct).toFixed(2)}%
          </span>
        </div>
        <div className="hud-subtext">
          <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
          Active PostgreSQL trading engine rate
        </div>
      </div>

      {/* Card 2: Reference Pool */}
      <div className="hud-card" style={{ '--card-accent': 'var(--cyber-blue)' }}>
        <div className="hud-card-header">
          <span className="hud-label">REFERENCE LIQUIDITY BASE</span>
          <div className="hud-icon" style={{ color: 'var(--cyber-blue)' }}>◈</div>
        </div>
        <div className="hud-value-row">
          <span className="hud-value mono-text">
            ${refAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="hud-subtext">
          <span style={{ color: 'var(--cyber-blue)' }}>Calculated Target:</span>
          <span>${((refAmount * activePct) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Card 3: Active Bot Conduits */}
      <div className="hud-card" style={{ '--card-accent': 'var(--violet-core)' }}>
        <div className="hud-card-header">
          <span className="hud-label">ACTIVE 24H CONDUITS</span>
          <div className="hud-icon">⎈</div>
        </div>
        <div className="hud-value-row">
          <span className="hud-value" style={{ color: 'var(--violet-core)' }}>
            {activeSessions}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>RUNNING</span>
        </div>
        <div className="hud-subtext">
          <span>Real-time autonomous arbitrage sessions</span>
        </div>
      </div>

      {/* Card 4: Purchased Volume */}
      <div className="hud-card" style={{ '--card-accent': 'var(--amber-core)' }}>
        <div className="hud-card-header">
          <span className="hud-label">TOTAL CAPITAL POOL</span>
          <div className="hud-icon">⛁</div>
        </div>
        <div className="hud-value-row">
          <span className="hud-value" style={{ color: '#F8FAFC' }}>
            ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="hud-subtext">
          <span style={{ color: 'var(--amber-core)' }}>{totalPackages} Packages</span>
          <span>deposited in database</span>
        </div>
      </div>
    </div>
  );
};

export default TelemetryHUD;
