import { NextResponse } from 'next/server'
import db from '../../../../lib/neon'

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 400 })
  }

  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') ?? '24')
    const res = await db.query('SELECT co2, co, dust, ts FROM sensor_readings ORDER BY ts DESC LIMIT $1', [limit])
    
    // Ensure numeric values and return in ascending time order
    const rows = res.rows.map((row: any) => ({
      ...row,
      co2: Number(row.co2) || 0,
      co: Number(row.co) || 0,
      dust: Number(row.dust) || 0
    })).reverse()
    
    return NextResponse.json({ data: rows })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
