import React from 'react';
import SignalDetailDrawer from './SignalDetailDrawer';
import { formatNetProfit, formatROI, shortenAddress, getDeterministicTxHash, isValidTxHash } from '../utils/formatters';

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

  const txHash = getDeterministicTxHash(signal);
  const hasValidTx = Boolean(txHash && isValidTxHash(txHash));
  const isExecuted = signal.timeLabel === 'Executed' || Boolean(signal.isLedgerTrade);
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
          <span className={`table-type-badge ${hasValidTx ? 'verified-pill' : (isExecuted ? 'pending-pill' : 'opp-pill')}`} style={{
            fontSize: '0.65rem',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 700,
            background: hasValidTx ? 'rgba(16, 185, 129, 0.14)' : (isExecuted ? 'rgba(245, 158, 11, 0.14)' : 'rgba(56, 189, 248, 0.12)'),
            border: hasValidTx ? '1px solid rgba(16, 185, 129, 0.35)' : (isExecuted ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(56, 189, 248, 0.3)'),
            color: hasValidTx ? '#34D399' : (isExecuted ? '#FBBF24' : '#38BDF8'),
            marginRight: '6px'
          }}>
            {hasValidTx ? 'VERIFIED' : (isExecuted ? 'PENDING' : 'OPP')}
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
            <span className="latency-dot" style={{ background: hasValidTx ? '#34D399' : (isExecuted ? '#FBBF24' : '#38BDF8') }} />
            {signal.timeLabel || (isExecuted ? 'Executed' : 'Live')}
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
