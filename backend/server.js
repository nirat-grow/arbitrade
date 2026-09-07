import { WebSocketServer } from 'ws';
import pg from 'pg';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json()); // Enable JSON body parsing

// --- NEW REST API ENDPOINT ---
app.post('/api/save-package', async (req, res) => {
    try {
        const { userId, packageOrderNo, packageName, amount, dateTime, description } = req.body;
        
        if (!userId || !packageName || !amount || !dateTime || !description) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Date Validation
        const submittedDate = new Date(dateTime);
        const now = new Date();

        if (isNaN(submittedDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid dateTime format' });
        }

        // Calculate time difference in hours
        const diffInHours = (now - submittedDate) / (1000 * 60 * 60);

        // Reject if date is more than 24 hours in the past or more than 24 hours in the future
        if (diffInHours > 24) {
            return res.status(400).json({ success: false, message: 'Date cannot be more than 24 hours in the past' });
        }
        if (diffInHours < -24) {
            return res.status(400).json({ success: false, message: 'Date cannot be more than 24 hours in the future' });
        }

        const queryText = `
            INSERT INTO api_submissions (user_id, package_order_no, package_name, amount, date_time, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;
        const values = [userId, packageOrderNo, packageName, amount, dateTime, description];
        
        const result = await dbClient.query(queryText, values);
        
        res.status(201).json({ 
            success: true, 
            message: 'Package saved successfully', 
            id: result.rows[0].id 
        });
    } catch (err) {
        console.error('Error saving package:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
// --- START TRADE ENDPOINT ---
app.post('/api/start-trade', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });

        // 1. Check if user exists in api_submissions
        let userCheck = await dbClient.query(
            'SELECT * FROM api_submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        if (userCheck.rows.length === 0) {
            const insertRes = await dbClient.query(
                `INSERT INTO api_submissions (user_id, package_order_no, package_name, amount, date_time, description)
                 VALUES ($1, $2, 'Standard Node', 150.00, NOW(), 'Auto-provisioned conduit access')
                 RETURNING *`,
                [userId, `ORD-${Date.now()}`]
            );
            userCheck = insertRes;
        }

        const userPackage = userCheck.rows[0];
        const packageAmount = parseFloat(userPackage.amount);

        // 2. Check if active session or recent session within 24 hours exists
        const sessionCheck = await dbClient.query(
            "SELECT * FROM auto_trade_sessions WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
            [userId]
        );
        if (sessionCheck.rows.length > 0) {
            const lastSession = sessionCheck.rows[0];
            const now = new Date();
            const endTime = new Date(lastSession.end_time);

            if (lastSession.is_active) {
                return res.status(429).json({ 
                    success: false, 
                    message: 'Auto-Trade session is currently actively running for this user.' 
                });
            }

            // Enforce Daily 1-Trade Limit (24-Hour Cooldown)
            if (endTime > now) {
                const remainingMs = endTime.getTime() - now.getTime();
                const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                return res.status(429).json({ 
                    success: false, 
                    message: `Daily 24-hour limit active (1 trade per day). Next session unlocks in ${hours}h ${minutes}m.`,
                    cooldownActive: true,
                    nextAvailableTime: lastSession.end_time
                });
            }
        }

        // 3. Fetch latest Admin profit percentage configuration
        const adminCheck = await dbClient.query(
            'SELECT * FROM admin_submissions ORDER BY created_at DESC LIMIT 1'
        );
        let targetPercentage = 3;
        if (adminCheck.rows.length > 0 && adminCheck.rows[0].percentage) {
            targetPercentage = parseFloat(adminCheck.rows[0].percentage);
        }

        // Target profit based on user investment and admin percentage: (Investment * Percentage) / 100
        const targetProfit = (packageAmount * targetPercentage) / 100;

        // 4. Start/Restart Auto-Trade Session (24 hours) with upsert
        await dbClient.query(`
            INSERT INTO auto_trade_sessions (user_id, package_amount, target_profit, target_percentage, end_time, is_active, current_profit, start_time)
            VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours', true, 0, NOW())
            ON CONFLICT (user_id) DO UPDATE SET 
                package_amount = EXCLUDED.package_amount,
                target_profit = EXCLUDED.target_profit,
                target_percentage = EXCLUDED.target_percentage,
                current_profit = 0,
                start_time = NOW(),
                end_time = EXCLUDED.end_time,
                is_active = true;
        `, [userId, packageAmount, targetProfit, targetPercentage]);

        res.status(200).json({ 
            success: true, 
            message: '24-Hour Autonomous Arbitrage Conduit Activated.'
        });
    } catch (err) {
        console.error('Error starting trade:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// --- GET USER PROFILE ENDPOINT ---
app.get('/api/user-profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 1. Get package info
        let userCheck = await dbClient.query('SELECT amount FROM api_submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
        if (userCheck.rows.length === 0) {
            const insertRes = await dbClient.query(
                `INSERT INTO api_submissions (user_id, package_order_no, package_name, amount, date_time, description)
                 VALUES ($1, $2, 'Standard Node', 150.00, NOW(), 'Auto-provisioned conduit access')
                 RETURNING amount`,
                [userId, `ORD-${Date.now()}`]
            );
            userCheck = insertRes;
        }
        
        const balance = parseFloat(userCheck.rows[0].amount);
        
        // 2. Get latest session (active or previous)
        const sessionCheck = await dbClient.query('SELECT * FROM auto_trade_sessions WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [userId]);
        const session = sessionCheck.rows.length > 0 ? sessionCheck.rows[0] : null;
        
        // 3. Get recent trade history (all session trades up to 5000)
        const historyCheck = await dbClient.query('SELECT * FROM trade_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5000', [userId]);
        
        const currentProfit = session ? parseFloat(session.current_profit || 0) : 0;
        const targetProfit = session ? parseFloat(session.target_profit || 0) : 0;
        const targetPercentage = session && session.target_percentage ? parseFloat(session.target_percentage) : (balance > 0 ? (targetProfit / balance) * 100 : 0);
        const currentProfitPercentage = balance > 0 ? (currentProfit / balance) * 100 : 0;

        const now = new Date();
        const sessionEndTime = session && session.end_time ? new Date(session.end_time) : null;
        const isCooldownActive = session && sessionEndTime && sessionEndTime > now && !session.is_active;
        const canStartTrade = !session || (sessionEndTime && sessionEndTime <= now && !session.is_active);

        res.status(200).json({
            success: true,
            profile: {
                userId,
                balance,
                sessionActive: session ? session.is_active : false,
                canStartTrade,
                isCooldownActive,
                cooldownEndTime: isCooldownActive ? session.end_time : null,
                currentProfit,
                targetProfit,
                currentProfitPercentage: parseFloat(currentProfitPercentage.toFixed(2)),
                targetPercentage: parseFloat(targetPercentage.toFixed(2)),
                startTime: session ? session.start_time : null,
                endTime: session ? session.end_time : null
            },
            trades: historyCheck.rows
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// --- GET FULL TRADE HISTORY ENDPOINT ---
app.get('/api/trade-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const historyCheck = await dbClient.query('SELECT * FROM trade_history WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        
        if (historyCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No trade history found for this user.' });
        }

        res.status(200).json({
            success: true,
            totalTrades: historyCheck.rows.length,
            trades: historyCheck.rows
        });
    } catch (err) {
        console.error('Error fetching trade history:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// --- GET ALL HISTORY WITH FILTERS & CHUNKED PAGINATION ENDPOINT ---
app.get('/api/all-history', async (req, res) => {
    try {
        const { userId, timeframe, limit, offset } = req.query;
        let baseFilter = ' WHERE 1=1';
        let filterParams = [];
        let paramCount = 1;

        if (userId) {
            baseFilter += ` AND user_id = $${paramCount}`;
            filterParams.push(userId);
            paramCount++;
        }

        if (timeframe === 'today') {
            baseFilter += ` AND DATE(created_at) = CURRENT_DATE`;
        } else if (timeframe === 'last7days') {
            baseFilter += ` AND created_at >= NOW() - INTERVAL '7 days'`;
        } else if (timeframe === 'thismonth') {
            baseFilter += ` AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)`;
        }

        // 1. Get accurate total count for pagination header and HUD badges
        const countRes = await dbClient.query(`SELECT COUNT(*) FROM trade_history${baseFilter}`, filterParams);
        const totalTrades = parseInt(countRes.rows[0]?.count || 0, 10);

        // 2. Paginate data with limit & offset (default limit 500 for lightning-fast network response)
        const fetchLimit = limit === 'all' ? 0 : (limit !== undefined ? parseInt(limit, 10) : 500);
        const fetchOffset = offset !== undefined ? parseInt(offset, 10) : 0;

        let queryStr = `SELECT * FROM trade_history${baseFilter} ORDER BY created_at DESC`;
        let queryParams = [...filterParams];

        if (fetchLimit > 0) {
            queryStr += ` LIMIT $${paramCount}`;
            queryParams.push(fetchLimit);
            paramCount++;
            
            if (fetchOffset > 0) {
                queryStr += ` OFFSET $${paramCount}`;
                queryParams.push(fetchOffset);
                paramCount++;
            }
        }

        const historyCheck = await dbClient.query(queryStr, queryParams);
        
        res.status(200).json({
            success: true,
            totalTrades: totalTrades,
            limit: fetchLimit,
            offset: fetchOffset,
            trades: historyCheck.rows
        });
    } catch (err) {
        console.error('Error fetching all history:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// --- GET LIVE SCANNER SIGNALS REST ENDPOINT (Instant 0ms Global Matrix) ---
app.get('/api/scanner-signals', async (req, res) => {
    try {
        if (!activeSignals || activeSignals.length === 0) {
            const result = await dbClient.query('SELECT * FROM arbitrage_signals ORDER BY RANDOM() LIMIT 5');
            activeSignals = result.rows.map(formatRow);
        }
        res.status(200).json({
            success: true,
            signals: getJitteredSignals()
        });
    } catch (err) {
        console.error('Error fetching scanner signals:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// --- API DOCS ENDPOINT ---
app.get('/api/docs', (req, res) => {
    try {
        const mdPath = path.join(__dirname, 'API_DOCUMENTATION.md');
        const markdown = fs.readFileSync(mdPath, 'utf8');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>API Documentation</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-dark.min.css">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        body { box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px; background-color: #0d1117; color: #c9d1d9; }
        .markdown-body { background-color: #0d1117; color: #c9d1d9; }
    </style>
</head>
<body class="markdown-body">
    <div id="content"></div>
    <script>
        document.getElementById('content').innerHTML = marked.parse(\`${markdown.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
    </script>
</body>
</html>`;
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Documentation not available');
    }
});
// --- ADMIN SAVE DATA ENDPOINT ---
app.post('/api/admin/save-data', async (req, res) => {
    try {
        const { date, amount, percentage, calculatedResult } = req.body;
        
        if (!date || amount === undefined || percentage === undefined || calculatedResult === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const queryText = `
            INSERT INTO admin_submissions (date_time, amount, percentage, calculated_result)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [date, amount, percentage, calculatedResult];
        
        const result = await dbClient.query(queryText, values);
        
        res.status(201).json({ 
            success: true, 
            message: 'Configuration saved to database successfully', 
            id: result.rows[0].id,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error saving admin data:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// --- ADMIN GET LATEST CONFIGURATION ---
app.get('/api/admin/latest-data', async (req, res) => {
    try {
        const result = await dbClient.query('SELECT * FROM admin_submissions ORDER BY created_at DESC LIMIT 1');
        res.status(200).json({
            success: true,
            data: result.rows.length > 0 ? result.rows[0] : null
        });
    } catch (err) {
        console.error('Error fetching latest admin data:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// --- ADMIN GET RECENT SUBMISSIONS HISTORY ---
app.get('/api/admin/history', async (req, res) => {
    try {
        const result = await dbClient.query('SELECT * FROM admin_submissions ORDER BY created_at DESC LIMIT 20');
        res.status(200).json({
            success: true,
            submissions: result.rows
        });
    } catch (err) {
        console.error('Error fetching admin history:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// --- ADMIN DASHBOARD STATS ---
app.get('/api/admin/stats', async (req, res) => {
    try {
        const latestAdmin = await dbClient.query('SELECT * FROM admin_submissions ORDER BY created_at DESC LIMIT 1');
        const activeSessions = await dbClient.query('SELECT COUNT(*) FROM auto_trade_sessions WHERE is_active = true');
        const totalPackages = await dbClient.query('SELECT COUNT(*), COALESCE(SUM(amount), 0) as total_volume FROM api_submissions');
        
        res.status(200).json({
            success: true,
            stats: {
                activePercentage: latestAdmin.rows.length > 0 ? parseFloat(latestAdmin.rows[0].percentage) : 3,
                latestAmount: latestAdmin.rows.length > 0 ? parseFloat(latestAdmin.rows[0].amount) : 0,
                calculatedResult: latestAdmin.rows.length > 0 ? parseFloat(latestAdmin.rows[0].calculated_result) : 0,
                latestDate: latestAdmin.rows.length > 0 ? latestAdmin.rows[0].date_time : null,
                activeSessions: parseInt(activeSessions.rows[0].count, 10),
                totalPackages: parseInt(totalPackages.rows[0].count, 10),
                totalVolume: parseFloat(totalPackages.rows[0].total_volume)
            }
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// -----------------------------

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

server.listen(8082, () => {
    console.log("Server starting on port 8082 (HTTP & WS)");
});

// Database connection pool (supports concurrent async queries without blocking)
const { Pool } = pg;
const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 25,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

dbClient.query('SELECT NOW()')
  .then(async () => {
      console.log('✅ Connected to PostgreSQL database "bot" pool successfully!');
      
      // Ensure admin table exists
      await dbClient.query(`
          CREATE TABLE IF NOT EXISTS admin_submissions (
              id SERIAL PRIMARY KEY,
              date_time DATE NOT NULL,
              amount NUMERIC NOT NULL,
              percentage NUMERIC NOT NULL,
              calculated_result NUMERIC NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
      `);
      console.log('✅ admin_submissions table ensured.');

      // Ensure target_percentage column exists in auto_trade_sessions
      await dbClient.query(`
          ALTER TABLE auto_trade_sessions 
          ADD COLUMN IF NOT EXISTS target_percentage NUMERIC DEFAULT 3;
      `);
      console.log('✅ auto_trade_sessions target_percentage column ensured.');
  })
  .catch(err => console.error('❌ PostgreSQL connection error:', err.stack));


let activeSignals = [];

function formatRow(row) {
    return {
        id: row.id,
        type: row.type,
        network: row.network,
        timeLabel: row.time_label,
        routePath: row.route_path,
        calculation: row.calculation,
        hops: row.hops
    };
}

// Fetch initial 5 records
async function initSignals() {
    try {
        const res = await dbClient.query('SELECT * FROM arbitrage_signals ORDER BY RANDOM() LIMIT 5');
        activeSignals = res.rows.map(formatRow);
    } catch (err) {
        console.error('Error fetching initial signals:', err);
    }
}
initSignals();

// --- BACKGROUND AUTO-TRADING ENGINE ---
const connectedClients = new Set();

function broadcastTrade(tradeData) {
    const details = typeof tradeData.trade_details === 'string' ? JSON.parse(tradeData.trade_details) : tradeData.trade_details;
    const txHash = details.txHash || details.calculation?.txHash || ('0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    const formattedTrade = {
        id: tradeData.id,
        type: details.type || 'Arbitrage',
        network: details.network || 'Ethereum',
        timeLabel: 'Executed',
        routePath: details.routePath,
        calculation: details.calculation,
        hops: details.hops,
        profitAmount: parseFloat(tradeData.profit_amount),
        tradeAmount: parseFloat(tradeData.trade_amount),
        txHash: txHash,
        isLedgerTrade: true
        // user_id is deliberately omitted to preserve complete anonymity
    };

    // Push to all connected clients for the live Execution Ledger & Personal Ledger
    connectedClients.forEach(ws => {
        if (ws.readyState === 1) {
            const isPersonalMatch = ws.userId && ws.userId === tradeData.user_id;
            ws.send(JSON.stringify({
                type: 'LIVE_TRADE',
                trade: { ...formattedTrade, isPersonalMatch }
            }));
        }
    });
}

setInterval(async () => {
    try {
        // 1. Deactivate expired sessions
        await dbClient.query("UPDATE auto_trade_sessions SET is_active = false WHERE end_time <= NOW() AND is_active = true");

        // 2. Fetch active sessions
        const activeSessions = await dbClient.query("SELECT * FROM auto_trade_sessions WHERE is_active = true");
        if (activeSessions.rows.length === 0) return;

        // 3. Get a random realistic signal pattern
        const signalRes = await dbClient.query("SELECT * FROM arbitrage_signals ORDER BY RANDOM() LIMIT 1");
        const baseSignal = signalRes.rows[0];

        // 4. Execute a slice of trade for each session
        for (let session of activeSessions.rows) {
            const targetProfit = parseFloat(session.target_profit);
            const currentProfit = parseFloat(session.current_profit || 0);
            
            // 1 to 2 Hour Pace Calculation (Only Profit, No Loss)
            const remainingProfit = targetProfit - currentProfit;
            
            let newProfit = 0;
            let sessionComplete = false;

            if (remainingProfit <= 0) {
                // Target already hit! 
                newProfit = 0;
                sessionComplete = true;
            } else {
                // For 1-2 hours completion (60-120 mins) at 15 seconds per tick:
                // Ticks for 2 hours = 120 mins * 4 ticks/min = 480 ticks
                // Ticks for 1 hour = 60 mins * 4 ticks/min = 240 ticks
                const minProfitPerTick = targetProfit / 480;
                const maxProfitPerTick = targetProfit / 240;
                
                // Generate a purely POSITIVE random profit
                newProfit = minProfitPerTick + (Math.random() * (maxProfitPerTick - minProfitPerTick));
                
                // If this jump puts us over the target, give exactly what's left and finish!
                if (currentProfit + newProfit >= targetProfit) {
                    newProfit = remainingProfit;
                    sessionComplete = true;
                }
            }
            
            // Final safety cap
            if (currentProfit + newProfit >= targetProfit) {
                newProfit = targetProfit - currentProfit;
                sessionComplete = true;
            }
            
            // Dynamic realistic calculation math for the UI summary panel
            const startAmount = parseFloat(session.package_amount);
            const gasFee = (Math.random() * 1.45 + 0.05).toFixed(6); // Random gas $0.05 to $1.50
            const flashFee = (Math.random() * 0.19 + 0.01).toFixed(6); // Random flash fee $0.01 to $0.20
            
            // Equation: Gross = Net + Gas + Flash Fee
            const grossProfit = (newProfit + parseFloat(gasFee) + parseFloat(flashFee)).toFixed(6);
            const finalAmount = (startAmount + parseFloat(grossProfit)).toFixed(6);
            const roiPercent = ((newProfit / startAmount) * 100).toFixed(4) + '%';

            const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
            const dynamicCalculation = {
                start: startAmount.toFixed(6),
                gross: grossProfit,
                gasUsd: `$${gasFee}`,
                final: finalAmount,
                flashFee: flashFee,
                net: newProfit.toFixed(6),
                roi: roiPercent,
                txHash: txHash
            };

            const tradeDetails = JSON.stringify({
                network: baseSignal.network,
                type: baseSignal.type,
                routePath: baseSignal.route_path,
                calculation: dynamicCalculation,
                hops: baseSignal.hops,
                txHash: txHash
            });

            const result = await dbClient.query(`
                INSERT INTO trade_history (user_id, trade_amount, profit_amount, trade_details)
                VALUES ($1, $2, $3, $4) RETURNING *
            `, [session.user_id, session.package_amount, newProfit, tradeDetails]);

            if (sessionComplete) {
                await dbClient.query(`
                    UPDATE auto_trade_sessions SET current_profit = current_profit + $1, is_active = false WHERE id = $2
                `, [newProfit, session.id]);
                
                const startAmount = parseFloat(session.package_amount);
                const achievedPercentage = session.target_percentage ? parseFloat(session.target_percentage) : (startAmount > 0 ? parseFloat(((targetProfit / startAmount) * 100).toFixed(2)) : 0);

                // Notify frontend that session hit target and stopped directly to the user's connection
                for (let client of connectedClients) {
                    if (client.readyState === 1 && client.userId === session.user_id) {
                        client.send(JSON.stringify([{ 
                            type: 'SESSION_COMPLETE', 
                            total_profit: targetProfit,
                            profit_percentage: achievedPercentage
                        }]));
                    }
                }
            } else {
                await dbClient.query(`
                    UPDATE auto_trade_sessions SET current_profit = current_profit + $1 WHERE id = $2
                `, [newProfit, session.id]);
            }
            
            broadcastTrade(result.rows[0]);
        }
    } catch (err) {
        console.error("Auto-Trade Engine Error:", err);
    }
}, 15000); // Runs incredibly fast: every 15 seconds
// ----------------------------------------

// Every 15 seconds, swap ONE record with a new one from the DB
// This gives the user time to open and read a row without it disappearing instantly!
setInterval(async () => {
    if (activeSignals.length === 0) return;
    try {
        const res = await dbClient.query('SELECT * FROM arbitrage_signals ORDER BY RANDOM() LIMIT 1');
        if (res.rows.length > 0) {
            const indexToReplace = Math.floor(Math.random() * activeSignals.length);
            activeSignals[indexToReplace] = formatRow(res.rows[0]);
        }
    } catch (err) {}
}, 15000);

// Add slight fake movement to the numbers every 2 seconds to make it look "live"
function getJitteredSignals() {
    return activeSignals.map(sig => {
        const cloned = JSON.parse(JSON.stringify(sig));
        let net = parseFloat(cloned.calculation.net);
        cloned.calculation.net = (net + (Math.random() * 0.1 - 0.05)).toFixed(6);
        let roi = parseFloat(cloned.calculation.roi);
        cloned.calculation.roi = (roi + (Math.random() * 0.02 - 0.01)).toFixed(4) + '%';
        return cloned;
    });
}

function sendUserHistory(ws, userId) {
    if (!userId || ws.readyState !== 1) return;
    dbClient.query('SELECT * FROM trade_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5000', [userId])
        .then(historyCheck => {
            const formattedHistory = historyCheck.rows.map(tradeData => {
                const details = typeof tradeData.trade_details === 'string' ? JSON.parse(tradeData.trade_details) : tradeData.trade_details;
                return {
                    id: tradeData.id,
                    type: details.type || 'Arbitrage',
                    network: details.network || 'Ethereum',
                    timeLabel: 'Executed',
                    routePath: details.routePath,
                    calculation: details.calculation,
                    hops: details.hops,
                    profitAmount: parseFloat(tradeData.profit_amount),
                    tradeAmount: parseFloat(tradeData.trade_amount),
                    txHash: details.txHash || details.calculation?.txHash,
                    isHistory: true,
                    isPersonalMatch: true
                };
            });
            if (ws.readyState === 1 && formattedHistory.length > 0) {
                ws.send(JSON.stringify({
                    type: 'USER_HISTORY',
                    userId: userId,
                    trades: formattedHistory
                }));
            }
        })
        .catch(err => console.error("Error fetching WS history:", err));
}

wss.on('connection', (ws, req) => {
    // Parse userId from URL e.g. /ws?userId=user_123
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    ws.userId = userId || null;
    connectedClients.add(ws);
    console.log(`Client connected. Mode: ${ws.userId ? `Personal (${ws.userId})` : 'Global'}`);

    // Send initial jittered scanner signals immediately to client with explicit type
    if (ws.readyState === 1 && activeSignals.length > 0) {
        ws.send(JSON.stringify({
            type: 'SCANNER_FEED',
            signals: getJitteredSignals()
        }));
    }

    if (ws.userId) {
        sendUserHistory(ws, ws.userId);
    }

    // Support runtime identification message without reconnecting socket
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'IDENTIFY' && data.userId) {
                ws.userId = data.userId;
                console.log(`Client identified via WS message: ${data.userId}`);
                sendUserHistory(ws, data.userId);
            }
        } catch (e) {}
    });

    // Broadcast live scanner data to all connected clients every 2 seconds with explicit type
    const interval = setInterval(() => {
        if (ws.readyState === 1 && activeSignals.length > 0) {
            ws.send(JSON.stringify({
                type: 'SCANNER_FEED',
                signals: getJitteredSignals()
            }));
        }
    }, 2000);

    ws.on('close', () => {
        console.log(`Client disconnected (${ws.userId || 'Global'})`);
        connectedClients.delete(ws);
        clearInterval(interval);
    });
});
