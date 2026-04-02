"use client"

import { useState } from "react"
import { Building2, Phone, Mic, Bell, Save, Plus, X, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string
  description: string
  icon: typeof Building2
  children: React.ReactNode
}) {
  return (
    <div className="glass-card">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/40">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  )
}

function FormField({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-white/70">{label}</Label>
      {children}
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-white/40">{description}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-red-500"
      />
    </div>
  )
}

export function SettingsPage() {
  const [businessName, setBusinessName] = useState("HealthFirst Clinic")
  const [greeting, setGreeting] = useState(
    "Hello! Thank you for calling HealthFirst Clinic. I'm your AI assistant. How can I help you today?"
  )
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [notificationEmail, setNotificationEmail] = useState("admin@healthfirst.com")
  
  // Medical specialties state
  const [specialties, setSpecialties] = useState<string[]>([
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
  ])
  const [newSpecialty, setNewSpecialty] = useState("")

  const handleAddSpecialty = () => {
    const trimmed = newSpecialty.trim()
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties([...specialties, trimmed])
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSpecialty()
    }
  }

  // Business hours state
  const [businessHours, setBusinessHours] = useState({
    monday: { open: "09:00", close: "18:00", enabled: true },
    tuesday: { open: "09:00", close: "18:00", enabled: true },
    wednesday: { open: "09:00", close: "18:00", enabled: true },
    thursday: { open: "09:00", close: "18:00", enabled: true },
    friday: { open: "09:00", close: "18:00", enabled: true },
    saturday: { open: "10:00", close: "14:00", enabled: true },
    sunday: { open: "00:00", close: "00:00", enabled: false },
  })

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Business Profile */}
      <SettingsCard
        title="Business Profile"
        description="Manage your business information"
        icon={Building2}
      >
        <FormField label="Business Name">
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
          />
        </FormField>

        <FormField label="Phone Number (Twilio)" hint="This number is managed by CallSync AI">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-white/40" />
            <span className="text-white/70">+91 80 4567 8901</span>
            <span className="text-xs text-white/30">(Read only)</span>
          </div>
        </FormField>

        <FormField label="Timezone">
          <Select defaultValue="asia_kolkata">
            <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-white/70 rounded-xl">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a0f3a] border-white/10 text-white">
              <SelectItem value="asia_kolkata">Asia/Kolkata (IST)</SelectItem>
              <SelectItem value="asia_mumbai">Asia/Mumbai (IST)</SelectItem>
              <SelectItem value="america_new_york">America/New_York (EST)</SelectItem>
              <SelectItem value="europe_london">Europe/London (GMT)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Business Hours">
          <div className="space-y-3 mt-2">
            {days.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24">
                  <span className="text-sm text-white/70 capitalize">{day}</span>
                </div>
                <Switch
                  checked={businessHours[day].enabled}
                  onCheckedChange={(checked) =>
                    setBusinessHours((prev) => ({
                      ...prev,
                      [day]: { ...prev[day], enabled: checked },
                    }))
                  }
                  className="data-[state=checked]:bg-red-500"
                />
                {businessHours[day].enabled ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={businessHours[day].open}
                      onChange={(e) =>
                        setBusinessHours((prev) => ({
                          ...prev,
                          [day]: { ...prev[day], open: e.target.value },
                        }))
                      }
                      className="h-8 px-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                    />
                    <span className="text-white/40">to</span>
                    <input
                      type="time"
                      value={businessHours[day].close}
                      onChange={(e) =>
                        setBusinessHours((prev) => ({
                          ...prev,
                          [day]: { ...prev[day], close: e.target.value },
                        }))
                      }
                      className="h-8 px-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-white/30">Closed</span>
                )}
              </div>
            ))}
          </div>
        </FormField>
      </SettingsCard>

      {/* Medical Specialties */}
      <SettingsCard
        title="Medical Specialties"
        description="Add specialties available at your hospital"
        icon={Stethoscope}
      >
        <FormField label="Add New Specialty">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Neurology, ENT, Ophthalmology"
              className="flex-1 h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
            />
            <Button
              onClick={handleAddSpecialty}
              disabled={!newSpecialty.trim()}
              className="h-10 px-4 bg-red-500 hover:bg-red-600 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </FormField>

        <FormField label={`Current Specialties (${specialties.length})`}>
          {specialties.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant="outline"
                  className="h-8 px-3 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 transition-colors group"
                >
                  {specialty}
                  <button
                    onClick={() => handleRemoveSpecialty(specialty)}
                    className="ml-2 text-white/40 hover:text-red-400 transition-colors"
                    title="Remove specialty"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 mt-2">No specialties added yet. Add your hospital&apos;s medical specialties above.</p>
          )}
        </FormField>
      </SettingsCard>

      {/* Voice Agent Settings */}
      <SettingsCard
        title="Voice Agent Settings"
        description="Configure your AI voice assistant"
        icon={Mic}
      >
        <FormField label="Voice Selection">
          <Select defaultValue="female_1">
            <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-white/70 rounded-xl">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a0f3a] border-white/10 text-white">
              <SelectItem value="female_1">Female - Professional (Recommended)</SelectItem>
              <SelectItem value="female_2">Female - Friendly</SelectItem>
              <SelectItem value="male_1">Male - Professional</SelectItem>
              <SelectItem value="male_2">Male - Friendly</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Greeting Message" hint="This is what the AI says when answering calls">
          <Textarea
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-white/20"
          />
        </FormField>

        <FormField label="Language">
          <Select defaultValue="en_in">
            <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-white/70 rounded-xl">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a0f3a] border-white/10 text-white">
              <SelectItem value="en_in">English (India)</SelectItem>
              <SelectItem value="en_us">English (US)</SelectItem>
              <SelectItem value="hi_in">Hindi</SelectItem>
              <SelectItem value="ta_in">Tamil</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </SettingsCard>

      {/* Notification Settings */}
      <SettingsCard
        title="Notification Settings"
        description="Manage how you receive alerts"
        icon={Bell}
      >
        <ToggleField
          label="Email Notifications"
          description="Receive booking confirmations via email"
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />

        <ToggleField
          label="SMS Alerts"
          description="Get instant SMS for new bookings"
          checked={smsAlerts}
          onCheckedChange={setSmsAlerts}
        />

        <FormField label="Reminder Lead Time">
          <Select defaultValue="24hr">
            <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 text-white/70 rounded-xl">
              <SelectValue placeholder="Select lead time" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a0f3a] border-white/10 text-white">
              <SelectItem value="24hr">24 hours before</SelectItem>
              <SelectItem value="48hr">48 hours before</SelectItem>
              <SelectItem value="1week">1 week before</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Notification Email">
          <input
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
            placeholder="email@example.com"
          />
        </FormField>
      </SettingsCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="h-11 px-6 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium glow-red-sm hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-300">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
