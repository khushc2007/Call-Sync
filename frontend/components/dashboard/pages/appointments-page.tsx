"use client"

import { useState } from "react"
import {
  Calendar, Search, Download, X, RefreshCw, Check, Bell, Plus, LayoutList, CalendarDays, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAppointments } from "@/hooks/use-appointments"
import { cn } from "@/lib/utils"
import { CalendarPage } from "./calendar-page"
import type { AppointmentRow } from "@/lib/supabase"

const DEFAULT_SPECIALTIES = [
  "General Medicine","Cardiology","Orthopedics","Pediatrics","Dermatology",
  "Dentistry","Ophthalmology","Physiotherapy","Neurology","ENT",
]

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-[#1a1b23] rounded-[10px] border border-[#2a2b35] backdrop-blur-sm transition-shadow hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]", className)}>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: AppointmentRow["status"] }) {
  const config = {
    confirmed: { label: "Confirmed", className: "bg-teal/15 text-teal border-teal/30" },
    pending:   { label: "Pending",   className: "bg-amber/15 text-amber border-amber/30" },
    cancelled: { label: "Cancelled", className: "bg-coral/15 text-coral border-coral/30" },
  }
  return (
    <Badge variant="outline" className={cn("rounded-[6px] font-normal border", config[status]?.className ?? config.pending.className)}>
      {config[status]?.label ?? status}
    </Badge>
  )
}

