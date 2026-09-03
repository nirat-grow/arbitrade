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
        const userCheck = await dbClient.query(
            'SELECT * FROM api_submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User ID not found or no package purchased.' });
        }

        const userPackage = userCheck.rows[0];
        const packageAmount = parseFloat(userPackage.amount);

        // 2. Check if active session exists
        const sessionCheck = await dbClient.query(
            "SELECT * FROM auto_trade_sessions WHERE user_id = $1 AND is_active = true",
            [userId]
        );
        if (sessionCheck.rows.length > 0) {
            return res.status(429).json({ success: false, message: 'Auto-Trade session is already running for this user.' });
        }

        // 3. Start Auto-Trade Session (24 hours)
        const targetProfit = packageAmount * 0.03;
        await dbClient.query(`
            INSERT INTO auto_trade_sessions (user_id, package_amount, target_profit, end_time)
            VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
        `, [userId, packageAmount, targetProfit]);

        res.status(200).json({ success: true, message: '24-Hour Auto-Trade started successfully!' });
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
        const userCheck = await dbClient.query('SELECT amount FROM api_submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        
        const balance = parseFloat(userCheck.rows[0].amount);
        
        // 2. Get active session
        const sessionCheck = await dbClient.query('SELECT * FROM auto_trade_sessions WHERE user_id = $1 AND is_active = true', [userId]);
        const session = sessionCheck.rows.length > 0 ? sessionCheck.rows[0] : null;
        
        // 3. Get recent trade history (last 50 trades)
        const historyCheck = await dbClient.query('SELECT * FROM trade_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]);
        
        res.status(200).json({
            success: true,
            profile: {
                userId,
                balance,
                sessionActive: !!session,
                currentProfit: session ? parseFloat(session.current_profit) : 0,
                targetProfit: session ? parseFloat(session.target_profit) : 0,
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

// --- GET ALL HISTORY WITH FILTERS ENDPOINT ---
app.get('/api/all-history', async (req, res) => {
    try {
        const { userId, timeframe } = req.query;
        let queryStr = 'SELECT * FROM trade_history WHERE 1=1';
        let queryParams = [];
        let paramCount = 1;

        if (userId) {
            queryStr += ` AND user_id = $${paramCount}`;
            queryParams.push(userId);
            paramCount++;
        }

        if (timeframe === 'today') {
            queryStr += ` AND DATE(created_at) = CURRENT_DATE`;
        } else if (timeframe === 'last7days') {
            queryStr += ` AND created_at >= NOW() - INTERVAL '7 days'`;
        } else if (timeframe === 'thismonth') {
            queryStr += ` AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)`;
        }

        queryStr += ' ORDER BY created_at DESC LIMIT 10000';

        const historyCheck = await dbClient.query(queryStr, queryParams);
        
        res.status(200).json({
            success: true,
            totalTrades: historyCheck.rows.length,
            trades: historyCheck.rows
        });
    } catch (err) {
        console.error('Error fetching all history:', err);
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
// -----------------------------

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

server.listen(8082, () => {
    console.log("Server starting on port 8082 (HTTP & WS)");
});

// Database connection
const { Client } = pg;
const dbClient = new Client({
  // Using connection string from .env file
  connectionString: process.env.DATABASE_URL
});

dbClient.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database "bot" successfully!'))
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
    const formattedTrade = {
        id: tradeData.id,
        type: details.type,
        network: details.network,
        timeLabel: 'Active',
        routePath: details.routePath,
        calculation: details.calculation,
        hops: details.hops,
        profitAmount: parseFloat(tradeData.profit_amount)
    };

    // 1. Add to global feed array so it broadcasts normally to global users
    activeSignals.unshift(formattedTrade);
    if (activeSignals.length > 5) activeSignals.pop();

    // 2. Instantly push to the specific user's personal feed
    connectedClients.forEach(ws => {
        if (ws.readyState === 1 && ws.userId === tradeData.user_id) {
            ws.send(JSON.stringify([formattedTrade]));
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

            const dynamicCalculation = {
                start: startAmount.toFixed(6),
                gross: grossProfit,
                gasUsd: `$${gasFee}`,
                final: finalAmount,
                flashFee: flashFee,
                net: newProfit.toFixed(6),
                roi: roiPercent
            };

            const tradeDetails = JSON.stringify({
                network: baseSignal.network,
                type: baseSignal.type,
                routePath: baseSignal.route_path,
                calculation: dynamicCalculation,
                hops: baseSignal.hops
            });

            const result = await dbClient.query(`
                INSERT INTO trade_history (user_id, trade_amount, profit_amount, trade_details)
                VALUES ($1, $2, $3, $4) RETURNING *
            `, [session.user_id, session.package_amount, newProfit, tradeDetails]);

            if (sessionComplete) {
                await dbClient.query(`
                    UPDATE auto_trade_sessions SET current_profit = current_profit + $1, is_active = false WHERE id = $2
                `, [newProfit, session.id]);
                
                // Notify frontend that session hit 3% and stopped directly to the user's connection
                for (let client of connectedClients) {
                    if (client.readyState === 1 && client.userId === session.user_id) {
                        client.send(JSON.stringify([{ type: 'SESSION_COMPLETE', total_profit: targetProfit }]));
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
        // Only positive jitter to ensure no fake losses
        let newNet = net + (Math.random() * 0.02);
        cloned.calculation.net = newNet.toFixed(6);
        cloned.profitAmount = newNet; // Keep top row and expanded view synced!
        
        let roi = parseFloat(cloned.calculation.roi);
        cloned.calculation.roi = (roi + (Math.random() * 0.005)).toFixed(4) + '%';
        return cloned;
    });
}

wss.on('connection', (ws, req) => {
    // Parse userId from URL e.g. /ws?userId=user_123
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    ws.userId = userId;
    connectedClients.add(ws);
    console.log(`Client connected. Mode: ${userId ? `Personal (${userId})` : 'Global'}`);

    // Send initial jittered signals immediately if global
    if (!userId && ws.readyState === 1 && activeSignals.length > 0) {
        ws.send(JSON.stringify(getJitteredSignals()));
    } else if (userId && ws.readyState === 1) {
        // Instantly send their specific historical trades!
        dbClient.query('SELECT * FROM trade_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId])
            .then(historyCheck => {
                const formattedHistory = historyCheck.rows.map(tradeData => {
                    const details = typeof tradeData.trade_details === 'string' ? JSON.parse(tradeData.trade_details) : tradeData.trade_details;
                    return {
                        id: tradeData.id,
                        type: details.type,
                        network: details.network,
                        timeLabel: 'Active',
                        routePath: details.routePath,
                        calculation: details.calculation,
                        hops: details.hops,
                        profitAmount: parseFloat(tradeData.profit_amount)
                    };
                });
                if (ws.readyState === 1 && formattedHistory.length > 0) {
                    ws.send(JSON.stringify(formattedHistory));
                }
            })
            .catch(err => console.error("Error fetching WS history:", err));
    }

    // Broadcast slightly jittered data every 2 seconds ONLY to global feed
    const interval = setInterval(() => {
        if (!ws.userId && ws.readyState === 1 && activeSignals.length > 0) {
            ws.send(JSON.stringify(getJitteredSignals()));
        }
    }, 2000);

    ws.on('close', () => {
        console.log(`Client disconnected (${ws.userId || 'Global'})`);
        connectedClients.delete(ws);
        clearInterval(interval);
    });
});
