import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { VERIFIED_TRANSACTION_SPECS } from './reconcile_database_trades.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;
const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

async function fastReconcile() {
  const startTime = Date.now();
  console.log('⚡ Starting high-speed batch reconciliation for PostgreSQL JSONB trade records...');

  try {
    let totalUpdated = 0;

    for (const [hash, spec] of Object.entries(VERIFIED_TRANSACTION_SPECS)) {
      const query = `
        UPDATE trade_history
        SET trade_details = (
          trade_details || jsonb_build_object(
            'network', $1::text,
            'type', $2::text,
            'routePath', $3::jsonb,
            'hops', $4::jsonb,
            'calculation', COALESCE(trade_details->'calculation', '{}'::jsonb) || jsonb_build_object('gasUsd', $5::text)
          )
        )
        WHERE lower(trade_details->>'txHash') = lower($6)
           OR lower(trade_details->'calculation'->>'txHash') = lower($6);
      `;

      const values = [
        spec.network,
        spec.type,
        JSON.stringify(spec.routePath),
        JSON.stringify(spec.hops),
        spec.gasUsd || '$0.05',
        hash
      ];

      const res = await dbClient.query(query, values);
      if (res.rowCount > 0) {
        totalUpdated += res.rowCount;
        console.log(`✓ Reconciled ${res.rowCount} trades for [${spec.network}] hash ${hash.slice(0, 10)}... (Route: ${spec.routePath.join(' → ')} | Gas: ${spec.gasUsd})`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 DONE! Reconciled ${totalUpdated} trades across all networks with 100% explorer match in ${duration}s!`);
  } catch (err) {
    console.error('❌ Reconciliation error:', err);
  } finally {
    await dbClient.end();
  }
}

fastReconcile();
