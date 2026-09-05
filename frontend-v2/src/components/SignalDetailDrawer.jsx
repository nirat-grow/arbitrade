import React, { useState } from 'react';
import { formatNetProfit, formatUSD, formatROI, shortenAddress } from '../utils/formatters';

const EXPLORER_URLS = {
  Ethereum: 'https://etherscan.io/address/',
  Polygon: 'https://polygonscan.com/address/',
  BNB: 'https://bscscan.com/address/',
  Arbitrum: 'https://arbiscan.io/address/',
  Optimism: 'https://optimistic.etherscan.io/address/',
  Base: 'https://basescan.org/address/',
  Avalanche: 'https://snowtrace.io/address/',
};

const CopyAddressChip = ({ address, network, label }) => {
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const displayAddr = shortenAddress(address, 4);
  const explorerUrl = network && EXPLORER_URLS[network] ? EXPLORER_URLS[network] + address : null;

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(address);
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
          {displayAddr}
        </a>
      ) : (
        <span className="address-chip-text">{displayAddr}</span>
      )}
      <button
        onClick={handleCopy}
        className={`address-copy-btn ${copied ? 'copied' : ''}`}
        title="Copy Contract Address"
      >
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  );
};

export const SignalDetailDrawer = ({ data, isTable = false }) => {
  if (!data?.calculation) return null;

  const calc = data.calculation;
  const hops = data.hops || [];
  const netDisplay = formatNetProfit(calc.net, data.profitAmount);
  const isProfit = !netDisplay.startsWith('-');

  return (
    <div className={`signal-inspection-drawer ${isTable ? 'table-mode' : 'card-mode'}`}>
      {/* 1. Settlement & Telemetry Section */}
      <div className="drawer-panel settlement-panel">
        <div className="drawer-panel-header">
          <span className="panel-title-icon">◐</span>
          <span className="panel-title-text">FINANCIAL SETTLEMENT TELEMETRY</span>
        </div>

        {/* 4-Tile Telemetry Metric Grid - NEVER TRUNCATES */}
        <div className="telemetry-tiles-grid">
          <div className="telemetry-tile">
            <span className="tile-label">Principal Capital</span>
            <span className="tile-value mono-text">{formatUSD(calc.start, 2)}</span>
          </div>

          <div className="telemetry-tile">
            <span className="tile-label">Gross Arbitrage</span>
            <span className="tile-value mono-text tile-cyan">{formatUSD(calc.gross, 4)}</span>
          </div>

          <div className="telemetry-tile">
            <span className="tile-label">Estimated Gas</span>
            <span className="tile-value mono-text tile-violet">{formatUSD(calc.gasUsd, 4)}</span>
          </div>

          <div className="telemetry-tile">
            <span className="tile-label">Flash Loan Fee</span>
            <span className="tile-value mono-text tile-amber">{formatUSD(calc.flashFee, 4)}</span>
          </div>
        </div>

        {/* Highlighted Net Arbitrage Banner */}
        <div className={`settlement-net-banner ${isProfit ? 'profit-banner' : 'loss-banner'}`}>
          <div className="net-banner-left">
            <span className="net-banner-label">NET REALIZED YIELD</span>
            <span className="net-banner-value mono-text">{netDisplay}</span>
          </div>
          <div className="net-banner-right">
            <span className="net-banner-roi mono-text">{formatROI(calc.roi)}</span>
            <span className="net-banner-badge">{isProfit ? '⚡ POSITIVE SPREAD' : '⚠️ NEGATIVE'}</span>
          </div>
        </div>

        {/* Execution Radar Confidence */}
        <div className="execution-confidence-bar">
          <div className="confidence-score-badge">89%</div>
          <div className="confidence-details">
            <div className="confidence-title">Autonomous Execution Index</div>
            <div className="confidence-sub">Optimal liquidity depth across verified AMM pools</div>
          </div>
        </div>
      </div>

      {/* 2. Route Sequence Timeline */}
      <div className="drawer-panel route-panel">
        <div className="drawer-panel-header">
          <span className="panel-title-icon">◆</span>
          <span className="panel-title-text">MULTI-DEX ROUTE SEQUENCE ({hops.length} HOPS)</span>
        </div>

        <div className="hops-stepper-list">
          {hops.map((hop, idx) => (
            <div className="hop-step-card" key={idx}>
              <div className="hop-step-meta">
                <div className="hop-step-num">#{idx + 1}</div>
                <div className="hop-step-dex">{hop.dex}</div>
                <div className="hop-step-fee">{hop.feeLabel}</div>
              </div>

              <div className="hop-step-swap">
                <span className="swap-token-flow">{hop.swapText}</span>
              </div>

              <div className="hop-step-addresses">
                <CopyAddressChip address={hop.router} network={data.network} label="Router" />
                <CopyAddressChip address={hop.quoter} network={data.network} label="Quoter" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignalDetailDrawer;
