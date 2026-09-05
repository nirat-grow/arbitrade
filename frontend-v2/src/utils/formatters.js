/**
 * Formatting utilities for financial & crypto numbers in NEXUS QUANTUM
 */

export function formatNetProfit(netStr, profitAmount) {
  if (profitAmount !== undefined && profitAmount !== null) {
    const val = Number(profitAmount);
    return val < 0 ? `-$${Math.abs(val).toFixed(6)}` : `+$${val.toFixed(6)}`;
  }

  if (!netStr) return '+$0.000000';
  const clean = String(netStr).trim();

  // If already formatted with +$ or -$
  if (clean.startsWith('+$') || clean.startsWith('-$')) {
    return clean;
  }

  const isNeg = clean.startsWith('-');
  const rawNumStr = clean.replace(/[^0-9.]/g, '');
  const num = parseFloat(rawNumStr);

  if (isNaN(num)) return clean;

  return isNeg ? `-$${num.toFixed(6)}` : `+$${num.toFixed(6)}`;
}

export function formatUSD(valueStr, decimals = 4) {
  if (valueStr === undefined || valueStr === null || valueStr === '') return '$0.00';
  const raw = String(valueStr).replace(/[^0-9.-]/g, '');
  const num = parseFloat(raw);
  if (isNaN(num)) return String(valueStr);

  // If number is >= 1000, format with 2 decimals and commas (e.g. $7,834.31)
  if (Math.abs(num) >= 1000) {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // Smaller values (gas, fee, micro-yield) keep precise decimals
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`;
}

export function formatROI(roiStr) {
  if (!roiStr) return '+0.00%';
  const clean = String(roiStr).trim();
  if (clean.startsWith('+') || clean.startsWith('-')) return clean;
  const num = parseFloat(clean.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return roiStr;
  return num >= 0 ? `+${num.toFixed(4)}%` : `${num.toFixed(4)}%`;
}

export function shortenAddress(addr, chars = 4) {
  if (!addr) return '';
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}
