import { NextResponse } from 'next/server'
import client, { ensureConnected } from '../../../../lib/neon'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 400 })
  }

  try {
    await ensureConnected()
    const res = await client!.query('SELECT co2, co, dust, ts FROM sensor_readings ORDER BY ts DESC LIMIT 1')
    const row = res.rows[0] ?? null
    
    // Ensure numeric values are properly converted
    if (row) {
      row.co2 = Number(row.co2) || 0
      row.co = Number(row.co) || 0
      row.dust = Number(row.dust) || 0
    }
    
    return NextResponse.json({ data: row })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
