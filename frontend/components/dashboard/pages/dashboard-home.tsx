"use client"

import { useMemo } from "react"
import {
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  Phone,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { mockDashboardStats, mockTodaySchedule, mockLiveCalls, type CallOutcome } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

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

function CardHeader({
  title,
  right,
}: {
  title: string
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2b35]">
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      {right}
    </div>
  )
}

// ─── KPI Sparkline data ───────────────────────────────────────────────────────

const makeSparkline = (base: number) =>
  Array.from({ length: 7 }, (_, i) => ({
    v: Math.max(0, base + Math.round((Math.random() - 0.5) * base * 0.4)),
  }))

// ─── KPI Cards ────────────────────────────────────────────────────────────────

type KpiVariant = "success" | "warning" | "default" | "danger"

const VARIANT_STYLES: Record<
  KpiVariant,
  { accent: string; iconBg: string; iconText: string; spark: string; trendColor: string }
> = {
  success: {
    accent: "bg-teal",
    iconBg: "bg-teal/15",
    iconText: "text-teal",
    spark: "hsl(174 72% 46%)",
    trendColor: "text-teal",
  },
  warning: {
    accent: "bg-amber",
    iconBg: "bg-amber/15",
    iconText: "text-amber",
    spark: "hsl(38 92% 50%)",
    trendColor: "text-amber",
  },
  default: {
    accent: "bg-coral",
    iconBg: "bg-coral/15",
    iconText: "text-coral",
    spark: "hsl(0 84% 60%)",
    trendColor: "text-coral",
  },
  danger: {
    accent: "bg-red-500",
    iconBg: "bg-red-500/15",
    iconText: "text-red-400",
    spark: "hsl(0 84% 60%)",
    trendColor: "text-red-400",
  },
}

