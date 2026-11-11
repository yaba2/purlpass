const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    const migrationFile = path.join(__dirname, 'drizzle', '0001_whole_norman_osborn.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration...');
    await pool.query(migrationSQL);
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
