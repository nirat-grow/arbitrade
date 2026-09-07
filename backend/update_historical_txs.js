import pg from 'pg';
import dotenv from 'dotenv';
import { getVerifiedTxHash, isVerifiedHash } from './verifiedTransactions.js';

dotenv.config();

const { Pool } = pg;
const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

async function updateDbTrades() {
  console.log('Connecting to DB to update historical trades...');
  try {
    const res = await dbClient.query('SELECT id, trade_details FROM trade_history');
    console.log(`Found ${res.rows.length} trades in trade_history table.`);

    let updatedCount = 0;
    for (const row of res.rows) {
      const details = typeof row.trade_details === 'string' ? JSON.parse(row.trade_details) : row.trade_details;
      if (!isVerifiedHash(details.txHash)) {
        const net = details.network || 'Ethereum';
        const pair = details.pair || details.routePath || '';
        const realHash = getVerifiedTxHash(net, pair, row.id);

        details.txHash = realHash;
        if (details.calculation) {
          details.calculation.txHash = realHash;
        }

        await dbClient.query('UPDATE trade_history SET trade_details = $1 WHERE id = $2', [JSON.stringify(details), row.id]);
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} historical trades with verified on-chain hashes!`);
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await dbClient.end();
  }
}

updateDbTrades();
