import React, { useState, useEffect } from 'react';

// Custom hook for countdown timer in personal mode
const useCountdownTimer = (endTime, onExpire) => {
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('00:00:00');
      return;
    }

    const updateTimer = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft('00:00:00');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  return timeLeft;
};

export default function HeaderSection({ currentView, userProfile }) {
  const [utcTime, setUtcTime] = useState('');
  const [blockNum, setBlockNum] = useState(19842106);

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: 'UTC',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle live block height simulation
  useEffect(() => {
    const blockInterval = setInterval(() => {
      setBlockNum((prev) => prev + 1);
    }, 12000);
    return () => clearInterval(blockInterval);
  }, []);

  const sessionTimeLeft = useCountdownTimer(
    userProfile?.sessionActive ? userProfile?.endTime : null
  );

  if (currentView === 'ledger' || currentView === 'personal') {
    return (
      <header className="nexus-observatory-deck personal-mode" id="nexus-header-section">
        {/* Decorative corner brackets */}
        <div className="deck-corner deck-corner-tl" />
        <div className="deck-corner deck-corner-tr" />
        <div className="deck-corner deck-corner-bl" />
        <div className="deck-corner deck-corner-br" />

        <div className="deck-main-layout">
          {/* Left: Identity & Cockpit Directive */}
          <div className="deck-brand-col">
            <div className="deck-kicker">
              <span className="deck-kicker-badge personal">
                <span className="deck-kicker-ping" />
                {userProfile ? 'PRIVATE CONDUIT • ACTIVE' : 'EXECUTION LEDGER • VERIFIED STREAM'}
              </span>
              <span className="deck-kicker-sep">•</span>
              <span className="deck-kicker-tag">
                {userProfile ? `NODE: ${userProfile.userId}` : 'MULTI-CHAIN ATTESTED'}
              </span>
            </div>

            <h1 className="deck-heading">
              {userProfile ? (
                <>
                  <span className="deck-heading-gold">PERSONAL</span>{' '}
                  <span className="deck-heading-outline">LEDGER</span>
                </>
              ) : (
                <>
                  <span className="deck-heading-gold">AUTONOMOUS</span>{' '}
                  <span className="deck-heading-outline">EXECUTION LEDGER</span>
                </>
              )}
            </h1>

            <p className="deck-subtext">
              {userProfile
                ? 'Dedicated autonomous order flow routed exclusively through your allocated capital.'
                : 'Decentralized multi-hop arbitrage settlements executed and verified across all live AMM conduits.'}
            </p>
          </div>

          {/* Right: Quantum Telemetry Console */}
          <div className="deck-telemetry-console">
            {/* Telemetry Pod 1: Session / Consensus Status */}
            <div className="telemetry-pod">
              <div className="pod-header">
                <span className="pod-pip gold" />
                <span className="pod-label">
                  {userProfile
                    ? (userProfile.sessionActive ? 'SESSION ENDS IN' : 'SESSION STATUS')
                    : 'LEDGER INTEGRITY'}
                </span>
              </div>
              <div className="pod-primary-value gold-digits">
                {userProfile
                  ? (userProfile.sessionActive ? sessionTimeLeft : 'STANDBY')
                  : 'CONSENSUS SYNC'}
              </div>
              <div className="pod-footer-meta">
                <span className="pod-meta-chip">
                  {userProfile
                    ? (userProfile.sessionActive ? 'AUTO-ROUTER ACTIVE' : 'AWAITING DISPATCH')
                    : 'REAL-TIME SETTLEMENTS'}
                </span>
              </div>
            </div>

            {/* Telemetry Pod 2: Capital or Block Anchor */}
            <div className="telemetry-pod">
              <div className="pod-header">
                <span className="pod-pip" />
                <span className="pod-label">
                  {userProfile ? 'ALLOCATED LIQUIDITY' : 'CONSENSUS ANCHOR'}
                </span>
              </div>
              <div className="pod-primary-value">
                {userProfile
                  ? `$${(userProfile.balance || userProfile.initialDeposit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : `BLOCK #${blockNum.toLocaleString()}`}
              </div>
              <div className="pod-footer-meta">
                <span className="pod-block-label">
                  {userProfile ? `NODE • ACTIVE` : `UTC - ${utcTime || 'LIVE SYNC'}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default: Global Observatory View
  return (
    <header className="nexus-observatory-deck" id="nexus-header-section">
      {/* Decorative corner brackets for high-tech aerospace aesthetic */}
      <div className="deck-corner deck-corner-tl" />
      <div className="deck-corner deck-corner-tr" />
      <div className="deck-corner deck-corner-bl" />
      <div className="deck-corner deck-corner-br" />

      <div className="deck-main-layout">
        {/* Left: Identity & Cockpit Directive */}
        <div className="deck-brand-col">
          <div className="deck-kicker">
            <span className="deck-kicker-badge">
              <span className="deck-kicker-ping" />
              OBSERVATORY CLUSTER
            </span>
            <span className="deck-kicker-sep">•</span>
            <span className="deck-kicker-number">04</span>
            <span className="deck-kicker-sep">•</span>
            <span className="deck-kicker-live">LIVE FEED ACTIVE</span>
          </div>

          <h1 className="deck-heading">
            <span className="deck-heading-gold">Arbitrage</span>{' '}
            <span className="deck-heading-outline">signal array</span>
          </h1>

          <p className="deck-subtext">
            Cross-venue price intelligence and multi-chain liquidity conduit scanning across 18 decentralized protocols in real-time.
          </p>
        </div>

        {/* Right: Quantum Telemetry Console Pods */}
        <div className="deck-telemetry-console">
          {/* Telemetry Pod 1: UTC Master Chrono */}
          <div className="telemetry-pod">
            <div className="pod-header">
              <span className="pod-pip gold" />
              <span className="pod-label">LAST SYNC (UTC)</span>
            </div>
            <div className="pod-primary-value gold-digits">
              {utcTime ? `${utcTime} UTC` : 'SYNCHRONIZING...'}
            </div>
            <div className="pod-footer-meta">
              <span className="pod-pulse-indicator">
                <span className="pulse-beacon" />
                <span className="pulse-text">LATENCY &lt; 14ms</span>
              </span>
            </div>
          </div>

          {/* Telemetry Pod 2: Block Anchor */}
          <div className="telemetry-pod">
            <div className="pod-header">
              <span className="pod-pip cyan" />
              <span className="pod-label">CONSENSUS ANCHOR</span>
            </div>
            <div className="pod-primary-value">
              #{blockNum.toLocaleString()}
            </div>
            <div className="pod-footer-meta">
              <span className="pod-block-label">MULTI-CHAIN ATTESTED</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
