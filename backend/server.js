const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
require('./reminder');

const { checkAvailability, createEvent, deleteEvent } = require('./calendar');
const { saveAppointment, getAppointmentByName, deleteAppointmentByName } = require('./supabase');

app.get('/', (req, res) => res.send('CallSync backend running'));

app.post('/vapi/tool', async (req, res) => {
  const toolCall = req.body.message?.toolCalls?.[0];
  if (!toolCall) return res.json({ results: [{ toolCallId: 'unknown', result: 'No tool call received.' }] });

  const { id: toolCallId, function: { name, arguments: args } } = toolCall;
  const parameters = typeof args === 'string' ? JSON.parse(args) : args;

  try {
    if (name === 'bookAppointment') {
      const { customerName, phone, date, time } = parameters;
      const available = await checkAvailability(date, time);

      if (!available) {
        return res.json({ results: [{ toolCallId, result: `Sorry, ${date} at ${time} is not available. Please choose another time.` }] });
      }

      const eventId = await createEvent(customerName, phone, date, time);
      await saveAppointment({ name: customerName, phone, date, time, calendar_event_id: eventId });

      return res.json({ results: [{ toolCallId, result: `Done! Your appointment is booked for ${date} at ${time}. You'll receive a reminder call 24 hours before. Goodbye!` }] });
    }

    if (name === 'rescheduleAppointment') {
      const { customerName, newDate, newTime } = parameters;
      const existing = await getAppointmentByName(customerName);

      if (!existing) {
        return res.json({ results: [{ toolCallId, result: `I couldn't find an appointment under ${customerName}. Can you double check the name?` }] });
      }

      const available = await checkAvailability(newDate, newTime);
      if (!available) {
        return res.json({ results: [{ toolCallId, result: `${newDate} at ${newTime} is not available. Please choose another slot.` }] });
      }

      await deleteEvent(existing.calendar_event_id);
      await deleteAppointmentByName(customerName);
      const eventId = await createEvent(customerName, existing.phone, newDate, newTime);
      await saveAppointment({ name: customerName, phone: existing.phone, date: newDate, time: newTime, calendar_event_id: eventId });

      return res.json({ results: [{ toolCallId, result: `Done! Rescheduled to ${newDate} at ${newTime}.` }] });
    }

    if (name === 'cancelAppointment') {
      const { customerName } = parameters;
      const existing = await getAppointmentByName(customerName);

      if (!existing) {
        return res.json({ results: [{ toolCallId, result: `I couldn't find an appointment under ${customerName}.` }] });
      }

      await deleteEvent(existing.calendar_event_id);
      await deleteAppointmentByName(customerName);

      return res.json({ results: [{ toolCallId, result: `Your appointment has been cancelled. Have a great day!` }] });
    }

    return res.json({ results: [{ toolCallId, result: 'Unknown action.' }] });

  } catch (err) {
    console.error(err);
    return res.json({ results: [{ toolCallId, result: 'Something went wrong. Please try again.' }] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
