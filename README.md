# CallSync AI

A voice-based appointment management system built for the HACK'A'WAR GenAI x AWS Hackathon at RIT Bengaluru. CallSync lets callers book, reschedule, and cancel appointments entirely over a phone call. The system uses a VAPI voice agent backed by GPT-4, a Node.js/Express API deployed on Render, Google Calendar for slot management, Supabase for persistence, and a Next.js dashboard for monitoring.

## Repository Structure

```
callsync-ai/
│
├── frontend/                        Next.js dashboard (deployed to Vercel)
│   ├── app/
│   │   ├── page.tsx                 Root page — renders the dashboard shell
│   │   ├── layout.tsx               App layout with theme provider
│   │   └── globals.css
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx          Navigation sidebar
│   │   │   ├── topbar.tsx           Top header bar
│   │   │   └── pages/
│   │   │       ├── dashboard-home.tsx
│   │   │       ├── appointments-page.tsx
│   │   │       ├── calendar-page.tsx
│   │   │       ├── live-calls-page.tsx
│   │   │       ├── past-appointments-page.tsx
│   │   │       ├── reminders-page.tsx
│   │   │       └── settings-page.tsx
│   │   └── ui/                      shadcn/ui component library
│   ├── lib/
│   │   ├── mock-data.ts             Sample data for UI development
│   │   └── utils.ts
│   ├── hooks/
│   ├── .env.local                   NEXT_PUBLIC_BACKEND_URL set here
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                         Node.js/Express API (deployed to Render)
│   ├── server.js                    Express app + /vapi/tool route
│   ├── calendar.js                  Google Calendar integration (check, create, delete)
│   ├── reminder.js                  Cron job for outbound VAPI reminder calls
│   ├── supabase.js                  Supabase queries (save, fetch, delete, remind)
│   ├── credentials.json             Google service account key (DO NOT COMMIT)
│   ├── .env.example                 Environment variable template
│   └── package.json
│
├── dialogflow/                      Dialogflow ES agent configuration
│   ├── intents/
│   │   ├── BookAppointment.json     Intent with multilingual prompts (EN/HI/KN/TA)
│   │   ├── RescheduleAppointment.json
│   │   └── CancelAppointment.json
│   ├── fulfillment/
│   │   ├── index.js                 Cloud Function webhook — bridges Dialogflow to backend
│   │   └── package.json
│   └── README.md
│
├── vapi/                            VAPI assistant configuration
│   ├── assistant-config.json        Full assistant definition with tool schemas
│   ├── prompts.md                   System prompts in English, Hindi, Kannada, Tamil
│   └── README.md
│
├── docs/                            Architecture diagrams and reference
│   └── (see Architecture section below)
│
├── .gitignore
├── package.json                     Root scripts for convenience
└── README.md
```

---

## System Architecture

The diagram below shows how a caller's phone call travels through the system and results in a confirmed appointment.

```
Caller (Phone)
      |
      | PSTN / SIP
      v
  VAPI Platform
  (Voice Agent - GPT-4)
      |
      | Detects intent, collects name/phone/date/time
      | POST /vapi/tool
      v
  CallSync Backend  <-----------+
  (Render - Node.js)            |
      |                         |
      |-- calendar.js --------> Google Calendar API
      |   checkAvailability()   (Free/Busy query)
      |   createEvent()         (Insert event)
      |   deleteEvent()         (Remove event)
      |
      |-- supabase.js --------> Supabase (PostgreSQL)
          saveAppointment()     (appointments table)
          getAppointmentByName()
          deleteAppointmentByName()
          getUnremindedAppointments()
          markReminded()

Separately, every hour:
  reminder.js (cron)
      |
      | Queries Supabase for appointments within next 24h
      | POST https://api.vapi.ai/call/phone
      v
  VAPI Outbound Call -> Caller (Reminder)


Frontend Dashboard (Vercel - Next.js)
      |
      | NEXT_PUBLIC_BACKEND_URL -> https://callsyncbackend.onrender.com
      | Reads appointment data from Supabase directly or via backend
      v
  Browser (Monitoring UI)
```

