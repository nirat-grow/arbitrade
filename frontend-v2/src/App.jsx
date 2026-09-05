import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeaderSection from './components/HeaderSection';
import SignalEqualizer from './components/SignalEqualizer';
import SignalCard from './components/SignalCard';
import SignalRow from './components/SignalRow';
import PersonalDashboard from './components/PersonalDashboard';
import AdminPortal from './components/AdminPortal';
import { LoginModal, SuccessModal, Toast } from './components/Modals';

export default function App() {
  // Navigation & Route states
  const [isAdminMode, setIsAdminMode] = useState(() => window.location.pathname === '/admin');
  const [currentView, setCurrentView] = useState('global'); // 'global' | 'personal'
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' | 'terminal'
  const [isReadOnlyProfile, setIsReadOnlyProfile] = useState(false);

  // Data states
  const [globalSignals, setGlobalSignals] = useState([]);
  const [personalSignals, setPersonalSignals] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [expandedSignalId, setExpandedSignalId] = useState(null);

  // Filters & Search
  const [selectedChain, setSelectedChain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('roi'); // 'roi' | 'profit' | 'recent'

  // Connection & UI states
  const [wsConnected, setWsConnected] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // 1. Fetch initial Admin Stats for HUD
  const fetchAdminStats = async () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const res = await fetch(`${protocol}//${window.location.host}/api/admin/stats`);
      const data = await res.json();
      if (data.success) {
        setAdminStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    const interval = setInterval(fetchAdminStats, 15000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch User Profile
  const fetchProfile = async (id) => {
    if (!id) return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const res = await fetch(`${protocol}//${window.location.host}/api/user-profile/${id}`);
      const data = await res.json();
      if (data.success) {
        setUserProfile(data.profile);
        if (data.trades && data.trades.length > 0) {
          const formatted = data.trades.map((t) => {
            const d = t.trade_details;
            return {
              id: t.id,
              type: d.type,
              network: d.network,
              timeLabel: 'Executed',
              routePath: d.routePath,
              calculation: d.calculation,
              hops: d.hops,
              profitAmount: parseFloat(t.profit_amount),
            };
          });
          setPersonalSignals(formatted);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // 3. Detect URL Parameters (?userId=... or /user_...)
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsAdminMode(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    let uid = params.get('userId');

    if (!uid && window.location.pathname !== '/') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts.length === 1 && parts[0].startsWith('user_')) {
        uid = parts[0];
      }
    }

    if (uid) {
      setIsReadOnlyProfile(true);
      setCurrentView('personal');
      fetchProfile(uid);
    }
  }, []);

  // 4. WebSocket Real-time Feed Connection
  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let wsUrl = `${protocol}//${window.location.host}/ws`;

      if (currentView === 'personal' && userProfile) {
        wsUrl += `?userId=${userProfile.userId}`;
      }

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle Session Complete Target Achieved Event
          if (Array.isArray(data) && data.length > 0 && data[0].type === 'SESSION_COMPLETE') {
            const ev = data[0];
            setUserProfile((prev) =>
              prev
                ? {
                    ...prev,
                    sessionActive: false,
                    currentProfit: ev.total_profit,
                    currentProfitPercentage: ev.profit_percentage || prev.targetPercentage,
                  }
                : prev
            );
            setSuccessModalData({
              profit: ev.total_profit,
              percentage: ev.profit_percentage || userProfile?.targetPercentage || 8,
            });
            return;
          }

          if (currentView === 'personal') {
            setPersonalSignals((prev) => {
              const incoming = Array.isArray(data) ? data : [data];
              const unique = incoming.filter((d) => !prev.some((p) => p.id === d.id));
              return [...unique, ...prev].slice(0, 50);
            });

            // Optimistically increment profile profit
            const incoming = Array.isArray(data) ? data : [data];
            const liveTrades = incoming.filter((d) => !d.isHistory);
            if (liveTrades.length > 0) {
              const addedProfit = liveTrades.reduce((sum, d) => sum + (d.profitAmount || 0), 0);
              setUserProfile((prev) => (prev ? { ...prev, currentProfit: prev.currentProfit + addedProfit } : prev));
            }
          } else {
            if (Array.isArray(data)) {
              setGlobalSignals(data);
            }
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, [currentView, userProfile?.userId]);

  // 5. Start Trade Handler
  const handleStartTrade = async (targetUserId) => {
    if (!targetUserId) return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const res = await fetch(`${protocol}//${window.location.host}/api/start-trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const data = await res.json();

      if (data.success || res.status === 429) {
        setIsLoginOpen(false);
        setCurrentView('personal');
        fetchProfile(targetUserId);
        showToast(data.message, data.success ? 'success' : 'error');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to backend server.', 'error');
    }
  };

  // Signal Filtering & Search
  const activeFeed = currentView === 'global' ? globalSignals : personalSignals;
  const filteredSignals = activeFeed
    .filter((signal) => {
      if (selectedChain !== 'All' && signal.network?.toLowerCase() !== selectedChain.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inNetwork = signal.network?.toLowerCase().includes(q);
        const inType = signal.type?.toLowerCase().includes(q);
        const inRoute = signal.routePath?.some((token) => token.toLowerCase().includes(q));
        if (!inNetwork && !inType && !inRoute) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'profit') {
        const profitA = a.profitAmount || parseFloat(a.calculation?.net?.replace(/[^0-9.-]+/g, '')) || 0;
        const profitB = b.profitAmount || parseFloat(b.calculation?.net?.replace(/[^0-9.-]+/g, '')) || 0;
        return profitB - profitA;
      }
      if (sortBy === 'roi') {
        const roiA = parseFloat(a.calculation?.roi) || 0;
        const roiB = parseFloat(b.calculation?.roi) || 0;
        return roiB - roiA;
      }
      return 0; // default recent order
    });

  return (
    <div className="nexus-app">
      {/* Background Matrix Grid Overlay */}
      <div className="nexus-grid-overlay" />

      {/* Global Notifications & Modals */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleStartTrade} />
      <SuccessModal
        isOpen={!!successModalData}
        onClose={() => setSuccessModalData(null)}
        profit={successModalData?.profit || 0}
        percentage={successModalData?.percentage || userProfile?.targetPercentage || 8}
      />

      {/* Navigation Bar */}
      <Navbar
        userProfile={userProfile}
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onStartTrade={handleStartTrade}
        isReadOnlyProfile={isReadOnlyProfile}
        wsConnected={wsConnected}
        isAdminRoute={isAdminMode}
        onOpenAdmin={(open) => setIsAdminMode(open)}
      />

      {/* Main Content Area */}
      {isAdminMode ? (
        <AdminPortal onBackToTerminal={() => setIsAdminMode(false)} />
      ) : (
        <main className="nexus-main">
          {/* Top Observatory Cockpit Header */}
          <HeaderSection currentView={currentView} userProfile={userProfile} />

          {/* Next-Gen Harmonic Spectrum Signal Equalizer */}
          <SignalEqualizer />

          {/* Personal Account View (if in Personal mode) */}
          {currentView === 'personal' && (
            <PersonalDashboard userProfile={userProfile} onStartTrade={handleStartTrade} />
          )}

          {/* Control Bar: Filters, Search, View Layout Switcher */}
          <div className="matrix-control-bar">
            {/* Chain Filters */}
            <div className="filter-chain-group">
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', textTransform: 'uppercase', marginRight: '4px' }}>
                Conduits:
              </span>
              {['All', 'Polygon', 'Ethereum', 'BNB', 'Arbitrum', 'Base'].map((chain) => (
                <button
                  key={chain}
                  className={`chain-filter-btn ${selectedChain === chain ? 'active' : ''}`}
                  onClick={() => setSelectedChain(chain)}
                >
                  <span className={`chain-pip ${chain.toLowerCase()}`} />
                  {chain}
                </button>
              ))}
            </div>

            {/* Right Tools: Search & Layout Mode */}
            <div className="control-tools-right">
              {/* Sort selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-display)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="roi">Highest ROI</option>
                  <option value="profit">Largest Yield ($)</option>
                  <option value="recent">Latest Stream</option>
                </select>
              </div>

              {/* Search Box */}
              <div className="matrix-search">
                <svg className="search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter pair or token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* View Layout Toggle (Grid vs Terminal Table) */}
              <div className="view-type-toggle">
                <button
                  className={`view-type-btn ${viewLayout === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewLayout('grid')}
                  title="Quantum Cards Grid"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  className={`view-type-btn ${viewLayout === 'terminal' ? 'active' : ''}`}
                  onClick={() => setViewLayout('terminal')}
                  title="High-Frequency Dense Table"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Signals Stream Display */}
          {filteredSignals.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
              <div style={{ fontFamily: 'var(--font-tech)', fontSize: '1.1rem', color: '#FFFFFF', fontWeight: '700' }}>
                Scanning High-Frequency Arbitrage Conduits...
              </div>
              <p style={{ fontSize: '0.84rem', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0' }}>
                Awaiting algorithmic spread cross-detection from Binance, Uniswap V3, Curve, and Balancer liquidity pools.
              </p>
            </div>
          ) : viewLayout === 'grid' ? (
            /* Mode A: Quantum Cards Grid */
            <div className="signals-grid-container">
              {filteredSignals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  isExpanded={expandedSignalId === signal.id}
                  onToggle={() => setExpandedSignalId(expandedSignalId === signal.id ? null : signal.id)}
                />
              ))}
            </div>
          ) : (
            /* Mode B: High-Density Terminal Table */
            <div className="terminal-table-container">
              <div className="terminal-header-row">
                <div>Conduit</div>
                <div>Execution Route</div>
                <div>Latency</div>
                <div>Net Yield ($)</div>
                <div>Est. ROI</div>
                <div style={{ textAlign: 'right' }}>Inspect</div>
              </div>
              {filteredSignals.map((signal) => (
                <SignalRow
                  key={signal.id}
                  signal={signal}
                  isExpanded={expandedSignalId === signal.id}
                  onToggle={() => setExpandedSignalId(expandedSignalId === signal.id ? null : signal.id)}
                />
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
