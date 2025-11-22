import { NextResponse } from 'next/server'
import client, { ensureConnected } from '../../../lib/neon'

const API_KEY = process.env.SENSOR_API_KEY || ''

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  try {
    await ensureConnected()
    const res = await client!.query('SELECT * FROM settings ORDER BY updated_at DESC LIMIT 1')
    const row = res.rows[0] ?? null
    if (!row) {
      // return defaults if none stored
      return NextResponse.json({ data: { mode: 'auto', threshold_co2_good: 700, threshold_co2_poor: 1000, threshold_co_double: 2, threshold_co_poor: 5, threshold_dust_moderate: 75, threshold_dust_poor: 100 } })
    }
    return NextResponse.json({ data: row })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const key = req.headers.get('x-api-key') || ''
    if (API_KEY && key !== API_KEY) return NextResponse.json({ error: 'invalid api key' }, { status: 401 })

    const body = await req.json()
    const mode = body.mode === 'manual' ? 'manual' : 'auto'
    const threshold_co2_good = Number(body.threshold_co2_good ?? 700)
    const threshold_co2_poor = Number(body.threshold_co2_poor ?? 1000)
    const threshold_co_double = Number(body.threshold_co_double ?? 2)
    const threshold_co_poor = Number(body.threshold_co_poor ?? 5)
    const threshold_dust_moderate = Number(body.threshold_dust_moderate ?? 75)
    const threshold_dust_poor = Number(body.threshold_dust_poor ?? 100)

    if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })

    await ensureConnected()
    await client!.query(
      `INSERT INTO settings (mode, threshold_co2_good, threshold_co2_poor, threshold_co_double, threshold_co_poor, threshold_dust_moderate, threshold_dust_poor) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [mode, threshold_co2_good, threshold_co2_poor, threshold_co_double, threshold_co_poor, threshold_dust_moderate, threshold_dust_poor]
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