function ListView() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [timeError, setTimeError] = useState<string | null>(null)
  const { toast } = useToast()
  const { appointments, loading, error, updateStatus, addAppointment, markReminded } = useAppointments({ pollingInterval: 30_000 })

  const [form, setForm] = useState({ name: "", phone: "", condition: "", doctor: "", date: "", time: "" })

  const resetForm = () => {
    setForm({ name: "", phone: "", condition: "", doctor: "", date: "", time: "" })
    setTimeError(null)
  }

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.condition || !form.doctor || !form.date || !form.time) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    const clash = appointments.find(a => a.date === form.date && a.time === form.time && a.status !== "cancelled")
    if (clash) { setTimeError("This time slot is already booked. Choose a different time."); return }

    setSubmitting(true)
    try {
      await addAppointment({ name: form.name, phone: form.phone, condition: form.condition, doctor: form.doctor, date: form.date, time: form.time })
      setIsDialogOpen(false)
      resetForm()
      toast({ title: "Appointment booked", description: `${form.name} on ${form.date} at ${form.time}` })
    } catch (e: any) {
      toast({ title: "Failed to book", description: e.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatus = async (id: string, status: AppointmentRow["status"]) => {
    try {
      await updateStatus(id, status)
      toast({ title: "Status updated" })
    } catch {
      toast({ title: "Failed to update", variant: "destructive" })
    }
  }

  const handleRemind = async (id: string) => {
    try {
      await markReminded(id)
      toast({ title: "Marked as reminded" })
    } catch {
      toast({ title: "Failed", variant: "destructive" })
    }
  }

  const handleExport = () => {
    const csv = [
      ["Name", "Phone", "Specialty", "Doctor", "Date", "Time", "Status"],
      ...filtered.map(a => [a.name, a.phone, a.condition ?? "", a.doctor ?? "", a.date, a.time, a.status]),
    ].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `appointments-${new Date().toISOString().split("T")[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = appointments.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false
    if (conditionFilter !== "all" && a.condition !== conditionFilter) return false
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !(a.doctor ?? "").toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (error) {
    return (
      <SectionCard className="p-8 text-center">
        <p className="text-sm text-coral mb-2">Failed to load appointments</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-4">
      <SectionCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search patient or doctor…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-[#12131a] border-[#2a2b35] text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-coral/30" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm bg-[#12131a] border-[#2a2b35] text-foreground"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-44 h-9 text-sm bg-[#12131a] border-[#2a2b35] text-foreground"><SelectValue placeholder="Specialty" /></SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all">All specialties</SelectItem>
              {DEFAULT_SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 text-xs bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:text-foreground">
            <Download className="w-3.5 h-3.5 mr-1.5" />Export CSV
          </Button>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2b35]">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">Appointments</h3>
            <Badge variant="outline" className="bg-coral/15 text-coral border-coral/30 text-xs rounded-[6px]">{filtered.length}</Badge>
          </div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2b35]">
                {["Patient","Phone","Specialty","Doctor","Date","Time","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#2a2b35]/50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">No appointments found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your filters or add a new appointment</p>
                  </div>
                </td></tr>
              ) : filtered.map((apt, i) => (
                <tr key={apt.id} className="border-b border-[#2a2b35]/50 transition-colors hover:bg-[#12131a] animate-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{apt.name}</td>
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">{apt.phone}</td>
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{apt.condition ?? "—"}</td>
                  <td className="px-5 py-3 text-foreground whitespace-nowrap">{apt.doctor ?? "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{apt.date}</td>
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{apt.time}</td>
                  <td className="px-5 py-3"><StatusBadge status={apt.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {apt.status !== "confirmed" && (
                        <button onClick={() => handleStatus(apt.id, "confirmed")} className="w-7 h-7 flex items-center justify-center rounded-[4px] bg-teal/15 text-teal hover:bg-teal/25 transition-colors" title="Confirm"><Check className="w-3.5 h-3.5" /></button>
                      )}
                      {apt.status !== "cancelled" && (
                        <button onClick={() => handleStatus(apt.id, "cancelled")} className="w-7 h-7 flex items-center justify-center rounded-[4px] bg-coral/15 text-coral hover:bg-coral/25 transition-colors" title="Cancel"><X className="w-3.5 h-3.5" /></button>
                      )}
                      <button onClick={() => handleStatus(apt.id, "pending")} className="w-7 h-7 flex items-center justify-center rounded-[4px] bg-amber/15 text-amber hover:bg-amber/25 transition-colors" title="Set pending"><RefreshCw className="w-3.5 h-3.5" /></button>
                      {!apt.reminded && apt.status !== "cancelled" && (
                        <button onClick={() => handleRemind(apt.id)} className="w-7 h-7 flex items-center justify-center rounded-[4px] bg-[#12131a] border border-[#2a2b35] text-muted-foreground hover:text-foreground transition-colors" title="Mark reminded"><Bell className="w-3.5 h-3.5" /></button>
                      )}
                      {apt.reminded && <span className="text-[10px] text-teal flex items-center gap-1"><Check className="w-3 h-3" /> Reminded</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Dialog open={isDialogOpen} onOpenChange={o => { setIsDialogOpen(o); if (!o) resetForm() }}>
        <DialogContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">New appointment</DialogTitle>
            <DialogDescription className="text-muted-foreground">Fill in the details to book a new appointment.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {[
              { label: "Patient name", key: "name", placeholder: "Full name" },
              { label: "Phone", key: "phone", placeholder: "+91 98XXXXXXXX" },
              { label: "Doctor", key: "doctor", placeholder: "Dr. Name" },
              { label: "Date", key: "date", placeholder: "YYYY-MM-DD" },
              { label: "Time", key: "time", placeholder: "HH:MM (24h)" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input placeholder={placeholder} value={form[key as keyof typeof form]}
                  onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); if (key === "time" || key === "date") setTimeError(null) }}
                  className="h-9 bg-[#12131a] border-[#2a2b35] text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-coral/30" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Specialty</Label>
              <Select value={form.condition} onValueChange={v => setForm(p => ({ ...p, condition: v }))}>
                <SelectTrigger className="h-9 bg-[#12131a] border-[#2a2b35] text-foreground text-sm"><SelectValue placeholder="Select specialty" /></SelectTrigger>
                <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
                  {DEFAULT_SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {timeError && <p className="text-xs text-coral bg-coral/10 border border-coral/20 rounded-[6px] px-3 py-2">{timeError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }} className="bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:text-foreground">Cancel</Button>
            <Button onClick={handleAdd} disabled={submitting} className="bg-coral hover:bg-red-500 text-white transition-all">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Book appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-8 right-8">
        <Button onClick={() => setIsDialogOpen(true)} className="h-12 px-5 bg-coral hover:bg-red-500 text-white rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_4px_24px_rgba(239,68,68,0.5)] transition-all">
          <Plus className="w-5 h-5 mr-2" />New appointment
        </Button>
      </div>
    </div>
  )
}

type ViewMode = "list" | "calendar"

export function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Appointments</p>
          <h2 className="text-lg font-semibold text-foreground">{viewMode === "list" ? "List view" : "Calendar view"}</h2>
        </div>
        <div className="flex items-center bg-[#12131a] border border-[#2a2b35] rounded-[8px] p-0.5">
          <button onClick={() => setViewMode("list")} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-all", viewMode === "list" ? "bg-coral text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]" : "text-muted-foreground hover:text-foreground")}>
            <LayoutList className="w-3.5 h-3.5" />List
          </button>
          <button onClick={() => setViewMode("calendar")} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-all", viewMode === "calendar" ? "bg-coral text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]" : "text-muted-foreground hover:text-foreground")}>
            <CalendarDays className="w-3.5 h-3.5" />Calendar
          </button>
        </div>
      </div>
      {viewMode === "list" ? <ListView /> : <CalendarPage />}
    </div>
  )
}
