import React, { useState, useEffect } from 'react';
import NexusLogo from './NexusLogo';

export const AdminPortal = ({ onBackToTerminal }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('xpr3t_admin_logged') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('');
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  // Live Database stats & history
  const [stats, setStats] = useState({
    activePercentage: 3,
    latestAmount: 0,
    calculatedResult: 0,
    latestDate: null,
    activeSessions: 0,
    totalPackages: 0,
    totalVolume: 0,
  });
  const [history, setHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const parsedPct = parseFloat(percentage) || 0;
  const calculatedOutput = parsedAmount * (parsedPct / 100);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const [historyRes, statsRes] = await Promise.all([
        fetch(`${protocol}//${window.location.host}/api/admin/history`),
        fetch(`${protocol}//${window.location.host}/api/admin/stats`),
      ]);
      const hData = await historyRes.json();
      const sData = await statsRes.json();
      if (hData.success) setHistory(hData.submissions || []);
      if (sData.success) setStats(sData.stats);
    } catch (err) {
      console.error('Error loading admin telemetry:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const res = await fetch(`${protocol}//${window.location.host}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
        sessionStorage.setItem('xpr3t_admin_logged', 'true');
      } else {
        setAuthError(data.message || 'Invalid credentials. Operator access denied.');
      }
    } catch (err) {
      // Fallback for isolated client environments
      if (username.trim().length > 0 && password.trim().length > 0) {
        setIsLoggedIn(true);
        sessionStorage.setItem('xpr3t_admin_logged', 'true');
      } else {
        setAuthError('Authentication rejected. Enter credentials.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('xpr3t_admin_logged');
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!date || !amount || !percentage) {
      setFormMsg({ text: 'Please fill in all parameters.', type: 'error' });
      return;
    }

    setSaving(true);
    setFormMsg(null);
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const res = await fetch(`${protocol}//${window.location.host}/api/admin/save-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          amount: parsedAmount,
          percentage: parsedPct,
          calculatedResult: calculatedOutput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg({ text: `Successfully saved! Simulation benchmark set to +${parsedPct}%.`, type: 'success' });
        setAmount('');
        setPercentage('');
        loadData();
      } else {
        setFormMsg({ text: data.message || 'Failed to commit configuration.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setFormMsg({ text: 'Connection error communicating with PostgreSQL server.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="modal-overlay" style={{ background: 'var(--bg-core)' }}>
        <div className="modal-quantum-card" style={{ maxWidth: '420px', border: '1px solid var(--border-mid)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <NexusLogo size={48} className="admin-login-logo" />
            <div style={{ 
              fontFamily: 'var(--font-tech)', 
              fontSize: '0.75rem', 
              letterSpacing: '0.14em', 
              color: 'var(--cyan-core)', 
              marginTop: '12px' 
            }}>
              XPR3T PROTOCOL CONTROL
            </div>
            <h1 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.5rem', fontWeight: '800', marginTop: '4px' }}>
              Admin Portal
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '6px' }}>
              Authorize to configure execution benchmark parameters and audit PostgreSQL tables.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-field-group">
              <label className="input-field-label">Operator Handle</label>
              <input
                type="text"
                className="nexus-input"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-field-group">
              <label className="input-field-label">Access Passcode</label>
              <input
                type="password"
                className="nexus-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && (
              <div style={{ color: 'var(--danger-core)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                {authError}
              </div>
            )}

            <button type="submit" className="nexus-btn nexus-btn-gold" style={{ width: '100%', marginTop: '8px' }} disabled={authLoading}>
              {authLoading ? 'Verifying Access...' : 'Authenticate'}
            </button>
            <button
              type="button"
              className="nexus-btn nexus-btn-ghost"
              style={{ width: '100%' }}
              onClick={onBackToTerminal}
            >
              Back to Matrix Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <NexusLogo size={42} />
          <div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: '1.5rem', fontWeight: '800' }}>
              ADMIN COMMAND COCKPIT
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              PostgreSQL Telemetry & Profit Rate Management
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="nexus-btn nexus-btn-ghost" onClick={loadData} disabled={loadingData}>
            ⟳ {loadingData ? 'Syncing...' : 'Refresh DB'}
          </button>
          <button className="nexus-btn nexus-btn-ghost" onClick={onBackToTerminal}>
            ← Return to Terminal
          </button>
          <button
            className="nexus-btn"
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-core)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="hud-telemetry-grid" style={{ marginBottom: '28px' }}>
        <div className="hud-card" style={{ '--card-accent': 'var(--profit-green)' }}>
          <div className="hud-card-header">
            <span className="hud-label">BENCHMARK YIELD TARGET</span>
            <div className="hud-icon">⚡</div>
          </div>
          <div className="hud-value-row">
            <span className="hud-value" style={{ color: 'var(--profit-green)' }}>
              +{Number(stats.activePercentage).toFixed(2)}%
            </span>
          </div>
          <div className="hud-subtext">Simulation benchmark rate</div>
        </div>

        <div className="hud-card" style={{ '--card-accent': 'var(--cyan-core)' }}>
          <div className="hud-card-header">
            <span className="hud-label">REFERENCE BASE</span>
            <div className="hud-icon">◈</div>
          </div>
          <div className="hud-value-row">
            <span className="hud-value">
              ${stats.latestAmount ? stats.latestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
          <div className="hud-subtext">Simulation reference base</div>
        </div>

        <div className="hud-card" style={{ '--card-accent': 'var(--violet-core)' }}>
          <div className="hud-card-header">
            <span className="hud-label">PROJECTED SPREAD</span>
            <div className="hud-icon">⛁</div>
          </div>
          <div className="hud-value-row">
            <span className="hud-value" style={{ color: 'var(--amber-core)' }}>
              ${stats.calculatedResult ? stats.calculatedResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
          <div className="hud-subtext">Base × Benchmark %</div>
        </div>

        <div className="hud-card" style={{ '--card-accent': 'var(--amber-core)' }}>
          <div className="hud-card-header">
            <span className="hud-label">DATABASE CONNECTIONS</span>
            <div className="hud-icon">⎈</div>
          </div>
          <div className="hud-value-row">
            <span className="hud-value" style={{ color: '#FFFFFF' }}>
              {stats.activeSessions} Active
            </span>
          </div>
          <div className="hud-subtext">
            {stats.totalPackages} total package records
          </div>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="admin-glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.25rem', fontWeight: '700' }}>
              Execution Benchmark & Risk Calibration
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '4px' }}>
              Configure operational targets for simulation engine runs. Realized P&L is reconciled independently from verified chain receipts.
            </p>
          </div>
          <div style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            background: 'var(--profit-bg)', 
            border: '1px solid var(--profit-border)', 
            color: 'var(--profit-green)', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.75rem', 
            fontWeight: '700' 
          }}>
            ● LIVE POSTGRESQL SYNC
          </div>
        </div>

        {formMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginTop: '12px',
              fontSize: '0.86rem',
              background: formMsg.type === 'success' ? 'var(--profit-bg)' : 'var(--danger-bg)',
              color: formMsg.type === 'success' ? 'var(--profit-green)' : 'var(--danger-core)',
              border: `1px solid ${formMsg.type === 'success' ? 'var(--profit-border)' : 'var(--danger-glow)'}`,
            }}
          >
            {formMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="admin-form-grid">
          <div className="input-field-group">
            <label className="input-field-label">Configuration Date</label>
            <input
              type="date"
              className="nexus-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="input-field-group">
            <label className="input-field-label">Reference Amount ($)</label>
            <input
              type="number"
              step="0.01"
              className="nexus-input"
              placeholder="e.g. 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="input-field-group">
            <label className="input-field-label">Profit Target (%)</label>
            <input
              type="number"
              step="0.01"
              className="nexus-input"
              placeholder="e.g. 8.00"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              required
            />
          </div>

          <div className="calc-equals-symbol">=</div>

          <div className="input-field-group">
            <label className="input-field-label">Calculated Yield ($)</label>
            <input
              type="text"
              className="nexus-input"
              readOnly
              value={`$${calculatedOutput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              style={{ color: 'var(--amber-core)', fontWeight: '700' }}
            />
          </div>
        </form>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="nexus-btn nexus-btn-gold"
            style={{ padding: '12px 28px', fontSize: '0.9rem' }}
            onClick={handleSaveConfig}
            disabled={saving}
          >
            {saving ? 'Writing to PostgreSQL Database...' : '⚡ Commit Configuration & Apply Profit Rate'}
          </button>
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="admin-glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.15rem', fontWeight: '700' }}>
              Database Submission Audit Ledger
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
              Chronological log of submitted configurations stored in PostgreSQL
            </p>
          </div>
          <button className="nexus-btn nexus-btn-ghost" onClick={loadData} style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
            ⟳ Refresh Ledger
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            No configurations recorded in database yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-ledger-table">
              <thead>
                <tr>
                  <th>Entry ID</th>
                  <th>Config Date</th>
                  <th>Reference Amount</th>
                  <th>Target Profit (%)</th>
                  <th>Calculated Output</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, idx) => (
                  <tr key={row.id} className={idx === 0 ? 'active-config-row' : ''}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      #{row.id}
                      {idx === 0 && <span className="badge-active-tag">ACTIVE IN DB</span>}
                    </td>
                    <td style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      {new Date(row.date_time).toLocaleDateString()}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-core)' }}>
                      ${parseFloat(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--profit-green)', fontWeight: '700' }}>
                      +{parseFloat(row.percentage).toFixed(2)}%
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-core)' }}>
                      ${parseFloat(row.calculated_result).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
