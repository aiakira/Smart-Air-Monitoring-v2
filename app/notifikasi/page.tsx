"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, AlertCircle, CheckCircle } from "lucide-react"

interface Notification {
  id: number
  type: "warning" | "info" | "success"
  icon: any
  time: string
  message: string
  action: string
}

const generateNotificationsFromSensorData = (sensorData: any) => {
  const notifications: Notification[] = []
  const now = new Date()
  const timeString = now.toLocaleTimeString("id-ID")

  // Check CO2 levels
  if (sensorData.co2 > 1000) {
    notifications.push({
      id: Date.now() + Math.random(),
      type: "warning",
      icon: AlertCircle,
      time: timeString,
      message: `CO₂ TINGGI (${Math.round(sensorData.co2)} ppm)`,
      action: "Exhaust aktif otomatis - segera buka ventilasi",
    })
  } else if (sensorData.co2 > 700) {
    notifications.push({
      id: Date.now() + Math.random(),
      type: "warning",
      icon: AlertCircle,
      time: timeString,
      message: `CO₂ sedang (${Math.round(sensorData.co2)} ppm)`,
      action: "Monitor tingkat CO₂",
    })
  }

  // Check CO levels
  if (sensorData.co > 5) {
    notifications.push({
      id: Date.now() + Math.random(),
      type: "warning",
      icon: AlertCircle,
      time: timeString,
      message: `CO TINGGI (${sensorData.co.toFixed(1)} ppm)`,
      action: "Exhaust aktif - perlu perhatian segera",
    })
  }

  // Check Dust levels
  if (sensorData.dust > 100) {
    notifications.push({
      id: Date.now() + Math.random(),
      type: "warning",
      icon: AlertCircle,
      time: timeString,
      message: `Debu TINGGI (${Math.round(sensorData.dust)} µg/m³)`,
      action: "Fan exhaust menyala - monitor udara",
    })
  } else if (sensorData.dust > 75) {
    notifications.push({
      id: Date.now() + Math.random(),
      type: "warning",
      icon: AlertCircle,
      time: timeString,
      message: `Debu sedang (${Math.round(sensorData.dust)} µg/m³)`,
      action: "Monitor tingkat debu",
    })
  }

  // Add success notification when all is good
  if (sensorData.co2 <= 700 && sensorData.co <= 2 && sensorData.dust <= 75) {
    notifications.push({
      id: Date.now() + Math.random(),
      type: "success",
      icon: CheckCircle,
      time: timeString,
      message: "Kualitas udara normal",
      action: "Semua sensor dalam kondisi baik",
    })
  }

  return notifications
}

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [sensorData, setSensorData] = useState({
    co2: 412,
    co: 1.2,
    dust: 58,
  })

  useEffect(() => {
    let mounted = true

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications')
        const json = await res.json()
        if (!mounted) return
        if (json?.data) {
          setNotifications(json.data.map((n: any, i: number) => ({ id: i + Date.now(), type: n.type, icon: n.type === 'success' ? CheckCircle : AlertCircle, time: n.time, message: n.message, action: n.action })))
        }
      } catch (err) {
        // ignore
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 3000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const handleDeleteAll = () => {
    setNotifications([])
  }

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-amber-50 dark:bg-amber-950",
          border: "border-amber-200 dark:border-amber-800",
          icon: "text-amber-600 dark:text-amber-400",
        }
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-950",
          border: "border-blue-200 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
        }
      case "success":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950",
          border: "border-emerald-200 dark:border-emerald-800",
          icon: "text-emerald-600 dark:text-emerald-400",
        }
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-900",
          border: "border-gray-200 dark:border-gray-800",
          icon: "text-gray-600 dark:text-gray-400",
        }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Notifikasi</h1>
                <p className="text-muted-foreground">Peringatan berdasarkan data sensor real-time</p>
              </div>
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Semua
                </Button>
              )}
            </div>

            {notifications.length === 0 ? (
              <Card className="p-12 shadow-sm text-center">
                <p className="text-lg font-semibold text-muted-foreground mb-2">Tidak ada notifikasi</p>
                <p className="text-sm text-muted-foreground">Semua sensor dalam kondisi normal</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => {
                  const Icon = notif.icon
                  const styles = getTypeStyles(notif.type)
                  return (
                    <Card
                      key={notif.id}
                      className={`p-6 shadow-sm border-2 ${styles.bg} ${styles.border} transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className={`flex-shrink-0 ${styles.icon}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground">{notif.message}</p>
                              <span className="text-xs text-muted-foreground font-mono">{notif.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{notif.action}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(notif.id)}
                          className="flex-shrink-0"
                        >
                          ✕
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
