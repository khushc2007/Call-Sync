import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AppointmentRow = {
  id: string
  name: string
  phone: string
  date: string
  time: string
  calendar_event_id: string | null
  reminded: boolean
  status: 'confirmed' | 'pending' | 'cancelled'
  created_at: string
  condition?: string
  doctor?: string
}
