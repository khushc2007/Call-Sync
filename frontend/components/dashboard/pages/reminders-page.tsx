"use client"

import { Bell, Check, X, Clock, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppointments } from "@/hooks/use-appointments"
import { cn } from "@/lib/utils"
import type { AppointmentRow } from "@/lib/supabase"

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-[#1a1b23] rounded-[10px] border border-[#2a2b35] backdrop-blur-sm", className)}>
      {children}
    </div>
  )
}

function ReminderRow({ apt }: { apt: AppointmentRow }) {
  const statusConfig = {
    sent: { label: "Reminded", className: "bg-teal/15 text-teal border-teal/30", icon: Check },
    pending_reminder: { label: "Scheduled", className: "bg-amber/15 text-amber border-amber/30", icon: Clock },
    not_needed: { label: "Not needed", className: "bg-[#2a2b35] text-muted-foreground border-[#2a2b35]", icon: AlertCircle },
  }

  const state = apt.reminded ? "sent" : apt.status === "cancelled" ? "not_needed" : "pending_reminder"
  const cfg = statusConfig[state]
  const Icon = cfg.icon

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[#2a2b35]/50 hover:bg-[#12131a] transition-colors">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", cfg.className.split(" ").slice(0,2).join(" "))}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{apt.name}</p>
        <p className="text-xs text-muted-foreground">{apt.phone} · {apt.date} at {apt.time}</p>
      </div>
      <Badge variant="outline" className={cn("text-[10px] rounded-[6px] border font-normal", cfg.className)}>
        {cfg.label}
      </Badge>
    </div>
  )
}

export function RemindersPage() {
  const { appointments, loading, error } = useAppointments({ pollingInterval: 60_000 })

  const remindedCount = appointments.filter(a => a.reminded).length
  const scheduledCount = appointments.filter(a => !a.reminded && a.status !== "cancelled").length
  const deliveryRate = appointments.length > 0 ? Math.round((remindedCount / (remindedCount + scheduledCount || 1)) * 100) : 0

  const sorted = [...appointments].sort((a, b) => {
    if (a.reminded !== b.reminded) return a.reminded ? 1 : -1
    return a.date.localeCompare(b.date)
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Scheduled", value: scheduledCount, sub: "next 24 hours", icon: Clock, color: "text-amber" },
          { label: "Sent", value: remindedCount, sub: "all time", icon: Check, color: "text-teal" },
          { label: "Delivery rate", value: `${deliveryRate}%`, sub: "success", icon: Bell, color: "text-coral" },
          { label: "Total tracked", value: appointments.length, sub: "appointments", icon: AlertCircle, color: "text-muted-foreground" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <SectionCard key={label} className="p-5">
            {loading ? (
              <><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-24" /></>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
              </>
            )}
          </SectionCard>
        ))}
      </div>

      <SectionCard>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2b35]">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">Reminder log</h3>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
          </div>
          <Badge variant="outline" className="bg-amber/15 text-amber border-amber/30 text-xs rounded-[6px]">
            {scheduledCount} pending
          </Badge>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-coral">Failed to load reminders</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : loading ? (
          <div className="divide-y divide-[#2a2b35]/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1"><Skeleton className="h-4 w-36 mb-1" /><Skeleton className="h-3 w-48" /></div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No appointments to remind</p>
          </div>
        ) : (
          <div>{sorted.map(apt => <ReminderRow key={apt.id} apt={apt} />)}</div>
        )}
      </SectionCard>
    </div>
  )
}
