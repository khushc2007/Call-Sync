"use client"

import { useState } from "react"
import { Search, Loader2, ClipboardList, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppointments } from "@/hooks/use-appointments"
import { cn } from "@/lib/utils"

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-[#1a1b23] rounded-[10px] border border-[#2a2b35]", className)}>
      {children}
    </div>
  )
}

export function PastAppointmentsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { appointments, loading, error } = useAppointments({ pollingInterval: 0 })

  const today = new Date().toISOString().split("T")[0]
  const past = appointments
    .filter(a => a.date < today)
    .filter(a => statusFilter === "all" || a.status === statusFilter)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.doctor ?? "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total past", value: appointments.filter(a => a.date < today).length, color: "text-foreground" },
          { label: "Completed", value: appointments.filter(a => a.date < today && a.status === "confirmed").length, color: "text-teal" },
          { label: "Cancelled", value: appointments.filter(a => a.date < today && a.status === "cancelled").length, color: "text-coral" },
        ].map(({ label, value, color }) => (
          <SectionCard key={label} className="p-5">
            {loading ? <Skeleton className="h-10 w-full" /> : (
              <>
                <p className={cn("text-2xl font-bold", color)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </>
            )}
          </SectionCard>
        ))}
      </div>

      <SectionCard>
        <div className="p-4 border-b border-[#2a2b35] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search patient or doctor…" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 bg-[#12131a] border-[#2a2b35] text-foreground text-sm placeholder:text-muted-foreground" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm bg-[#12131a] border-[#2a2b35] text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2b35]">
                {["Patient","Phone","Specialty","Doctor","Date","Time","Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#2a2b35]/50">
                    {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>)}
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-coral">{error}</td></tr>
              ) : past.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center">
                  <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No past appointments found</p>
                </td></tr>
              ) : past.map((apt, i) => (
                <tr key={apt.id} className="border-b border-[#2a2b35]/50 hover:bg-[#12131a] transition-colors" style={{ opacity: 0.85 }}>
                  <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{apt.name}</td>
                  <td className="px-5 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">{apt.phone}</td>
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{apt.condition ?? "—"}</td>
                  <td className="px-5 py-3 text-foreground whitespace-nowrap">{apt.doctor ?? "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{apt.date}</td>
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{apt.time}</td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className={cn("rounded-[6px] font-normal border text-[10px]",
                      apt.status === "confirmed" ? "bg-teal/10 text-teal border-teal/20" : "bg-coral/10 text-coral border-coral/20")}>
                      {apt.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
