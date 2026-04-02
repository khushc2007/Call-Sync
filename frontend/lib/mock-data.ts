// Mock data for CallSync AI Dashboard

export type AppointmentStatus = "confirmed" | "pending" | "cancelled"
export type ReminderStatus = "scheduled" | "sent" | "failed" | "not_required"
export type CallOutcome = "booked" | "rescheduled" | "cancelled"
export type PatientOutcome = "recovered" | "follow-up" | "under-treatment"
export type AppointmentStatusType = "complete" | "waiting" | "canceled"

export interface Appointment {
  id: string
  patientName: string
  phone: string
  condition: string
  doctor: string
  date: string
  time: string
  status: AppointmentStatus
  reminded: boolean
}

export interface LiveCall {
  id: string
  callerPhone: string
  outcome: CallOutcome
  description: string
  timestamp: string
}

export interface PastAppointment {
  id: string
  patientId: string
  patientName: string
  lastVisit: string
  condition: string
  outcome: PatientOutcome
  doctor: string
  appointmentStatus: AppointmentStatusType
  diagnosis: string
}

export interface PatientHistory {
  id: string
  name: string
  age: number
  gender: "Male" | "Female" | "Other"
  phone: string
  pastVisits: {
    date: string
    condition: string
    diagnosis: string
    medicines: string[]
    notes: string
  }[]
  medicalHistory: string[]
}

// Mock appointments data - exact data from requirements
export const mockAppointments: Appointment[] = [
  {
    id: "apt-001",
    patientName: "Priya Sharma",
    phone: "+91 98●●●●●●42",
    condition: "Dentistry",
    doctor: "Dr. Anjali Desai",
    date: "1 Apr",
    time: "10:00 AM",
    status: "confirmed",
    reminded: true,
  },
  {
    id: "apt-002",
    patientName: "Rahul Mehta",
    phone: "+91 98●●●●●●23",
    condition: "General Medicine",
    doctor: "Dr. Vikram Patel",
    date: "1 Apr",
    time: "11:30 AM",
    status: "confirmed",
    reminded: true,
  },
  {
    id: "apt-003",
    patientName: "Ananya Iyer",
    phone: "+91 99●●●●●●78",
    condition: "Physiotherapy",
    doctor: "Dr. Priya Menon",
    date: "1 Apr",
    time: "2:00 PM",
    status: "pending",
    reminded: false,
  },
  {
    id: "apt-004",
    patientName: "Karan Patel",
    phone: "+91 98●●●●●●89",
    condition: "General Medicine",
    doctor: "Dr. Rajesh Kumar",
    date: "2 Apr",
    time: "9:00 AM",
    status: "pending",
    reminded: false,
  },
  {
    id: "apt-005",
    patientName: "Meera Nair",
    phone: "+91 97●●●●●●90",
    condition: "Dermatology",
    doctor: "Dr. Meera Nair",
    date: "2 Apr",
    time: "11:00 AM",
    status: "cancelled",
    reminded: true,
  },
  {
    id: "apt-006",
    patientName: "Arjun Rao",
    phone: "+91 96●●●●●●01",
    condition: "Ophthalmology",
    doctor: "Dr. Suresh Sharma",
    date: "2 Apr",
    time: "4:30 PM",
    status: "confirmed",
    reminded: true,
  },
]

// Mock live calls data
export const mockLiveCalls: LiveCall[] = [
  {
    id: "call-001",
    callerPhone: "+91 98●●●●●●42",
    outcome: "booked",
    description: "Booked dental checkup for Apr 3 at 2 PM",
    timestamp: "2 mins ago",
  },
  {
    id: "call-002",
    callerPhone: "+91 87●●●●●●33",
    outcome: "rescheduled",
    description: "Rescheduled general consultation from Apr 2 to Apr 5",
    timestamp: "5 mins ago",
  },
  {
    id: "call-003",
    callerPhone: "+91 99●●●●●●78",
    outcome: "cancelled",
    description: "Cancelled physiotherapy session on Apr 1",
    timestamp: "8 mins ago",
  },
  {
    id: "call-004",
    callerPhone: "+91 95●●●●●●12",
    outcome: "booked",
    description: "Confirmed fever checkup for Apr 4 at 10 AM",
    timestamp: "12 mins ago",
  },
]

// Dashboard stats for current day
export const mockDashboardStats = {
  appointmentsAttended: 8,
  appointmentsRemaining: 5,
  totalAppointments: 13,
  cancelledToday: 2,
}

// Today's schedule preview
export const mockTodaySchedule = [
  { time: "10:00 AM", patientName: "Priya Sharma", condition: "Dental Checkup", status: "completed" as const },
  { time: "11:30 AM", patientName: "Rahul Mehta", condition: "General Consultation", status: "completed" as const },
  { time: "2:00 PM", patientName: "Ananya Iyer", condition: "Physiotherapy", status: "upcoming" as const },
  { time: "3:30 PM", patientName: "Karan Patel", condition: "Fever Checkup", status: "upcoming" as const },
  { time: "4:30 PM", patientName: "Arjun Rao", condition: "Eye Examination", status: "upcoming" as const },
]