### Dialogflow Path (Alternative Channel)

If a caller comes through a Dialogflow-connected channel (e.g., Amazon Connect, Google Assistant):

```
Amazon Connect / Google Assistant
      |
      v
  Dialogflow ES Agent
  (Intent classification + slot filling)
      |
      | Webhook fulfillment
      v
  dialogflow/fulfillment/index.js  (Cloud Function)
      |
      | Reformats parameters into /vapi/tool payload shape
      | POST /vapi/tool
      v
  CallSync Backend  (same backend, same logic)
```

This means the backend is the single source of truth regardless of which voice channel is used.

---

## Services and Accounts Required

| Service             | Purpose                                        | Where to get it                          |
|---------------------|------------------------------------------------|------------------------------------------|
| VAPI                | Voice AI platform, phone number, agent hosting | app.vapi.ai                              |
| Google Cloud        | Google Calendar API + service account          | console.cloud.google.com                 |
| Supabase            | PostgreSQL database for appointments           | supabase.com                             |
| Render              | Backend hosting                                | render.com                               |
| Vercel              | Frontend hosting                               | vercel.com                               |
| Google Cloud (opt.) | Dialogflow ES + Cloud Functions for webhook    | console.cloud.google.com                 |

---

## Database Schema

Create this table in Supabase before running the backend.

```sql
create table appointments (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  phone             text not null,
  date              date not null,
  time              text not null,
  calendar_event_id text,
  reminded          boolean default false,
  created_at        timestamptz default now()
);
```

---

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in your values.

```
VAPI_API_KEY          Your VAPI API key from app.vapi.ai -> Account -> API Keys
SUPABASE_URL          Your Supabase project URL (Settings -> API -> Project URL)
SUPABASE_ANON_KEY     Your Supabase anon public key
GOOGLE_CALENDAR_ID    The Google Calendar email address or calendar ID to write events to
PORT                  Port for the Express server (Render sets this automatically)
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_BACKEND_URL=https://callsyncbackend.onrender.com
```

This variable is already set in the committed `.env.local` file. If you deploy to a different backend URL, update it here and redeploy to Vercel.

---

## Local Development

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
# Place your Google service account credentials.json in backend/
npm install
node server.js
```

The server starts on `http://localhost:3000`. Test it:

```bash
curl http://localhost:3000
# Response: CallSync backend running
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The dashboard opens at `http://localhost:3001` (Next.js auto-selects the next available port if 3000 is taken by the backend).

---

## Deployment

### Backend (Render)

1. Push this repository to GitHub.
2. Go to render.com -> New -> Web Service -> connect your GitHub repo.
3. Set the root directory to `backend`.
4. Build command: `npm install`
5. Start command: `node server.js`
6. Under Environment, add all variables from `backend/.env.example` with real values.
7. Under Secret Files, add `credentials.json` at path `credentials.json` with the contents of your Google service account JSON key.
8. Deploy. Render will assign a URL like `https://callsyncbackend.onrender.com`.

### Frontend (Vercel)

1. Go to vercel.com -> New Project -> import your GitHub repo.
2. Set the root directory to `frontend`.
3. Framework preset: Next.js (auto-detected).
4. Under Environment Variables, confirm `NEXT_PUBLIC_BACKEND_URL` is set to your Render URL.
5. Deploy.

---

## Google Calendar Setup

1. Go to Google Cloud Console -> APIs & Services -> Enable the Google Calendar API.
2. Create a service account under IAM & Admin -> Service Accounts.
3. Download the JSON key for the service account. This becomes `credentials.json` in the backend.
4. Open Google Calendar in your browser, go to the calendar's settings, and under "Share with specific people" add the service account's email address with "Make changes to events" permission.
5. Copy the Calendar ID (usually your Google account email or a generated ID) into the `GOOGLE_CALENDAR_ID` environment variable.

---

## VAPI Setup

1. Create an account at app.vapi.ai.
2. Go to Assistants -> Create Assistant.
3. Use the configuration in `vapi/assistant-config.json` as reference, or import it via the VAPI REST API:

```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @vapi/assistant-config.json
```

