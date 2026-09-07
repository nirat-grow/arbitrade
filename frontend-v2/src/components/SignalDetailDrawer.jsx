import React, { useState } from 'react';
import { formatNetProfit, formatUSD, formatROI, shortenAddress, getDeterministicTxHash, copyToClipboard } from '../utils/formatters';

const EXPLORER_URLS = {
  Ethereum: 'https://etherscan.io/address/',
  Polygon: 'https://polygonscan.com/address/',
  BNB: 'https://bscscan.com/address/',
  Arbitrum: 'https://arbiscan.io/address/',
  Optimism: 'https://optimistic.etherscan.io/address/',
  Base: 'https://basescan.org/address/',
  Avalanche: 'https://snowtrace.io/address/',
};

const EXPLORER_TX_URLS = {
  Ethereum: 'https://etherscan.io/tx/',
  Polygon: 'https://polygonscan.com/tx/',
  BNB: 'https://bscscan.com/tx/',
  Arbitrum: 'https://arbiscan.io/tx/',
  Optimism: 'https://optimistic.etherscan.io/tx/',
  Base: 'https://basescan.org/tx/',
  Avalanche: 'https://snowtrace.io/tx/',
};

const CopyAddressChip = ({ address, network, label }) => {
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const displayAddr = shortenAddress(address, 4);
  const explorerUrl = network && EXPLORER_URLS[network] ? EXPLORER_URLS[network] + address : null;

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await copyToClipboard(address);
    } catch (err) {
      console.warn('Copy address failed:', err);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="address-chip-wrap">
      <span className="address-chip-label">{label}:</span>
      {explorerUrl ? (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="address-chip-link"
          onClick={(e) => e.stopPropagation()}
          title={`View on ${network} Explorer: ${address}`}
        >
          <span className="address-text mono-text">{displayAddr}</span>
          <svg className="chip-link-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      ) : (
        <span className="address-chip-text mono-text">{displayAddr}</span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className={`address-copy-btn ${copied ? 'copied' : ''}`}
        title={copied ? "Copied to clipboard" : "Copy Contract Address"}
        aria-label="Copy address"
      >
        {copied ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
};

export const SignalDetailDrawer = ({ data, isTable = false }) => {
  if (!data?.calculation) return null;

  const [copiedTx, setCopiedTx] = useState(false);
  const txHash = data.txHash || getDeterministicTxHash(data);
  const explorerTxUrl = data.network && EXPLORER_TX_URLS[data.network] ? EXPLORER_TX_URLS[data.network] + txHash : null;

  const handleCopyTx = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await copyToClipboard(txHash);
    } catch (err) {
      console.warn('Copy txHash failed:', err);
    }
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 1400);
  };

  const calc = data.calculation;
  const hops = data.hops || [];
  const netDisplay = formatNetProfit(calc.net, data.profitAmount);
  const isProfit = !netDisplay.startsWith('-');

  // Clean and format swap text into beautiful token badges
  const renderSwapTokens = (swapText) => {
    if (!swapText) return null;
    const parts = swapText.split(/→|->/).map((s) => s.trim());
    if (parts.length >= 2) {
      const fromToken = parts[0].split(/\.{2,}/)[0].trim() || parts[0];
      const toToken = parts[1].split(/\.{2,}/)[0].trim() || parts[1];

      return (
        <div className="hop-swap-route-box">
          <div className="swap-token-badge from">
            <span className="token-dot" />
            <span className="token-name mono-text">{fromToken}</span>
          </div>
          <div className="swap-route-indicator">
            <span className="route-flow-line" />
            <span className="route-flow-spark" />
            <svg className="route-flow-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <div className="swap-token-badge to">
            <span className="token-dot" />
            <span className="token-name mono-text">{toToken}</span>
          </div>
        </div>
      );
    }
    return <div className="swap-token-flow mono-text">{swapText}</div>;
  };

  return (
    <div className={`signal-inspection-drawer ${isTable ? 'table-mode' : 'card-mode'}`}>
      {/* 1. Settlement & Telemetry Section */}
      <div className="drawer-panel settlement-panel animate-drawer-panel">
        <div className="drawer-panel-header">
          <div className="panel-title-wrap">
            <span className="panel-title-beacon" />
            <span className="panel-title-text">FINANCIAL SETTLEMENT TELEMETRY</span>
          </div>
          <span className="panel-kicker-tag">REAL-TIME ATTESTED</span>
        </div>

        {/* Institutional On-Chain Attestation Bar */}
        <div className="drawer-tx-attestation-bar">
          <div className="tx-attestation-left">
            <span className="tx-verified-dot" />
            <span className="tx-attestation-label">TRANSACTION HASH:</span>
            <span className="tx-hash-mono mono-text" title={`Full On-Chain Hash: ${txHash}`}>
              {shortenAddress(txHash, 6)}
            </span>
          </div>
          <div className="tx-attestation-actions">
            <button
              type="button"
              className={`tx-copy-btn ${copiedTx ? 'copied' : ''}`}
              onClick={handleCopyTx}
              title={copiedTx ? "Copied to clipboard" : "Copy Transaction Hash"}
            >
              {copiedTx ? '✓ Copied' : '⧉ Copy Hash'}
            </button>
            {explorerTxUrl && (
              <a
                href={explorerTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-explorer-link"
                title={`Verify on ${data.network} Explorer`}
                onClick={(e) => e.stopPropagation()}
              >
                <span>Explorer</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* 4-Tile High-Tech Telemetry Metric Grid */}
        <div className="telemetry-tiles-grid">
          {/* Tile 1: Principal Capital */}
          <div className="telemetry-tile tile-cap">
            <div className="tile-top-row">
              <span className="tile-label">Principal Capital</span>
              <div className="tile-icon-badge gold" title="Allocated Capital Tranche">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
            <div className="tile-val-wrap">
              <span className="tile-value mono-text">{formatUSD(calc.start, 2)}</span>
              <span className="tile-subtag gold">Allocated</span>
            </div>
            <div className="tile-hover-ambient-glow" />
          </div>

          {/* Tile 2: Gross Arbitrage */}
          <div className="telemetry-tile tile-gross">
            <div className="tile-top-row">
              <span className="tile-label">Gross Arbitrage</span>
              <div className="tile-icon-badge emerald" title="Gross Pool Spread">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
            </div>
            <div className="tile-val-wrap">
              <span className="tile-value mono-text val-emerald">{formatUSD(calc.gross, 4)}</span>
              <span className="tile-subtag emerald">+Spread</span>
            </div>
            <div className="tile-hover-ambient-glow emerald" />
          </div>

          {/* Tile 3: Estimated Gas */}
          <div className="telemetry-tile tile-gas">
            <div className="tile-top-row">
              <span className="tile-label">Estimated Gas</span>
              <div className="tile-icon-badge amber" title="Priority Network Fuel">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
            </div>
            <div className="tile-val-wrap">
              <span className="tile-value mono-text val-amber">{formatUSD(calc.gasUsd, 4)}</span>
              <span className="tile-subtag amber">Priority</span>
            </div>
            <div className="tile-hover-ambient-glow amber" />
          </div>

          {/* Tile 4: Flash Loan Fee */}
          <div className="telemetry-tile tile-fee">
            <div className="tile-top-row">
              <span className="tile-label">Flash Loan Fee</span>
              <div className="tile-icon-badge violet" title="Pool Liquidity Protocol Fee">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
            </div>
            <div className="tile-val-wrap">
              <span className="tile-value mono-text val-violet">{formatUSD(calc.flashFee, 4)}</span>
              <span className="tile-subtag violet">0.05% Fee</span>
            </div>
            <div className="tile-hover-ambient-glow violet" />
          </div>
        </div>

        {/* Highlighted Net Arbitrage Master Spotlight Banner */}
        <div className={`settlement-net-card ${isProfit ? 'profit-card' : 'loss-card'}`}>
          <div className="net-card-shimmer" />
          <div className="net-card-content">
            <div className="net-card-left">
              <div className="net-kicker-row">
                <span className="net-kicker-beacon" />
                <span className="net-card-label">NET REALIZED YIELD</span>
              </div>
              <div className="net-card-value mono-text">{netDisplay}</div>
            </div>
            <div className="net-card-right">
              <div className="net-roi-group">
                <span className="net-roi-label">EST. ROI</span>
                <span className="net-roi-value mono-text">{formatROI(calc.roi)}</span>
              </div>
              <div className={`net-status-pill ${isProfit ? 'positive' : 'negative'}`}>
                <span className="status-pill-spark" />
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>{isProfit ? 'POSITIVE SPREAD' : 'NEGATIVE SPREAD'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Autonomous Execution Index - Cybernetic Radial HUD Gauge */}
        <div className="confidence-hud-meter">
          <div className="confidence-radial-wrap">
            <svg className="confidence-svg-ring" viewBox="0 0 48 48">
              <circle className="confidence-ring-bg" cx="24" cy="24" r="20" />
              <circle className="confidence-ring-fill" cx="24" cy="24" r="20" strokeDasharray="125.66" strokeDashoffset="13.8" />
              <circle className="confidence-ring-radar" cx="24" cy="24" r="20" />
            </svg>
            <div className="confidence-score-center">
              <span className="confidence-score-val mono-text">89</span>
              <span className="confidence-score-pct">%</span>
            </div>
          </div>
          <div className="confidence-details">
            <div className="confidence-title-row">
              <span className="confidence-title">Autonomous Execution Index</span>
              <span className="confidence-status-pill">OPTIMAL</span>
            </div>
            <div className="confidence-sub">Optimal liquidity depth across verified AMM pools</div>
            <div className="confidence-progress-track">
              <div className="confidence-progress-bar" style={{ width: '89%' }}>
                <span className="progress-laser-glow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Route Sequence Timeline with Connected Stem Flow */}
      <div className="drawer-panel route-panel animate-drawer-panel">
        <div className="drawer-panel-header">
          <div className="panel-title-wrap">
            <span className="panel-title-icon">◆</span>
            <span className="panel-title-text">MULTI-DEX ROUTE SEQUENCE</span>
            <span className="panel-hops-count">{hops.length} HOPS</span>
          </div>
          <span className="panel-kicker-tag">ATOMIC ROUTE</span>
        </div>

        {/* Timeline Flow Feed - Connected Circuit Stem */}
        <div className="hops-timeline-feed">
          {hops.map((hop, idx) => (
            <div className="hop-timeline-row" key={idx} style={{ '--hop-idx': idx }}>
              {/* Left Timeline Gutter with Connecting Stem */}
              <div className="timeline-gutter">
                <div className="timeline-node-badge">
                  <span className="node-num mono-text">#{idx + 1}</span>
                </div>
                {idx < hops.length - 1 && (
                  <div className="timeline-stem">
                    <span className="timeline-stem-pulse" />
                  </div>
                )}
              </div>

              {/* Right Hop Execution Card */}
              <div className="hop-content-card">
                {/* Meta Header */}
                <div className="hop-step-meta">
                  <div className="hop-dex-badge">
                    <span className="hop-dex-pip" />
                    <span className="hop-step-dex">{hop.dex}</span>
                  </div>
                  <div className="hop-step-fee mono-text">{hop.feeLabel}</div>
                </div>

                {/* Token Swap Stream Route */}
                <div className="hop-step-swap">
                  {renderSwapTokens(hop.swapText)}
                </div>

                {/* Contract Addresses Grid */}
                <div className="hop-contracts-grid">
                  <CopyAddressChip address={hop.router} network={data.network} label="Router" />
                  <CopyAddressChip address={hop.quoter} network={data.network} label="Quoter" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignalDetailDrawer;
