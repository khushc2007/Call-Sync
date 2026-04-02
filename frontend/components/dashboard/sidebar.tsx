"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Phone,
  Bell,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type PageType =
  | "dashboard"
  | "appointments"
  | "calendar"
  | "live-calls"
  | "reminders"
  | "past-appointments"
  | "settings"

interface SidebarProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const navItems: {
  id: PageType
  label: string
  icon: typeof LayoutDashboard
  hasLiveDot?: boolean
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "live-calls", label: "Live Calls", icon: Phone, hasLiveDot: true },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "past-appointments", label: "Past Appointments", icon: ClipboardList },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({
  currentPage,
  onPageChange,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-[#12131a] border-r border-[#2a2b35] transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[#2a2b35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-coral to-red-600 flex items-center justify-center shadow-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white tracking-tight">
                  CallSync<span className="text-coral">.</span>
                </span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                  AI
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            const Icon = item.icon

            const navButton = (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-coral/20 text-coral"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#1a1b23]"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.hasLiveDot && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-teal rounded-full animate-pulse-dot" />
                  )}
                </div>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-[#1a1b23] border-[#2a2b35] text-foreground"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return navButton
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-[#2a2b35]">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <Avatar className="h-10 w-10 border-2 border-[#2a2b35]">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback className="bg-coral/20 text-coral text-sm">PS</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Priyanka S.</p>
                <p className="text-xs text-muted-foreground truncate">Admin</p>
              </div>
            )}
            {!isCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-[#1a1b23]"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
                  Logout
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1a1b23] border border-[#2a2b35] rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#2a2b35] transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  )
}
