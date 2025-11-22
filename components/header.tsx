"use client"

import { NotificationBell } from "./notification-bell"

interface HeaderProps {
  co2?: number
  co?: number
  dust?: number
}

export function Header({ co2 = 0, co = 0, dust = 0 }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            💨
          </div>
          <span className="text-xl font-bold text-foreground">Smart Air Monitor</span>
        </div>
        
        <NotificationBell co2={co2} co={co} dust={dust} />
      </div>
    </header>
  )
}
