"use client"

import { useEffect, useState } from "react"
import { Search, Bell, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PageType } from "./sidebar"

interface TopbarProps {
  currentPage: PageType
  sidebarCollapsed: boolean
}

const PAGE_META: Record<PageType, { title: string; subtitle: string }> = {
  dashboard:           { title: "Dashboard",           subtitle: "Overview" },
  appointments:        { title: "Appointments",        subtitle: "Schedule & management" },
  calendar:            { title: "Calendar",            subtitle: "Weekly & monthly view" },
  "live-calls":        { title: "Live calls",          subtitle: "Real-time AI activity" },
  reminders:           { title: "Reminders",           subtitle: "Automated notifications" },
  "past-appointments": { title: "Past appointments",   subtitle: "Patient history" },
  settings:            { title: "Settings",            subtitle: "System configuration" },
}

export function Topbar({ currentPage, sidebarCollapsed }: TopbarProps) {
  const [clock, setClock] = useState("")
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    function tick() {
      const now = new Date()
      setClock(
        `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const meta = PAGE_META[currentPage]

  return (
    <header className={`fixed top-0 right-0 z-30 h-16 bg-[#12131a] border-b border-[#2a2b35] flex items-center justify-between px-6 transition-all duration-300 ${sidebarCollapsed ? "left-20" : "left-64"}`}>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">CallSync AI</span>
          <span className="text-muted-foreground text-[10px]">/</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{meta.subtitle}</span>
        </div>
        <h1 className="text-base font-semibold text-foreground leading-tight">{meta.title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search appointments…"
            className="w-56 h-9 pl-9 pr-12 bg-[#1a1b23] border border-[#2a2b35] rounded-[6px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral/50 transition-colors" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-[10px] text-muted-foreground bg-[#2a2b35] px-1.5 py-0.5 rounded-[3px] font-mono">⌘K</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#1a1b23] border border-[#2a2b35] rounded-full">
          <span className="w-2 h-2 bg-teal rounded-full animate-pulse-dot" />
          <span className="text-xs text-muted-foreground">System online</span>
          <span className="text-[10px] font-mono text-muted-foreground border-l border-[#2a2b35] pl-2 ml-0.5">{clock}</span>
        </div>

        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setNotifOpen(o => !o)}
            className="relative h-9 w-9 rounded-[6px] bg-[#1a1b23] border border-[#2a2b35] text-muted-foreground hover:text-foreground hover:bg-[#2a2b35]">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-coral text-white text-[9px] border-0 rounded-full">3</Badge>
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-72 bg-[#1a1b23] border border-[#2a2b35] rounded-[10px] shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2b35]">
                <span className="text-xs font-semibold text-foreground">Notifications</span>
                <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">Clear all</button>
              </div>
              {[
                { title: "New appointment booked", desc: "Priya Sharma — Apr 1 at 10:00 AM", time: "2 min ago", color: "bg-teal/15 text-teal" },
                { title: "Appointment cancelled", desc: "Rahul Mehta — Apr 1 at 11:30 AM", time: "14 min ago", color: "bg-coral/15 text-coral" },
                { title: "Reminder sent", desc: "24hr reminder delivered to Ananya Patel", time: "1 hr ago", color: "bg-amber/15 text-amber" },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[#2a2b35]/50 hover:bg-[#12131a] transition-colors cursor-pointer">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.color.split(" ")[0]}`} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{n.desc}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
