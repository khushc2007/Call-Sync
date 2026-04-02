"use client"

import { useState } from "react"
import { Sidebar, type PageType } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { DashboardHome } from "@/components/dashboard/pages/dashboard-home"
import { AppointmentsPage } from "@/components/dashboard/pages/appointments-page"
import { CalendarPage } from "@/components/dashboard/pages/calendar-page"
import { LiveCallsPage } from "@/components/dashboard/pages/live-calls-page"
import { RemindersPage } from "@/components/dashboard/pages/reminders-page"
import { PastAppointmentsPage } from "@/components/dashboard/pages/past-appointments-page"
import { SettingsPage } from "@/components/dashboard/pages/settings-page"
import { Toaster } from "@/components/ui/toaster"

export default function CallSyncDashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardHome />
      case "appointments":
        return <AppointmentsPage />
      case "calendar":
        return <CalendarPage />
      case "live-calls":
        return <LiveCallsPage />
      case "reminders":
        return <RemindersPage />
      case "past-appointments":
        return <PastAppointmentsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Topbar currentPage={currentPage} sidebarCollapsed={sidebarCollapsed} />

      <main
        className={`pt-24 pb-8 px-6 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {renderPage()}
      </main>
      <Toaster />
    </div>
  )
}
