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

async function getAppointmentByName(name) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .ilike('name', `%${name}%`)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data[0];
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

async function deleteAppointmentByName(name) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .ilike('name', `%${name}%`);
  if (error) throw error;
}

module.exports = {
  saveAppointment,
  getAppointmentByName,
  getUnremindedAppointments,
  markReminded,
  deleteAppointmentByName
};
