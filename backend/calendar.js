const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

async function checkAvailability(date, time) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: client });

  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
    },
  });

  const busy = res.data.calendars[process.env.GOOGLE_CALENDAR_ID].busy;
  return busy.length === 0;
}

async function createEvent(name, phone, date, time) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: client });

  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: `Appointment - ${name}`,
      description: `Phone: ${phone}`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  });

  return res.data.id;
}

async function deleteEvent(eventId) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: client });
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
  });
}

module.exports = { checkAvailability, createEvent, deleteEvent };