// Past appointments data
export const mockPastAppointments: PastAppointment[] = [
  {
    id: "past-001",
    patientId: "patient-001",
    patientName: "Priya Sharma",
    lastVisit: "12 Mar 2026",
    condition: "Dental Infection",
    outcome: "recovered",
    doctor: "Dr. Anjali Desai",
    appointmentStatus: "complete",
    diagnosis: "Periapical abscess in lower right molar",
  },
  {
    id: "past-002",
    patientId: "patient-002",
    patientName: "Rahul Mehta",
    lastVisit: "15 Mar 2026",
    condition: "Viral Fever",
    outcome: "follow-up",
    doctor: "Dr. Vikram Patel",
    appointmentStatus: "complete",
    diagnosis: "Acute viral upper respiratory infection",
  },
  {
    id: "past-003",
    patientId: "patient-003",
    patientName: "Ananya Iyer",
    lastVisit: "20 Mar 2026",
    condition: "Muscle Pain",
    outcome: "under-treatment",
    doctor: "Dr. Priya Menon",
    appointmentStatus: "waiting",
    diagnosis: "Chronic lower back pain with mild sciatica",
  },
  {
    id: "past-004",
    patientId: "patient-004",
    patientName: "Vikram Singh",
    lastVisit: "8 Mar 2026",
    condition: "Hypertension",
    outcome: "follow-up",
    doctor: "Dr. Rajesh Kumar",
    appointmentStatus: "complete",
    diagnosis: "Stage 1 hypertension, BP 145/95",
  },
  {
    id: "past-005",
    patientId: "patient-005",
    patientName: "Sneha Reddy",
    lastVisit: "5 Mar 2026",
    condition: "Skin Allergy",
    outcome: "recovered",
    doctor: "Dr. Meera Nair",
    appointmentStatus: "complete",
    diagnosis: "Contact dermatitis from cosmetic product",
  },
  {
    id: "past-006",
    patientId: "patient-006",
    patientName: "Amit Kumar",
    lastVisit: "1 Mar 2026",
    condition: "Diabetes Checkup",
    outcome: "follow-up",
    doctor: "Dr. Suresh Sharma",
    appointmentStatus: "canceled",
    diagnosis: "Type 2 Diabetes, HbA1c at 7.2%",
  },
]

