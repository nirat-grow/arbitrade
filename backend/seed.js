import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const dbClient = new Client({ connectionString: process.env.DATABASE_URL });

const networks = ['Ethereum', 'Polygon', 'BNB', 'Arbitrum', 'Optimism', 'Base', 'Avalanche'];
const types = ['Triangular', 'Same-pair', 'Cross-chain', 'Flash-loan'];
const tokens = ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI', 'BNB', 'MATIC', 'ARB', 'OP'];
const dexes = ['Uniswap V2', 'Uniswap V3', 'PancakeSwap', 'SushiSwap', 'Curve', 'Camelot', 'QuickSwap', 'Biswap'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max, decimals = 6) {
    return (Math.random() * (max - min) + min).toFixed(decimals);
}

function generateRandomRecord() {
    const type = getRandomItem(types);
    const network = getRandomItem(networks);
    const timeLabel = Math.floor(Math.random() * 120) + 'S';
    
    // Generate route path
    const numTokens = Math.floor(Math.random() * 3) + 2; // 2 to 4 tokens
    const routePath = [];
    for (let i = 0; i < numTokens; i++) {
        routePath.push(getRandomItem(tokens));
    }
    // Make sure it loops back to start token for arbitrage
    routePath.push(routePath[0]);
    
    // Calculation
    const startAmount = (Math.random() * 10000 + 100).toFixed(6);
    const gross = (Math.random() * 50 - 5).toFixed(6);
    const net = (parseFloat(gross) - Math.random() * 2).toFixed(6);
    const roi = (Math.random() * 5 - 1).toFixed(4) + '%';
    
    const calculation = {
        start: startAmount,
        final: (parseFloat(startAmount) + parseFloat(gross)).toFixed(6),
        gross: gross,
        flashFee: getRandomNumber(0, 5),
        gasUsd: '$' + getRandomNumber(0.01, 15, 6),
        net: net,
        roi: roi
    };
    
    // Hops
    const hops = [];
    for (let i = 0; i < routePath.length - 1; i++) {
        const fromToken = routePath[i];
        const toToken = routePath[i+1];
        hops.push({
            dex: getRandomItem(dexes),
            feeLabel: 'V3 • FEE ' + getRandomItem(['100', '500', '3000', '10000']),
            swapText: `${fromToken}...${fromToken} → ${toToken}...${toToken}`,
            router: '0x' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 6),
            quoter: '0x' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 6)
        });
    }
    
    return { type, network, timeLabel, routePath, calculation, hops };
}

async function seed() {
    try {
        await dbClient.connect();
        console.log('✅ Connected to database');

        console.log('🔄 Creating table "arbitrage_signals"...');
        await dbClient.query(`
            DROP TABLE IF EXISTS arbitrage_signals;
            CREATE TABLE arbitrage_signals (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50),
                network VARCHAR(50),
                time_label VARCHAR(20),
                route_path JSONB,
                calculation JSONB,
                hops JSONB
            );
        `);
        console.log('✅ Table created');

        console.log('🔄 Generating 10,000 dummy records...');
        const totalRecords = 10000;
        const batchSize = 100;
        
        for (let i = 0; i < totalRecords; i += batchSize) {
            const values = [];
            let queryText = 'INSERT INTO arbitrage_signals (type, network, time_label, route_path, calculation, hops) VALUES ';
            
            for (let j = 0; j < batchSize; j++) {
                const record = generateRandomRecord();
                const offset = j * 6;
                queryText += `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
                if (j < batchSize - 1) queryText += ', ';
                
                values.push(
                    record.type, 
                    record.network, 
                    record.timeLabel, 
                    JSON.stringify(record.routePath), 
                    JSON.stringify(record.calculation), 
                    JSON.stringify(record.hops)
                );
            }
            
            await dbClient.query(queryText, values);
            if ((i + batchSize) % 1000 === 0) {
                console.log(`... Inserted ${i + batchSize} records`);
            }
        }

        console.log('✅ Successfully seeded 10,000 records!');
    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await dbClient.end();
    }
}

seed();
