import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { PageHeader } from './ui/PageHeader';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, []); // Empty dependency array to prevent timer reset on every render

    return (
        <div className={`toast-notification toast-${type}`}>
            <span className="toast-icon">{type === 'success' ? '✅' : '❌'}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};

const KarometaLogo = ({ size = 38 }) => (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="karometa-logo" style={{ flexShrink: 0 }}>
        <defs>
            <linearGradient id="admin-k-gold" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF9C3"/>
                <stop offset="0.5" stopColor="#EAB308"/>
                <stop offset="1" stopColor="#A16207"/>
            </linearGradient>
            <radialGradient id="admin-k-ambient" cx="50%" cy="50%" r="50%">
                <stop stopColor="#EAB308" stopOpacity="0.3"/>
                <stop offset="1" stopColor="#EAB308" stopOpacity="0"/>
            </radialGradient>
            <filter id="admin-k-ring-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur1"/>
                <feFlood floodColor="#FFDF00" floodOpacity="0.9" result="color1"/>
                <feComposite in="color1" in2="blur1" operator="in" result="glow1"/>
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur2"/>
                <feFlood floodColor="#D9A84E" floodOpacity="0.6" result="color2"/>
                <feComposite in="color2" in2="blur2" operator="in" result="glow2"/>
                <feMerge>
                    <feMergeNode in="glow2"/>
                    <feMergeNode in="glow1"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="admin-k-outer-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feFlood floodColor="#EAB308" floodOpacity="0.45" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                    <feMergeNode in="glow"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <circle cx="19" cy="19" r="16" fill="url(#admin-k-ambient)" className="logo-ambient"/>
        <circle cx="19" cy="19" r="15" stroke="#EAB308" strokeWidth="3" fill="none" strokeDasharray="3 8.8" opacity="0.15" className="logo-segment-ring"/>
        <circle cx="19" cy="19" r="15" stroke="#FFDF00" strokeWidth="1.8" fill="none" strokeDasharray="3 8.8" filter="url(#admin-k-ring-glow)" className="logo-segment-ring"/>
        <g filter="url(#admin-k-outer-glow)" className="logo-k">
            <path d="M14 11L14 27" stroke="url(#admin-k-gold)" strokeWidth="2.8" strokeLinecap="round"/>
            <path d="M14.5 19L23 11" stroke="url(#admin-k-gold)" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M14.5 19L23 27" stroke="url(#admin-k-gold)" strokeWidth="2.4" strokeLinecap="round"/>
        </g>
    </svg>
);

const IconDashboard = () => (
    <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5"/>
        <rect x="14" y="3" width="7" height="5" rx="1.5"/>
        <rect x="14" y="12" width="7" height="9" rx="1.5"/>
        <rect x="3" y="16" width="7" height="5" rx="1.5"/>
    </svg>
);

const IconAmount = () => (
    <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.25"/>
        <path d="M12 8v8M9.6 10.2c.5-1 1.6-1.6 2.6-1.6 1.3 0 2.3.7 2.3 1.8 0 2.5-5 1.2-5 3.6 0 1.1 1 1.8 2.7 1.8 1.2 0 2.2-.5 2.7-1.4"/>
    </svg>
);

const IconChart = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>
    </svg>
);

const NAV_SECTIONS = [
    {
        id: 'overview',
        label: 'Overview',
        items: [{ id: 'dashboard', label: 'Dashboard', icon: IconDashboard }],
    },
    {
        id: 'operations',
        label: 'Operations',
        items: [{ id: 'amount', label: 'Amount', icon: IconAmount }],
    },
];

const SKELETON_METRICS = [
    { label: 'Signals today', hint: 'Live count' },
    { label: 'Avg. ROI', hint: 'Rolling 24h' },
    { label: 'Packages', hint: 'Configured' },
    { label: 'Last sync', hint: 'UTC' },
];

