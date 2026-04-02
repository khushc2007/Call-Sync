# VAPI Configuration

## Files

```
vapi/
  assistant-config.json   - Full VAPI assistant definition with tool schemas
  prompts.md              - System prompts for all languages and call types
```

## Setup

### Create the Assistant via Dashboard

1. Go to app.vapi.ai -> Assistants -> Create Assistant
2. Set the model to OpenAI GPT-4
3. Paste the system prompt from `prompts.md` into the System Prompt field
4. Under Tools, add each function from `assistant-config.json` with the server URL pointing to `https://callsyncbackend.onrender.com/vapi/tool`
5. Set the voice to PlayHT -> Jennifer (or a language-appropriate voice)

### Create the Assistant via API

```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @vapi/assistant-config.json
```

### Assign to a Phone Number

1. In the VAPI dashboard, go to Phone Numbers
2. Purchase or import a number
3. Assign it to the CallSync assistant
4. Incoming calls to that number will trigger the assistant

## Tool Endpoint

All three tools (bookAppointment, rescheduleAppointment, cancelAppointment) hit the same endpoint:

```
POST https://callsyncbackend.onrender.com/vapi/tool
```

The backend reads `message.toolCalls[0].function.name` to route to the correct handler.

## Outbound Reminder Calls

The backend's `reminder.js` runs a cron job every hour.
It queries Supabase for appointments within the next 24 hours that have not been reminded,
then uses the VAPI `/call/phone` endpoint to place an outbound call with the reminder prompt.
