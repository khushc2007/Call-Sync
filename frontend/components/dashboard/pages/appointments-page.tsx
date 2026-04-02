"use client"

import { useState } from "react"
import {
  Calendar,
  Search,
  Download,
  X,
  RefreshCw,
  Check,
  Bell,
  Plus,
  LayoutList,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { mockAppointments, type Appointment } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { CalendarPage } from "./calendar-page"

// ─── Static data ──────────────────────────────────────────────────────────────

const DEFAULT_SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Dentistry",
  "Ophthalmology",
  "Physiotherapy",
  "Neurology",
  "ENT",
]

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-[#1a1b23] rounded-[10px] border border-[#2a2b35] backdrop-blur-sm transition-shadow hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
        className
      )}
    >
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const config = {
    confirmed: { label: "Confirmed", className: "bg-teal/15 text-teal border-teal/30" },
    pending: { label: "Pending", className: "bg-amber/15 text-amber border-amber/30" },
    cancelled: { label: "Cancelled", className: "bg-coral/15 text-coral border-coral/30" },
  }
  return (
    <Badge
      variant="outline"
      className={cn("rounded-[6px] font-normal border", config[status].className)}
    >
      {config[status].label}
    </Badge>
  )
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [appointments, setAppointments] = useState(mockAppointments)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeError, setTimeError] = useState<string | null>(null)
  const { toast } = useToast()

  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    phone: "",
    condition: "",
    doctor: "",
    date: "",
    time: "",
  })

  const resetForm = () => {
    setNewAppointment({ patientName: "", phone: "", condition: "", doctor: "", date: "", time: "" })
    setTimeError(null)
  }

  const checkDuplicateTimeSlot = (date: string, time: string) =>
    appointments.some(
      (apt) => apt.date === date && apt.time === time && apt.status !== "cancelled"
    )

  const handleAddAppointment = () => {
    if (
      !newAppointment.patientName ||
      !newAppointment.phone ||
      !newAppointment.condition ||
      !newAppointment.doctor ||
      !newAppointment.date ||
      !newAppointment.time
    ) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    if (checkDuplicateTimeSlot(newAppointment.date, newAppointment.time)) {
      setTimeError("This time slot is already booked. Please choose a different time.")
      return
    }
    const apt: Appointment = {
      id: `apt-${Date.now()}`,
      ...newAppointment,
      status: "confirmed",
      reminded: false,
    }
    setAppointments((prev) => [apt, ...prev])
    setIsDialogOpen(false)
    resetForm()
    toast({ title: "Appointment added", description: `${apt.patientName} on ${apt.date} at ${apt.time}` })
  }

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    toast({ title: "Status updated" })
  }

  const handleRemind = (id: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, reminded: true } : a)))
    toast({ title: "Reminder sent" })
  }

  const filtered = appointments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false
    if (conditionFilter !== "all" && a.condition !== conditionFilter) return false
    if (searchQuery && !a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) && !a.doctor.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <SectionCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patient or doctor…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-[#12131a] border-[#2a2b35] text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-coral/30"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm bg-[#12131a] border-[#2a2b35] text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-44 h-9 text-sm bg-[#12131a] border-[#2a2b35] text-foreground">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all">All Specialties</SelectItem>
              {DEFAULT_SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </SectionCard>

      {/* Table */}
      <SectionCard>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2b35]">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">Appointments</h3>
            <Badge variant="outline" className="bg-coral/15 text-coral border-coral/30 text-xs rounded-[6px]">
              {filtered.length}
            </Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2b35]">
                {["Patient", "Phone", "Specialty", "Doctor", "Date", "Time", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="w-10 h-10 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">No appointments found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filters or add a new appointment</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((apt, i) => (
                  <tr
                    key={apt.id}
                    className={cn(
                      "border-b border-[#2a2b35]/50 transition-colors hover:bg-[#12131a] animate-in slide-in-from-bottom-2"
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">
                      {apt.patientName}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">
                      {apt.phone}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                      {apt.condition}
                    </td>
                    <td className="px-5 py-3 text-foreground whitespace-nowrap">{apt.doctor}</td>
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{apt.date}</td>
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{apt.time}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {apt.status !== "confirmed" && (
                          <button
                            onClick={() => handleStatusChange(apt.id, "confirmed")}
                            className="w-7 h-7 flex items-center justify-center rounded-[4px] bg-teal/15 text-teal hover:bg-teal/25 transition-colors"
                            title="Confirm"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {apt.status !== "cancelled" && (
                          <button
                            onClick={() => handleStatusChange(apt.id, "cancelled")}
                            className="w-7 h-7 flex items-center justify-center rounded-[4px] bg-coral/15 text-coral hover:bg-coral/25 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(apt.id, "pending")}
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] bg-amber/15 text-amber hover:bg-amber/25 transition-colors"
                          title="Reschedule"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        {!apt.reminded && apt.status !== "cancelled" && (
                          <button
                            onClick={() => handleRemind(apt.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-[4px] bg-[#12131a] border border-[#2a2b35] text-muted-foreground hover:text-foreground transition-colors"
                            title="Send Reminder"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {apt.reminded && (
                          <span className="text-[10px] text-teal flex items-center gap-1">
                            <Check className="w-3 h-3" /> Reminded
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Add Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm() }}>
        <DialogContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">New Appointment</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details to book a new appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {[
              { label: "Patient Name", key: "patientName", placeholder: "Full name" },
              { label: "Phone", key: "phone", placeholder: "+91 98XXXXXXXX" },
              { label: "Doctor", key: "doctor", placeholder: "Dr. Name" },
              { label: "Date", key: "date", placeholder: "1 Apr" },
              { label: "Time", key: "time", placeholder: "10:00 AM" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  placeholder={placeholder}
                  value={newAppointment[key as keyof typeof newAppointment]}
                  onChange={(e) => {
                    setNewAppointment((prev) => ({ ...prev, [key]: e.target.value }))
                    if (key === "time" || key === "date") setTimeError(null)
                  }}
                  className="h-9 bg-[#12131a] border-[#2a2b35] text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-coral/30"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Specialty</Label>
              <Select
                value={newAppointment.condition}
                onValueChange={(v) => setNewAppointment((p) => ({ ...p, condition: v }))}
              >
                <SelectTrigger className="h-9 bg-[#12131a] border-[#2a2b35] text-foreground text-sm">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
                  {DEFAULT_SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {timeError && (
            <p className="text-xs text-coral bg-coral/10 border border-coral/20 rounded-[6px] px-3 py-2">
              {timeError}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setIsDialogOpen(false); resetForm() }}
              className="bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAppointment}
              className="bg-coral hover:bg-red-500 text-white shadow-[0_2px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_2px_16px_rgba(239,68,68,0.35)] transition-all"
            >
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAB */}
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="h-12 px-5 bg-coral hover:bg-red-500 text-white rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_4px_24px_rgba(239,68,68,0.5)] transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewMode = "list" | "calendar"

export function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  return (
    <div className="space-y-4">
      {/* View toggle header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
            Appointments
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {viewMode === "list" ? "List View" : "Calendar View"}
          </h2>
        </div>
        <div className="flex items-center bg-[#12131a] border border-[#2a2b35] rounded-[8px] p-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-all",
              viewMode === "list"
                ? "bg-coral text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutList className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-all",
              viewMode === "calendar"
                ? "bg-coral text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? <ListView /> : <CalendarPage />}
    </div>
  )
}
