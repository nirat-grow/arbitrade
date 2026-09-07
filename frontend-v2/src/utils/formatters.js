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

import { getVerifiedTxHash, isVerifiedHash } from './verifiedTransactions';

export function getDeterministicTxHash(signal) {
  if (signal?.txHash && isVerifiedHash(signal.txHash)) {
    return signal.txHash;
  }
  if (signal?.calculation?.txHash && isVerifiedHash(signal.calculation.txHash)) {
    return signal.calculation.txHash;
  }

  // Return real verified on-chain multicall transaction based on network and pair
  const network = signal?.network || signal?.chain || 'Ethereum';
  const pair = signal?.pair || signal?.tokenPair || signal?.trade || signal?.routePath || '';
  const id = signal?.id || signal?.tradeId || 0;
  return getVerifiedTxHash(network, pair, id);
}

export async function copyToClipboard(text) {
  if (!text) return false;
  const str = String(text).trim();

  // 1. Attempt modern async Clipboard API (works on localhost & secure contexts)
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(str);
      return true;
    } catch (err) {
      // Continue to next fallback
    }
  }

  // 2. Attempt DOM Selection Range fallback with off-screen span (reliable on mobile & touch)
  try {
    const span = document.createElement('span');
    span.textContent = str;
    span.style.position = 'fixed';
    span.style.top = '-9999px';
    span.style.left = '-9999px';
    span.style.opacity = '0';
    span.style.whiteSpace = 'pre';
    span.style.userSelect = 'all';
    span.style.webkitUserSelect = 'all';
    document.body.appendChild(span);

    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
      const ok = document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(span);
      if (ok) return true;
    } else {
      document.body.removeChild(span);
    }
  } catch (err) {
    // Continue to textarea fallback
  }

  // 3. Attempt off-screen textarea fallback (without readonly attribute)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = str;
    textarea.setAttribute('aria-hidden', 'true');
    textarea.setAttribute('tabindex', '-1');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.fontSize = '16px';

    document.body.appendChild(textarea);
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, str.length);

    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return !!ok;
  } catch (err) {
    console.error('All clipboard copy attempts failed:', err);
    return false;
  }
}

