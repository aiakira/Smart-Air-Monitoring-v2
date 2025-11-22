import { NextResponse } from 'next/server'
import db from '../../../lib/neon'

function generateNotificationsFromSensor(sensor: any) {
  const notifications: any[] = []
  if (!sensor) return notifications
  const now = new Date(sensor.ts || Date.now())
  const timeString = now.toLocaleTimeString('id-ID')

  // Default thresholds
  const co2Poor = 1000
  const co2Moderate = 700
  const coPoor = 5
  const coModerate = 2
  const dustPoor = 100
  const dustModerate = 75

  if (sensor.co2 > co2Poor) {
    notifications.push({ type: 'warning', time: timeString, message: `CO₂ TINGGI (${Math.round(sensor.co2)} ppm)`, action: 'Perlu ventilasi segera' })
  } else if (sensor.co2 > co2Moderate) {
    notifications.push({ type: 'warning', time: timeString, message: `CO₂ sedang (${Math.round(sensor.co2)} ppm)`, action: 'Monitor tingkat CO₂' })
  }

  if (sensor.co > coPoor) {
    notifications.push({ type: 'warning', time: timeString, message: `CO TINGGI (${sensor.co.toFixed(1)} ppm)`, action: 'Perlu perhatian' })
  }

  if (sensor.dust > dustPoor) {
    notifications.push({ type: 'warning', time: timeString, message: `Debu TINGGI (${Math.round(sensor.dust)} µg/m³)`, action: 'Perlu pembersihan udara' })
  } else if (sensor.dust > dustModerate) {
    notifications.push({ type: 'warning', time: timeString, message: `Debu sedang (${Math.round(sensor.dust)} µg/m³)`, action: 'Monitor tingkat debu' })
  }

  if (sensor.co2 <= co2Moderate && sensor.co <= coModerate && sensor.dust <= dustModerate) {
    notifications.push({ type: 'success', time: timeString, message: 'Kualitas udara normal', action: 'Semua sensor dalam kondisi baik' })
  }

  return notifications
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 400 })
  }

  try {
    const res = await db.query('SELECT co2, co, dust, ts FROM sensor_readings ORDER BY ts DESC LIMIT 1')
    const sensor = res.rows[0] ?? null
    const notifications = generateNotificationsFromSensor(sensor)

    return NextResponse.json({ data: notifications })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
