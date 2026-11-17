import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || 
      `postgresql://${process.env.SQL_USER}:${process.env.SQL_PASSWORD}@${process.env.SQL_HOST}/${process.env.SQL_DB_NAME}?sslmode=require`;
    
    global._postgresPool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 30000,
      // Opening a connection to a remote Neon DB is slow (TLS + auth); keep them around
      idleTimeoutMillis: 240000,
      keepAlive: true,
    });

    // Retry transient connection failures (Neon cold start, dropped sockets)
    const isTransient = (err: any) =>
      /Connection terminated|connection timeout|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EPIPE|terminating connection|TLS connection/i.test(
        `${err?.message || ''} ${err?.code || ''}`
      );
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const pool = global._postgresPool as any;

    const origQuery = pool.query.bind(pool);
    pool.query = async (...args: any[]) => {
      if (typeof args[args.length - 1] === 'function') return origQuery(...args);
      let lastErr: any;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          return await origQuery(...args);
        } catch (err: any) {
          lastErr = err;
          if (!isTransient(err)) throw err;
          await sleep(500 * (attempt + 1));
        }
      }
      throw lastErr;
    };

    const origConnect = pool.connect.bind(pool);
    pool.connect = async (...args: any[]) => {
      if (typeof args[0] === 'function') return origConnect(...args);
      let lastErr: any;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          return await origConnect();
        } catch (err: any) {
          lastErr = err;
          if (!isTransient(err)) throw err;
          await sleep(500 * (attempt + 1));
        }
      }
      throw lastErr;
    };

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });

// Pre-warm a few connections and keep them (and the Neon compute) alive
async function warmPool() {
  try {
    await Promise.all([1, 2, 3].map(() => pool.query('select 1')));
  } catch (err) {
    console.error('DB warm-up failed:', (err as Error).message);
  }
}
warmPool();
setInterval(warmPool, 2 * 60 * 1000).unref();
