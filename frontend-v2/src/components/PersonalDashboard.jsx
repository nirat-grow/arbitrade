import React, { useState, useEffect } from 'react';

const useCountdown = (endTime) => {
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('00:00:00');
      return;
    }

    const calcTime = () => {
      const distance = new Date(endTime).getTime() - new Date().getTime();
      if (distance <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      const h = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const m = Math.floor((distance / (1000 * 60)) % 60);
      const s = Math.floor((distance / 1000) % 60);
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    calcTime();
    const timer = setInterval(calcTime, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
};

export const PersonalDashboard = ({ userProfile, onStartTrade }) => {
  if (!userProfile) return null;

  const now = new Date();
  const sessionEndTime = userProfile.endTime ? new Date(userProfile.endTime) : null;
  const isCooldown = !userProfile.sessionActive && sessionEndTime && sessionEndTime > now;
  const canLaunch = !userProfile.sessionActive && (!sessionEndTime || sessionEndTime <= now);

  const targetTimerTime = userProfile.sessionActive 
    ? userProfile.endTime 
    : (isCooldown ? userProfile.endTime : null);

  const countdown = useCountdown(targetTimerTime);
  const currentPct = userProfile.balance > 0
    ? ((userProfile.currentProfit / userProfile.balance) * 100)
    : (userProfile.currentProfitPercentage || 0);

  return (
    <div className="personal-ledger-header">
      {/* 4-Corner Observatory Cyber Brackets */}
      <span className="ledger-corner ledger-corner-tl" />
      <span className="ledger-corner ledger-corner-tr" />
      <span className="ledger-corner ledger-corner-bl" />
      <span className="ledger-corner ledger-corner-br" />

      <div className="user-session-hud">
        {/* Left: Account & Live Performance Stream */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="user-id-tag" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
              ACCOUNT: {userProfile.userId}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: userProfile.sessionActive 
                  ? 'var(--profit-green)' 
                  : (isCooldown ? 'var(--cyber-blue)' : 'var(--amber-core)'),
                padding: '2px 8px',
                borderRadius: '10px',
                background: userProfile.sessionActive 
                  ? 'var(--profit-bg)' 
                  : (isCooldown ? 'rgba(0, 163, 255, 0.12)' : 'var(--amber-bg)'),
                border: isCooldown ? '1px solid rgba(0, 163, 255, 0.28)' : 'none'
              }}
            >
              {userProfile.sessionActive 
                ? '● 24H ARBITRAGE ACTIVE' 
                : (isCooldown ? '⏳ 24H DAILY COOLDOWN' : '○ READY FOR NEXT SESSION')}
            </span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF' }}>
            Private Capital Conduit
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
            Dedicated autonomous order flow routed exclusively through your allocated capital.
          </p>

          {/* Live Real-time Arbitrage Execution Stream (Internal Target Hidden) */}
          <div className="ledger-stream-wrapper">
            <div className="ledger-stream-header">
              <div className="stream-label-group">
                <span className="stream-live-pip" style={{ background: isCooldown ? 'var(--cyber-blue)' : undefined }} />
                <span className="stream-label">
                  {isCooldown ? 'Daily Harvest Secured:' : 'Session Arbitrage Yield:'}
                </span>
              </div>
              <div className="stream-metrics-group">
                <span className="stream-yield-val" style={{ color: isCooldown ? 'var(--cyber-blue)' : undefined }}>
                  +{currentPct.toFixed(2)}%
                </span>
                <span className="stream-status-pill">
                  {userProfile.sessionActive ? 'LIVE CONDUIT STREAMING' : (isCooldown ? 'LOCKED / CYCLE ACTIVE' : 'STANDBY')}
                </span>
              </div>
            </div>
            <div className="ledger-stream-track">
              <div className={`ledger-stream-laser ${userProfile.sessionActive ? 'active' : ''}`} />
            </div>
          </div>
        </div>

        {/* Center: Financial Standing */}
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Account Capital
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', marginTop: '4px' }}>
            ${userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Accumulated Yield
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--profit-green)', marginTop: '2px' }}>
            +${userProfile.currentProfit.toFixed(2)}
          </div>
        </div>

        {/* Right: 24h Countdown Clock or Launch Action */}
        <div className="session-timer-box">
          <div style={{ fontSize: '0.72rem', color: isCooldown ? 'var(--cyber-blue)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {userProfile.sessionActive 
              ? 'Session Expiration' 
              : (isCooldown ? 'Next Session Unlocks In' : 'Daily 24H Window')}
          </div>
          <div className="timer-digits" style={{ color: isCooldown ? 'var(--cyber-blue)' : undefined }}>
            {userProfile.sessionActive ? countdown : (isCooldown ? countdown : '24:00:00')}
          </div>
          <div style={{ marginTop: '12px' }}>
            {isCooldown ? (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'rgba(0, 163, 255, 0.1)',
                  border: '1px solid rgba(0, 163, 255, 0.28)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-tech)',
                  color: 'var(--cyber-blue)',
                  fontWeight: '600'
                }}
              >
                <span>🔒</span>
                <span>Daily Limit (1/1) • Locked</span>
              </div>
            ) : canLaunch ? (
              <button
                className="nexus-btn nexus-btn-cyber"
                style={{ width: '100%', fontSize: '0.8rem', padding: '10px 14px' }}
                onClick={() => onStartTrade(userProfile.userId)}
              >
                ▶ Launch 24h Session
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
