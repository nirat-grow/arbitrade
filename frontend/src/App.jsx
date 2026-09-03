import React, { useState, useEffect } from 'react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
    const [userId, setUserId] = useState('');
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Start Auto-Trade</h2>
                <p>Enter your User ID to authenticate and begin the 24-hour smart trading session.</p>
                <input 
                    type="text" 
                    placeholder="e.g. user_12345" 
                    value={userId} 
                    onChange={e => setUserId(e.target.value)}
                    autoFocus
                />
                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="start-trade-btn" onClick={() => onLogin(userId)}>Authenticate</button>
                </div>
            </div>
        </div>
    );
};

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast-notification toast-${type}`}>
            <span className="toast-icon">{type === 'success' ? '✅' : '❌'}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};

const useCountdownTimer = (endTime, onExpire) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!endTime) return;
        
        const updateTimer = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance <= 0) {
                setTimeLeft('00:00:00');
                if (onExpire) onExpire();
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTime, onExpire]);

    return timeLeft;
};

const KarometaLogo = () => (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="karometa-logo" style={{ marginRight: '10px', flexShrink: 0 }}>
        <defs>
            <linearGradient id="k-gold" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF9C3"/>
                <stop offset="0.5" stopColor="#EAB308"/>
                <stop offset="1" stopColor="#A16207"/>
            </linearGradient>
            <radialGradient id="k-ambient" cx="50%" cy="50%" r="50%">
                <stop stopColor="#EAB308" stopOpacity="0.3"/>
                <stop offset="1" stopColor="#EAB308" stopOpacity="0"/>
            </radialGradient>
            <filter id="k-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <filter id="k-ring-glow" x="-50%" y="-50%" width="200%" height="200%">
                {/* Tight bright yellow glow (Scanner match) */}
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur1"/>
                <feFlood floodColor="#FFDF00" floodOpacity="0.9" result="color1"/>
                <feComposite in="color1" in2="blur1" operator="in" result="glow1"/>
                
                {/* Wider gold glow */}
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur2"/>
                <feFlood floodColor="#D9A84E" floodOpacity="0.6" result="color2"/>
                <feComposite in="color2" in2="blur2" operator="in" result="glow2"/>
                
                <feMerge>
                    <feMergeNode in="glow2"/>
                    <feMergeNode in="glow1"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="k-outer-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feFlood floodColor="#EAB308" floodOpacity="0.45" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                    <feMergeNode in="glow"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Ambient background glow */}
        <circle cx="19" cy="19" r="16" fill="url(#k-ambient)" className="logo-ambient"/>

        {/* Glow layer behind segments */}
        <circle cx="19" cy="19" r="15" stroke="#EAB308" strokeWidth="3" fill="none" strokeDasharray="3 8.8" opacity="0.15" className="logo-segment-ring"/>

        {/* Segmented block ring - small dashes forming full circle */}
        <circle cx="19" cy="19" r="15" stroke="#FFDF00" strokeWidth="1.8" fill="none" strokeDasharray="3 8.8" filter="url(#k-ring-glow)" className="logo-segment-ring"/>

        {/* Bold K lettermark with strong glow */}
        <g filter="url(#k-outer-glow)" className="logo-k">
            <path d="M14 11L14 27" stroke="url(#k-gold)" strokeWidth="2.8" strokeLinecap="round"/>
            <path d="M14.5 19L23 11" stroke="url(#k-gold)" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M14.5 19L23 27" stroke="url(#k-gold)" strokeWidth="2.4" strokeLinecap="round"/>
        </g>
    </svg>
);

const Navbar = ({ onOpenLogin, userProfile, currentView, onViewToggle, isReadOnlyProfile, onStartTrade }) => (
    <nav className="navbar">
        <div className="navbar-content">
            <div className="nav-left">
                <div className="logo-container">
                    <KarometaLogo />
                    KAROMETA
                </div>
                <div className="nav-links">
                    <a href="#" className="active">Scanner</a>
                    <a href="#">Watchlist <span>8</span></a>
                    <a href="#">Activity</a>
                </div>
            </div>
            <div className="nav-right">
                {userProfile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {!isReadOnlyProfile && (
                            <div className="view-toggle-group">
                                <button className={`toggle-btn ${currentView === 'global' ? 'active' : ''}`} onClick={() => onViewToggle('global')}>Global Feed</button>
                                <button className={`toggle-btn ${currentView === 'personal' ? 'active' : ''}`} onClick={() => onViewToggle('personal')}>My Trades</button>
                            </div>
                        )}
                        <div className="profile-badge">
                            <div className="user-pill">
                                <span className="profile-id">👤 {userProfile.userId}</span>
                                <span className="profile-bal">Balance: <strong style={{color: '#FFF'}}>${userProfile.balance.toFixed(2)}</strong></span>
                                {userProfile.sessionActive ? (
                                    <span className="profile-profit premium-badge">Profit: ${userProfile.currentProfit.toFixed(2)}</span>
                                ) : (
                                    <button className="start-trade-btn" style={{ marginLeft: '4px', padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onStartTrade(userProfile.userId)}>▶ Start 24h Trade</button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <button className="start-trade-btn" onClick={onOpenLogin}>Start Trade</button>
                )}
                <div className="status-pill">
                    <div className="live-feed-indicator">
                        <div className="live-dot"></div>
                        Live feed
                    </div>
                    <div className="status-divider"></div>
                    <div className="bell-icon">🔔</div>
                </div>
            </div>
        </div>
    </nav>
);

const Header = ({ syncTime, currentView, userProfile }) => {
    const formattedTime = syncTime.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' });
    const sessionTimeLeft = useCountdownTimer(userProfile?.sessionActive ? userProfile.endTime : null);
    
    if (currentView === 'personal') {
        return (
            <div className="header-section">
                <div className="header-title-area">
                    <div className="observatory-label">— PERSONAL DASHBOARD / ACTIVE</div>
                    <h1 className="main-heading">
                        <div className="heading-line1">Auto-Trade</div>
                        <div className="heading-line2">activity log</div>
                    </h1>
                    <p className="sub-heading">Real-time specific trades executed for {userProfile?.userId}.</p>
                </div>
                <div className="sync-area">
                    <div className="sync-label" style={{ color: userProfile?.sessionActive ? '#EAB308' : '#888' }}>
                        {userProfile?.sessionActive ? "SESSION ENDS IN" : "NO ACTIVE SESSION"}
                    </div>
                    <div className="sync-time" style={{ color: userProfile?.sessionActive ? '#EAB308' : '#fff' }}>
                        {userProfile?.sessionActive ? sessionTimeLeft : "00:00:00"}
                    </div>
                    <div className="sync-block">UTC - block 19,842,106</div>
                </div>
            </div>
        );
    }

    return (
        <div className="header-section">
            <div className="header-title-area">
                <div className="observatory-label">— OBSERVATORY / 04</div>
                <h1 className="main-heading">
                    <div className="heading-line1">Arbitrage</div>
                    <div className="heading-line2">signal array</div>
                </h1>
                <p className="sub-heading">Cross-venue price intelligence for fast, disciplined execution.</p>
            </div>
            <div className="sync-area">
                <div className="sync-label">LAST SYNC</div>
                <div className="sync-time">{formattedTime}</div>
                <div className="sync-block">UTC - block 19,842,106</div>
            </div>
        </div>
    );
};

const SignalEqualizer = ({ segmentsCount = 11 }) => {
    // Generate an array of segments with varying sizes for the scanner
    const segments = [...Array(segmentsCount)].map((_, i) => {
        const delay = i * 0.15; // Smooth sequential delay left to right
        const baseFlex = 2 + Math.random() * 2; // Only large blocks of slightly different widths
        return { id: i, delay, baseFlex };
    });

    return (
        <div className="signal-bar-container">
            <div className="signal-bar-label">
                <div className="signal-bar-dot"></div>
                SCANNER SIGNAL STRENGTH
            </div>
            <div className="equalizer-segments">
                {segments.map((seg) => (
                    <div 
                        key={seg.id} 
                        className="eq-segment scan-pulse" 
                        style={{ 
                            flex: seg.baseFlex,
                            animationDelay: `${seg.delay}s`
                        }}
                    ></div>
                ))}
            </div>
            <div className="signal-bar-value">
                87.4% <span className="signal-bar-status">stable array</span>
            </div>
        </div>
    );
};

const useCountUp = (endValueStr, duration, isExpanded, delay = 250) => {
    const [displayValue, setDisplayValue] = useState('0' + (endValueStr.includes('.') ? '.'.padEnd(endValueStr.split('.')[1]?.length + 2, '0') : ''));
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (!isExpanded) {
            let resetZero = '0';
            if (endValueStr.includes('.')) {
                resetZero = '0.' + '0'.repeat(endValueStr.split('.')[1].length);
            }
            if (endValueStr.includes('$')) resetZero = '$' + resetZero;
            if (endValueStr.includes('%')) resetZero = resetZero + '%';
            if (endValueStr.startsWith('-')) resetZero = '-' + resetZero;
            
            setDisplayValue(resetZero);
            setHasAnimated(false);
            return;
        }
        
        if (hasAnimated) {
            setDisplayValue(endValueStr);
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setDisplayValue(endValueStr);
            setHasAnimated(true);
            return;
        }

        let isNegative = endValueStr.startsWith('-');
        let isCurrency = endValueStr.includes('$');
        let isPercentage = endValueStr.includes('%');
        let rawStr = endValueStr.replace(/[-$%]/g, '');
        let targetNum = parseFloat(rawStr);
        if (isNaN(targetNum)) {
            setDisplayValue(endValueStr);
            setHasAnimated(true);
            return;
        }

        let decimalPlaces = 0;
        if (rawStr.includes('.')) {
            decimalPlaces = rawStr.split('.')[1].length;
        }

        let startTime = null;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - percentage, 3);
            const currentNum = targetNum * easeOut;

            let formatted = currentNum.toFixed(decimalPlaces);
            if (isCurrency) formatted = '$' + formatted;
            if (isNegative) formatted = '-' + formatted;
            if (isPercentage) formatted = formatted + '%';

            setDisplayValue(formatted);

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValueStr);
                setHasAnimated(true);
            }
        };

        const delayTimeout = setTimeout(() => {
            animationFrame = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(delayTimeout);
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [endValueStr, duration, isExpanded, hasAnimated]);

    if (!isExpanded && displayValue !== endValueStr && !displayValue.startsWith('0') && !displayValue.startsWith('-0') && !displayValue.startsWith('$0')) {
         return endValueStr; 
    }

    return displayValue;
};

const AnimatedCalcItem = ({ label, valueStr, valueColorClass, isExpanded, isNetRow = false }) => {
    const animatedValue = useCountUp(valueStr, 500, isExpanded, 50); // Start soon after panel fade
    
    if (isNetRow) {
        return (
            <div className="calc-item net-row">
                <span className="c-label">{label}</span>
                <span className={`c-val net-val tabular-nums ${valueStr?.startsWith('-') ? 'danger-text' : 'success-text'}`}>
                    {animatedValue}
                </span>
            </div>
        );
    }

    return (
        <div className="calc-item">
            <span className="c-label">{label}</span>
            <span className={`c-val ${valueColorClass} tabular-nums`}>{animatedValue}</span>
        </div>
    );
};

const CopyableAddress = ({ address }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <span className={`a-val copyable ${copied ? 'is-copied' : ''}`} onClick={handleCopy} title="Copy to clipboard">
            {address} <span className="copy-icon">{copied ? '✓ Copied' : '⎘'}</span>
        </span>
    );
};

const CircleChart = ({ score, isExpanded }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className={`circle-chart-container ${isExpanded ? 'animate' : ''}`}>
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle className="circle-bg" cx="50" cy="50" r={radius} />
                <circle 
                    className="circle-progress" 
                    cx="50" cy="50" r={radius} 
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: isExpanded ? strokeDashoffset : circumference,
                    }} 
                />
            </svg>
            <div className="circle-text">
                <div className="circle-score tabular-nums">{useCountUp(`${score}%`, 1200, isExpanded, 200)}</div>
                <div className="circle-label">MATCH</div>
            </div>
        </div>
    );
};

const FlashValue = ({ value, className, style }) => {
    const [flash, setFlash] = useState(false);
    const [prevValue, setPrevValue] = useState(value);

    useEffect(() => {
        if (value !== prevValue) {
            setFlash(true);
            setPrevValue(value);
            const timer = setTimeout(() => setFlash(false), 500);
            return () => clearTimeout(timer);
        }
    }, [value, prevValue]);

    return (
        <span className={`${className} mono-num flash-value ${flash ? 'is-flashing' : ''}`} style={style}>
            {value}
        </span>
    );
};

const SignalRow = ({ data, isExpanded, onToggle }) => {
    // Prevent crash if backend still sending old data format
    if (!data.calculation) return null;

    return (
        <div className={`table-row-container ${isExpanded ? 'expanded' : ''}`}>
            {/* The always-visible summary row */}
            <div className="table-row-summary" onClick={onToggle}>
                <div className="t-col col-network">
                    <div className="network-name">
                        <span className="net-dot"></span> {data.network.toUpperCase()}
                    </div>
                </div>
                <div className="t-col col-route">
                    <div className="new-route-title" style={{fontSize: '0.9rem', marginBottom: '6px'}}>
                        <span className="icon-chip" style={{fontSize: '1rem'}}>🖧</span> 
                        {data.routePath.map((node, i) => (
                            <React.Fragment key={i}>
                                <span className="route-coin">{node}</span>
                                {i < data.routePath.length - 1 && <span className="route-arrow">→</span>}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className={`type-badge badge-${data.type.toLowerCase().replace(/\s+/g, '-')}`}>{data.type.toUpperCase()}</div>
                </div>
                <div className="t-col col-time">
                    <div className="timer-badge" style={{width: 'max-content'}}>
                        <span className="timer-icon">🕒</span> {data.timeLabel}
                    </div>
                </div>
                <div className="t-col col-net">
                    {data.profitAmount !== undefined ? (
                        <FlashValue 
                            className={`c-val ${data.profitAmount < 0 ? 'danger-text' : 'success-text'}`} 
                            style={{fontSize: '1.1rem'}}
                            value={data.profitAmount < 0 ? `-$${Math.abs(data.profitAmount).toFixed(6)}` : `+$${data.profitAmount.toFixed(6)}`} 
                        />
                    ) : (
                        <FlashValue 
                            className={`c-val ${data.calculation.net?.startsWith('-') ? 'danger-text' : 'success-text'}`} 
                            style={{fontSize: '1.1rem'}}
                            value={data.calculation.net} 
                        />
                    )}
                </div>
                <div className="t-col col-roi">
                    <div className="roi-wrapper">
                        {(() => {
                            const roiVal = parseFloat(data.calculation.roi);
                            const absRoi = Math.abs(roiVal);
                            const h1 = Math.min(6, Math.max(2, absRoi * 2));
                            const h2 = Math.min(10, Math.max(4, absRoi * 4));
                            const h3 = Math.min(14, Math.max(6, absRoi * 6));
                            const h4 = Math.min(18, Math.max(8, absRoi * 8));
                            const colorClass = roiVal < 0 ? 'danger-text' : 'success-text';
                            return (
                                <div className="mini-chart">
                                    <div className="mc-bar" style={{height: `${h1}px`}}></div>
                                    <div className="mc-bar" style={{height: `${h2}px`}}></div>
                                    <div className="mc-bar" style={{height: `${h3}px`}}></div>
                                    <div className={`mc-bar glow-bar ${colorClass}`} style={{height: `${h4}px`}}></div>
                                </div>
                            );
                        })()}
                        <FlashValue 
                            className={`c-val ${data.calculation.roi?.startsWith('-') ? 'danger-text' : 'success-text'}`} 
                            style={{fontSize: '1.1rem'}}
                            value={data.calculation.roi} 
                        />
                    </div>
                </div>
                <div className="t-col col-action">
                    <button className="expand-btn">
                        <span className={`chevron-icon ${isExpanded ? 'rotated' : ''}`}>▼</span>
                    </button>
                </div>
            </div>

            {/* Expandable Details Content */}
            <div className="table-row-details">
                <div className="details-content">
                    {/* Calculation Summary */}
                    <div className="inner-box calc-summary">
                        <div className="box-title"><span className="info-icon">◐</span> CALCULATION SUMMARY</div>
                        <div className="calc-list">
                            <AnimatedCalcItem label="Start" valueStr={data.calculation.start} valueColorClass="white" isExpanded={isExpanded} />
                            <AnimatedCalcItem label="Gross" valueStr={data.calculation.gross} valueColorClass="cyan" isExpanded={isExpanded} />
                            <AnimatedCalcItem label="Gas USD" valueStr={data.calculation.gasUsd} valueColorClass="purple" isExpanded={isExpanded} />
                            <AnimatedCalcItem label="Final" valueStr={data.calculation.final} valueColorClass="white" isExpanded={isExpanded} />
                            <AnimatedCalcItem label="Flash Fee" valueStr={data.calculation.flashFee} valueColorClass="yellow" isExpanded={isExpanded} />
                            <AnimatedCalcItem label="Net" valueStr={data.calculation.net} isExpanded={isExpanded} isNetRow={true} />
                        </div>
                        
                        <div className="chart-fill-space">
                            <CircleChart score={87} isExpanded={isExpanded} />
                            <div className="chart-fill-info">
                                <div className="cfi-title">AI Signal Confidence</div>
                                <div className="cfi-desc">High probability based on historical spread volatility. Executing sequence...</div>
                            </div>
                        </div>
                    </div>

                    {/* Route / Router / Quoter */}
                    <div className="inner-box route-breakdown">
                        <div className="box-title"><span className="layers-icon">◆</span> ROUTE / ROUTER / QUOTER</div>
                        <div className="timeline-container" style={{ '--draw-duration': `${500 + (data.hops.length * 600)}ms` }}>
                            {data.hops.map((hop, index) => {
                                const drawDuration = (500 + (data.hops.length * 600)) / 1000;
                                const beamHitTime = (index / Math.max(1, data.hops.length - 1)) * 3;
                                const totalFlashDelay = drawDuration + 0.2 + beamHitTime;
                                return (
                                <div className="hop-item" key={index} style={{ '--flash-delay': `${totalFlashDelay}s` }}>
                                    <div className="hop-marker"></div>
                                    <div className="hop-content">
                                        <div className="hop-header">
                                            <span className="hop-dex badge-dex">{hop.dex}</span>
                                            <span className="hop-fee badge-fee">{hop.feeLabel}</span>
                                        </div>
                                        <div className="hop-swap">{hop.swapText}</div>
                                        <div className="hop-address">
                                            <span className="a-label">Router</span>
                                            <CopyableAddress address={hop.router} />
                                        </div>
                                        <div className="hop-address">
                                            <span className="a-label">Quoter</span>
                                            <CopyableAddress address={hop.quoter} />
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [globalSignals, setGlobalSignals] = useState([]);
    const [personalSignals, setPersonalSignals] = useState([]);
    const [syncTime, setSyncTime] = useState(new Date());
    const [filter, setFilter] = useState('All networks');
    const [isRescanning, setIsRescanning] = useState(false);

    const [userProfile, setUserProfile] = useState(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentView, setCurrentView] = useState('global');
    const [isReadOnlyProfile, setIsReadOnlyProfile] = useState(false);
    const [toast, setToast] = useState(null);
    const [expandedTradeId, setExpandedTradeId] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleRescan = () => {
        setIsRescanning(true);
        setTimeout(() => setIsRescanning(false), 500);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlUserId = urlParams.get('userId');
        if (urlUserId) {
            // If the URL has ?userId=..., automatically load their specific dashboard and lock the view
            setIsReadOnlyProfile(true);
            setCurrentView('personal');
            fetchProfile(urlUserId);
        }
    }, []);

    const fetchProfile = async (id) => {
        try {
            const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
            const res = await fetch(`${protocol}//${window.location.host}/api/user-profile/${id}`);
            const data = await res.json();
            if (data.success) {
                setUserProfile(data.profile);
                if (data.trades && data.trades.length > 0) {
                    const formattedTrades = data.trades.map(t => {
                        const details = t.trade_details;
                        return {
                            id: t.id,
                            type: details.type,
                            network: details.network,
                            timeLabel: 'Active',
                            routePath: details.routePath,
                            calculation: details.calculation,
                            hops: details.hops,
                            profitAmount: parseFloat(t.profit_amount)
                        };
                    });
                    setPersonalSignals(formattedTrades);
                }
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    useEffect(() => {
        if (!userProfile) return;
        // Fetch profile once when view switches or user changes to update the profit header, 
        // but rely on WS for the real-time trades array updates!
        fetchProfile(userProfile.userId);
    }, [userProfile?.userId, currentView]);

    const handleLogin = async (userId) => {
        if (!userId) return;
        try {
            const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
            const apiUrl = `${protocol}//${window.location.host}/api/start-trade`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();
            
            if (data.success || response.status === 429) {
                setIsLoginOpen(false);
                fetchProfile(userId);
                if (data.success) showToast(data.message, 'success');
            } else {
                showToast(data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to connect to the server.", 'error');
        }
    };

    useEffect(() => {
        let ws;
        let reconnectTimer;

        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let backendUrl = `${protocol}//${window.location.host}/ws`;
            
            if (currentView === 'personal' && userProfile) {
                backendUrl += `?userId=${userProfile.userId}`;
            }

            ws = new WebSocket(backendUrl);
            
            ws.onopen = () => {
                console.log(`Connected to server (${currentView} mode)`);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                // Catch the auto-stop success message
                if (data.length > 0 && data[0].type === 'SESSION_COMPLETE') {
                    const completeData = data[0];
                    setUserProfile(prev => prev ? {
                        ...prev,
                        sessionActive: false,
                        currentProfit: completeData.total_profit
                    } : prev);
                    
                    // Trigger celebratory alert
                    alert(`✅ Success! 3% Daily Profit Target Reached ($${completeData.total_profit.toFixed(2)} secured)!\nYour Auto-Trade session has automatically stopped to secure your profits.`);
                    return;
                }
                
                if (currentView === 'personal') {
                    setPersonalSignals(prev => {
                        const newTrades = data.filter(d => !prev.some(p => p.id === d.id));
                        return [...newTrades, ...prev].slice(0, 50);
                    });
                    
                    // Optimistically update header profit if it's a new personal trade
                    if (data.length > 0 && data[0].profitAmount) {
                        setUserProfile(prev => prev ? {
                            ...prev, 
                            currentProfit: prev.currentProfit + data.reduce((sum, d) => sum + (d.profitAmount || 0), 0)
                        } : prev);
                    }
                } else {
                    setGlobalSignals(data);
                }
                
                setSyncTime(new Date());
            };

            ws.onclose = () => {
                console.log('Disconnected, reconnecting in 2s...');
                reconnectTimer = setTimeout(connect, 2000);
            };
            
            ws.onerror = (err) => {
                console.error('WebSocket Error:', err);
            };
        };

        connect();

        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimer);
        };
    }, [currentView, userProfile?.userId]);

    const displaySignals = currentView === 'global' ? globalSignals : personalSignals;
    
    const filteredSignals = filter === 'All networks' 
        ? displaySignals 
        : displaySignals.filter(s => s.network === filter);

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />
            <Navbar 
                onOpenLogin={() => setIsLoginOpen(true)} 
                userProfile={userProfile} 
                currentView={currentView}
                onViewToggle={(view) => setCurrentView(view)}
                isReadOnlyProfile={isReadOnlyProfile}
                onStartTrade={handleLogin}
            />
            <div className="container">
                <Header syncTime={syncTime} currentView={currentView} userProfile={userProfile} />
                <SignalEqualizer segmentsCount={16} />
                
                <div className="controls-section">
                    <div className="controls-left">
                        <div className="opportunity-label">
                            <span className="opportunity-icon">⎈</span> Opportunity field <span className="signals-count">{filteredSignals.length} signals in range</span>
                        </div>
                        <div className="filters">
                            <button className={`filter-btn ${filter === 'All networks' ? 'active btn-all' : ''}`} onClick={() => setFilter('All networks')}>
                                <span className="network-dot dot-all"></span> All networks
                            </button>
                            <button className={`filter-btn ${filter === 'Polygon' ? 'active btn-polygon' : ''}`} onClick={() => setFilter('Polygon')}>
                                <span className="network-dot dot-polygon"></span> Polygon
                            </button>
                            <button className={`filter-btn ${filter === 'Ethereum' ? 'active btn-ethereum' : ''}`} onClick={() => setFilter('Ethereum')}>
                                <span className="network-dot dot-ethereum"></span> Ethereum
                            </button>
                            <button className={`filter-btn ${filter === 'BNB' ? 'active btn-bnb' : ''}`} onClick={() => setFilter('BNB')}>
                                <span className="network-dot dot-bnb"></span> BNB
                            </button>
                        </div>
                    </div>
                    
                    <div className="search-rescan">
                        <div className="search-box">
                            <span className="search-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                            </span>
                            <input type="text" placeholder="Search pair or venue" />
                        </div>
                        <button className="rescan-btn" onClick={handleRescan}>
                            <span className={`rescan-icon ${isRescanning ? 'spin' : ''}`}>⟳</span> Re-scan
                        </button>
                    </div>
                </div>

                {currentView === 'personal' && userProfile?.startTime && (
                    <div className="session-start-info" style={{ 
                        padding: '12px 24px', 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.9rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ color: 'var(--accent-gold)' }}>⏱</span>
                        Session Started: <strong style={{ color: '#fff', fontWeight: '500' }}>{new Date(userProfile.startTime).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}</strong>
                    </div>
                )}

                <div className="signals-table-container">
                    <div className="table-header">
                        <div className="t-col col-network">NETWORK</div>
                        <div className="t-col col-route">ROUTE / TYPE</div>
                        <div className="t-col col-time">TIME</div>
                        <div className="t-col col-net">NET PROFIT</div>
                        <div className="t-col col-roi">EST. ROI</div>
                        <div className="t-col col-action"></div>
                    </div>
                    <div className="signals-table-body">
                        {filteredSignals.map(signal => (
                            <SignalRow 
                                key={signal.id} 
                                data={signal} 
                                isExpanded={expandedTradeId === signal.id}
                                onToggle={() => setExpandedTradeId(expandedTradeId === signal.id ? null : signal.id)}
                            />
                        ))}
                    </div>
                </div>
                
                <div className="footer-bar">
                    <div className="footer-left">
                        <span className="footer-dot"></span> Data refreshed every 15 seconds
                    </div>
                    <div className="footer-right">
                        KAROMETA INTELLIGENCE <span className="footer-separator">•</span> PAPER MODE
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
