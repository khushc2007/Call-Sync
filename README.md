<div align="center">

<img src="https://img.shields.io/badge/version-2.0.0-coral?style=for-the-badge&labelColor=0f1117&color=e85d3f" />
<img src="https://img.shields.io/badge/Next.js-15.2.6-black?style=for-the-badge&logo=next.js&labelColor=0f1117" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&labelColor=0f1117" />
<img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase&labelColor=0f1117" />
<img src="https://img.shields.io/badge/VAPI-Voice_AI-7c3aed?style=for-the-badge&labelColor=0f1117" />

<br /><br />

# CallSync AI

### Voice-first appointment booking for healthcare

A patient calls a phone number. An AI voice agent named Riley answers, collects their details, checks the calendar, books the appointment, and hangs up — in under 90 seconds. The clinic dashboard updates in real time.


<br />

</div>

---

## How it works

```
Patient calls                    Riley answers (VAPI + GPT-4)
     │                                    │
     │  "I'd like to book an              │
     │   appointment for Tuesday"         │
     └──────────────────────────────────► │
                                          │ Collects: name, phone, date, time
                                          │
                              POST /vapi/tool
                                          │
                              ┌───────────▼──────────────┐
                              │   CallSync Backend        │
                              │   (Node.js on Render)     │
                              └───┬──────────────────┬───┘
                                  │                  │
                        Google Calendar          Supabase
                        checkAvailability()    saveAppointment()
                        createEvent()
                                  │
                              Confirmed ──► Riley tells patient ──► Call ends
                                                        │
                              ┌─────────────────────────▼──┐
                              │   Dashboard (Next.js)       │
                              │   Real-time via Postgres     │
                              │   Realtime subscription      │
                              └────────────────────────────┘

  ── 24hrs before appointment ──────────────────────────────
  node-cron fires ──► VAPI outbound call ──► Patient reminded
```

---

## Feature overview

| Feature | Description |
|---|---|
| **Voice booking** | Full book / reschedule / cancel via natural speech |
| **Live dashboard** | KPI cards, schedule, call feed — all Postgres Realtime |
| **Calendar sync** | Free/busy checks and event creation on Google Calendar |
| **Outbound reminders** | Automated VAPI call 24 hours before each appointment |
| **Multilingual** | English, Hindi, Kannada, Tamil via Dialogflow + VAPI |
| **Dual channel** | VAPI (primary) + Dialogflow ES (alternative) |
| **REST API** | Dashboard-facing endpoints for reads, status updates, stats |
| **Auth** | Webhook secret on VAPI route, bearer token on API routes |
| **Input validation** | Date format, time format, phone, past-date rejection |

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Voice AI | VAPI Platform | — |
| LLM | OpenAI GPT-4 | — |
| TTS | PlayHT (voice: Jennifer) | — |
| Backend | Node.js + Express | 4.18 |
| Calendar | Google Calendar API | v3 |
| Database | Supabase (PostgreSQL) | — |
| Realtime | Supabase Postgres Realtime | — |
| Frontend | Next.js | 15.2.6 |
| UI | React + shadcn/ui + Tailwind | 19 / — / — |
| Charts | Recharts | 2.15.4 |
| Deployment | Render (backend) + Vercel (frontend) | — |
| Alt channel | Dialogflow ES + Google Cloud Functions | — |

---

## Repository structure

```
callsync-ai/
│
├── backend/
│   ├── server.js          Main Express app — all routes
│   ├── calendar.js        Google Calendar: checkAvailability, createEvent, deleteEvent
│   ├── supabase.js        All DB queries — phone-based lookup, CRUD, stats
│   ├── reminder.js        Hourly cron → outbound VAPI reminder calls
│   ├── schema.sql         Supabase table, indexes, RLS policies, realtime
│   ├── .env.example       All required environment variables (copy → .env)
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx       Root — renders dashboard shell
│   │   └── layout.tsx     App layout, metadata, Vercel Analytics
│   ├── components/
│   │   └── dashboard/
│   │       ├── sidebar.tsx
│   │       ├── topbar.tsx
│   │       └── pages/
│   │           ├── dashboard-home.tsx      KPIs, schedule, charts — live data
│   │           ├── appointments-page.tsx   Table + CRUD — live data
│   │           ├── calendar-page.tsx       Day/Week/Month view — live data
│   │           ├── live-calls-page.tsx     Recent bookings feed — live data
│   │           ├── reminders-page.tsx      Reminder status log — live data
│   │           ├── past-appointments-page.tsx
│   │           └── settings-page.tsx
│   ├── hooks/
│   │   └── use-appointments.ts    useAppointments + useDashboardStats
│   ├── lib/
│   │   ├── supabase.ts            Browser Supabase client + AppointmentRow type
│   │   └── mock-data.ts           Static fallback / local dev without DB
│   ├── .env.local.example
│   └── package.json
│
├── vapi/
│   ├── assistant-config.json    Full VAPI assistant definition
│   └── prompts.md               System prompts in EN / HI / KN / TA
│
├── dialogflow/
│   ├── intents/                 BookAppointment, RescheduleAppointment, CancelAppointment
│   │                            — each with EN / HI / KN / TA slot-filling prompts
│   └── fulfillment/
│       └── index.js             Cloud Function webhook bridging Dialogflow → backend
│
└── README.md
```

