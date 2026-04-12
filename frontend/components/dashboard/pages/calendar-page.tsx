"use client"

import { useState, useMemo } from "react"
import { useAppointments } from "@/hooks/use-appointments"
import {
  format,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  addHours,
  subWeeks,
  subMonths,
  subDays,
  isSameDay,
  isSameMonth,
  isToday,
  getDay,
  eachDayOfInterval,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Phone,
  User,
  Stethoscope,
  Clock,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = "day" | "week" | "month"
type ApptStatus = "confirmed" | "pending" | "cancelled"

interface CalendarAppointment {
  id: string
  patientName: string
  phone: string
  doctor: string
  specialty: string
  date: Date
  hour: number
  minute: number
  durationMins: number
  status: ApptStatus
  notes: string
}

// ─── Static data ─────────────────────────────────────────────────────────────

const DOCTORS = [
  { name: "Dr. Vikram Patel", specialty: "General Medicine" },
  { name: "Dr. Sunita Rao", specialty: "General Medicine" },
  { name: "Dr. Arjun Mehta", specialty: "Cardiology" },
  { name: "Dr. Preethi Nair", specialty: "Cardiology" },
  { name: "Dr. Rohan Kapoor", specialty: "Orthopedics" },
  { name: "Dr. Anjali Desai", specialty: "Dentistry" },
  { name: "Dr. Kavitha Menon", specialty: "Pediatrics" },
  { name: "Dr. Siddharth Iyer", specialty: "Neurology" },
  { name: "Dr. Meera Krishnan", specialty: "Dermatology" },
  { name: "Dr. Rahul Bose", specialty: "Ophthalmology" },
  { name: "Dr. Divya Sharma", specialty: "ENT" },
  { name: "Dr. Anil Kumar", specialty: "Physiotherapy" },
]

const SPECIALTIES = [...new Set(DOCTORS.map((d) => d.specialty))]

const PATIENT_NAMES = [
  "Aarav Sharma", "Priya Mehta", "Rohan Gupta", "Sneha Patel", "Kiran Reddy",
  "Ananya Iyer", "Vikram Nair", "Deepa Krishnan", "Arjun Bose", "Kavya Rao",
  "Suresh Menon", "Pooja Desai", "Rahul Kapoor", "Meera Singh", "Aditya Kumar",
  "Neha Joshi", "Sanjay Pillai", "Lakshmi Verma", "Ravi Chandra", "Divya Das",
  "Amit Saxena", "Rekha Nambiar", "Varun Tiwari", "Sunita Bhatt", "Mohan Yadav",
  "Geeta Mishra", "Prasad Kulkarni", "Asha Shetty", "Nikhil Patil", "Padma Rajan",
]

const NOTES_POOL = [
  "Patient reports mild symptoms. Follow-up required.",
  "First consultation. Medical history to be collected.",
  "Routine checkup. Patient is stable.",
  "Post-surgery follow-up. Recovering well.",
  "Chronic condition management. Medication adjusted.",
  "Diagnostic tests ordered. Results pending.",
  "Referred by GP. Specialist evaluation needed.",
  "Annual health screening. No major concerns.",
]

function generateAppointments(): CalendarAppointment[] {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const appointments: CalendarAppointment[] = []
  const statuses: ApptStatus[] = ["confirmed", "confirmed", "confirmed", "pending", "cancelled"]
  const hours = [8, 9, 10, 10, 11, 11, 12, 14, 14, 15, 15, 16, 16, 17]

  let id = 1
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = addDays(weekStart, dayOffset)
    const slotsToday = 5 + Math.floor(Math.random() * 4)
    const usedHours = new Set<number>()

    for (let s = 0; s < slotsToday; s++) {
      let hour = hours[Math.floor(Math.random() * hours.length)]
      let attempts = 0
      while (usedHours.has(hour) && attempts < 10) {
        hour = hours[Math.floor(Math.random() * hours.length)]
        attempts++
      }
      if (usedHours.has(hour)) continue
      usedHours.add(hour)

      const doctor = DOCTORS[Math.floor(Math.random() * DOCTORS.length)]
      const patient = PATIENT_NAMES[Math.floor(Math.random() * PATIENT_NAMES.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      appointments.push({
        id: `cal-${id++}`,
        patientName: patient,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
        doctor: doctor.name,
        specialty: doctor.specialty,
        date: day,
        hour,
        minute: Math.random() > 0.5 ? 30 : 0,
        durationMins: [15, 20, 30, 45][Math.floor(Math.random() * 4)],
        status,
        notes: NOTES_POOL[Math.floor(Math.random() * NOTES_POOL.length)],
      })
    }
  }
  return appointments
}

const ALL_APPOINTMENTS = generateAppointments()

// ─── Shared helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ApptStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  confirmed: {
    label: "Confirmed",
    bg: "bg-teal/15",
    text: "text-teal",
    border: "border-teal/30",
    dot: "bg-teal",
  },
  pending: {
    label: "Pending",
    bg: "bg-amber/15",
    text: "text-amber",
    border: "border-amber/30",
    dot: "bg-amber",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-coral/15",
    text: "text-coral",
    border: "border-coral/30",
    dot: "bg-coral",
  },
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8–19

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
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

function StatusBadge({ status }: { status: ApptStatus }) {
  const c = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn("rounded-[6px] font-normal border text-xs", c.bg, c.text, c.border)}>
      {c.label}
    </Badge>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function AppointmentModal({
  appt,
  onClose,
}: {
  appt: CalendarAppointment | null
  onClose: () => void
}) {
  if (!appt) return null
  const c = STATUS_CONFIG[appt.status]
  return (
    <Dialog open={!!appt} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CalendarDays className="w-5 h-5 text-coral" />
            Appointment Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className={cn("flex items-center gap-3 p-3 rounded-[8px] border", c.bg, c.border)}>
            <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", c.dot)} />
            <span className={cn("text-sm font-medium", c.text)}>{c.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={User} label="Patient" value={appt.patientName} />
            <InfoRow icon={Phone} label="Phone" value={appt.phone} />
            <InfoRow icon={Stethoscope} label="Doctor" value={appt.doctor} />
            <InfoRow icon={Stethoscope} label="Specialty" value={appt.specialty} />
            <InfoRow
              icon={CalendarDays}
              label="Date"
              value={format(appt.date, "EEE, d MMM yyyy")}
            />
            <InfoRow
              icon={Clock}
              label="Time"
              value={`${String(appt.hour).padStart(2, "0")}:${String(appt.minute).padStart(2, "0")} — ${appt.durationMins} min`}
            />
          </div>
          <div className="p-3 bg-[#12131a] rounded-[8px] border border-[#2a2b35]">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-foreground">{appt.notes}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="p-3 bg-[#12131a] rounded-[8px] border border-[#2a2b35]">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  )
}

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({
  date,
  appointments,
  onSelectAppt,
}: {
  date: Date
  appointments: CalendarAppointment[]
  onSelectAppt: (a: CalendarAppointment) => void
}) {
  const dayAppts = appointments.filter((a) => isSameDay(a.date, date))

  return (
    <SectionCard className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2b35]">
        <h3 className="font-semibold text-foreground">{format(date, "EEEE, d MMMM")}</h3>
        <Badge variant="outline" className="bg-coral/15 text-coral border-coral/30 text-xs">
          {dayAppts.length} appointments
        </Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="overflow-auto min-w-[340px]">
          {HOURS.map((hour) => {
            const slotAppts = dayAppts.filter((a) => a.hour === hour)
            return (
              <div key={hour} className="flex border-b border-[#2a2b35]/50 min-h-[64px]">
                <div className="w-16 flex-shrink-0 flex items-start justify-end pr-3 pt-2">
                  <span className="text-xs text-muted-foreground">
                    {hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                  </span>
                </div>
                <div className="flex-1 px-2 py-1 flex flex-col gap-1">
                  {slotAppts.map((appt) => {
                    const c = STATUS_CONFIG[appt.status]
                    return (
                      <button
                        key={appt.id}
                        onClick={() => onSelectAppt(appt)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-[6px] border transition-all hover:brightness-110 overflow-hidden",
                          c.bg, c.border
                        )}
                      >
                        <p className={cn("text-xs font-semibold truncate", c.text)}>{appt.patientName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{appt.doctor} · {appt.durationMins}min</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </SectionCard>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  weekStart,
  appointments,
  onSelectAppt,
}: {
  weekStart: Date
  appointments: CalendarAppointment[]
  onSelectAppt: (a: CalendarAppointment) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <SectionCard className="flex-1 flex flex-col overflow-hidden">
      <div className="overflow-auto min-w-[700px]">
        {/* Header row */}
        <div className="flex border-b border-[#2a2b35] sticky top-0 bg-[#1a1b23] z-10">
          <div className="w-16 flex-shrink-0" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "flex-1 text-center py-3 border-l border-[#2a2b35]",
                isToday(day) && "bg-coral/5"
              )}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{format(day, "EEE")}</p>
              <p
                className={cn(
                  "text-sm font-semibold mt-0.5",
                  isToday(day) ? "text-coral" : "text-foreground"
                )}
              >
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>
        {/* Hour rows */}
        {HOURS.map((hour) => (
          <div key={hour} className="flex border-b border-[#2a2b35]/40 min-h-[56px]">
            <div className="w-16 flex-shrink-0 flex items-start justify-end pr-3 pt-1.5">
              <span className="text-[11px] text-muted-foreground">
                {hour < 12 ? `${hour}AM` : hour === 12 ? "12PM" : `${hour - 12}PM`}
              </span>
            </div>
            {days.map((day) => {
              const slotAppts = appointments.filter(
                (a) => isSameDay(a.date, day) && a.hour === hour
              )
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex-1 border-l border-[#2a2b35] px-1 py-1 flex flex-col gap-0.5",
                    isToday(day) && "bg-coral/5"
                  )}
                >
                  {slotAppts.map((appt) => {
                    const c = STATUS_CONFIG[appt.status]
                    return (
                      <button
                        key={appt.id}
                        onClick={() => onSelectAppt(appt)}
                        className={cn(
                          "w-full text-left px-2 py-1 rounded-[4px] border overflow-hidden transition-all hover:brightness-110",
                          c.bg, c.border
                        )}
                      >
                        <p className={cn("text-[10px] font-semibold truncate leading-tight", c.text)}>
                          {appt.patientName}
                        </p>
                        <p className="text-[9px] text-muted-foreground truncate">
                          {String(hour).padStart(2, "0")}:{String(appt.minute).padStart(2, "0")}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  month,
  appointments,
  onSelectAppt,
}: {
  month: Date
  appointments: CalendarAppointment[]
  onSelectAppt: (a: CalendarAppointment) => void
}) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const allDays = eachDayOfInterval({ start: calStart, end: addDays(monthEnd, 6 - getDay(monthEnd)) })

  const selectedDayAppts = selectedDay
    ? appointments.filter((a) => isSameDay(a.date, selectedDay))
    : []

  return (
    <div className="flex gap-4 flex-1">
      <SectionCard className="flex-1 overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-[#2a2b35]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center py-2 text-xs text-muted-foreground font-medium">
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7">
          {allDays.map((day, i) => {
            const dayAppts = appointments.filter((a) => isSameDay(a.date, day))
            const isCurrentMonth = isSameMonth(day, month)
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                className={cn(
                  "min-h-[90px] p-2 border-b border-r border-[#2a2b35] text-left transition-colors",
                  !isCurrentMonth && "opacity-40",
                  isSelected && "bg-coral/10",
                  isToday(day) && !isSelected && "bg-[#12131a]",
                  "hover:bg-[#12131a]"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full",
                    isToday(day) ? "bg-coral text-white" : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayAppts.slice(0, 3).map((appt) => {
                    const c = STATUS_CONFIG[appt.status]
                    return (
                      <div
                        key={appt.id}
                        className={cn("text-[9px] px-1.5 py-0.5 rounded-[3px] truncate border", c.bg, c.text, c.border)}
                      >
                        {appt.patientName}
                      </div>
                    )
                  })}
                  {dayAppts.length > 3 && (
                    <div className="text-[9px] text-muted-foreground px-1">
                      +{dayAppts.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </SectionCard>

      {/* Side panel for selected day */}
      {selectedDay && (
        <SectionCard className="w-72 flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2b35]">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {format(selectedDay, "EEEE")}
              </p>
              <p className="font-semibold text-foreground">{format(selectedDay, "d MMMM")}</p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 p-3">
            {selectedDayAppts.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No appointments</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayAppts.map((appt) => {
                  const c = STATUS_CONFIG[appt.status]
                  return (
                    <button
                      key={appt.id}
                      onClick={() => onSelectAppt(appt)}
                      className={cn(
                        "w-full text-left p-3 rounded-[8px] border transition-all hover:brightness-110 overflow-hidden",
                        c.bg, c.border
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={cn("text-xs font-semibold truncate", c.text)}>{appt.patientName}</p>
                        <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                          {String(appt.hour).padStart(2, "0")}:{String(appt.minute).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{appt.doctor}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </SectionCard>
      )}
    </div>
  )
}

// ─── Main Calendar Page ───────────────────────────────────────────────────────

export function CalendarPage() {
  const [view, setView] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [selectedAppt, setSelectedAppt] = useState<CalendarAppointment | null>(null)

  const { appointments: liveApts } = useAppointments({ pollingInterval: 60_000 })

  // Convert live Supabase appointments to CalendarAppointment shape
  const liveCalendarApts = useMemo<CalendarAppointment[]>(() => {
    return liveApts
      .filter(a => a.date && a.time)
      .map(a => {
        const [hourStr, minStr] = a.time.split(":")
        const hour = parseInt(hourStr, 10)
        const minute = parseInt(minStr || "0", 10)
        // Parse date — Supabase returns ISO date string
        const [y, m, d] = a.date.split("-").map(Number)
        return {
          id: a.id,
          patientName: a.name,
          phone: a.phone,
          doctor: a.doctor ?? "—",
          specialty: a.condition ?? "General",
          date: new Date(y, m - 1, d),
          hour: isNaN(hour) ? 9 : hour,
          minute: isNaN(minute) ? 0 : minute,
          durationMins: 30,
          status: a.status as ApptStatus,
          notes: a.reminded ? "Reminder sent." : "No notes.",
        }
      })
  }, [liveApts])

  // Merge: live data overrides generated data by id
  const mergedAppointments = useMemo(() => {
    const liveIds = new Set(liveCalendarApts.map(a => a.id))
    const generated = ALL_APPOINTMENTS.filter(a => !liveIds.has(a.id))
    return liveCalendarApts.length > 0
      ? [...liveCalendarApts, ...generated.slice(0, Math.max(0, 20 - liveCalendarApts.length))]
      : generated
  }, [liveCalendarApts])

  const filteredDoctors = useMemo(
    () =>
      selectedSpecialty === "all"
        ? DOCTORS
        : DOCTORS.filter((d) => d.specialty === selectedSpecialty),
    [selectedSpecialty]
  )

  const filteredAppointments = useMemo(() => {
    return mergedAppointments.filter((a) => {
      if (selectedSpecialty !== "all" && a.specialty !== selectedSpecialty) return false
      if (selectedDoctor !== "all" && a.doctor !== selectedDoctor) return false
      return true
    })
  }, [mergedAppointments, selectedSpecialty, selectedDoctor])

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })

  function navigate(dir: 1 | -1) {
    if (view === "day") setCurrentDate((d) => (dir === 1 ? addDays(d, 1) : subDays(d, 1)))
    else if (view === "week") setCurrentDate((d) => (dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)))
    else setCurrentDate((d) => (dir === 1 ? addMonths(d, 1) : subMonths(d, 1)))
  }

  function getHeaderLabel() {
    if (view === "day") return format(currentDate, "EEEE, d MMMM yyyy")
    if (view === "week")
      return `${format(weekStart, "d MMM")} – ${format(addDays(weekStart, 6), "d MMM yyyy")}`
    return format(currentDate, "MMMM yyyy")
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] bg-[#1a1b23] border border-[#2a2b35] text-muted-foreground hover:text-foreground hover:bg-[#2a2b35] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] bg-[#1a1b23] border border-[#2a2b35] text-muted-foreground hover:text-foreground hover:bg-[#2a2b35] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-foreground min-w-[200px]">{getHeaderLabel()}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="h-8 px-3 text-xs bg-[#1a1b23] border-[#2a2b35] text-muted-foreground hover:text-foreground hover:bg-[#2a2b35]"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-[#12131a] border border-[#2a2b35] rounded-[8px] p-0.5">
            {(["day", "week", "month"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-[6px] capitalize transition-all",
                  view === v
                    ? "bg-coral text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Specialty filter */}
          <Select
            value={selectedSpecialty}
            onValueChange={(v) => {
              setSelectedSpecialty(v)
              setSelectedDoctor("all")
            }}
          >
            <SelectTrigger className="w-44 h-8 text-xs bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all" className="text-xs">All Specialties</SelectItem>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Doctor filter */}
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-44 h-8 text-xs bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectValue placeholder="All Doctors" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all" className="text-xs">All Doctors</SelectItem>
              {filteredDoctors.map((d) => (
                <SelectItem key={d.name} value={d.name} className="text-xs">{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        {(Object.entries(STATUS_CONFIG) as [ApptStatus, typeof STATUS_CONFIG[ApptStatus]][]).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", v.dot)} />
            <span className="text-xs text-muted-foreground">{v.label}</span>
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">
          {filteredAppointments.length} appointments shown
        </span>
      </div>

      {/* Calendar body */}
      <div className="flex flex-col flex-1 min-h-0">
        {view === "day" && (
          <DayView
            date={currentDate}
            appointments={filteredAppointments}
            onSelectAppt={setSelectedAppt}
          />
        )}
        {view === "week" && (
          <WeekView
            weekStart={weekStart}
            appointments={filteredAppointments}
            onSelectAppt={setSelectedAppt}
          />
        )}
        {view === "month" && (
          <MonthView
            month={currentDate}
            appointments={filteredAppointments}
            onSelectAppt={setSelectedAppt}
          />
        )}
      </div>

      <AppointmentModal appt={selectedAppt} onClose={() => setSelectedAppt(null)} />
    </div>
  )
}
