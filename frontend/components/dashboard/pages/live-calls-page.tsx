"use client"

import { useState, useEffect } from "react"
import { Phone, Clock, MessageSquare, Target, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppointments } from "@/hooks/use-appointments"
import { cn } from "@/lib/utils"
import type { AppointmentRow } from "@/lib/supabase"

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-[#1a1b23] rounded-[10px] border border-[#2a2b35]", className)}>
      {children}
    </div>
  )
}

function RecentCallCard({ apt, isSelected, onClick }: { apt: AppointmentRow; isSelected: boolean; onClick: () => void }) {
  const statusColor = {
    confirmed: "bg-teal/20 text-teal border-teal/30",
    pending:   "bg-amber/20 text-amber border-amber/30",
    cancelled: "bg-coral/20 text-coral border-coral/30",
  }

  return (
    <button onClick={onClick} className={cn(
      "w-full p-4 rounded-[10px] border text-left transition-all duration-200",
      isSelected ? "bg-coral/10 border-coral/30" : "bg-[#12131a] border-[#2a2b35] hover:border-[#3a3b45]"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center">
            <Phone className="w-4 h-4 text-teal" />
          </div>
          <span className="font-medium text-foreground text-sm">{apt.name}</span>
        </div>
        <Badge variant="outline" className={cn("text-[10px] rounded-[6px] font-normal border", statusColor[apt.status])}>
          {apt.status}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.time}</span>
        <span className="flex items-center gap-1"><Target className="w-3 h-3" />{apt.date}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 font-mono">{apt.phone}</p>
    </button>
  )
}

function DetailView({ apt }: { apt: AppointmentRow }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#2a2b35]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-foreground">{apt.name}</h3>
          <Badge variant="outline" className="bg-teal/15 text-teal border-teal/30 text-xs">
            <span className="w-1.5 h-1.5 bg-teal rounded-full mr-1.5 animate-pulse" />Recent
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{apt.time}</span>
          <span className="flex items-center gap-1"><Target className="w-4 h-4" />{apt.date}</span>
        </div>
      </div>

      <div className="p-4 border-b border-[#2a2b35] bg-[#12131a]">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Booking details</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Phone", value: apt.phone },
            { label: "Status", value: apt.status },
            { label: "Specialty", value: apt.condition ?? "—" },
            { label: "Doctor", value: apt.doctor ?? "—" },
            { label: "Reminded", value: apt.reminded ? "Yes" : "Pending" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm text-foreground font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Booking summary</span>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-[8px] bg-[#12131a] border border-[#2a2b35] max-w-[85%]">
            <p className="text-xs text-muted-foreground">Caller: "I'd like to book an appointment."</p>
          </div>
          <div className="p-3 rounded-[8px] bg-coral/10 border border-coral/20 max-w-[85%] ml-auto">
            <p className="text-xs text-muted-foreground">Riley: "Sure! What's your name and preferred date?"</p>
          </div>
          <div className="p-3 rounded-[8px] bg-[#12131a] border border-[#2a2b35] max-w-[85%]">
            <p className="text-xs text-muted-foreground">Caller: "My name is {apt.name}, on {apt.date} at {apt.time}."</p>
          </div>
          <div className="p-3 rounded-[8px] bg-teal/10 border border-teal/20 max-w-[85%] ml-auto">
            <p className="text-xs text-muted-foreground">Riley: "Done! Your appointment is confirmed."</p>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#2a2b35] bg-[#12131a]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Booking outcome</span>
          <Badge className="bg-teal/15 text-teal border-0 text-xs">{apt.status}</Badge>
        </div>
      </div>
    </div>
  )
}

export function LiveCallsPage() {
  const { appointments, loading } = useAppointments({ pollingInterval: 15_000 })
  const recent = appointments
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  useEffect(() => {
    if (recent.length > 0 && !selectedId) setSelectedId(recent[0].id)
  }, [recent, selectedId])

  const selected = recent.find(a => a.id === selectedId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      <SectionCard className="flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#2a2b35]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent bookings</h3>
            <Badge variant="outline" className="bg-teal/15 text-teal border-teal/30 text-xs">
              <span className="w-1.5 h-1.5 bg-teal rounded-full mr-1.5 animate-pulse" />
              {recent.length} calls
            </Badge>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-[10px] bg-[#12131a] border border-[#2a2b35] animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#12131a] flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No calls yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Bookings will appear here in real time</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map(apt => (
                <RecentCallCard key={apt.id} apt={apt} isSelected={selectedId === apt.id} onClick={() => setSelectedId(apt.id)} />
              ))}
            </div>
          )}
        </ScrollArea>
      </SectionCard>

      <SectionCard className="overflow-hidden">
        {selected ? <DetailView apt={selected} /> : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[#12131a] flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-muted-foreground mb-2">Select a booking</h3>
            <p className="text-sm text-muted-foreground/60 max-w-xs">Click on a booking from the list to view its details</p>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
