import { NextResponse } from 'next/server'
import db from '../../../lib/neon'

function generateNotificationsFromSensor(sensor: any, settings: any) {
  const notifications: any[] = []
  if (!sensor) return notifications
  const now = new Date(sensor.ts || Date.now())
  const timeString = now.toLocaleTimeString('id-ID')

  const co2Poor = Number(settings?.threshold_co2_poor ?? 1000)
  const co2Moderate = Number(settings?.threshold_co2_good ?? 700)
  const coPoor = Number(settings?.threshold_co_poor ?? 5)
  const coModerate = Number(settings?.threshold_co_double ?? 2)
  const dustPoor = Number(settings?.threshold_dust_poor ?? 100)
  const dustModerate = Number(settings?.threshold_dust_moderate ?? 75)

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
    // read settings so thresholds and mode are respected
    const settingsRes = await db.query('SELECT * FROM settings ORDER BY updated_at DESC LIMIT 1')
    const settings = settingsRes.rows[0] ?? null
    const notifications = generateNotificationsFromSensor(sensor, settings)

    return NextResponse.json({ data: notifications })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
