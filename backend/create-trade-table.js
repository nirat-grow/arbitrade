import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const dbClient = new Client({ connectionString: process.env.DATABASE_URL });

async function createTable() {
    try {
        await dbClient.connect();
        console.log('✅ Connected to database');

        console.log('🔄 Creating table "trade_history"...');
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS trade_history (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255),
                trade_amount NUMERIC,
                profit_amount NUMERIC,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Table created successfully');
    } catch (err) {
        console.error('❌ Error creating table:', err);
    } finally {
        await dbClient.end();
    }
}

createTable();
