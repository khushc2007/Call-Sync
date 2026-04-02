const cron = require('node-cron');
const axios = require('axios');
const { getUnremindedAppointments, markReminded } = require('./supabase');
require('dotenv').config();

cron.schedule('0 * * * *', async () => {
  console.log('Running reminder check...');
  const appointments = await getUnremindedAppointments();

  for (const appt of appointments) {
    try {
      await axios.post('https://api.vapi.ai/call/phone', {
        customer: {
          number: appt.phone,
        },
        assistant: {
          firstMessage: `Hi ${appt.name}, this is a reminder from CallSync. You have an appointment scheduled for ${appt.date} at ${appt.time}. Please call us if you need to reschedule. Goodbye!`,
          model: {
            provider: 'openai',
            model: 'gpt-4',
            messages: [{ role: 'system', content: 'You are a reminder assistant. Deliver the reminder and end the call politely.' }]
          },
          voice: {
            provider: 'playht',
            voiceId: 'jennifer',
          },
        },
      }, {
        headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
      });

      await markReminded(appt.id);
      console.log(`Reminded: ${appt.name}`);
    } catch (err) {
      console.error(`Failed to remind ${appt.name}:`, err.message);
    }
  }
});