export default function AdminPanel() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('adminLoggedIn') === 'true');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [percentage, setPercentage] = useState('');
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // Live Admin Data from Backend
    const [adminHistory, setAdminHistory] = useState([]);
    const [adminStats, setAdminStats] = useState({
        activePercentage: 3,
        latestAmount: 0,
        calculatedResult: 0,
        latestDate: null,
        activeSessions: 0,
        totalPackages: 0,
        totalVolume: 0
    });

    const parsedAmount = parseFloat(amount);
    const parsedPct = parseFloat(percentage);
    const calculatedResult = (Number.isFinite(parsedAmount) ? parsedAmount : 0) * ((Number.isFinite(parsedPct) ? parsedPct : 0) / 100);

    const loadAdminData = async () => {
        try {
            const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
            const [historyRes, statsRes] = await Promise.all([
                fetch(`${protocol}//${window.location.host}/api/admin/history`),
                fetch(`${protocol}//${window.location.host}/api/admin/stats`)
            ]);
            const historyData = await historyRes.json();
            const statsData = await statsRes.json();
            if (historyData.success) setAdminHistory(historyData.submissions || []);
            if (statsData.success) setAdminStats(statsData.stats);
        } catch (err) {
            console.error('Error loading admin data:', err);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            loadAdminData();
        }
    }, [isLoggedIn]);

    const amountErrors = {
        date: !date ? 'Date is required' : '',
        amount: amount === '' ? 'Amount is required' : (!Number.isFinite(parsedAmount) || parsedAmount <= 0) ? 'Enter a valid amount greater than 0' : '',
        percentage: percentage === '' ? 'Percentage is required' : (!Number.isFinite(parsedPct)) ? 'Enter a valid percentage' : '',
    };
    const showError = (field) => (touched[field] || submitted) ? amountErrors[field] : '';
    const formValid = !amountErrors.date && !amountErrors.amount && !amountErrors.percentage;

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);
        await new Promise(r => setTimeout(r, 450));
        if (username === 'admin' && password === 'admin123') {
            setIsLoggedIn(true);
            localStorage.setItem('adminLoggedIn', 'true');
            setToast({ message: 'Logged in as Admin', type: 'success' });
        } else {
            setAuthError('Invalid credentials');
            setToast({ message: 'Invalid credentials', type: 'error' });
        }
        setAuthLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!formValid) {
            setToast({ message: 'Please fix the highlighted fields', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
            const apiUrl = `${protocol}//${window.location.host}/api/admin/save-data`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    amount: parsedAmount,
                    percentage: parsedPct,
                    calculatedResult,
                }),
            });
            const data = await response.json();

            if (data.success) {
                setToast({ message: `Saved to DB! Active Target: +${parsedPct}%`, type: 'success' });
                setDate('');
                setAmount('');
                setPercentage('');
                setTouched({});
                setSubmitted(false);
                loadAdminData(); // Refresh history and live stats immediately
            } else {
                setToast({ message: data.message || 'Failed to save', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setToast({ message: 'Server error', type: 'error' });
        }
        setLoading(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="admin-login-shell">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <div className="admin-login-grid" aria-hidden="true" />
                <Card accent className="admin-login-card page-enter">
                    <div className="admin-login-brand">
                        <KarometaLogo size={44} />
                        <p className="ui-section-label">KAROMETA</p>
                        <h1 className="admin-login-title">Admin Portal</h1>
                        <p className="admin-login-sub">Sign in to configure packages and monitor operations.</p>
                    </div>
                    <div className="ui-divider" />
                    <form onSubmit={handleLogin} className="ui-form">
                        <Input
                            label="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            error={authError}
                            required
                        />
                        <Button type="submit" variant="primary" fullWidth loading={authLoading}>
                            Authenticate
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className={`admin-layout ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <KarometaLogo size={32} />
                    {!sidebarCollapsed && (
                        <div>
                            <div className="admin-sidebar-title">KAROMETA</div>
                            <div className="admin-sidebar-kicker">Admin</div>
                        </div>
                    )}
                </div>

                <nav className="admin-nav-list">
                    {NAV_SECTIONS.map(section => (
                        <div key={section.id} className="admin-nav-section">
                            {!sidebarCollapsed && <div className="ui-section-label admin-nav-section-label">{section.label}</div>}
                            {section.items.map(item => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        title={sidebarCollapsed ? item.label : undefined}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                                    >
                                        <Icon />
                                        {!sidebarCollapsed && item.label}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    {!sidebarCollapsed && (
                        <div className="admin-user-row">
                            <div className="admin-user-avatar">A</div>
                            <div className="admin-user-info">
                                <span className="admin-user-name">Admin</span>
                                <span className="admin-user-role">Operator</span>
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        className="admin-collapse-btn"
                        onClick={() => setSidebarCollapsed(v => !v)}
                        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                            {sidebarCollapsed ? <path d="M9 6l6 6-6 6"/> : <path d="M15 6l-6 6 6 6"/>}
                        </svg>
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <div className="admin-content-inner page-enter" key={activeTab}>
                    {activeTab === 'dashboard' && (
                        <>
                            <PageHeader
                                title="Dashboard"
                                subtitle="Live system & profit rate overview"
                                breadcrumbs={['Admin', 'Dashboard']}
                            />

                            <div className="admin-metric-grid">
                                <Card className="admin-metric-card">
                                    <p className="ui-section-label">Configured Profit Rate</p>
                                    <div style={{ fontSize: '1.85rem', fontWeight: '700', color: '#4ADE80', margin: '8px 0' }}>
                                        +{adminStats.activePercentage.toFixed(2)}%
                                    </div>
                                    <p className="admin-metric-hint">Current active user profit target</p>
                                </Card>

                                <Card className="admin-metric-card">
                                    <p className="ui-section-label">Reference Amount</p>
                                    <div style={{ fontSize: '1.85rem', fontWeight: '700', color: '#FDE047', margin: '8px 0' }}>
                                        ${adminStats.latestAmount ? adminStats.latestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                    </div>
                                    <p className="admin-metric-hint">Latest configured admin base</p>
                                </Card>

                                <Card className="admin-metric-card">
                                    <p className="ui-section-label">Active Auto-Trades</p>
                                    <div style={{ fontSize: '1.85rem', fontWeight: '700', color: '#60A5FA', margin: '8px 0' }}>
                                        {adminStats.activeSessions}
                                    </div>
                                    <p className="admin-metric-hint">Running 24h trading sessions</p>
                                </Card>

                                <Card className="admin-metric-card">
                                    <p className="ui-section-label">Purchased Packages</p>
                                    <div style={{ fontSize: '1.85rem', fontWeight: '700', color: '#C084FC', margin: '8px 0' }}>
                                        {adminStats.totalPackages}
                                    </div>
                                    <p className="admin-metric-hint">${adminStats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total volume</p>
                                </Card>
                            </div>

                            <Card className="admin-empty-card" style={{ marginTop: '24px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', margin: 0 }}>Active Trading Engine Configuration</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                                            When users authenticate and start trading, their target profit is calculated using these active parameters.
                                        </p>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '20px', 
                                        background: 'rgba(74, 222, 128, 0.15)', 
                                        border: '1px solid rgba(74, 222, 128, 0.4)', 
                                        color: '#4ADE80', 
                                        fontSize: '0.8rem', 
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}></span>
                                        ACTIVE IN POSTGRESQL
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Profit %</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#4ADE80', marginTop: '4px' }}>+{adminStats.activePercentage}%</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reference Amount</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff', marginTop: '4px' }}>${adminStats.latestAmount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reference Profit</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#FDE047', marginTop: '4px' }}>${adminStats.calculatedResult.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Configured Date</div>
                                        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#ddd', marginTop: '8px' }}>
                                            {adminStats.latestDate ? new Date(adminStats.latestDate).toLocaleDateString() : 'Default (3%)'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                    <Button variant="primary" onClick={() => setActiveTab('amount')}>
                                        Update Profit Rate / Amount
                                    </Button>
                                    <Button variant="ghost" onClick={loadAdminData}>
                                        ⟳ Refresh DB Data
                                    </Button>
                                </div>
                            </Card>
                        </>
                    )}

                    {activeTab === 'amount' && (
                        <>
                            <PageHeader
                                title="Amount Configuration"
                                subtitle="Enter and save new package data to PostgreSQL"
                                breadcrumbs={['Admin', 'Amount']}
                            />

                            <Card accent>
                                <form onSubmit={handleSubmit} className="ui-form">
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
                                        <div style={{ flex: '1 1 120px' }}>
                                            <Input
                                                label="Date"
                                                type="date"
                                                value={date}
                                                onChange={e => setDate(e.target.value)}
                                                onBlur={() => setTouched(t => ({ ...t, date: true }))}
                                                error={showError('date')}
                                            />
                                        </div>
                                        <div style={{ flex: '1 1 120px' }}>
                                            <Input
                                                label="Amount"
                                                type="number"
                                                step="0.01"
                                                numeric
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                onBlur={() => setTouched(t => ({ ...t, amount: true }))}
                                                error={showError('amount')}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div style={{ flex: '1 1 120px' }}>
                                            <Input
                                                label="Percentage (%)"
                                                type="number"
                                                step="0.01"
                                                numeric
                                                value={percentage}
                                                onChange={e => setPercentage(e.target.value)}
                                                onBlur={() => setTouched(t => ({ ...t, percentage: true }))}
                                                error={showError('percentage')}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '32px', fontSize: '1.5rem', fontWeight: '600' }}>
                                            =
                                        </div>
                                        <div style={{ flex: '1 1 180px' }}>
                                            <Input
                                                label="Calculated Result"
                                                value={calculatedResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                readOnly
                                                hint="Amount × Percentage — read-only output"
                                                style={{ 
                                                    color: '#FDE047', 
                                                    fontWeight: '700',
                                                    fontSize: '1.2rem',
                                                    letterSpacing: '1px'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" variant="primary" fullWidth loading={loading} disabled={!formValid}>
                                        {loading ? 'Saving to Database…' : 'Submit Data & Apply Profit Rate'}
                                    </Button>
                                </form>
                            </Card>

                            {/* SAVED CONFIGURATIONS HISTORY TABLE */}
                            <Card style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#fff', margin: 0 }}>Saved Database Configurations</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                                            Historical configurations saved in table <code>admin_submissions</code>
                                        </p>
                                    </div>
                                    <Button variant="ghost" onClick={loadAdminData} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                                        ⟳ Refresh
                                    </Button>
                                </div>

                                {adminHistory.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                                        No configurations saved in database yet. Submit the form above to record your first entry.
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                                    <th style={{ padding: '12px 16px' }}>ID</th>
                                                    <th style={{ padding: '12px 16px' }}>Date</th>
                                                    <th style={{ padding: '12px 16px' }}>Amount</th>
                                                    <th style={{ padding: '12px 16px' }}>Target Profit (%)</th>
                                                    <th style={{ padding: '12px 16px' }}>Calculated Profit</th>
                                                    <th style={{ padding: '12px 16px' }}>Submitted At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {adminHistory.map((row, idx) => (
                                                    <tr key={row.id} style={{ 
                                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                        background: idx === 0 ? 'rgba(234, 179, 8, 0.06)' : 'transparent'
                                                    }}>
                                                        <td style={{ padding: '12px 16px', color: '#888' }}>
                                                            #{row.id} {idx === 0 && <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80', marginLeft: '6px' }}>ACTIVE</span>}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: '500' }}>
                                                            {new Date(row.date_time).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#FDE047', fontFamily: 'monospace' }}>
                                                            ${parseFloat(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#4ADE80', fontWeight: '600' }}>
                                                            +{parseFloat(row.percentage)}%
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#fff', fontFamily: 'monospace' }}>
                                                            ${parseFloat(row.calculated_result).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#888', fontSize: '0.8rem' }}>
                                                            {new Date(row.created_at).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