---

## Database schema

Run `backend/schema.sql` in your Supabase SQL editor. It creates the table, all indexes, RLS policies, and enables Postgres Realtime in one shot.

```sql
create table appointments (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  phone             text        not null,
  date              date        not null,
  time              text        not null,
  calendar_event_id text,
  reminded          boolean     default false,
  status            text        not null default 'confirmed'
                                check (status in ('confirmed', 'pending', 'cancelled')),
  condition         text,        -- medical specialty
  doctor            text,
  created_at        timestamptz default now()
);

-- Indexes
create index idx_appointments_phone  on appointments (phone);
create index idx_appointments_date   on appointments (date);
create index idx_appointments_status on appointments (status);
```

Appointments are looked up by **phone number**, not name — this prevents collisions between patients with similar names.

---

## Environment variables

### Backend — `backend/.env`

Copy `backend/.env.example` to `backend/.env` and fill in all values.

| Variable | Required | Description |
|---|---|---|
| `VAPI_API_KEY` | ✅ | Your VAPI API key — `app.vapi.ai → Account → API Keys` |
| `VAPI_WEBHOOK_SECRET` | ✅ | Random string ≥ 32 chars — sent as `X-Webhook-Secret` header by VAPI |
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anon public key |
| `GOOGLE_CALENDAR_ID` | ✅ | The calendar to write events to (usually your Gmail address) |
| `API_SECRET` | ✅ | Bearer token for `/api/*` dashboard endpoints |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated frontend origins, e.g. `https://callsync.vercel.app,http://localhost:3001` |
| `PORT` | — | Render sets this automatically; defaults to `3000` |

> **Never commit `credentials.json`** — this file contains your Google service account private key. It is listed in `.gitignore`. Add it as a Render Secret File instead (see Deployment).

### Frontend — `frontend/.env.local`

Copy `frontend/.env.local.example` to `frontend/.env.local`.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (safe to expose in browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe to expose in browser) |
| `NEXT_PUBLIC_BACKEND_URL` | Your Render backend URL |

---

## Local development

### Prerequisites

- Node.js 18 or higher
- A Supabase project with `schema.sql` already applied
- A Google Cloud project with Calendar API enabled and a service account JSON key
- A VAPI account with an assistant configured

### Backend

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
# Place your Google service account key at backend/credentials.json
npm install
npm run dev          # node --watch for hot reload
```

Verify it's running:

```bash
curl http://localhost:3000
# {"status":"ok","service":"CallSync AI Backend","version":"2.0.0"}
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install --legacy-peer-deps
npm run dev          # opens on http://localhost:3001
```

The dashboard will connect directly to your Supabase project. Any appointment booked through the voice agent will appear in real time.

---

## Deployment

### Backend — Render

1. Push this repository to GitHub.
2. Go to **Render → New → Web Service** → connect your repo.
3. Set **Root Directory** to `backend`.
4. **Build command:** `npm install`
5. **Start command:** `node server.js`
6. Under **Environment**, add every variable from `backend/.env.example`.
7. Under **Secret Files**, add your Google service account JSON at path `credentials.json`.
8. Deploy. Render will assign a URL like `https://callsync-backend.onrender.com`.

> The Render free tier spins down after inactivity — the first request after a cold start may take 30–50 seconds. Use an uptime monitoring ping (e.g., UptimeRobot) or upgrade to a paid instance for production.

### Frontend — Vercel

1. Go to **Vercel → New Project** → import your GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Next.js** (auto-detected).
4. Under **Environment Variables**, add your Supabase and backend URL vars.
5. Deploy.

---

## API reference

