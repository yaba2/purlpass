import { db } from './src/db/index.ts';
import { sql } from 'drizzle-orm';

async function addPasswordHashColumn() {
  try {
    console.log('Adding password_hash column to users table...');
    await db.execute(sql`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'users'
              AND column_name = 'password_hash'
          ) THEN
              ALTER TABLE users ADD COLUMN password_hash TEXT;
          END IF;
      END $$;
    `);
    console.log('Successfully added password_hash column');
    process.exit(0);
  } catch (error) {
    console.error('Error adding password_hash column:', error);
    process.exit(1);
  }
}

addPasswordHashColumn();