4. Go to Phone Numbers, purchase a number, and assign it to the assistant.
5. All three tools (`bookAppointment`, `rescheduleAppointment`, `cancelAppointment`) point to:

```
POST https://callsyncbackend.onrender.com/vapi/tool
```

The backend routes requests by reading `message.toolCalls[0].function.name`.

---

## Dialogflow Setup (Optional Channel)

See `dialogflow/README.md` for full instructions. The short version:

1. Create a Dialogflow ES agent.
2. Import the intent JSONs from `dialogflow/intents/`.
3. Enable fulfillment webhook in each intent.
4. Deploy `dialogflow/fulfillment/index.js` to Google Cloud Functions.
5. Set the deployed function URL as the webhook in Dialogflow -> Fulfillment.

The fulfillment Cloud Function bridges Dialogflow to the same `/vapi/tool` backend endpoint, so no backend changes are needed.

---

## Multilingual Support

Language support is implemented at two layers:

At the Dialogflow layer, each intent JSON contains slot-filling prompts and response messages in English, Hindi, Kannada, and Tamil. Dialogflow handles the language automatically based on the caller's detected locale.

At the VAPI layer, language is controlled by selecting an appropriate system prompt from `vapi/prompts.md` and, if needed, switching the voice provider to a native speaker voice for that language. The backend and Supabase layers are language-agnostic — they only handle structured data.

To add a new language, add a prompt entry in `vapi/prompts.md` and add the corresponding `prompts` and `messages` entries to each intent JSON using the correct BCP-47 language code.

---

## API Reference

### `GET /`

Health check. Returns `CallSync backend running`.

### `POST /vapi/tool`

Handles all VAPI tool calls. VAPI sends a `message.toolCalls` array; the backend reads the first entry.

Request body (sent by VAPI):

```json
{
  "message": {
    "toolCalls": [
      {
        "id": "call_abc123",
        "function": {
          "name": "bookAppointment",
          "arguments": {
            "customerName": "Riya Sharma",
            "phone": "+919876543210",
            "date": "2026-04-10",
            "time": "14:30"
          }
        }
      }
    ]
  }
}
```

Supported `name` values: `bookAppointment`, `rescheduleAppointment`, `cancelAppointment`.

Response:

```json
{
  "results": [
    {
      "toolCallId": "call_abc123",
      "result": "Done! Your appointment is booked for 2026-04-10 at 14:30. You'll receive a reminder call 24 hours before. Goodbye!"
    }
  ]
}
```

---

## How the Reminder System Works

`backend/reminder.js` registers a cron job that fires at the top of every hour. When it runs:

1. It queries the `appointments` table in Supabase for rows where `reminded = false` and `date` falls within the next 24 hours.
2. For each such appointment, it calls `POST https://api.vapi.ai/call/phone` with the customer's phone number and a short reminder script.
3. If the call is placed successfully, it marks the row `reminded = true` in Supabase so the same person is not called again.

The reminder assistant uses GPT-4 with a minimal system prompt and ends the call after delivering the message.

---

## Known Limitations and Notes

- The backend free tier on Render spins down after inactivity. The first request after a cold start may take 30-50 seconds. For production, upgrade to a paid Render instance or add an uptime monitoring ping.
- `credentials.json` contains a Google service account private key. It must never be committed to the repository. Add it as a Render secret file.
- VAPI charges per minute of call time. Monitor usage on the VAPI dashboard.
- The frontend dashboard currently uses mock data from `lib/mock-data.ts` for some views. To connect it to live Supabase data, add the Supabase client to the frontend and replace the mock imports.

---

## Built With

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Voice AI    | VAPI, OpenAI GPT-4, PlayHT                     |
| Backend     | Node.js, Express, node-cron, Axios             |
| Calendar    | Google Calendar API, googleapis npm package    |
| Database    | Supabase (PostgreSQL)                          |
| Frontend    | Next.js 14, Tailwind CSS, shadcn/ui, TypeScript|
| Deployment  | Render (backend), Vercel (frontend)            |
| Alt channel | Dialogflow ES, Google Cloud Functions          |

---

## Team
Developed and produced by Khush Chadha
