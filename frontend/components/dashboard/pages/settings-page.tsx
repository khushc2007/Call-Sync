"use client"

import { useState } from "react"
import { Building2, Phone, Mic, Bell, Save, Plus, X, Stethoscope, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

function SettingsCard({ title, description, icon: Icon, children }: {
  title: string; description: string; icon: typeof Building2; children: React.ReactNode
}) {
  return (
    <div className="bg-[#1a1b23] rounded-[10px] border border-[#2a2b35]">
      <div className="p-5 border-b border-[#2a2b35]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-coral/15 border border-coral/20 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-coral" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
    </div>
  )
}

function Toggle({ label, description, checked, onCheckedChange }: {
  label: string; description?: string; checked: boolean; onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#2a2b35]/50 last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-coral" />
    </div>
  )
}

const inputClass = "h-9 bg-[#12131a] border-[#2a2b35] text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-coral/30"

export function SettingsPage() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [businessName, setBusinessName] = useState("HealthFirst Clinic")
  const [timezone, setTimezone] = useState("asia_kolkata")
  const [greeting, setGreeting] = useState(
    "Hello! Thank you for calling HealthFirst Clinic. I'm Riley, your AI assistant. How can I help you today?"
  )
  const [voice, setVoice] = useState("female_1")
  const [language, setLanguage] = useState("en_in")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [reminderLeadTime, setReminderLeadTime] = useState("24hr")
  const [notificationEmail, setNotificationEmail] = useState("admin@healthfirst.com")

  const [specialties, setSpecialties] = useState([
    "General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Dermatology",
    "Dentistry", "Ophthalmology", "Neurology",
  ])
  const [newSpecialty, setNewSpecialty] = useState("")

  const [businessHours, setBusinessHours] = useState({
    monday:    { open: "09:00", close: "18:00", enabled: true },
    tuesday:   { open: "09:00", close: "18:00", enabled: true },
    wednesday: { open: "09:00", close: "18:00", enabled: true },
    thursday:  { open: "09:00", close: "18:00", enabled: true },
    friday:    { open: "09:00", close: "18:00", enabled: true },
    saturday:  { open: "10:00", close: "14:00", enabled: true },
    sunday:    { open: "00:00", close: "00:00", enabled: false },
  })

  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const

  const addSpecialty = () => {
    const t = newSpecialty.trim()
    if (t && !specialties.includes(t)) {
      setSpecialties(p => [...p, t])
      setNewSpecialty("")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    // In production: POST to /api/settings or save to Supabase settings table
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    toast({ title: "Settings saved", description: "Your configuration has been updated." })
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Business Profile */}
      <SettingsCard title="Business profile" description="Clinic name, timezone, and hours" icon={Building2}>
        <Field label="Business name">
          <Input value={businessName} onChange={e => setBusinessName(e.target.value)} className={inputClass} />
        </Field>

        <Field label="VAPI phone number" hint="Managed by CallSync AI — change in VAPI dashboard">
          <div className="flex items-center gap-2 h-9 px-3 bg-[#12131a] border border-[#2a2b35] rounded-md">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">+91 80 4567 8901</span>
            <span className="text-[10px] text-muted-foreground/50 ml-1">(read only)</span>
          </div>
        </Field>

        <Field label="Timezone">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className={cn(inputClass, "w-full")}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="asia_kolkata">Asia/Kolkata (IST)</SelectItem>
              <SelectItem value="asia_mumbai">Asia/Mumbai (IST)</SelectItem>
              <SelectItem value="america_new_york">America/New_York (EST)</SelectItem>
              <SelectItem value="europe_london">Europe/London (GMT)</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Business hours">
          <div className="space-y-2 mt-1">
            {days.map(day => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-24 text-xs text-muted-foreground capitalize">{day}</span>
                <Switch
                  checked={businessHours[day].enabled}
                  onCheckedChange={v => setBusinessHours(p => ({ ...p, [day]: { ...p[day], enabled: v } }))}
                  className="data-[state=checked]:bg-coral"
                />
                {businessHours[day].enabled ? (
                  <div className="flex items-center gap-2">
                    <input type="time" value={businessHours[day].open}
                      onChange={e => setBusinessHours(p => ({ ...p, [day]: { ...p[day], open: e.target.value } }))}
                      className="h-8 px-2 bg-[#12131a] border border-[#2a2b35] rounded-[6px] text-sm text-foreground focus:outline-none" />
                    <span className="text-muted-foreground text-xs">to</span>
                    <input type="time" value={businessHours[day].close}
                      onChange={e => setBusinessHours(p => ({ ...p, [day]: { ...p[day], close: e.target.value } }))}
                      className="h-8 px-2 bg-[#12131a] border border-[#2a2b35] rounded-[6px] text-sm text-foreground focus:outline-none" />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/50">Closed</span>
                )}
              </div>
            ))}
          </div>
        </Field>
      </SettingsCard>

      {/* Medical Specialties */}
      <SettingsCard title="Medical specialties" description="Specialties available at your clinic" icon={Stethoscope}>
        <Field label="Add specialty">
          <div className="flex gap-2">
            <Input value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
              placeholder="e.g., Neurology, ENT…" className={cn(inputClass, "flex-1")} />
            <Button onClick={addSpecialty} disabled={!newSpecialty.trim()}
              className="h-9 px-4 bg-coral hover:bg-red-500 disabled:opacity-40 text-white text-sm">
              <Plus className="w-3.5 h-3.5 mr-1" />Add
            </Button>
          </div>
        </Field>
        <Field label={`Active specialties (${specialties.length})`}>
          <div className="flex flex-wrap gap-2 mt-1">
            {specialties.map(s => (
              <Badge key={s} variant="outline" className="h-7 px-2.5 bg-[#12131a] border-[#2a2b35] text-muted-foreground text-xs gap-1.5">
                {s}
                <button onClick={() => setSpecialties(p => p.filter(x => x !== s))} className="text-muted-foreground/50 hover:text-coral transition-colors">
                  <X className="w-2.5 h-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </Field>
      </SettingsCard>

      {/* Voice Agent */}
      <SettingsCard title="Voice agent" description="Configure Riley's voice and greeting" icon={Mic}>
        <Field label="Voice">
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger className={cn(inputClass, "w-full")}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="female_1">Female — professional (recommended)</SelectItem>
              <SelectItem value="female_2">Female — friendly</SelectItem>
              <SelectItem value="male_1">Male — professional</SelectItem>
              <SelectItem value="male_2">Male — friendly</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Language">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className={cn(inputClass, "w-full")}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="en_in">English (India)</SelectItem>
              <SelectItem value="en_us">English (US)</SelectItem>
              <SelectItem value="hi_in">Hindi</SelectItem>
              <SelectItem value="ta_in">Tamil</SelectItem>
              <SelectItem value="kn_in">Kannada</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Greeting message" hint="What Riley says when answering a call">
          <Textarea value={greeting} onChange={e => setGreeting(e.target.value)}
            className="min-h-[90px] bg-[#12131a] border-[#2a2b35] text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-coral/30 resize-none" />
        </Field>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard title="Notifications" description="Alerts and reminder configuration" icon={Bell}>
        <Toggle label="Email notifications" description="Booking confirmations and cancellations" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        <Toggle label="SMS alerts" description="Instant SMS for new bookings" checked={smsAlerts} onCheckedChange={setSmsAlerts} />
        <Field label="Notification email">
          <Input type="email" value={notificationEmail} onChange={e => setNotificationEmail(e.target.value)}
            placeholder="email@example.com" className={inputClass} />
        </Field>
        <Field label="Reminder lead time" hint="How far in advance to call patients">
          <Select value={reminderLeadTime} onValueChange={setReminderLeadTime}>
            <SelectTrigger className={cn(inputClass, "w-full")}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="12hr">12 hours before</SelectItem>
              <SelectItem value="24hr">24 hours before</SelectItem>
              <SelectItem value="48hr">48 hours before</SelectItem>
              <SelectItem value="1week">1 week before</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </SettingsCard>

      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} disabled={saving}
          className="h-10 px-6 bg-coral hover:bg-red-500 text-white rounded-full font-medium transition-all">
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
          ) : saved ? (
            <><Check className="w-4 h-4 mr-2" />Saved</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save changes</>
          )}
        </Button>
      </div>
    </div>
  )
}