All `/api/*` routes require the header:

```
Authorization: Bearer <API_SECRET>
```

---

### `GET /`

Health check. No auth required.

**Response**

```json
{
  "status": "ok",
  "service": "CallSync AI Backend",
  "version": "2.0.0"
}
```

---

### `POST /vapi/tool`

Handles all VAPI tool calls. Requires `X-Webhook-Secret: <VAPI_WEBHOOK_SECRET>` header.

The request body is the standard VAPI tool-call webhook payload. The backend reads `message.toolCalls[0].function.name` and routes accordingly.

**Supported tool names:** `bookAppointment` · `rescheduleAppointment` · `cancelAppointment` · `checkAvailability`

**Example request — bookAppointment**

```json
{
  "message": {
    "toolCalls": [
      {
        "id": "call_abc123",
        "function": {
          "name": "bookAppointment",
          "arguments": {
            "customerName": "Priya Sharma",
            "phone": "+919876543210",
            "date": "2025-06-10",
            "time": "14:00"
          }
        }
      }
    ]
  }
}
```

**Example response**

```json
{
  "results": [
    {
      "toolCallId": "call_abc123",
      "result": "Done! Your appointment is confirmed for 2025-06-10 at 14:00. You will receive a reminder call 24 hours before."
    }
  ]
}
```

**Input validation** — all tool calls validate their inputs before touching the calendar or database:

| Field | Rule |
|---|---|
| `date` | Must match `YYYY-MM-DD`, must be in the future |
| `time` | Must match `HH:MM` (24-hour) |
| `phone` | Must be 7–15 digits after stripping spaces, dashes, parentheses |
| `customerName` | Must not be empty |

Validation failures return a conversational error string to the voice agent — the call continues gracefully rather than erroring out.

---

### `GET /api/appointments`

Returns a paginated list of appointments.

**Query parameters**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by `confirmed`, `pending`, or `cancelled` |
| `date` | string | Filter by exact date (`YYYY-MM-DD`) |
| `limit` | number | Max results (default: 100) |
| `offset` | number | Pagination offset (default: 0) |

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-...",
      "name": "Priya Sharma",
      "phone": "+919876543210",
      "date": "2025-06-10",
      "time": "14:00",
      "status": "confirmed",
      "condition": "Cardiology",
      "doctor": "Dr. Arjun Mehta",
      "reminded": false,
      "created_at": "2025-06-09T10:23:00Z"
    }
  ]
}
```

---

### `PATCH /api/appointments/:id/status`

Updates the status of a single appointment.

**Request body**

```json
{ "status": "cancelled" }
```

Accepted values: `confirmed` · `pending` · `cancelled`

**Response**

```json
{
  "success": true,
  "data": { "id": "550e8400-...", "status": "cancelled", ... }
}
```

---

### `GET /api/stats`

Returns booking counts for today and all-time totals.

**Response**

```json
{
  "success": true,
  "data": {
    "today": {
      "total": 12,
      "confirmed": 9,
      "pending": 2,
      "cancelled": 1
    },
    "allTime": {
      "total": 847
    }
  }
}
```

---

## Voice agent — Riley

Riley is a VAPI assistant powered by GPT-4 with PlayHT TTS (voice: Jennifer). She answers inbound calls, collects booking details, calls backend tools, and confirms outcomes in natural speech.

### System prompt principles

- Responses are kept short — this is a phone call, not a chat interface.
- All details are confirmed with the caller before any tool is invoked.
- If a slot is unavailable, Riley apologises and asks for an alternative.
- Temperature is set to `0.3` for consistent, predictable scheduling responses.
- Silence timeout: 30 seconds · Max call duration: 10 minutes.

### Multilingual support

Language support is implemented at two layers:

At the **VAPI layer**, the system prompt in `vapi/prompts.md` has variants in English, Hindi, Kannada, and Tamil. Select the appropriate prompt in the VAPI dashboard and switch the voice provider to a native-language voice for each locale.

At the **Dialogflow layer**, each intent JSON in `dialogflow/intents/` contains slot-filling prompts and response messages in all four languages using standard BCP-47 codes (`en`, `hi`, `kn`, `ta`). Dialogflow selects the language automatically based on the caller's detected locale.

The backend and database are language-agnostic — they only handle structured data.

To add a new language: add a prompt block to `vapi/prompts.md` and add `messages` / `responses` entries to each intent JSON using the correct BCP-47 code.

---

## Reminder system

`backend/reminder.js` registers a cron job that runs at the top of every hour.

**Flow:**

1. Query Supabase for rows where `reminded = false` and `date` falls within the next 24 hours.
2. For each appointment, call `POST https://api.vapi.ai/call/phone` with the patient's number and a short reminder script.
3. On successful call placement, set `reminded = true` — the patient will not be called again.

