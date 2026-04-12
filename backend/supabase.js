const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function saveAppointment(data) {
  const { error } = await supabase.from('appointments').insert([data]);
  if (error) throw error;
}

// Changed from name-based to phone-based lookup — avoids name collision bugs
async function getAppointmentByPhone(phone) {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .or(`phone.eq.${phone},phone.eq.${cleaned}`)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data[0] || null;
}

async function getAppointmentById(id) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function deleteAppointmentById(id) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

async function getUnremindedAppointments() {
  const now = new Date();
  const in24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('reminded', false)
    .lte('date', in24.toISOString().split('T')[0])
    .gte('date', now.toISOString().split('T')[0]);
  if (error) throw error;
  return data;
}

async function markReminded(id) {
  const { error } = await supabase
    .from('appointments')
    .update({ reminded: true })
    .eq('id', id);
  if (error) throw error;
}

// For dashboard REST API
async function getAllAppointments({ status, date, limit = 100, offset = 0 } = {}) {
  let query = supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) query = query.eq('status', status);
  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function updateAppointmentStatus(id, status) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = {
  saveAppointment,
  getAppointmentByPhone,
  getAppointmentById,
  deleteAppointmentById,
  getUnremindedAppointments,
  markReminded,
  getAllAppointments,
  updateAppointmentStatus,
};
