"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { RefreshCw } from "lucide-react"

export default function GrafikPage() {
  const [selectedSensor, setSelectedSensor] = useState<"co2" | "co" | "dust">("co2")
  const [chartData, setChartData] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  // Fetch chart data from server (Neon)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/sensor/history?limit=24')
        const json = await res.json()
        if (!mounted) return
        if (json?.data) {
          const data = json.data.map((row: any) => ({
            time: new Date(row.ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            co2: row.co2,
            co: row.co,
            dust: row.dust,
          }))
          setChartData(data)
        }
      } catch (err) {
        // ignore
      }
    }
    load()
    setMounted(true)
  }, [])

  const sensorConfig = {
    co2: { color: "#4CAF50", name: "CO₂ (ppm)", key: "co2" },
    co: { color: "#009688", name: "CO (ppm)", key: "co" },
    dust: { color: "#FFB74D", name: "Debu (µg/m³)", key: "dust" },
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Grafik Data Sensor</h1>
              <p className="text-muted-foreground">Visualisasi perubahan nilai sensor dari waktu ke waktu</p>
            </div>

            {/* Controls */}
            <Card className="p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(sensorConfig) as Array<"co2" | "co" | "dust">).map((sensor) => (
                    <Button
                      key={sensor}
                      variant={selectedSensor === sensor ? "default" : "outline"}
                      onClick={() => setSelectedSensor(sensor)}
                      className="text-sm"
                    >
                      {sensorConfig[sensor].name}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setLastUpdate(new Date())}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </Card>

            {/* Chart */}
            <Card className="p-6 shadow-sm">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f3f4f6",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={sensorConfig[selectedSensor].key}
                    stroke={sensorConfig[selectedSensor].color}
                    name={sensorConfig[selectedSensor].name}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Info */}
            <Card className="p-4 shadow-sm bg-muted">
              <p className="text-sm text-muted-foreground">
                Terakhir diperbarui: {mounted ? lastUpdate.toLocaleTimeString("id-ID") : "--:--"}
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
