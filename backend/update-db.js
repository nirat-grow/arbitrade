import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const dbClient = new Client({ connectionString: process.env.DATABASE_URL });

async function updateDb() {
    try {
        await dbClient.connect();
        console.log('✅ Connected to database');

        console.log('🔄 Creating table "auto_trade_sessions"...');
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS auto_trade_sessions (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) UNIQUE,
                package_amount NUMERIC,
                target_profit NUMERIC,
                current_profit NUMERIC DEFAULT 0,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                is_active BOOLEAN DEFAULT true
            );
        `);
        console.log('✅ auto_trade_sessions created');

        console.log('🔄 Modifying "trade_history"...');
        await dbClient.query(`
            DROP TABLE IF EXISTS trade_history;
            CREATE TABLE trade_history (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255),
                trade_amount NUMERIC,
                profit_amount NUMERIC,
                trade_details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ trade_history recreated with JSONB column');

    } catch (err) {
        console.error('❌ Error updating db:', err);
    } finally {
        await dbClient.end();
    }
}

updateDb();
