"use client"

import { useEffect, useState } from "react"
import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PageType } from "./sidebar"

interface TopbarProps {
  currentPage: PageType
  sidebarCollapsed: boolean
}

const PAGE_META: Record<PageType, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview" },
  appointments: { title: "Appointments", subtitle: "Schedule & Management" },
  calendar: { title: "Calendar", subtitle: "Weekly & Monthly View" },
  "live-calls": { title: "Live Calls", subtitle: "Real-time AI Activity" },
  reminders: { title: "Reminders", subtitle: "Automated Notifications" },
  "past-appointments": { title: "Past Appointments", subtitle: "Patient History" },
  settings: { title: "Settings", subtitle: "System Configuration" },
}

export function Topbar({ currentPage, sidebarCollapsed }: TopbarProps) {
  const [clock, setClock] = useState("")

  useEffect(() => {
    function tick() {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, "0")
      const mm = String(now.getMinutes()).padStart(2, "0")
      const ss = String(now.getSeconds()).padStart(2, "0")
      setClock(`${hh}:${mm}:${ss}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const meta = PAGE_META[currentPage]

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-[#12131a] border-b border-[#2a2b35] flex items-center justify-between px-6 transition-all duration-300 ${
        sidebarCollapsed ? "left-20" : "left-64"
      }`}
    >
      {/* Left: Page title + breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            CallSync AI
          </span>
          <span className="text-muted-foreground text-[10px]">/</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {meta.subtitle}
          </span>
        </div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">{meta.title}</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search appointments..."
            className="w-64 h-9 pl-10 pr-14 bg-[#1a1b23] border border-[#2a2b35] rounded-[6px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral/50 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground bg-[#2a2b35] px-1.5 py-0.5 rounded-[3px] font-mono">
              ⌘K
            </span>
          </div>
        </div>

        {/* System status + clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#1a1b23] border border-[#2a2b35] rounded-full">
          <span className="w-2 h-2 bg-teal rounded-full animate-pulse-dot" />
          <span className="text-xs text-muted-foreground">System Online</span>
          <span className="text-[10px] font-mono text-muted-foreground border-l border-[#2a2b35] pl-2 ml-0.5">
            {clock}
          </span>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-[6px] bg-[#1a1b23] border border-[#2a2b35] text-muted-foreground hover:text-foreground hover:bg-[#2a2b35]"
        >
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-coral text-white text-[9px] border-0 rounded-full">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}