The reminder assistant uses GPT-4 with a minimal prompt and ends the call after delivering the message and handling at most one follow-up question.

---

## Dialogflow channel (optional)

Dialogflow provides an alternative entry point for callers coming through Amazon Connect, Google Assistant, or any other Dialogflow-connected channel.

```
Amazon Connect / Google Assistant
          │
          ▼
   Dialogflow ES Agent
   (intent classification + slot filling)
          │
          │ Webhook fulfillment
          ▼
   dialogflow/fulfillment/index.js
   (Google Cloud Function)
          │
          │ Reformats params → /vapi/tool payload shape
          ▼
   CallSync Backend  ← same backend, same logic
```

The backend is the single source of truth regardless of which voice channel is used.

**Setup:**

1. Create a Dialogflow ES agent.
2. Import the three intent JSONs from `dialogflow/intents/`.
3. Enable webhook fulfillment on each intent.
4. Deploy `dialogflow/fulfillment/index.js` to Google Cloud Functions.
5. Set the deployed function URL as the fulfillment webhook in **Dialogflow → Fulfillment**.

---

## Google Calendar setup

1. Go to **Google Cloud Console → APIs & Services → Enable** the Google Calendar API.
2. Create a service account under **IAM & Admin → Service Accounts**.
3. Download the JSON key — this becomes `backend/credentials.json`.
4. In Google Calendar, open the target calendar's settings and share it with the service account email, granting **"Make changes to events"** permission.
5. Copy the Calendar ID (usually your Gmail address or a generated ID) into `GOOGLE_CALENDAR_ID`.

---

## VAPI setup

1. Create an account at [app.vapi.ai](https://app.vapi.ai).
2. Go to **Assistants → Create Assistant**.
3. Use `vapi/assistant-config.json` as reference, or import via the VAPI API:

```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @vapi/assistant-config.json
```

4. Go to **Phone Numbers**, purchase a number, and assign it to the assistant.
5. Under **Tools**, set all three tool server URLs to:

```
POST https://<your-render-url>.onrender.com/vapi/tool
```

6. Configure the `X-Webhook-Secret` header in each tool to match your `VAPI_WEBHOOK_SECRET`.

---

## Security model

| Surface | Protection |
|---|---|
| `/vapi/tool` | `X-Webhook-Secret` header checked against `VAPI_WEBHOOK_SECRET` env var |
| `/api/*` | `Authorization: Bearer` token checked against `API_SECRET` env var |
| CORS | Only origins listed in `ALLOWED_ORIGINS` receive `Access-Control-Allow-Origin` |
| Database writes | Validated before touching Supabase — date format, time format, phone, past-date check |
| Patient lookup | Phone-based (indexed column) — not name-based, no collision risk |
| Service account key | In `.gitignore`, added as Render Secret File only |
| Supabase RLS | Row-level security enabled on `appointments` table; policies in `schema.sql` |

---

## Known limitations

- **Render free tier cold starts** — first request after inactivity takes 30–50 seconds. Use an uptime ping or upgrade to a paid instance.
- **Race condition on simultaneous bookings** — `checkAvailability` and `createEvent` are two async calls with no distributed lock. Very rare in practice but theoretically two calls at the exact same millisecond could double-book a slot.
- **Frontend uses anon key** — the browser Supabase client connects with the anon key and is subject to RLS policies. The backend also currently uses the anon key. For a stricter setup, the backend should use the service role key to bypass RLS entirely.
- **VAPI charges per minute** — monitor usage in the VAPI dashboard.

---

## Built with

```
Voice AI      VAPI · OpenAI GPT-4 · PlayHT
Backend       Node.js · Express · node-cron · Axios
Calendar      Google Calendar API · googleapis npm
Database      Supabase · PostgreSQL · Postgres Realtime
Frontend      Next.js 15 · React 19 · TypeScript · Tailwind CSS
Components    shadcn/ui · Radix UI · Recharts · Lucide
Fonts         Geist Sans · Geist Mono
Deployment    Render · Vercel · Vercel Analytics
Alt channel   Dialogflow ES · Google Cloud Functions
```

---

## Team

**Khush Chadha** 

