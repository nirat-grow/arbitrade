import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const dbClient = new Client({ connectionString: process.env.DATABASE_URL });

const types = ['Triangular', 'Same-pair', 'Cross-chain', 'Flash-loan'];

// Real DEX Router & Quoter addresses mapped by Network
const networkDexMapping = {
    'Ethereum': [
        { dex: 'Uniswap V2', feeLabel: 'V2 • FEE 3000', router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', quoter: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' },
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 500', router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6' },
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 3000', router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6' },
        { dex: 'SushiSwap', feeLabel: 'V2 • FEE 3000', router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', quoter: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac' },
        { dex: 'Curve', feeLabel: 'V1 • FEE 400', router: '0x99a58482BD75cbab83b27EC03CA68fF489b5788f', quoter: '0xA962EF05C48e6e6E571b1DAe21d0Dc6Ed46b7a43' },
        { dex: 'PancakeSwap', feeLabel: 'V3 • FEE 2500', router: '0xEfF92A263d31888d860bD50809A8D171709b7b1c', quoter: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997' },
    ],
    'Polygon': [
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 500', router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6' },
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 3000', router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6' },
        { dex: 'QuickSwap', feeLabel: 'V2 • FEE 3000', router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', quoter: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32' },
        { dex: 'QuickSwap', feeLabel: 'V3 • FEE 500', router: '0xf5b509bB0909a69B1c207E495f687a596C168E12', quoter: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32' },
        { dex: 'SushiSwap', feeLabel: 'V2 • FEE 3000', router: '0x1b02da8c750e38686d06d482436d65457b479975', quoter: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' },
        { dex: 'Curve', feeLabel: 'V1 • FEE 400', router: '0x0DCDED3545D565bA3B19E683431381007245d983', quoter: '0x722272D36ef0Da72FF51c5A65Db7b870E2e8D4ee' },
    ],
    'BNB': [
        { dex: 'PancakeSwap', feeLabel: 'V2 • FEE 2500', router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', quoter: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73' },
        { dex: 'PancakeSwap', feeLabel: 'V3 • FEE 500', router: '0x1b81D678ffb9C0263b24A97847620C99d213eB14', quoter: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997' },
        { dex: 'Biswap', feeLabel: 'V2 • FEE 1000', router: '0x3a6d8ca21D1CF76F653A67677FA0530263C45335', quoter: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE' },
        { dex: 'SushiSwap', feeLabel: 'V2 • FEE 3000', router: '0x1b02da8c750e38686d06d482436d65457b479975', quoter: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' },
        { dex: 'Curve', feeLabel: 'V1 • FEE 400', router: '0xA72C85C258A81761433B4e8da60505Fe3Dd551CC', quoter: '0x98a73F23D5Fc02Ad34FdB3dD0E344dB08c4EcA5e' },
    ],
    'Arbitrum': [
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 500', router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6' },
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 3000', router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6' },
        { dex: 'Camelot', feeLabel: 'V2 • FEE 3000', router: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d', quoter: '0x6EcCab422D763aC031210895C81787E87B43A652' },
        { dex: 'Camelot', feeLabel: 'V3 • FEE 500', router: '0x1F721E2E82F6676FCE4eA07A5958cF098D339e18', quoter: '0x6EcCab422D763aC031210895C81787E87B43A652' },
        { dex: 'SushiSwap', feeLabel: 'V2 • FEE 3000', router: '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55', quoter: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' },
        { dex: 'Curve', feeLabel: 'V1 • FEE 400', router: '0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D', quoter: '0x445FE580eF8d70FF569aB36e80c647af338db351' },
        { dex: 'PancakeSwap', feeLabel: 'V3 • FEE 500', router: '0x1b81D678ffb9C0263b24A97847620C99d213eB14', quoter: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997' },
    ],
    'Optimism': [
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 500', router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6' },
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 3000', router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6' },
        { dex: 'Curve', feeLabel: 'V1 • FEE 400', router: '0x0DCDED3545D565bA3B19E683431381007245d983', quoter: '0x7DA64233Fefb352f8F501B357c018158ED8aA455' },
        { dex: 'SushiSwap', feeLabel: 'V2 • FEE 3000', router: '0x1b02da8c750e38686d06d482436d65457b479975', quoter: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' },
    ],
    'Base': [
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 500', router: '0x2626664c2603336E57B271c5C0b26F421741e481', quoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' },
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 3000', router: '0x2626664c2603336E57B271c5C0b26F421741e481', quoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' },
        { dex: 'SushiSwap', feeLabel: 'V2 • FEE 3000', router: '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891', quoter: '0x71524B4f93c58fcbF659783fCeE636fSb368aAf2' },
        { dex: 'Curve', feeLabel: 'V1 • FEE 400', router: '0x4f37A9d177470499A2dD084621020b023fcffc1F', quoter: '0x11C907CEc8Dc0B38dC3e5a1dC52d5D8e7eF3e84a' },
    ],
    'Avalanche': [
        { dex: 'Uniswap V3', feeLabel: 'V3 • FEE 500', router: '0xbb00FF08d01D300023C629E8fFfCb65A5a578cEe', quoter: '0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F' },
        { dex: 'SushiSwap', feeLabel: 'V2 • FEE 3000', router: '0x1b02da8c750e38686d06d482436d65457b479975', quoter: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' },
        { dex: 'Curve', feeLabel: 'V1 • FEE 400', router: '0x0DCDED3545D565bA3B19E683431381007245d983', quoter: '0x5552b631e2aD801fAa129Aacf4B701071cC9d1f7' },
        { dex: 'PancakeSwap', feeLabel: 'V3 • FEE 500', router: '0x1b81D678ffb9C0263b24A97847620C99d213eB14', quoter: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997' },
    ],
};

// Real tokens available on each network
const networkTokens = {
    'Ethereum': ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI'],
    'Polygon': ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI', 'MATIC'],
    'BNB': ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI', 'BNB'],
    'Arbitrum': ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI', 'ARB'],
    'Optimism': ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI', 'OP'],
    'Base': ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI'],
    'Avalanche': ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI'],
};

const networks = Object.keys(networkDexMapping);

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max, decimals = 6) {
    return (Math.random() * (max - min) + min).toFixed(decimals);
}

// Abbreviate real address: 0x7a250d56...F2488D
function abbreviateAddress(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function generateRandomRecord() {
    const type = getRandomItem(types);
    const network = getRandomItem(networks);
    const tokens = networkTokens[network];
    const availableDexes = networkDexMapping[network];
    const timeLabel = Math.floor(Math.random() * 120) + 'S';
    
    // Generate route path using tokens valid for this network
    const numTokens = Math.floor(Math.random() * 3) + 2; // 2 to 4 tokens
    const routePath = [];
    for (let i = 0; i < numTokens; i++) {
        routePath.push(getRandomItem(tokens));
    }
    // Make sure it loops back to start token for arbitrage
    routePath.push(routePath[0]);
    
    // Calculation
    const startAmount = (Math.random() * 10000 + 100).toFixed(6);
    const gross = (Math.random() * 50 + 0.5).toFixed(6); // Always positive
    const net = (parseFloat(gross) * (Math.random() * 0.3 + 0.1)).toFixed(6); // Always positive net
    const roi = (Math.random() * 2 + 0.01).toFixed(4) + '%'; // Always positive ROI
    
    const calculation = {
        start: startAmount,
        final: (parseFloat(startAmount) + parseFloat(gross)).toFixed(6),
        gross: gross,
        flashFee: getRandomNumber(0, 5),
        gasUsd: '$' + getRandomNumber(0.01, 15, 6),
        net: net,
        roi: roi
    };
    
    // Hops with REAL Router & Quoter addresses
    const hops = [];
    for (let i = 0; i < routePath.length - 1; i++) {
        const fromToken = routePath[i];
        const toToken = routePath[i+1];
        const dexInfo = getRandomItem(availableDexes); // Pick a real DEX for this network
        hops.push({
            dex: dexInfo.dex,
            feeLabel: dexInfo.feeLabel,
            swapText: `${fromToken}...${fromToken} → ${toToken}...${toToken}`,
            router: dexInfo.router,
            quoter: dexInfo.quoter
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
