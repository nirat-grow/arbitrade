import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const dbClient = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await dbClient.connect();
  const res = await dbClient.query("SELECT id, user_id, profit_amount, trade_details FROM trade_history WHERE user_id = 'user_701' ORDER BY created_at DESC LIMIT 15");
  console.log(res.rows);
  await dbClient.end();
}

run();
