import React from 'react';
import SignalDetailDrawer from './SignalDetailDrawer';
import { formatNetProfit, formatROI } from '../utils/formatters';

const NETWORK_COLORS = {
  Avalanche: { bg: 'rgba(232, 65, 66, 0.12)', border: 'rgba(232, 65, 66, 0.35)', color: '#FF5C5C', dot: '#E84142' },
  Ethereum: { bg: 'rgba(98, 126, 234, 0.12)', border: 'rgba(98, 126, 234, 0.35)', color: '#8299F8', dot: '#627EEA' },
  Polygon: { bg: 'rgba(130, 71, 229, 0.12)', border: 'rgba(130, 71, 229, 0.35)', color: '#B388FF', dot: '#8247E5' },
  BNB: { bg: 'rgba(243, 186, 47, 0.12)', border: 'rgba(243, 186, 47, 0.35)', color: '#FCD535', dot: '#F3BA2F' },
  Arbitrum: { bg: 'rgba(40, 160, 240, 0.12)', border: 'rgba(40, 160, 240, 0.35)', color: '#56B8FF', dot: '#28A0F0' },
  Base: { bg: 'rgba(0, 82, 255, 0.12)', border: 'rgba(0, 82, 255, 0.35)', color: '#3B82F6', dot: '#0052FF' },
};

export const SignalCard = ({ signal, isExpanded, onToggle }) => {
  if (!signal || !signal.calculation) return null;

  const netDisplay = formatNetProfit(signal.calculation.net, signal.profitAmount);
  const isProfit = !netDisplay.startsWith('-');
  const roiDisplay = formatROI(signal.calculation.roi);
  const roiNum = Math.abs(parseFloat(signal.calculation.roi) || 0);

  const netStyle = NETWORK_COLORS[signal.network] || {
    bg: 'rgba(234, 179, 8, 0.1)',
    border: 'rgba(234, 179, 8, 0.35)',
    color: 'var(--gold-bright)',
    dot: 'var(--gold-core)',
  };

  return (
    <div className={`quantum-signal-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Top Meta Header */}
      <div className="signal-card-top">
        <div
          className="network-badge-custom"
          style={{ background: netStyle.bg, borderColor: netStyle.border, color: netStyle.color }}
        >
          <span className="network-dot-pip" style={{ background: netStyle.dot }} />
          {signal.network?.toUpperCase()}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="execution-type-pill">
            {signal.type?.toUpperCase() || 'ARBITRAGE'}
          </span>
          <span className="signal-timestamp mono-text">
            {signal.timeLabel || 'Active'}
          </span>
        </div>
      </div>

      {/* Visual Token Route Flow */}
      <div className="route-chain-flow">
        {signal.routePath && signal.routePath.map((token, idx) => (
          <React.Fragment key={idx}>
            <span className="token-pill">
              <span className="token-pill-icon">◆</span>
              <span className="token-pill-name">{token}</span>
            </span>
            {idx < signal.routePath.length - 1 && (
              <span className="token-flow-arrow">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Financial Metrics Row */}
      <div className="signal-financial-row">
        <div className="fin-metric">
          <span className="fin-metric-label">NET ARBITRAGE</span>
          <span className={`fin-metric-value mono-text ${isProfit ? 'profit' : 'loss'}`}>
            {netDisplay}
          </span>
        </div>

        <div className="fin-metric" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
          <span className="fin-metric-label">YIELD ROI</span>
          <div className="roi-pill-group">
            <span className={`roi-badge-pill mono-text ${isProfit ? 'profit-badge' : 'loss-badge'}`}>
              {roiDisplay}
            </span>
            <div className="roi-bars-indicator">
              <div className="bar-seg" style={{ height: `${Math.min(14, Math.max(3, roiNum * 3))}px` }} />
              <div className="bar-seg" style={{ height: `${Math.min(14, Math.max(5, roiNum * 5))}px` }} />
              <div
                className="bar-seg active-seg"
                style={{
                  height: `${Math.min(14, Math.max(7, roiNum * 7))}px`,
                  background: isProfit ? 'var(--profit-green)' : 'var(--danger-core)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expand / Collapse Action Button */}
      <button className={`inspect-expand-btn ${isExpanded ? 'active' : ''}`} onClick={onToggle}>
        <span>{isExpanded ? 'Collapse Telemetry' : 'Inspect Conduit Execution'}</span>
        <span className={`chevron-icon ${isExpanded ? 'open' : ''}`}>▼</span>
      </button>

      {/* Deep Inspection Drawer (Vertical flow inside card) */}
      {isExpanded && <SignalDetailDrawer data={signal} isTable={false} />}
    </div>
  );
};

export default SignalCard;
