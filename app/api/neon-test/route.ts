import { NextResponse } from 'next/server';
import db from '../../../lib/neon';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not set. Add it to .env.local or environment.' }, { status: 400 });
  }

  try {
    // simple test query
    const res = await db.query('SELECT NOW() as now');
    return NextResponse.json({ now: res.rows[0].now });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
