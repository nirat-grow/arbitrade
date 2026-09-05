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
  const netDotColor = NETWORK_COLORS[signal.network] || 'var(--cyan-core)';

  return (
    <>
      <div className={`terminal-data-row ${isExpanded ? 'expanded' : ''}`} onClick={onToggle}>
        {/* Network */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="network-dot-pip" style={{ background: netDotColor }} />
          <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.84rem', fontWeight: '700', color: '#FFFFFF' }}>
            {signal.network}
          </span>
        </div>

        {/* Route / Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span className="execution-type-pill" style={{ fontSize: '0.64rem', padding: '2px 6px' }}>
            {signal.type?.toUpperCase()}
          </span>
          <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.86rem', color: '#E2E8F0', whiteSpace: 'nowrap' }}>
            {signal.routePath ? signal.routePath.join(' → ') : ''}
          </span>
        </div>

        {/* Time */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {signal.timeLabel || 'Active'}
        </div>

        {/* Net Profit */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.94rem', fontWeight: '700' }}>
          <span style={{ color: isProfit ? 'var(--profit-green)' : 'var(--danger-core)' }}>
            {netDisplay}
          </span>
        </div>

        {/* ROI */}
        <div>
          <span className={`roi-badge-pill mono-text ${isProfit ? 'profit-badge' : 'loss-badge'}`} style={{ fontSize: '0.78rem' }}>
            {roiDisplay}
          </span>
        </div>

        {/* Action Toggle */}
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              color: 'var(--cyan-core)',
              fontSize: '0.75rem',
              transform: isExpanded ? 'rotate(180deg)' : 'none',
              display: 'inline-block',
              transition: 'transform 0.2s',
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Expanded Details Row */}
      {isExpanded && (
        <div style={{ gridColumn: '1 / -1', background: 'var(--bg-deep)' }}>
          <SignalDetailDrawer data={signal} isTable={true} />
        </div>
      )}
    </>
  );
};

export default SignalRow;
