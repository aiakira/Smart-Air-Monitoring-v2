"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Notification {
  id: string
  type: "warning" | "danger" | "info"
  message: string
  time: Date
}

interface NotificationBellProps {
  co2: number
  co: number
  dust: number
}

export function NotificationBell({ co2, co, dust }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const newNotifications: Notification[] = []

    // Check CO2 levels
    if (co2 > 1000) {
      newNotifications.push({
        id: "co2-danger",
        type: "danger",
        message: `⚠️ CO₂ sangat tinggi (${Math.round(co2)} ppm)! Segera ventilasi ruangan.`,
        time: new Date(),
      })
    } else if (co2 > 700) {
      newNotifications.push({
        id: "co2-warning",
        type: "warning",
        message: `⚡ CO₂ meningkat (${Math.round(co2)} ppm). Pertimbangkan ventilasi.`,
        time: new Date(),
      })
    }

    // Check CO levels
    if (co > 5) {
      newNotifications.push({
        id: "co-danger",
        type: "danger",
        message: `⚠️ CO berbahaya (${co.toFixed(1)} ppm)! Bahaya kesehatan!`,
        time: new Date(),
      })
    } else if (co > 2) {
      newNotifications.push({
        id: "co-warning",
        type: "warning",
        message: `⚡ CO meningkat (${co.toFixed(1)} ppm). Perhatikan ventilasi.`,
        time: new Date(),
      })
    }

    // Check dust levels
    if (dust > 100) {
      newNotifications.push({
        id: "dust-danger",
        type: "danger",
        message: `⚠️ Debu sangat tinggi (${Math.round(dust)} µg/m³)! Gunakan masker.`,
        time: new Date(),
      })
    } else if (dust > 75) {
      newNotifications.push({
        id: "dust-warning",
        type: "warning",
        message: `⚡ Debu meningkat (${Math.round(dust)} µg/m³). Kurangi aktivitas luar.`,
        time: new Date(),
      })
    }

    // Add good air quality notification if all is well
    if (newNotifications.length === 0) {
      newNotifications.push({
        id: "all-good",
        type: "info",
        message: "✅ Kualitas udara baik. Semua sensor normal.",
        time: new Date(),
      })
    }

    setNotifications(newNotifications)
  }, [co2, co, dust])

  const hasWarnings = notifications.some((n) => n.type === "warning" || n.type === "danger")

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className={`h-5 w-5 ${hasWarnings ? "text-red-500 animate-pulse" : ""}`} />
        {hasWarnings && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Notifikasi</h3>
            </div>
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 ${
                    notif.type === "danger"
                      ? "bg-red-50 dark:bg-red-950/20"
                      : notif.type === "warning"
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : "bg-emerald-50 dark:bg-emerald-950/20"
                  }`}
                >
                  <p className="text-sm">{notif.message}</p>
                  {mounted && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.time.toLocaleTimeString("id-ID")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