function KpiCard({
  title,
  value,
  icon: Icon,
  variant,
  trend,
  trendLabel,
}: {
  title: string
  value: number
  icon: typeof Calendar
  variant: KpiVariant
  trend: "up" | "down"
  trendLabel: string
}) {
  const s = VARIANT_STYLES[variant]
  const sparkData = useMemo(() => makeSparkline(value), [value])

  return (
    <SectionCard className="relative overflow-hidden flex flex-col">
      {/* accent top bar */}
      <div className={cn("h-0.5 w-full", s.accent)} />
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-10 h-10 rounded-[8px] flex items-center justify-center", s.iconBg)}>
            <Icon className={cn("w-5 h-5", s.iconText)} />
          </div>
          <div className={cn("flex items-center gap-1 text-xs", s.trendColor)}>
            {trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trendLabel}</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground mb-0.5">{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
      {/* Sparkline */}
      <div className="h-12 px-0 -mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`sg-${variant}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.spark} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.spark} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={s.spark}
              strokeWidth={1.5}
              fill={`url(#sg-${variant})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ─── Today's Schedule ─────────────────────────────────────────────────────────

function TodaySchedule() {
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()

  return (
    <SectionCard className="flex flex-col h-full">
      <CardHeader
        title="Today's Schedule"
        right={
          <Badge variant="outline" className="bg-coral/15 text-coral border-coral/30 text-xs rounded-[6px]">
            {mockTodaySchedule.length} apts
          </Badge>
        }
      />
      <ScrollArea className="flex-1">
        <div className="p-4 relative">
          {/* vertical timeline line */}
          <div className="absolute left-[28px] top-4 bottom-4 w-px bg-[#2a2b35]" />
          <div className="space-y-3">
            {mockTodaySchedule.map((item, i) => {
              const isCompleted = item.status === "completed"
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* node */}
                  <div
                    className={cn(
                      "relative z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1",
                      isCompleted
                        ? "border-teal bg-teal/20"
                        : "border-amber bg-amber/20"
                    )}
                  />
                  <div
                    className={cn(
                      "flex-1 p-3 rounded-[8px] border transition-colors",
                      isCompleted
                        ? "bg-teal/5 border-teal/20"
                        : "bg-[#12131a] border-[#2a2b35]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] rounded-[4px] font-normal border",
                          isCompleted
                            ? "bg-teal/15 text-teal border-teal/30"
                            : "bg-amber/15 text-amber border-amber/30"
                        )}
                      >
                        {isCompleted ? "Done" : "Upcoming"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.patientName}</p>
                    <p className="text-xs text-muted-foreground">{item.condition}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </SectionCard>
  )
}

// ─── AI Call Activity ─────────────────────────────────────────────────────────

const CALL_ACTIVITY = Array.from({ length: 13 }, (_, i) => ({
  hour: `${8 + i}:00`,
  calls: Math.floor(Math.random() * 18) + 2,
  success: Math.floor(Math.random() * 14) + 1,
}))

const totalCalls = CALL_ACTIVITY.reduce((a, b) => a + b.calls, 0)
const totalSuccess = CALL_ACTIVITY.reduce((a, b) => a + b.success, 0)
const successRate = Math.round((totalSuccess / totalCalls) * 100)

function AICallActivity() {
  return (
    <SectionCard className="flex flex-col h-full">
      <CardHeader
        title="AI Call Activity"
        right={
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal" />
            <span className="text-xs text-teal font-medium">Live</span>
          </div>
        }
      />
      <div className="px-5 py-3 flex items-center gap-6 border-b border-[#2a2b35]">
        <div>
          <p className="text-2xl font-bold text-foreground">{totalCalls}</p>
          <p className="text-xs text-muted-foreground">Total calls today</p>
        </div>
        <div className="w-px h-10 bg-[#2a2b35]" />
        <div>
          <p className="text-2xl font-bold text-teal">{successRate}%</p>
          <p className="text-xs text-muted-foreground">Success rate</p>
        </div>
      </div>
      <div className="flex-1 px-3 py-4 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={CALL_ACTIVITY} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="hour"
              tick={{ fill: "hsl(215 16% 57%)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: "hsl(215 16% 57%)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1b23",
                border: "1px solid #2a2b35",
                borderRadius: 8,
                fontSize: 11,
                color: "hsl(210 20% 98%)",
              }}
              itemStyle={{ color: "hsl(174 72% 46%)" }}
              cursor={{ stroke: "#2a2b35" }}
            />
            <Line
              type="monotone"
              dataKey="calls"
              stroke="hsl(0 84% 60%)"
              strokeWidth={2}
              dot={false}
              name="Calls"
            />
            <Line
              type="monotone"
              dataKey="success"
              stroke="hsl(174 72% 46%)"
              strokeWidth={2}
              dot={false}
              name="Booked"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ─── Live Call Feed ───────────────────────────────────────────────────────────

const outcomeConfig: Record<CallOutcome, { label: string; className: string }> = {
  booked: { label: "Booked", className: "bg-teal/15 text-teal border-teal/30" },
  rescheduled: { label: "Rescheduled", className: "bg-amber/15 text-amber border-amber/30" },
  cancelled: { label: "Cancelled", className: "bg-coral/15 text-coral border-coral/30" },
}

function LiveCallFeed() {
  return (
    <SectionCard className="flex flex-col h-full">
      <CardHeader
        title="Live Call Feed"
        right={
          <Badge variant="outline" className="bg-teal/15 text-teal border-teal/30 text-xs rounded-[6px]">
            <span className="w-1.5 h-1.5 bg-teal rounded-full mr-1.5 animate-pulse-dot" />
            Live
          </Badge>
        }
      />
      <ScrollArea className="flex-1">
        {mockLiveCalls.length > 0 ? (
          <div className="p-4 space-y-2">
            {mockLiveCalls.map((call, i) => {
              const initials = call.callerPhone.slice(-4)
              return (
                <div
                  key={call.id}
                  className="p-3 bg-[#12131a] rounded-[10px] border border-[#2a2b35] animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar className="h-8 w-8 border border-[#2a2b35]">
                      <AvatarFallback className="bg-coral/15 text-coral text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground block truncate">{call.callerPhone}</span>
                      <span className="text-[10px] text-muted-foreground">{call.timestamp}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-normal rounded-[6px] border flex-shrink-0", outcomeConfig[call.outcome].className)}
                    >
                      {outcomeConfig[call.outcome].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{call.description}</p>
                  <button className="text-[10px] text-muted-foreground hover:text-foreground border border-[#2a2b35] rounded-[4px] px-2 py-0.5 transition-colors">
                    View Transcript
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-6">
            <Phone className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">No active calls</p>
            <p className="text-xs text-muted-foreground mt-1">Incoming calls will appear here in real time</p>
          </div>
        )}
      </ScrollArea>
    </SectionCard>
  )
}

// ─── Appointment Funnel (Donut) ───────────────────────────────────────────────

const FUNNEL_DATA = [
  { name: "Confirmed", value: 18, color: "hsl(174 72% 46%)" },
  { name: "Pending", value: 7, color: "hsl(38 92% 50%)" },
  { name: "Cancelled", value: 3, color: "hsl(0 84% 60%)" },
]

function AppointmentFunnel() {
  const total = FUNNEL_DATA.reduce((a, b) => a + b.value, 0)
  return (
    <SectionCard className="flex flex-col">
      <CardHeader
        title="Today's Breakdown"
        right={
          <span className="text-xs text-muted-foreground">{total} total</span>
        }
      />
      <div className="p-5 flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={FUNNEL_DATA}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={54}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={false}
              >
                {FUNNEL_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-foreground">{total}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {FUNNEL_DATA.map((d) => (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{d.value}</span>
              </div>
              <Progress
                value={(d.value / total) * 100}
                className="h-1.5 bg-[#12131a]"
                style={{ "--progress-color": d.color } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Top Doctors Today ────────────────────────────────────────────────────────

const TOP_DOCTORS = [
  { name: "Dr. Vikram Patel", specialty: "General Medicine", count: 8, max: 10 },
  { name: "Dr. Anjali Desai", specialty: "Dentistry", count: 6, max: 10 },
  { name: "Dr. Arjun Mehta", specialty: "Cardiology", count: 5, max: 10 },
  { name: "Dr. Kavitha Menon", specialty: "Pediatrics", count: 4, max: 10 },
  { name: "Dr. Siddharth Iyer", specialty: "Neurology", count: 3, max: 10 },
]

function TopDoctors() {
  return (
    <SectionCard className="flex flex-col">
      <CardHeader
        title="Top Doctors Today"
        right={<span className="text-xs text-muted-foreground">by appointments</span>}
      />
      <div className="p-4 space-y-3">
        {TOP_DOCTORS.map((doc, i) => (
          <div
            key={doc.name}
            className="flex items-center gap-3 animate-in slide-in-from-bottom-2"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
            <Avatar className="h-8 w-8 border border-[#2a2b35] flex-shrink-0">
              <AvatarFallback className="bg-coral/15 text-coral text-[10px]">
                {doc.name.split(" ").slice(1).map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                <span className="text-xs font-semibold text-foreground ml-2">{doc.count}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#12131a] border-[#2a2b35] text-muted-foreground text-[9px] rounded-[4px] font-normal py-0">
                  {doc.specialty}
                </Badge>
                <div className="flex-1 h-1 bg-[#12131a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coral rounded-full transition-all"
                    style={{ width: `${(doc.count / doc.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DashboardHome() {
  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Appointments Attended"
          value={mockDashboardStats.appointmentsAttended}
          icon={CheckCircle2}
          variant="success"
          trend="up"
          trendLabel="+12% vs yesterday"
        />
        <KpiCard
          title="Appointments Remaining"
          value={mockDashboardStats.appointmentsRemaining}
          icon={Clock}
          variant="warning"
          trend="down"
          trendLabel="-3 from yesterday"
        />
        <KpiCard
          title="Total Appointments"
          value={mockDashboardStats.totalAppointments}
          icon={Calendar}
          variant="default"
          trend="up"
          trendLabel="+5% this week"
        />
        <KpiCard
          title="Cancelled / Rescheduled"
          value={mockDashboardStats.cancelledToday}
          icon={XCircle}
          variant="danger"
          trend="down"
          trendLabel="-2 vs yesterday"
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="min-h-[380px] flex flex-col">
          <TodaySchedule />
        </div>
        <div className="min-h-[380px] flex flex-col">
          <AICallActivity />
        </div>
        <div className="min-h-[380px] flex flex-col">
          <LiveCallFeed />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AppointmentFunnel />
        <TopDoctors />
      </div>
    </div>
  )
}
