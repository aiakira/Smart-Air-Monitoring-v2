import { NextResponse } from 'next/server';
import db from '../../../lib/neon';

/**
 * Health check endpoint
 * Tests database connection and returns system status
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const result = await db.query('SELECT NOW() as server_time, version() as db_version');
    const dbTime = result.rows[0];
    
    // Get sensor count
    const sensorCount = await db.query('SELECT COUNT(*) as count FROM sensor_readings');
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        serverTime: dbTime.server_time,
        version: dbTime.db_version,
        responseTime: `${responseTime}ms`,
      },
      stats: {
        totalReadings: parseInt(sensorCount.rows[0].count),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: err.message,
        },
      },
      { status: 500 }
    );
  }
}
