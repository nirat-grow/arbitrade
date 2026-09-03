import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const dbClient = new Client({ connectionString: process.env.DATABASE_URL });

async function createTable() {
    try {
        await dbClient.connect();
        console.log('✅ Connected to database');

        console.log('🔄 Creating table "api_submissions"...');
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS api_submissions (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255),
                package_order_no VARCHAR(255),
                package_name VARCHAR(255),
                amount NUMERIC,
                date_time TIMESTAMP,
                description TEXT,
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
