import { supabase } from '@/lib/supabase'

export type AttendanceRow = {
  id: string
  contract_id: string
  month: string
  scheduled_hours: number
  actual_hours: number
  overtime_hours: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
}

export type AttendanceWithDetails = AttendanceRow & {
  contracts: {
    candidate_id: string
    company_id: string
    candidates: { name: string } | null
    companies: { name: string } | null
  } | null
}

export async function getAttendances(month?: string): Promise<AttendanceWithDetails[]> {
  let query = supabase
    .from('attendances')
    .select('*, contracts(candidate_id, company_id, candidates(name), companies(name))')
    .order('month', { ascending: false })
  if (month) query = query.eq('month', month + '-01')
  const { data, error } = await query
  if (error) { console.error('getAttendances:', error.message); return [] }
  return (data ?? []) as AttendanceWithDetails[]
}

export async function updateAttendanceStatus(id: string, status: AttendanceRow['status']): Promise<boolean> {
  const { error } = await (supabase as any).from('attendances').update({ status }).eq('id', id)
  if (error) { console.error('updateAttendanceStatus:', error.message); return false }
  return true
}

export type AttendanceInput = Omit<AttendanceRow, 'id'>

export async function createAttendance(input: AttendanceInput): Promise<AttendanceRow | null> {
  const { data, error } = await (supabase as any).from('attendances').insert([input]).select().single()
  if (error) { console.error('createAttendance:', error.message); return null }
  return data as AttendanceRow
}

export async function updateAttendance(id: string, input: Partial<AttendanceInput>): Promise<boolean> {
  const { error } = await (supabase as any).from('attendances').update(input).eq('id', id)
  if (error) { console.error('updateAttendance:', error.message); return false }
  return true
}

export async function deleteAttendance(id: string): Promise<boolean> {
  const { error } = await (supabase as any).from('attendances').delete().eq('id', id)
  if (error) { console.error('deleteAttendance:', error.message); return false }
  return true
}
