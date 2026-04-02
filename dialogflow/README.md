# Dialogflow Configuration

## Structure

```
dialogflow/
  intents/
    BookAppointment.json        - Book a new appointment
    RescheduleAppointment.json  - Reschedule an existing appointment
    CancelAppointment.json      - Cancel an appointment
  fulfillment/
    index.js                    - Cloud Function webhook handler
    package.json
```

## Multi-Language Support

Each intent JSON contains prompts and response messages in four languages:

| Code | Language   |
|------|------------|
| en   | English    |
| hi   | Hindi      |
| kn   | Kannada    |
| ta   | Tamil      |

To add more languages, add entries to each intent's `prompts` and `messages` blocks
using the appropriate BCP-47 language code.

## Importing Intents

1. Go to Dialogflow ES console -> your agent -> Settings -> Export and Import
2. Use "Restore from ZIP" or manually create each intent using the JSON files as reference
3. Enable Fulfillment webhook in each intent

## Deploying the Fulfillment Webhook

```bash
cd dialogflow/fulfillment
npm install
gcloud functions deploy dialogflowWebhook \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1
```

Copy the deployed Cloud Function URL into Dialogflow -> Fulfillment -> Webhook URL.

## How It Works

The fulfillment webhook receives structured parameters from Dialogflow,
reformats them into the CallSync backend's `/vapi/tool` payload shape,
and returns the backend's response as the agent's reply.
This means Dialogflow and VAPI share the same backend logic.
