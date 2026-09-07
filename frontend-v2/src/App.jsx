import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  const [ledgerSignals, setLedgerSignals] = useState(() => {
    try {
      const cached = localStorage.getItem('karometa_cached_ledger');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [totalSettledCount, setTotalSettledCount] = useState(() => {
    try {
      const cached = localStorage.getItem('karometa_cached_total');
      return cached ? parseInt(cached, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreTrades, setHasMoreTrades] = useState(true);
  const [isFetchingInitialLedger, setIsFetchingInitialLedger] = useState(() => {
    try {
      return !localStorage.getItem('karometa_cached_ledger');
    } catch (e) {
      return true;
    }
  });
  const [personalSignals, setPersonalSignals] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [expandedSignalId, setExpandedSignalId] = useState(null);

  // Active Inspection & Visual Stability Refs
  const expandedSignalIdRef = useRef(null);
  const frozenIdsRef = useRef(null);
  const filteredSignalsRef = useRef([]);
  const ledgerSignalsRef = useRef([]);
  const isLoadingMoreRef = useRef(false);
  const hasMoreTradesRef = useRef(true);
  const wsRef = useRef(null);

  ledgerSignalsRef.current = ledgerSignals;
  isLoadingMoreRef.current = isLoadingMore;
  hasMoreTradesRef.current = hasMoreTrades;

  const handleToggleExpand = useCallback((id) => {
    setExpandedSignalId((prev) => {
      const next = prev === id ? null : id;
      expandedSignalIdRef.current = next;
      if (next && filteredSignalsRef.current) {
        // Freeze the current visual order of filtered signals so rows do not jump
        frozenIdsRef.current = filteredSignalsRef.current.map((s) => s.id);
      } else {
        frozenIdsRef.current = null;
      }
      return next;
    });
  }, []);

  const handleChainChange = (chain) => {
    setSelectedChain(chain);
    frozenIdsRef.current = null;
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    frozenIdsRef.current = null;
  };

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
    if (!id) return null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const res = await fetch(`${protocol}//${window.location.host}/api/user-profile/${id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setUserProfile(data.profile);
        if (data.trades && data.trades.length > 0) {
          const formatted = data.trades.map((t) => {
            const d = typeof t.trade_details === 'string' ? JSON.parse(t.trade_details) : t.trade_details;
            return {
              id: t.id,
              type: d.type || 'Arbitrage',
              network: d.network || 'Ethereum',
              timeLabel: 'Executed',
              routePath: d.routePath,
              calculation: d.calculation,
              hops: d.hops,
              profitAmount: parseFloat(t.profit_amount),
              tradeAmount: parseFloat(t.trade_amount),
              createdAt: t.created_at,
              txHash: d.txHash || d.calculation?.txHash,
            };
          });
          setPersonalSignals(formatted);
        } else {
          setPersonalSignals([]);
        }
        return data.profile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('karometa_user_id');
    setUserProfile(null);
    setPersonalSignals([]);
    setCurrentView('ledger');
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
    showToast('Disconnected from personal account session.', 'info');
  };

  // 3. Fetch Executed Trades in 500-record chunks for maximum network speed
  const fetchAllHistoryTrades = async (offset = 0, isAppend = false) => {
    if (isAppend && (isLoadingMoreRef.current || !hasMoreTradesRef.current)) return;
    try {
      if (isAppend) setIsLoadingMore(true);
      else if (!ledgerSignalsRef.current.length) setIsFetchingInitialLedger(true);

      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const res = await fetch(`${protocol}//${window.location.host}/api/all-history?limit=500&offset=${offset}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.trades)) {
        if (data.totalTrades !== undefined) {
          setTotalSettledCount(data.totalTrades);
          try {
            localStorage.setItem('karometa_cached_total', data.totalTrades.toString());
          } catch (e) {}
        }
        const formatted = data.trades.map((t) => {
          const d = typeof t.trade_details === 'string' ? JSON.parse(t.trade_details) : t.trade_details;
          return {
            id: t.id,
            type: d.type || 'Arbitrage',
            network: d.network || 'Ethereum',
            timeLabel: 'Executed',
            routePath: d.routePath,
            calculation: d.calculation,
            hops: d.hops,
            profitAmount: parseFloat(t.profit_amount),
            tradeAmount: parseFloat(t.trade_amount),
            createdAt: t.created_at,
            txHash: d.txHash || d.calculation?.txHash,
          };
        });

        // Cache first 50 records for instant 0ms render on next page load
        if (!isAppend && formatted.length > 0) {
          try {
            localStorage.setItem('karometa_cached_ledger', JSON.stringify(formatted.slice(0, 50)));
          } catch (e) {}
        }

        setLedgerSignals((prev) => {
          if (isAppend) {
            const existingIds = new Set(prev.map((p) => p.id));
            const newItems = formatted.filter((item) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          }
          return formatted;
        });

        if (data.trades.length < 500) {
          setHasMoreTrades(false);
        } else {
          setHasMoreTrades(true);
        }
      }
    } catch (err) {
      console.error('Error fetching history trades:', err);
    } finally {
      if (isAppend) setIsLoadingMore(false);
      setIsFetchingInitialLedger(false);
    }
  };

  useEffect(() => {
    fetchAllHistoryTrades(0, false);
  }, []);

  useEffect(() => {
    if (currentView === 'ledger' || currentView === 'personal') {
      fetchAllHistoryTrades(0, false);
    }
  }, [currentView]);

  // 4. Detect URL Parameters (?userId=...) or saved user in localStorage
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

    const savedUid = localStorage.getItem('karometa_user_id');
    const effectiveUid = uid || savedUid;

    if (effectiveUid) {
      if (uid) setIsReadOnlyProfile(true);
      fetchProfile(effectiveUid);
    }
  }, []);

  // 4. WebSocket Real-time Feed Connection (Continuous stream, decoupled from tab view)
  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let wsUrl = `${protocol}//${window.location.host}/ws`;

      if (userProfile?.userId) {
        wsUrl += `?userId=${userProfile.userId}`;
      }

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

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

          // Append incoming executed trades to all users' Execution Ledger in real-time
          const incomingTrades = Array.isArray(data) ? data : [data];
          const executedTrades = incomingTrades.filter(
            (d) => d.calculation && (d.profitAmount !== undefined || d.isLedgerTrade)
          );

          if (executedTrades.length > 0) {
            setTotalSettledCount((prev) => prev + executedTrades.length);
            setLedgerSignals((prev) => {
              const unique = executedTrades.filter((item) => !prev.some((p) => p.id === item.id));
              if (unique.length === 0) return prev;
              return [...unique, ...prev];
            });

            // If current logged-in user owns any of these trades, append to personalSignals and update profile
            if (userProfile) {
              const myTrades = executedTrades.filter((d) => d.isPersonalMatch);
              if (myTrades.length > 0) {
                setPersonalSignals((prev) => {
                  const uniqueMy = myTrades.filter((item) => !prev.some((p) => p.id === item.id));
                  if (uniqueMy.length === 0) return prev;
                  return [...uniqueMy, ...prev];
                });

                const freshTrades = myTrades.filter((d) => !d.isHistory);
                const addedProfit = freshTrades.reduce((sum, d) => sum + (d.profitAmount || 0), 0);
                if (addedProfit > 0) {
                  setUserProfile((prev) => (prev ? { ...prev, currentProfit: prev.currentProfit + addedProfit } : prev));
                }
              }
            }
          }

          // Update Global Scanner signals if payload is scanner array
          if (Array.isArray(data) && (!data[0] || !data[0].isLedgerTrade)) {
            setGlobalSignals((prev) => {
              const currentExpandedId = expandedSignalIdRef.current;

              // 1. If nothing is currently inspected, accept the incoming stream normally
              if (!currentExpandedId) {
                return data;
              }

              // 2. Active Inspection Protection: Never kick out or shift the opened record!
              const expandedItem = prev.find((s) => s.id === currentExpandedId);
              if (!expandedItem) {
                return data;
              }

              const incomingMatch = data.find((s) => s.id === currentExpandedId);
              if (incomingMatch) {
                const incomingMap = new Map(data.map((s) => [s.id, s]));
                return prev.map((p) => incomingMap.get(p.id) || p);
              } else {
                const result = [...prev];
                const expIdx = result.findIndex((s) => s.id === currentExpandedId);
                const availableIncoming = data.filter((s) => s.id !== currentExpandedId);
                let incIdx = 0;

                for (let i = 0; i < result.length; i++) {
                  if (i === expIdx) continue;
                  if (incIdx < availableIncoming.length) {
                    result[i] = availableIncoming[incIdx];
                    incIdx++;
                  }
                }
                return result;
              }
            });
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
  }, [userProfile?.userId]);

  // 5. Start Trade & Authenticate Session Handler (Instant 1-Click Execution)
  const handleStartTrade = async (targetUserId) => {
    if (!targetUserId) return;
    try {
      // Step 1: Immediately fetch user profile and their personal history
      const profile = await fetchProfile(targetUserId);
      if (!profile) {
        showToast('Unable to authenticate client identifier. Please verify User ID.', 'error');
        return;
      }

      // Step 2: Instant UI transition - Save session, close modal and show Personal Ledger
      localStorage.setItem('karometa_user_id', targetUserId);
      setIsLoginOpen(false);
      setCurrentView('ledger');

      // Step 3: Inform WebSocket of user identity without reconnecting
      if (wsRef.current && wsRef.current.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: 'IDENTIFY', userId: targetUserId }));
      }

      // Step 4: Handle 24h Auto-Trade start or active status gracefully
      if (profile.canStartTrade) {
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const res = await fetch(`${protocol}//${window.location.host}/api/start-trade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: targetUserId }),
        });
        const data = await res.json();
        await fetchProfile(targetUserId);
        showToast(data.message || '24-Hour Auto-Trade session started!', data.success ? 'success' : 'info');
      } else if (profile.sessionActive) {
        showToast(`Authenticated: Active 24h trading conduit running for ${targetUserId}.`, 'success');
      } else if (profile.isCooldownActive) {
        showToast(`Authenticated: Daily harvest secured. Next session unlock timer active.`, 'info');
      } else {
        showToast(`Conduit verified for ${targetUserId}.`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to backend server.', 'error');
    }
  };

  // Signal Filtering & Search (Global Matrix vs Personal Ledger vs Execution Ledger)
  const activeFeed = currentView === 'global'
    ? globalSignals
    : (userProfile ? personalSignals : ledgerSignals);

  const filteredSignals = useMemo(() => {
    return activeFeed
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
        // 1. When an item is actively inspected, strictly lock the visual sequence so rows don't shift
        if (expandedSignalId && frozenIdsRef.current) {
          const idxA = frozenIdsRef.current.indexOf(a.id);
          const idxB = frozenIdsRef.current.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
        }

        // 2. Standard user-selected sorting
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
  }, [activeFeed, selectedChain, searchQuery, sortBy, expandedSignalId]);

  filteredSignalsRef.current = filteredSignals;

  // Gmail-Style Pagination State & Calculations (50 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const tableContainerRef = useRef(null);

  // Auto-reset page to 1 whenever view, network filter, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
    setExpandedSignalId(null);
  }, [currentView, selectedChain, searchQuery, sortBy]);

  const isDefaultLedgerView = currentView === 'ledger' && selectedChain === 'All' && !searchQuery.trim() && !userProfile;
  const totalCount = isDefaultLedgerView
    ? Math.max(totalSettledCount, filteredSignals.length)
    : filteredSignals.length;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalCount === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  const displaySignals = useMemo(() => {
    if (currentView === 'global') return filteredSignals;
    return filteredSignals.slice(startIndex, endIndex);
  }, [currentView, filteredSignals, startIndex, endIndex]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    setExpandedSignalId(null);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Lazy load next 500 chunk when user approaches the end of currently loaded records
    if (currentView === 'ledger') {
      const neededRecords = newPage * pageSize;
      const loadedCount = ledgerSignalsRef.current.length;
      if (neededRecords >= loadedCount - 100 && hasMoreTradesRef.current && !isLoadingMoreRef.current) {
        fetchAllHistoryTrades(loadedCount, true);
      }
    }
  }, [currentView, pageSize]);

  const renderPaginationWidget = (isBottom = false) => {
    if (currentView === 'global' || totalCount === 0) return null;
    return (
      <div className={`gmail-pagination ${isBottom ? 'pagination-bottom' : ''}`}>
        <span className="pagination-range-text">
          <span className="range-highlight">{startIndex + 1}–{endIndex}</span>
          <span className="range-sep">of</span>
          <span className="range-total">{totalCount.toLocaleString()}</span>
          {isLoadingMore && <span className="pagination-loading-pulse" title="Fetching next records...">●</span>}
        </span>
        <div className="pagination-arrows-group">
          <button
            type="button"
            className="pagination-arrow-btn"
            onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage <= 1}
            title="Previous 50 records"
            aria-label="Previous page"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="pagination-arrow-btn"
            onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage >= totalPages}
            title="Next 50 records"
            aria-label="Next page"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

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
        onLogout={handleLogout}
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

          {/* Personal Account View (only when in Ledger mode AND a user profile is logged in) */}
          {(currentView === 'ledger' || currentView === 'personal') && userProfile && (
            <PersonalDashboard userProfile={userProfile} onStartTrade={handleStartTrade} />
          )}

          {/* Control Bar: Filters, Search, View Layout Switcher */}
          <div className="matrix-control-bar">
            {/* Decorative corner brackets matching Image 1 Observatory design */}
            <span className="control-corner control-corner-tl" />
            <span className="control-corner control-corner-tr" />
            <span className="control-corner control-corner-bl" />
            <span className="control-corner control-corner-br" />

            {/* Chain Filters */}
            <div className="filter-chain-group">
              <span className="control-bar-label">
                Conduits:
              </span>
              {['All', 'Polygon', 'Ethereum', 'BNB', 'Arbitrum', 'Base'].map((chain) => (
                <button
                  key={chain}
                  type="button"
                  className={`chain-filter-btn ${selectedChain === chain ? 'active' : ''}`}
                  onClick={() => handleChainChange(chain)}
                >
                  <span className={`chain-pip ${chain.toLowerCase()}`} />
                  <span>{chain}</span>
                </button>
              ))}
            </div>

            {/* Right Tools: Search & Layout Mode */}
            <div className="control-tools-right">
              {/* Sort selector */}
              <div className="matrix-sort-wrapper">
                <span className="control-bar-label">SORT:</span>
                <div className="matrix-select-box">
                  <select
                    className="matrix-sort-select"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    aria-label="Sort Conduits"
                  >
                    <option value="roi">Highest ROI</option>
                    <option value="profit">Largest Yield ($)</option>
                    <option value="recent">Latest Stream</option>
                  </select>
                  <svg className="select-dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Search Box */}
              <div className="matrix-search">
                <svg className="search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter pair or token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter pair or token"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    title="Clear filter"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* View Layout Toggle (Grid vs Terminal Table) */}
              <div className="view-type-toggle" role="group" aria-label="View Layout">
                <button
                  type="button"
                  className={`view-type-btn ${viewLayout === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewLayout('grid')}
                  title="Quantum Cards Grid View"
                  aria-label="Quantum Cards Grid View"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`view-type-btn ${viewLayout === 'terminal' ? 'active' : ''}`}
                  onClick={() => setViewLayout('terminal')}
                  title="High-Frequency Dense Table View"
                  aria-label="High-Frequency Dense Table View"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            isFetchingInitialLedger && currentView === 'ledger' ? (
              /* High-End Obsidian Shimmer Skeleton while initially loading first time */
              <div className="terminal-table-container">
                <span className="table-corner table-corner-tl" />
                <span className="table-corner table-corner-tr" />
                <span className="table-corner table-corner-bl" />
                <span className="table-corner table-corner-br" />
                <div className="terminal-card-topbar">
                  <div className="topbar-title-wrap">
                    <div className="topbar-icon-badge">
                      <svg className="topbar-icon-bolt" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>
                    <h3 className="topbar-title">Live Execution Ledger</h3>
                    <span className="topbar-active-pill">Syncing Ledger...</span>
                  </div>
                </div>
                <div className="terminal-header-row">
                  <div className="header-cell">Conduit</div>
                  <div className="header-cell">Execution Route</div>
                  <div className="header-cell">Latency</div>
                  <div className="header-cell">Net Yield ($)</div>
                  <div className="header-cell">Est. ROI</div>
                  <div className="header-cell" style={{ textAlign: 'right', justifyContent: 'flex-end' }}>Inspect</div>
                </div>
                <div className="terminal-skeleton-table">
                  {[1, 2, 3, 4, 5, 6, 7].map((idx) => (
                    <div key={idx} className="terminal-skeleton-row" />
                  ))}
                </div>
              </div>
            ) : (
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
                  {currentView === 'global'
                    ? 'Scanning High-Frequency Arbitrage Conduits...'
                    : (userProfile ? 'No Personal Trades Found' : 'No Matching Arbitrage Records')}
                </div>
                <p style={{ fontSize: '0.84rem', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0' }}>
                  {searchQuery || selectedChain !== 'All'
                    ? 'No records match your active search or conduit network filter. Try clearing filters.'
                    : 'Awaiting new algorithmic settlements across live liquidity pools.'}
                </p>
              </div>
            )
          ) : viewLayout === 'grid' ? (
            /* Mode A: Quantum Cards Grid */
            <div className="grid-view-wrapper" ref={tableContainerRef}>
              {currentView !== 'global' && totalCount > 0 && (
                <div className="grid-pagination-header">
                  <div className="grid-header-meta">
                    <span className="grid-header-title">
                      {userProfile ? 'Personal Trade Ledger' : 'Live Execution Ledger'}
                    </span>
                    <span className="topbar-active-pill">
                      {totalCount.toLocaleString()} Settled
                    </span>
                  </div>
                  {renderPaginationWidget(false)}
                </div>
              )}
              <div className="signals-grid-container">
                {displaySignals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    isExpanded={expandedSignalId === signal.id}
                    onToggle={handleToggleExpand}
                  />
                ))}
              </div>
              {currentView !== 'global' && totalCount > pageSize && (
                <div className="grid-bottom-pagination">
                  {renderPaginationWidget(true)}
                </div>
              )}
            </div>
          ) : (
            /* Mode B: High-Density Terminal Table */
            <div className="terminal-table-container" ref={tableContainerRef}>
              {/* Decorative corner brackets matching Observatory design */}
              <span className="table-corner table-corner-tl" />
              <span className="table-corner table-corner-tr" />
              <span className="table-corner table-corner-bl" />
              <span className="table-corner table-corner-br" />

              {/* Top Title Bar */}
              <div className="terminal-card-topbar">
                <div className="topbar-title-wrap">
                  <div className="topbar-icon-badge">
                    <svg className="topbar-icon-bolt" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <h3 className="topbar-title">
                    {currentView === 'global'
                      ? 'Current Running Conduits'
                      : (userProfile ? 'Personal Trade Ledger' : 'Live Execution Ledger')}
                  </h3>
                  <span className="topbar-active-pill">
                    {totalCount.toLocaleString()}{' '}
                    {currentView === 'global' ? 'Active' : 'Settled'}
                  </span>
                </div>
                {renderPaginationWidget(false)}
              </div>

              <div className="terminal-header-row">
                <div className="header-cell">Conduit</div>
                <div className="header-cell">Execution Route</div>
                <div className="header-cell">Latency</div>
                <div className="header-cell">Net Yield ($)</div>
                <div className="header-cell">Est. ROI</div>
                <div className="header-cell" style={{ textAlign: 'right', justifyContent: 'flex-end' }}>
                  Inspect
                </div>
              </div>
              <div className="terminal-rows-list">
                {displaySignals.map((signal) => (
                  <SignalRow
                    key={signal.id}
                    signal={signal}
                    isExpanded={expandedSignalId === signal.id}
                    onToggle={handleToggleExpand}
                  />
                ))}
              </div>

              {currentView !== 'global' && totalCount > pageSize && (
                <div className="table-bottom-pagination">
                  {renderPaginationWidget(true)}
                </div>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
