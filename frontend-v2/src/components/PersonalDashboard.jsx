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

  const countdown = useCountdown(userProfile.sessionActive ? userProfile.endTime : null);
  const targetPct = userProfile.targetPercentage || 8;
  const currentPct = userProfile.balance > 0
    ? ((userProfile.currentProfit / userProfile.balance) * 100)
    : (userProfile.currentProfitPercentage || 0);

  const progress = Math.min(100, Math.max(0, (currentPct / targetPct) * 100));

  return (
    <div className="personal-ledger-header">
      <div className="user-session-hud">
        {/* Left: Account & Target Progress */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="user-id-tag" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
              ACCOUNT: {userProfile.userId}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: userProfile.sessionActive ? 'var(--profit-green)' : 'var(--amber-core)',
                padding: '2px 8px',
                borderRadius: '10px',
                background: userProfile.sessionActive ? 'var(--profit-bg)' : 'var(--amber-bg)',
              }}
            >
              {userProfile.sessionActive ? '● 24H ARBITRAGE ACTIVE' : '○ SESSION INACTIVE'}
            </span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF' }}>
            Personal Execution Ledger
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
            Dedicated autonomous order flow routed exclusively through your capital package.
          </p>

          {/* Progress Bar towards configured target */}
          <div className="progress-track-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Target Profit Progress:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--profit-green)', fontWeight: '700' }}>
                +{currentPct.toFixed(2)}% / +{targetPct.toFixed(2)}% Target ({progress.toFixed(1)}%)
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Session Expiration
          </div>
          <div className="timer-digits">
            {userProfile.sessionActive ? countdown : '00:00:00'}
          </div>
          <div style={{ marginTop: '12px' }}>
            {!userProfile.sessionActive && (
              <button
                className="nexus-btn nexus-btn-cyan"
                style={{ width: '100%', fontSize: '0.8rem', padding: '8px 12px' }}
                onClick={() => onStartTrade(userProfile.userId)}
              >
                ▶ Re-Launch 24h Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
