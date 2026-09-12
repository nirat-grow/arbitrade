import React, { useState, useEffect, useMemo } from 'react';

export default function SignalEqualizer({ barCount = 28 }) {
  // Micro-fluctuation for stability rating between 87.2% and 87.8% for realistic live telemetry
  const [stability, setStability] = useState(87.4);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate subtly around 87.4%
      const jitter = (Math.random() * 0.4 - 0.2);
      setStability(parseFloat((87.4 + jitter).toFixed(1)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Pre-calculate bar properties with harmonic wave heights
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      // Sinusoidal wave pattern combined with randomized variation
      const normalizedPos = i / (barCount - 1);
      const wave = Math.sin(normalizedPos * Math.PI); // arch in the middle
      const minH = 20 + Math.floor(wave * 40);
      const maxH = Math.min(96, minH + 25 + Math.floor(Math.random() * 15));
      const animDuration = (1.1 + Math.random() * 0.9).toFixed(2);
      const animDelay = (i * 0.045).toFixed(3);

      return {
        id: i,
        minH: `${minH}%`,
        maxH: `${maxH}%`,
        duration: `${animDuration}s`,
        delay: `${animDelay}s`,
      };
    });
  }, [barCount]);

  return (
    <div className="quantum-spectrum-deck" id="nexus-scanner-spectrum">
      {/* Corner Brackets */}
      <span className="spectrum-bracket bracket-tl" />
      <span className="spectrum-bracket bracket-tr" />
      <span className="spectrum-bracket bracket-bl" />
      <span className="spectrum-bracket bracket-br" />

      {/* Left Beacon: Radar Orb & Scanner Identity */}
      <div className="spectrum-beacon-col">
        <div className="spectrum-radar-orb">
          <span className="radar-core-dot" />
          <span className="radar-wave-ring ring-1" />
          <span className="radar-wave-ring ring-2" />
        </div>
        <div className="spectrum-beacon-info">
          <div className="spectrum-kicker-row">
            <span className="spectrum-beacon-title">MULTI-DEX ROUTE MONITOR</span>
          </div>
          <div className="spectrum-beacon-subtitle">
            <span className="live-feed-dot" />
            CROSS-CHAIN LIQUIDITY TELEMETRY • ACTIVE
          </div>
        </div>
      </div>

      {/* Center Visualizer: 28-Bar Harmonic Spectrum with Laser Sweep */}
      <div className="spectrum-visualizer-wrapper">
        {/* Animated Laser Sweep Line */}
        <div className="spectrum-laser-sweep" />

        {/* 28 Dynamic Waveform Bars */}
        <div className="spectrum-bars-row">
          {bars.map((bar) => (
            <div
              key={bar.id}
              className="spectrum-bar-column"
              style={{
                height: bar.maxH,
                animationDuration: bar.duration,
                animationDelay: bar.delay,
              }}
            >
              <div className="spectrum-bar-peak" />
              <div className="spectrum-bar-fill" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Telemetry Gauge & Coherence Indicator */}
      <div className="spectrum-telemetry-col">
        <div className="spectrum-score-row">
          <span className="spectrum-score-digits">{stability.toFixed(1)}%</span>
          <div className="spectrum-status-badge">
            <span className="status-gold-lock">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm3 8H9V6a3 3 0 1 1 6 0v3z" />
              </svg>
            </span>
            <span>FEED COHERENCE</span>
          </div>
        </div>
        <div className="spectrum-aux-meta">
          <span className="meta-item">FEED: EVM RPC</span>
          <span className="meta-sep">•</span>
          <span className="meta-item">MONITOR: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
