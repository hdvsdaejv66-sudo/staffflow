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

export async function updateAttendanceStatus(
  id: string,
  status: AttendanceRow['status']
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('attendances')
    .update({ status })
    .eq('id', id)
  if (error) { console.error('updateAttendanceStatus:', error.message); return false }
  return true
}
