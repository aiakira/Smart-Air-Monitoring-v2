import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for local development
if (process.env.NODE_ENV !== 'production') {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please set process.env.DATABASE_URL in .env.local');
}

// Create a new pool with optimized settings
const pool = new Pool({ 
  connectionString,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('[neon] Unexpected pool error:', err);
});

/**
 * Execute a SQL query with parameters
 * @param text SQL query string
 * @param params Query parameters (optional)
 * @returns Query result with rows
 */
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows };
  } catch (err: unknown) {
    console.error('[neon] Query error:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Execute multiple queries in a transaction
 * @param queries Array of {text, params} objects
 * @returns Array of query results
 */
export async function transaction(queries: Array<{ text: string; params?: any[] }>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const q of queries) {
      const result = await client.query(q.text, q.params);
      results.push({ rows: result.rows });
    }
    
    await client.query('COMMIT');
    return results;
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    console.error('[neon] Transaction error:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Close all connections in the pool
 * Useful for graceful shutdown
 */
export async function closePool() {
  await pool.end();
}

export default { query, transaction, closePool };