// Patient detailed history
export const mockPatientHistory: Record<string, PatientHistory> = {
  "patient-001": {
    id: "patient-001",
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    phone: "+91 9876543242",
    pastVisits: [
      {
        date: "12 Mar 2026",
        condition: "Dental Infection",
        diagnosis: "Periapical abscess in lower right molar",
        medicines: ["Amoxicillin 500mg", "Ibuprofen 400mg", "Chlorhexidine mouthwash"],
        notes: "Root canal treatment recommended. Patient advised to avoid hard foods. Follow-up in 2 weeks.",
      },
      {
        date: "15 Jan 2026",
        condition: "Routine Dental Checkup",
        diagnosis: "Mild tartar buildup, no cavities",
        medicines: ["Fluoride toothpaste"],
        notes: "Scaling done. Advised to floss daily.",
      },
    ],
    medicalHistory: ["No known allergies", "Non-smoker", "Previous wisdom tooth extraction (2024)"],
  },
  "patient-002": {
    id: "patient-002",
    name: "Rahul Mehta",
    age: 28,
    gender: "Male",
    phone: "+91 9876543223",
    pastVisits: [
      {
        date: "15 Mar 2026",
        condition: "Viral Fever",
        diagnosis: "Acute viral upper respiratory infection",
        medicines: ["Paracetamol 650mg", "Cetirizine 10mg", "Vitamin C supplements"],
        notes: "High fever (102°F) with body ache. Advised rest and hydration. Follow-up if fever persists beyond 5 days.",
      },
      {
        date: "10 Nov 2025",
        condition: "Gastritis",
        diagnosis: "Mild gastritis, likely stress-induced",
        medicines: ["Pantoprazole 40mg", "Domperidone 10mg"],
        notes: "Advised dietary modifications. Avoid spicy food and caffeine.",
      },
    ],
    medicalHistory: ["Allergic to Penicillin", "History of migraine", "Non-vegetarian diet"],
  },
  "patient-003": {
    id: "patient-003",
    name: "Ananya Iyer",
    age: 45,
    gender: "Female",
    phone: "+91 9987654378",
    pastVisits: [
      {
        date: "20 Mar 2026",
        condition: "Muscle Pain",
        diagnosis: "Chronic lower back pain with mild sciatica",
        medicines: ["Diclofenac gel", "Thiocolchicoside 4mg", "Calcium + Vitamin D3"],
        notes: "MRI recommended. Started physiotherapy sessions. Continue exercises at home.",
      },
      {
        date: "5 Feb 2026",
        condition: "Joint Stiffness",
        diagnosis: "Early signs of osteoarthritis in knee joints",
        medicines: ["Glucosamine supplements", "Methylcobalamin"],
        notes: "Weight management advised. Referred to orthopedic specialist.",
      },
    ],
    medicalHistory: ["Hypothyroidism (on medication)", "Vitamin D deficiency", "Family history of arthritis"],
  },
  "patient-004": {
    id: "patient-004",
    name: "Vikram Singh",
    age: 55,
    gender: "Male",
    phone: "+91 9876500089",
    pastVisits: [
      {
        date: "8 Mar 2026",
        condition: "Hypertension",
        diagnosis: "Stage 1 hypertension, BP 145/95",
        medicines: ["Amlodipine 5mg", "Telmisartan 40mg"],
        notes: "Lifestyle modifications advised. Reduce salt intake. Daily BP monitoring recommended.",
      },
    ],
    medicalHistory: ["Type 2 Diabetes (controlled)", "High cholesterol", "Ex-smoker (quit 2020)"],
  },
  "patient-005": {
    id: "patient-005",
    name: "Sneha Reddy",
    age: 26,
    gender: "Female",
    phone: "+91 9567890012",
    pastVisits: [
      {
        date: "5 Mar 2026",
        condition: "Skin Allergy",
        diagnosis: "Contact dermatitis, likely triggered by new cosmetic product",
        medicines: ["Hydrocortisone cream 1%", "Cetirizine 10mg", "Moisturizing lotion"],
        notes: "Advised to discontinue suspected product. Patch testing recommended if symptoms recur.",
      },
    ],
    medicalHistory: ["Sensitive skin", "Seasonal allergies", "No chronic conditions"],
  },
  "patient-006": {
    id: "patient-006",
    name: "Amit Kumar",
    age: 48,
    gender: "Male",
    phone: "+91 9123456701",
    pastVisits: [
      {
        date: "1 Mar 2026",
        condition: "Diabetes Checkup",
        diagnosis: "Type 2 Diabetes, HbA1c at 7.2%",
        medicines: ["Metformin 500mg", "Glimepiride 1mg", "Atorvastatin 10mg"],
        notes: "Blood sugar levels slightly elevated. Dietary counseling done. Follow-up in 3 months with HbA1c test.",
      },
      {
        date: "1 Dec 2025",
        condition: "Routine Checkup",
        diagnosis: "Diabetes management review, HbA1c at 6.8%",
        medicines: ["Metformin 500mg"],
        notes: "Good control maintained. Continue current regimen.",
      },
    ],
    medicalHistory: ["Type 2 Diabetes (since 2018)", "Mild fatty liver", "Family history of heart disease"],
  },
}

// Stats for dashboard (legacy - keeping for compatibility)
export const mockStats = {
  totalAppointments: 47,
  confirmedToday: 12,
  pendingReminders: 8,
  activeCalls: 3,
}

// Helper function to get reminders for next 24 hours
export function getRemindersNext24Hours(): number {
  return mockAppointments.filter(apt => !apt.reminded && apt.status !== "cancelled").length
}

// Extended appointment data with reminder details for the reminders page
export interface AppointmentWithReminder extends Appointment {
  service: string
  reminderStatus: ReminderStatus
  reminderSentAt?: string
}

export const mockAppointmentsWithReminders: AppointmentWithReminder[] = mockAppointments.map(apt => ({
  ...apt,
  service: apt.condition,
  reminderStatus: apt.reminded ? "sent" : (apt.status === "cancelled" ? "not_required" : "scheduled"),
  reminderSentAt: apt.reminded ? "Today, 9:00 AM" : undefined,
}))

// Active calls for live calls page
export interface ActiveCall extends LiveCall {
  duration: string
  currentStep: string
  transcript: string
  intent: string
  slots: { label: string; value: string }[]
}

export const mockActiveCalls: ActiveCall[] = [
  {
    id: "active-001",
    callerPhone: "+91 98●●●●●●55",
    outcome: "booked",
    description: "Booking appointment for general checkup",
    timestamp: "Live",
    duration: "2:34",
    currentStep: "Confirming time slot",
    transcript: "Hello, I would like to book an appointment for a general checkup...Yes, Dr. Patel would be perfect...I'm available on Monday afternoon...",
    intent: "book_appointment",
    slots: [
      { label: "Doctor", value: "Dr. Vikram Patel" },
      { label: "Type", value: "General Checkup" },
      { label: "Date", value: "Monday, Apr 5" },
    ],
  },
  {
    id: "active-002",
    callerPhone: "+91 87●●●●●●21",
    outcome: "rescheduled",
    description: "Rescheduling dental appointment",
    timestamp: "Live",
    duration: "1:15",
    currentStep: "Checking availability",
    transcript: "I need to reschedule my dental appointment from tomorrow...Yes, my name is Raj Kumar...Can we move it to next week?",
    intent: "reschedule_appointment",
    slots: [
      { label: "Patient", value: "Raj Kumar" },
      { label: "Original Date", value: "Apr 2" },
    ],
  },
]
