import pg from 'pg';

const { Client } = pg;
const connectionString = 'postgresql://postgres:Zx7%23mK9%24pQr2%21vNw@192.168.0.234:54329/bot';

const dbClient = new Client({ connectionString });

async function updateTable() {
    try {
        await dbClient.connect();
        console.log('✅ Connected to database');

        console.log('🔄 Altering table "api_submissions" to add package_order_no...');
        await dbClient.query(`
            ALTER TABLE api_submissions 
            ADD COLUMN IF NOT EXISTS package_order_no VARCHAR(255);
        `);
        console.log('✅ Table altered successfully');
    } catch (err) {
        console.error('❌ Error altering table:', err);
    } finally {
        await dbClient.end();
    }
}

updateTable();
