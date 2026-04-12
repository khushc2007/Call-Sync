const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
require('./reminder');

const { checkAvailability, createEvent, deleteEvent } = require('./calendar');
const { saveAppointment, getAppointmentByPhone, deleteAppointmentById, getAllAppointments, updateAppointmentStatus } = require('./supabase');

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const allowed = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3001'];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Webhook-Secret');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Auth Middleware ───────────────────────────────────────────────────────────
function requireVapiAuth(req, res, next) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[WARN] VAPI_WEBHOOK_SECRET not set — running without auth (dev mode)');
    return next();
  }
  const provided = req.headers['x-webhook-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (provided !== secret) {
    console.warn(`[AUTH] Rejected request from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function requireApiAuth(req, res, next) {
  const secret = process.env.API_SECRET;
  if (!secret) return next();
  const provided = req.headers['authorization']?.replace('Bearer ', '');
  if (provided !== secret) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ─── Input Validation ─────────────────────────────────────────────────────────
function validateDateTime(date, time) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!dateRegex.test(date)) return true;
  if (!timeRegex.test(time)) return true;
  const d = new Date(`${date}T${time}:00`);
  if (isNaN(d.getTime())) return true;
  if (d < new Date()) return true;
  return false;
}

function validatePhone(phone) {
  if (!phone) return true;
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  return !/^\d{7,15}$/.test(cleaned);
}

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', service: 'CallSync AI Backend', version: '2.0.0' }));

// ─── VAPI Tool Handler ────────────────────────────────────────────────────────
app.post('/vapi/tool', requireVapiAuth, async (req, res) => {
  const toolCall = req.body.message?.toolCalls?.[0];
  if (!toolCall) {
    return res.json({ results: [{ toolCallId: 'unknown', result: 'No tool call received.' }] });
  }

  const { id: toolCallId, function: { name, arguments: args } } = toolCall;
  const parameters = typeof args === 'string' ? JSON.parse(args) : args;
  console.log(`[TOOL] ${name}`, JSON.stringify(parameters));

  try {
    if (name === 'bookAppointment') {
      const { customerName, phone, date, time } = parameters;
      if (!customerName?.trim()) return toolResult(res, toolCallId, 'I need your name to book the appointment. Could you tell me your name?');
      if (validatePhone(phone)) return toolResult(res, toolCallId, 'I need a valid phone number. Could you repeat it?');
      if (validateDateTime(date, time)) return toolResult(res, toolCallId, 'Could you try again with a future date and time? For example: 2025-06-10 at 14:00.');

      const available = await checkAvailability(date, time);
      if (!available) return toolResult(res, toolCallId, `I'm sorry, ${date} at ${time} is not available. Can I suggest a different time?`);

      const eventId = await createEvent(customerName.trim(), phone, date, time);
      await saveAppointment({ name: customerName.trim(), phone, date, time, calendar_event_id: eventId });
      return toolResult(res, toolCallId, `Done! Your appointment is confirmed for ${date} at ${time}. You will receive a reminder call 24 hours before. Is there anything else I can help you with?`);
    }

    if (name === 'rescheduleAppointment') {
      const { customerPhone, newDate, newTime } = parameters;
      if (validatePhone(customerPhone)) return toolResult(res, toolCallId, 'I need your phone number to find your appointment.');
      if (validateDateTime(newDate, newTime)) return toolResult(res, toolCallId, 'Could you give me a valid future date and time for the rescheduled appointment?');

      const existing = await getAppointmentByPhone(customerPhone);
      if (!existing) return toolResult(res, toolCallId, `I could not find an appointment linked to that number. Could you double-check it?`);

      const available = await checkAvailability(newDate, newTime);
      if (!available) return toolResult(res, toolCallId, `${newDate} at ${newTime} is already taken. Would you like to try another slot?`);

      await deleteEvent(existing.calendar_event_id);
      await deleteAppointmentById(existing.id);
      const eventId = await createEvent(existing.name, existing.phone, newDate, newTime);
      await saveAppointment({ name: existing.name, phone: existing.phone, date: newDate, time: newTime, calendar_event_id: eventId });
      return toolResult(res, toolCallId, `Done! Rescheduled to ${newDate} at ${newTime}. You will receive a reminder 24 hours before.`);
    }

    if (name === 'cancelAppointment') {
      const { customerPhone } = parameters;
      if (validatePhone(customerPhone)) return toolResult(res, toolCallId, 'I need your phone number to locate your appointment.');

      const existing = await getAppointmentByPhone(customerPhone);
      if (!existing) return toolResult(res, toolCallId, `I could not find an appointment for that number. Is it possible it was booked under a different number?`);

      await deleteEvent(existing.calendar_event_id);
      await deleteAppointmentById(existing.id);
      return toolResult(res, toolCallId, `Your appointment on ${existing.date} at ${existing.time} has been cancelled. Have a great day!`);
    }

    if (name === 'checkAvailability') {
      const { date, time } = parameters;
      if (validateDateTime(date, time)) return toolResult(res, toolCallId, 'That date or time looks invalid. Can you try again?');
      const available = await checkAvailability(date, time);
      return toolResult(res, toolCallId, available ? `Yes, ${date} at ${time} is available.` : `Sorry, that slot is already taken.`);
    }

    return toolResult(res, toolCallId, 'I received an unknown request. Could you try again?');
  } catch (err) {
    console.error('[ERROR]', err);
    return toolResult(res, toolCallId, 'Something went wrong on our end. Please try again in a moment.');
  }
});

// ─── REST API for Dashboard ───────────────────────────────────────────────────
app.get('/api/appointments', requireApiAuth, async (req, res) => {
  try {
    const { status, date, limit = 100, offset = 0 } = req.query;
    const data = await getAllAppointments({ status, date, limit: Number(limit), offset: Number(offset) });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[API /appointments]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
});

app.patch('/api/appointments/:id/status', requireApiAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed', 'pending', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const data = await updateAppointmentStatus(req.params.id, status);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[API PATCH /appointments]', err);
    res.status(500).json({ success: false, error: 'Failed to update appointment' });
  }
});

app.get('/api/stats', requireApiAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [todayApts, allApts] = await Promise.all([
      getAllAppointments({ date: today, limit: 500 }),
      getAllAppointments({ limit: 500 }),
    ]);
    res.json({
      success: true,
      data: {
        today: {
          total: todayApts.length,
          confirmed: todayApts.filter(a => a.status === 'confirmed').length,
          pending: todayApts.filter(a => a.status === 'pending').length,
          cancelled: todayApts.filter(a => a.status === 'cancelled').length,
        },
        allTime: { total: allApts.length },
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

function toolResult(res, toolCallId, result) {
  return res.json({ results: [{ toolCallId, result }] });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[CallSync] Server running on port ${PORT}`));
