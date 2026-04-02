"use client"

import { Bell, Send, Clock, AlertCircle, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAppointmentsWithReminders, getRemindersNext24Hours, type ReminderStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
  const config = {
    scheduled: { 
      label: "Scheduled", 
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: Clock
    },
    sent: { 
      label: "Sent", 
      className: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: Check
    },
    failed: { 
      label: "Failed", 
      className: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: X
    },
    not_required: { 
      label: "Not Required", 
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      icon: AlertCircle
    },
  }

  const Icon = config[status].icon

  return (
    <Badge variant="outline" className={cn("rounded-full font-normal border gap-1", config[status].className)}>
      <Icon className="w-3 h-3" />
      {config[status].label}
    </Badge>
  )
}

export function RemindersPage() {
  const remindersNext24Hours = getRemindersNext24Hours()
  
  // Sort appointments: scheduled first, then by date
  const sortedAppointments = [...mockAppointmentsWithReminders].sort((a, b) => {
    // Priority order: scheduled > sent > failed > not_required
    const priority: Record<ReminderStatus, number> = { scheduled: 0, sent: 1, failed: 2, not_required: 3 }
    const priorityDiff = priority[a.reminderStatus] - priority[b.reminderStatus]
    if (priorityDiff !== 0) return priorityDiff
    return 0 // Keep original order for same priority
  })

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Bell className="w-7 h-7 text-yellow-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{remindersNext24Hours}</p>
              <p className="text-sm text-white/60">Reminders scheduled for next 24 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">92%</p>
              <p className="text-sm text-white/40">Delivery rate</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{mockAppointmentsWithReminders.filter(a => a.reminderStatus === "sent").length}</p>
              <p className="text-sm text-white/40">Sent today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Reminder Status</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {mockAppointmentsWithReminders.filter(a => a.reminderStatus === "scheduled").length} Pending
            </Badge>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Appointment Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Reminder Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Sent At</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{apt.patientName}</p>
                      <p className="text-xs text-white/40">{apt.service}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70">{apt.phone}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-white/70">
                        {new Date(apt.date).toLocaleDateString('en-IN', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-white/40">{apt.time}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ReminderStatusBadge status={apt.reminderStatus} />
                  </td>
                  <td className="px-4 py-3 text-sm text-white/50">
                    {apt.reminderSentAt || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {apt.reminderStatus === "scheduled" && (
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full h-8 px-3 text-xs"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send Now
                      </Button>
                    )}
                    {apt.reminderStatus === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-full h-8 px-3 text-xs"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    )}
                    {(apt.reminderStatus === "sent" || apt.reminderStatus === "not_required") && (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-white/40">
            Showing {sortedAppointments.length} appointments
          </p>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-white/50">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/50">Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-white/50">Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-white/50">Not Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
