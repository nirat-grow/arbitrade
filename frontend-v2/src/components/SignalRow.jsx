import React from 'react';
import SignalDetailDrawer from './SignalDetailDrawer';
import { formatNetProfit, formatROI, shortenAddress, getDeterministicTxHash } from '../utils/formatters';

const NETWORK_COLORS = {
  Avalanche: '#FF5C5C',
  Ethereum: '#8299F8',
  Polygon: '#B388FF',
  BNB: '#FCD535',
  Arbitrum: '#56B8FF',
  Base: '#3B82F6',
};

export const SignalRow = React.memo(({ signal, isExpanded, onToggle }) => {
  if (!signal || !signal.calculation) return null;

  const txHash = signal.txHash || getDeterministicTxHash(signal);
  const netDisplay = formatNetProfit(signal.calculation.net, signal.profitAmount);
  const isProfit = !netDisplay.startsWith('-');
  const roiDisplay = formatROI(signal.calculation.roi);
  const netDotColor = NETWORK_COLORS[signal.network] || 'var(--gold-core)';

  const handleRowToggle = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof onToggle === 'function') {
      onToggle(signal.id);
    }
  };

  return (
    <div className={`terminal-row-item ${isExpanded ? 'expanded' : ''}`}>
      <div className={`terminal-data-row ${isExpanded ? 'expanded' : ''}`} onClick={handleRowToggle}>
        {/* Network / Conduit */}
        <div className="table-conduit-col">
          <span className="table-network-pip" style={{ background: netDotColor, boxShadow: `0 0 8px ${netDotColor}66` }} />
          <span className="table-conduit-name">
            {signal.network}
          </span>
        </div>

        {/* Route / Type */}
        <div className="table-route-col">
          <span className="table-type-badge">
            {signal.type?.toUpperCase()}
          </span>
          <div className="table-path-flow">
            {signal.routePath && signal.routePath.map((token, idx) => (
              <React.Fragment key={idx}>
                <span className="table-path-token">{token}</span>
                {idx < signal.routePath.length - 1 && (
                  <span className="table-path-arrow">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Latency / Time */}
        <div className="table-latency-col">
          <span className="table-latency-chip mono-text">
            <span className="latency-dot" />
            {signal.timeLabel || 'Active'}
          </span>
        </div>

        {/* Net Profit */}
        <div className="table-yield-col mono-text">
          <span className={`table-yield-val ${isProfit ? 'profit' : 'loss'}`}>
            {netDisplay}
          </span>
        </div>

        {/* ROI */}
        <div className="table-roi-col">
          <span className={`roi-badge-pill mono-text ${isProfit ? 'profit-badge' : 'loss-badge'}`}>
            {roiDisplay}
          </span>
        </div>

        {/* Action Toggle */}
        <div className="table-action-col">
          <button
            type="button"
            className={`table-inspect-chevron-btn ${isExpanded ? 'active' : ''}`}
            onClick={handleRowToggle}
            aria-expanded={isExpanded}
            title={isExpanded ? 'Collapse Telemetry' : 'Inspect Telemetry'}
          >
            <svg
              className={`table-chevron-svg ${isExpanded ? 'rotated' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Details Row */}
      {isExpanded && (
        <div className="terminal-expanded-drawer-wrap">
          <SignalDetailDrawer data={signal} isTable={true} />
        </div>
      )}
    </div>
  );
});

export default SignalRow;
