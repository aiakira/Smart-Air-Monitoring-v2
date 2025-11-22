import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || null;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please set process.env.DATABASE_URL');
}

// Use Pool for better connection management
const pool = new Pool({ connectionString });

export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    return { rows: result.rows };
  } catch (err) {
    console.error('[neon] query error:', err);
    throw err;
  }
}

export default { query };
