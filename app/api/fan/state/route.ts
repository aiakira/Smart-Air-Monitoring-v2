import { NextResponse } from 'next/server'
import db from '../../../../lib/neon'

const API_KEY = process.env.SENSOR_API_KEY || ''

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  }
  try {
    const res = await db.query('SELECT desired, updated_at FROM fan_state ORDER BY updated_at DESC LIMIT 1')
    const row = res.rows[0] ?? { desired: false, updated_at: new Date().toISOString() }
    return NextResponse.json({ data: row })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const key = req.headers.get('x-api-key') || ''
    if (API_KEY && key !== API_KEY) {
      return NextResponse.json({ error: 'invalid api key' }, { status: 401 })
    }

    const body = await req.json()
    const desired = Boolean(body.desired)

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
    }

    await db.query('INSERT INTO fan_state (desired) VALUES ($1)', [desired])
    return NextResponse.json({ ok: true, desired })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
