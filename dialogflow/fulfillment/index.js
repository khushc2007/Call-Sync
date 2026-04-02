/**
 * Dialogflow Fulfillment Webhook
 *
 * This Cloud Function handles fulfillment for all intents.
 * It forwards structured parameters to the CallSync backend
 * running on Render, which handles Google Calendar and Supabase operations.
 *
 * Deploy this to Google Cloud Functions and point Dialogflow's
 * fulfillment webhook URL at it.
 */

const { WebhookClient } = require('dialogflow-fulfillment');
const axios = require('axios');

const BACKEND_URL = 'https://callsyncbackend.onrender.com';

exports.dialogflowWebhook = async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  async function bookAppointment(agent) {
    const customerName = agent.parameters['customerName'];
    const phone       = agent.parameters['phone'];
    const date        = agent.parameters['date'].split('T')[0];
    const time        = agent.parameters['time'].split('T')[1]?.slice(0, 5) || agent.parameters['time'];

    try {
      const response = await axios.post(`${BACKEND_URL}/vapi/tool`, {
        message: {
          toolCalls: [{
            id: 'dialogflow-book',
            function: {
              name: 'bookAppointment',
              arguments: { customerName, phone, date, time }
            }
          }]
        }
      });
      const result = response.data.results[0]?.result || 'Appointment booked.';
      agent.add(result);
    } catch (err) {
      agent.add('Sorry, I could not book the appointment. Please try again.');
    }
  }

  async function rescheduleAppointment(agent) {
    const customerName = agent.parameters['customerName'];
    const newDate      = agent.parameters['newDate'].split('T')[0];
    const newTime      = agent.parameters['newTime'].split('T')[1]?.slice(0, 5) || agent.parameters['newTime'];

    try {
      const response = await axios.post(`${BACKEND_URL}/vapi/tool`, {
        message: {
          toolCalls: [{
            id: 'dialogflow-reschedule',
            function: {
              name: 'rescheduleAppointment',
              arguments: { customerName, newDate, newTime }
            }
          }]
        }
      });
      const result = response.data.results[0]?.result || 'Appointment rescheduled.';
      agent.add(result);
    } catch (err) {
      agent.add('Sorry, I could not reschedule the appointment. Please try again.');
    }
  }

  async function cancelAppointment(agent) {
    const customerName = agent.parameters['customerName'];

    try {
      const response = await axios.post(`${BACKEND_URL}/vapi/tool`, {
        message: {
          toolCalls: [{
            id: 'dialogflow-cancel',
            function: {
              name: 'cancelAppointment',
              arguments: { customerName }
            }
          }]
        }
      });
      const result = response.data.results[0]?.result || 'Appointment cancelled.';
      agent.add(result);
    } catch (err) {
      agent.add('Sorry, I could not cancel the appointment. Please try again.');
    }
  }

  const intentMap = new Map();
  intentMap.set('Book Appointment', bookAppointment);
  intentMap.set('Reschedule Appointment', rescheduleAppointment);
  intentMap.set('Cancel Appointment', cancelAppointment);

  agent.handleRequest(intentMap);
};
