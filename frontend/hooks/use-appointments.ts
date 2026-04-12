'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, type AppointmentRow } from '@/lib/supabase'

type UseAppointmentsOptions = {
  date?: string
  status?: string
  pollingInterval?: number // ms, 0 to disable
}

export function useAppointments(opts: UseAppointmentsOptions = {}) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const optsRef = useRef(opts)
  optsRef.current = opts

  const fetch = useCallback(async () => {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })
      if (optsRef.current.date) query = query.eq('date', optsRef.current.date)
      if (optsRef.current.status) query = query.eq('status', optsRef.current.status)
      const { data, error } = await query
      if (error) throw error
      setAppointments(data || [])
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const interval = opts.pollingInterval ?? 30_000
    if (interval > 0) {
      const id = setInterval(fetch, interval)
      return () => clearInterval(id)
    }
  }, [fetch, opts.pollingInterval])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetch()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetch])

  const updateStatus = useCallback(async (id: string, status: AppointmentRow['status']) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
    if (error) throw error
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }, [])

  const addAppointment = useCallback(async (apt: Omit<AppointmentRow, 'id' | 'created_at' | 'calendar_event_id' | 'reminded'>) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{ ...apt, reminded: false, status: 'confirmed' }])
      .select()
      .single()
    if (error) throw error
    setAppointments(prev => [data, ...prev])
    return data
  }, [])

  const markReminded = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ reminded: true })
      .eq('id', id)
    if (error) throw error
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, reminded: true } : a))
  }, [])

  return { appointments, loading, error, refetch: fetch, updateStatus, addAppointment, markReminded }
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalToday: 0, confirmed: 0, pending: 0, cancelled: 0, allTime: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const [todayRes, allRes] = await Promise.all([
        supabase.from('appointments').select('status').eq('date', today),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
      ])
      const todayData = todayRes.data || []
      setStats({
        totalToday: todayData.length,
        confirmed: todayData.filter(a => a.status === 'confirmed').length,
        pending: todayData.filter(a => a.status === 'pending').length,
        cancelled: todayData.filter(a => a.status === 'cancelled').length,
        allTime: allRes.count || 0,
      })
    } catch (e) {
      console.error('Stats fetch failed', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, 60_000)
    return () => clearInterval(id)
  }, [fetch])

  return { stats, loading, refetch: fetch }
}
