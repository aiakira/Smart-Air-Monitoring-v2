import { NextResponse } from 'next/server'
import db from '../../../../lib/neon'

const API_KEY = process.env.SENSOR_API_KEY || ''

export async function POST(req: Request) {
  try {
    const key = req.headers.get('x-api-key') || ''
    if (API_KEY && key !== API_KEY) {
      return NextResponse.json({ error: 'invalid api key' }, { status: 401 })
    }

    const body = await req.json()
    const co2 = Number(body.co2)
    const co = Number(body.co)
    const dust = Number(body.dust)
    const ts = body.ts ? new Date(body.ts).toISOString() : new Date().toISOString()

    if (Number.isNaN(co2) || Number.isNaN(co) || Number.isNaN(dust)) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
    }

    await db.query('INSERT INTO sensor_readings (ts, co2, co, dust) VALUES ($1, $2, $3, $4)', [ts, co2, co, dust])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
