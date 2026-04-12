# CallSync AI

A voice-first appointment booking system built for the HACK'A'WAR GenAI × AWS Hackathon at RIT Bengaluru. Callers can book, reschedule, and cancel appointments entirely over a phone call. A real-time Next.js dashboard lets clinic staff monitor bookings live.

---

## What it does

1. A patient calls the VAPI phone number
2. Riley (the AI voice agent, powered by GPT-4) collects name, phone, date, and time
3. The backend checks Google Calendar for availability, creates the event, and writes to Supabase
4. The dashboard updates in real time — no refresh needed
5. 24 hours before the appointment, an outbound VAPI call reminds the patient

---

## Stack

| Layer | Technology |
|---|---|
| Voice AI | VAPI, OpenAI GPT-4, PlayHT |
| Backend | Node.js, Express, node-cron |
| Calendar | Google Calendar API |
| Database | Supabase (PostgreSQL + Realtime) |
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui, Recharts |
| Deployment | Render (backend), Vercel (frontend) |
| Alt channel | Dialogflow ES + Google Cloud Functions |

---

## Repository structure

```
callsync-ai/
├── backend/
│   ├── server.js          Express app — /vapi/tool route + /api/* dashboard routes
│   ├── calendar.js        Google Calendar integration
│   ├── reminder.js        Hourly cron → outbound VAPI reminder calls
│   ├── supabase.js        All Supabase queries (phone-based, not name-based)
│   ├── schema.sql         Supabase table definition with indexes + RLS + realtime
│   ├── .env.example       All required environment variables
│   └── package.json
├── frontend/
│   ├── app/               Next.js app router
│   ├── components/
│   │   └── dashboard/     Sidebar, Topbar, and all page components
│   ├── hooks/
│   │   └── use-appointments.ts   useAppointments + useDashboardStats (live Supabase)
│   ├── lib/
│   │   ├── supabase.ts    Supabase browser client
│   │   └── mock-data.ts   Kept for reference / local dev without DB
│   ├── .env.local.example
│   └── package.json
├── dialogflow/            Dialogflow ES agent config (alternative channel)
├── vapi/                  VAPI assistant config + multilingual prompts
└── README.md
```

---

## Database schema

Run `backend/schema.sql` in your Supabase SQL editor. It creates the `appointments` table with all indexes, RLS policies, and enables Postgres realtime.

```sql
create table appointments (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  phone             text not null,
  date              date not null,
  time              text not null,
  calendar_event_id text,
  reminded          boolean default false,
  status            text not null default 'confirmed'
                    check (status in ('confirmed', 'pending', 'cancelled')),
  condition         text,   -- medical specialty
  doctor            text,
  created_at        timestamptz default now()
);
```

---

## Environment variables

### Backend — `backend/.env`

```
VAPI_API_KEY            VAPI API key (app.vapi.ai → Account → API Keys)
VAPI_WEBHOOK_SECRET     Random secret ≥32 chars — sent as X-Webhook-Secret header
SUPABASE_URL            Supabase project URL
SUPABASE_ANON_KEY       Supabase anon public key
GOOGLE_CALENDAR_ID      Google Calendar ID
API_SECRET              Random secret for /api/* dashboard endpoints
ALLOWED_ORIGINS         Comma-separated allowed frontend origins
PORT                    Render sets this automatically
```

### Frontend — `frontend/.env.local`

```
NEXT_PUBLIC_SUPABASE_URL       Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase anon key (safe to expose in browser)
NEXT_PUBLIC_BACKEND_URL        https://callsyncbackend.onrender.com
```

---

## Local development

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your values. Place credentials.json in backend/
npm install
npm run dev   # uses node --watch for hot reload
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key
npm install --legacy-peer-deps
npm run dev   # starts on http://localhost:3001
```

---

## Deployment

### Backend (Render)

1. New → Web Service → connect repo, root directory: `backend`
2. Build: `npm install` · Start: `node server.js`
3. Add all env vars from `backend/.env.example`
4. Add `credentials.json` as a Secret File at path `credentials.json`

### Frontend (Vercel)

1. New Project → import repo, root directory: `frontend`
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Set `NEXT_PUBLIC_BACKEND_URL` to your Render URL

---

## API reference

### POST `/vapi/tool`

Requires `X-Webhook-Secret: <VAPI_WEBHOOK_SECRET>` header.

Handles: `bookAppointment`, `rescheduleAppointment`, `cancelAppointment`, `checkAvailability`.

All inputs are validated — invalid dates, past dates, and malformed phone numbers return a conversational error message to the voice agent rather than a 500.

### GET `/api/appointments`

Requires `Authorization: Bearer <API_SECRET>`.

Query params: `status`, `date`, `limit`, `offset`.

### PATCH `/api/appointments/:id/status`

Body: `{ "status": "confirmed" | "pending" | "cancelled" }`.

### GET `/api/stats`

Returns today's confirmed/pending/cancelled counts plus all-time total.

---

## Security

- All VAPI webhook requests are verified via `VAPI_WEBHOOK_SECRET`
- All dashboard API requests are verified via `API_SECRET`
- `credentials.json` is in `.gitignore` — never commit it
- Appointment lookup is phone-based (not name-based) to prevent collision between patients with similar names
- Input validation rejects past dates, malformed times, and invalid phone numbers before touching the calendar or database

---

## How the reminder system works

`backend/reminder.js` runs every hour via `node-cron`. It queries Supabase for appointments where `reminded = false` and `date` is within the next 24 hours, places an outbound VAPI call to each patient, then sets `reminded = true` so they are not called again.

---

## Known limitations

- Render free tier cold-starts after inactivity (~30–50s first request). Upgrade to paid or add an uptime ping.
- The dashboard connects directly to Supabase from the browser using the anon key with RLS policies. For stricter auth, add Supabase Auth and restrict policies to authenticated users.
- VAPI charges per minute of call time.

---

## Team

Built by Khush Chadha — Frontend & Voice  
Hack'a'War GenAI × AWS Hackathon, RIT Bengaluru
