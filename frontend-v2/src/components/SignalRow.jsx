import React from 'react';
import SignalDetailDrawer from './SignalDetailDrawer';
import { formatNetProfit, formatROI } from '../utils/formatters';

const NETWORK_COLORS = {
  Avalanche: '#FF5C5C',
  Ethereum: '#8299F8',
  Polygon: '#B388FF',
  BNB: '#FCD535',
  Arbitrum: '#56B8FF',
  Base: '#3B82F6',
};

export const SignalRow = ({ signal, isExpanded, onToggle }) => {
  if (!signal || !signal.calculation) return null;

  const netDisplay = formatNetProfit(signal.calculation.net, signal.profitAmount);
  const isProfit = !netDisplay.startsWith('-');
  const roiDisplay = formatROI(signal.calculation.roi);
  const netDotColor = NETWORK_COLORS[signal.network] || 'var(--gold-core)';

  return (
    <div className={`terminal-row-item ${isExpanded ? 'expanded' : ''}`}>
      <div className={`terminal-data-row ${isExpanded ? 'expanded' : ''}`} onClick={onToggle}>
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
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            title={isExpanded ? 'Collapse Telemetry' : 'Inspect Telemetry'}
          >
            <span className="table-chevron-icon">{isExpanded ? '▲' : '▼'}</span>
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
};

export default SignalRow;
