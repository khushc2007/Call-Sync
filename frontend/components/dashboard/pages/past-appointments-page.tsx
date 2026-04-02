"use client"

import { useState } from "react"
import { Search, X, User, Phone, Calendar, Pill, FileText, Activity, Stethoscope, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockPastAppointments, mockPatientHistory, type PastAppointment, type PatientHistory, type AppointmentStatusType } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function OutcomeBadge({ outcome }: { outcome: PastAppointment["outcome"] }) {
  const config = {
    recovered: { label: "Recovered", className: "bg-teal/20 text-teal border-teal/30" },
    "follow-up": { label: "Follow-up Advised", className: "bg-amber/20 text-amber border-amber/30" },
    "under-treatment": { label: "Under Treatment", className: "bg-coral/20 text-coral border-coral/30" },
  }

  return (
    <Badge variant="outline" className={cn("rounded-[6px] font-normal border", config[outcome].className)}>
      {config[outcome].label}
    </Badge>
  )
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatusType }) {
  const config = {
    complete: { label: "Complete", className: "bg-teal/20 text-teal border-teal/30" },
    waiting: { label: "Waiting", className: "bg-amber/20 text-amber border-amber/30" },
    canceled: { label: "Canceled", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  }

  return (
    <Badge variant="outline" className={cn("rounded-[6px] font-normal border", config[status].className)}>
      {config[status].label}
    </Badge>
  )
}

function PatientDetailDrawer({
  patient,
  onClose,
}: {
  patient: PatientHistory | null
  onClose: () => void
}) {
  if (!patient) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-[#12131a] border-l border-[#2a2b35] h-full overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2b35]">
          <h2 className="text-lg font-semibold text-foreground">Patient Medical History</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-[#1a1b23]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-6 space-y-6">
            {/* Patient Info Card */}
            <div className="bg-[#1a1b23] rounded-[10px] p-5 border border-[#2a2b35]">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-coral/20 border-2 border-coral/30 flex items-center justify-center">
                  <User className="w-7 h-7 text-coral" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{patient.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{patient.age} years</span>
                    <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                    <span>{patient.gender}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History Summary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-coral" />
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Medical History</h4>
              </div>
              <div className="bg-[#1a1b23] rounded-[10px] p-4 border border-[#2a2b35]">
                <ul className="space-y-2">
                  {patient.medicalHistory.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-coral rounded-full mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Past Visits */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-coral" />
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Past Visits</h4>
              </div>
              <div className="space-y-4">
                {patient.pastVisits.map((visit, index) => (
                  <div
                    key={index}
                    className="bg-[#1a1b23] rounded-[10px] p-4 border border-[#2a2b35]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">{visit.date}</span>
                      <Badge variant="outline" className="bg-coral/10 text-coral border-coral/30 rounded-[6px] text-xs">
                        {visit.condition}
                      </Badge>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase">Diagnosis</span>
                      </div>
                      <p className="text-sm text-foreground">{visit.diagnosis}</p>
                    </div>

                    {/* Medicines */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Pill className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase">Medicines Prescribed</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {visit.medicines.map((med, medIndex) => (
                          <Badge
                            key={medIndex}
                            variant="outline"
                            className="bg-[#12131a] text-muted-foreground border-[#2a2b35] rounded-[6px] text-xs font-normal"
                          >
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase">Notes</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{visit.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export function PastAppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<PatientHistory | null>(null)
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null)

  const filteredAppointments = mockPastAppointments.filter((apt) =>
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePatientClick = (patientId: string) => {
    const patient = mockPatientHistory[patientId]
    if (patient) {
      setSelectedPatient(patient)
    }
  }

  const toggleExpand = (patientId: string) => {
    setExpandedPatientId(expandedPatientId === patientId ? null : patientId)
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-[#1a1b23] rounded-[10px] p-4 border border-[#2a2b35]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient name, condition, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#12131a] border border-[#2a2b35] rounded-[6px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral/50 transition-colors"
          />
        </div>
      </div>

      {/* Past Appointments - Patient List */}
      <div className="bg-[#1a1b23] rounded-[10px] border border-[#2a2b35] overflow-hidden">
        <div className="p-4 border-b border-[#2a2b35]">
          <h3 className="text-lg font-semibold text-foreground">Past Appointments</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click on a patient to view their diagnosis, doctor, and appointment status
          </p>
        </div>

        <div className="divide-y divide-[#2a2b35]">
          {filteredAppointments.map((apt) => (
            <div key={apt.id}>
              {/* Patient Row */}
              <button
                onClick={() => toggleExpand(apt.patientId)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-4 transition-colors hover:bg-[#12131a] text-left",
                  expandedPatientId === apt.patientId && "bg-[#12131a]"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-coral/20 border border-coral/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{apt.patientName}</p>
                    <p className="text-xs text-muted-foreground">{apt.condition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">Last Visit</p>
                    <p className="text-sm text-foreground">{apt.lastVisit}</p>
                  </div>
                  <AppointmentStatusBadge status={apt.appointmentStatus} />
                  <ChevronRight 
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      expandedPatientId === apt.patientId && "rotate-90"
                    )} 
                  />
                </div>
              </button>

              {/* Expanded Details */}
              {expandedPatientId === apt.patientId && (
                <div className="px-4 pb-4 bg-[#12131a] animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#1a1b23] rounded-[10px] border border-[#2a2b35]">
                    {/* Diagnosis */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-coral" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Diagnosis</span>
                      </div>
                      <p className="text-sm text-foreground">{apt.diagnosis}</p>
                    </div>

                    {/* Treating Doctor */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-coral" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Treating Doctor</span>
                      </div>
                      <p className="text-sm text-foreground">{apt.doctor}</p>
                    </div>

                    {/* Appointment Status */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-coral" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AppointmentStatusBadge status={apt.appointmentStatus} />
                        <OutcomeBadge outcome={apt.outcome} />
                      </div>
                    </div>
                  </div>

                  {/* View Full History Button */}
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={() => handlePatientClick(apt.patientId)}
                      variant="outline"
                      size="sm"
                      className="bg-coral/10 text-coral border-coral/30 hover:bg-coral/20 hover:text-coral"
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Full Medical History
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No past appointments found matching your search.</p>
          </div>
        )}
      </div>

      {/* Patient Detail Drawer */}
      <PatientDetailDrawer
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  )
}
