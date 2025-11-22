"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { SensorCard } from "@/components/sensor-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function Dashboard() {
  const [sensorData, setSensorData] = useState({
    co2: 412,
    co: 1.2,
    dust: 58,
  })
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedSensor, setSelectedSensor] = useState<"co2" | "co" | "dust">("co2")
  const [chartData, setChartData] = useState<any[]>([])
  const [historyData, setHistoryData] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<"semua" | "baik" | "sedang" | "buruk">("semua")

  // Poll latest sensor data from server (Neon) every 3s
  useEffect(() => {
    let mounted = true

    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/sensor/latest')
        const json = await res.json()
        if (!mounted) return
        if (json?.data) {
          setSensorData({ 
            co2: Number(json.data.co2) || 0, 
            co: Number(json.data.co) || 0, 
            dust: Number(json.data.dust) || 0 
          })
          setLastUpdate(new Date(json.data.ts ?? Date.now()))
        }
      } catch (err) {
        // ignore for now
      }
    }

    fetchLatest()
    const interval = setInterval(fetchLatest, 3000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // Fetch chart data
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
    return () => { mounted = false }
  }, [])

  // Fetch history data
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/sensor/history?limit=30')
        const json = await res.json()
        if (!mounted) return
        if (json?.data) {
          const rows = json.data.map((row: any, idx: number) => {
            const d = new Date(row.ts)
            return {
              id: idx,
              tanggal: d.toLocaleDateString('id-ID'),
              waktu: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
              co2: row.co2,
              co: row.co,
              dust: row.dust,
              status: row.co2 > 1000 ? 'buruk' : row.co2 > 700 ? 'sedang' : 'baik',
            }
          })
          setHistoryData(rows)
        }
      } catch (err) {
        // ignore
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const getStatusFromCO2 = (value: number): "good" | "moderate" | "poor" => {
    if (value > 1000) return "poor"
    if (value > 700) return "moderate"
    return "good"
  }

  const sensorConfig = {
    co2: { color: "#4CAF50", name: "CO₂ (ppm)", key: "co2" },
    co: { color: "#009688", name: "CO (ppm)", key: "co" },
    dust: { color: "#FFB74D", name: "Debu (µg/m³)", key: "dust" },
  }

  const filteredHistory = useMemo(() => {
    if (filterStatus === "semua") return historyData
    return historyData.filter((item) => item.status === filterStatus)
  }, [historyData, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "baik":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
      case "sedang":
        return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
      case "buruk":
        return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-900"
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ["Tanggal", "Waktu", "CO₂ (ppm)", "CO (ppm)", "Debu (µg/m³)", "Status"].join(","),
      ...filteredHistory.map((row) => [row.tanggal, row.waktu, row.co2, row.co, row.dust, row.status].join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `air-quality-history-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header co2={sensorData.co2} co={sensorData.co} dust={sensorData.dust} />
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Sensor Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SensorCard
                label="CO₂"
                value={Math.round(sensorData.co2)}
                unit="ppm"
                icon="🌫️"
                status={getStatusFromCO2(sensorData.co2)}
              />
              <SensorCard
                label="CO"
                value={Number((sensorData.co || 0).toFixed(1))}
                unit="ppm"
                icon="💨"
                status={sensorData.co > 5 ? "poor" : sensorData.co > 2 ? "moderate" : "good"}
              />
              <SensorCard
                label="Debu"
                value={Math.round(sensorData.dust)}
                unit="µg/m³"
                icon="🏭"
                status={sensorData.dust > 100 ? "poor" : sensorData.dust > 75 ? "moderate" : "good"}
              />
            </div>



            {/* Grafik Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Grafik Data Sensor</h2>
              
              <Card className="p-6 shadow-sm">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.keys(sensorConfig) as Array<"co2" | "co" | "dust">).map((sensor) => (
                    <Button
                      key={sensor}
                      variant={selectedSensor === sensor ? "default" : "outline"}
                      onClick={() => setSelectedSensor(sensor)}
                      size="sm"
                    >
                      {sensorConfig[sensor].name}
                    </Button>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={300}>
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
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Riwayat Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Riwayat Data</h2>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {["semua", "baik", "sedang", "buruk"].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status as any)}
                    >
                      {status === "semua" ? "Semua" : status === "baik" ? "🟢 Baik" : status === "sedang" ? "🟡 Sedang" : "🔴 Buruk"}
                    </Button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Tanggal/Waktu</th>
                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground">CO₂ (ppm)</th>
                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground">CO (ppm)</th>
                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Debu (µg/m³)</th>
                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredHistory.slice(0, 10).map((row) => (
                        <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-3 text-sm">
                            {row.tanggal} <span className="text-muted-foreground">{row.waktu}</span>
                          </td>
                          <td className="px-6 py-3 font-medium">{row.co2}</td>
                          <td className="px-6 py-3 font-medium">{row.co}</td>
                          <td className="px-6 py-3 font-medium">{row.dust}</td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}
                            >
                              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {filteredHistory.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  Menampilkan 10 dari {filteredHistory.length} entri
                </p>
              )}
            </div>
          </div>
        </main>
    </div>
  )
}
