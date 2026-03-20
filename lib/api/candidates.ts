import { supabase } from '@/lib/supabase'

export type CandidateRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: 'active' | 'placed' | 'inactive' | 'blacklist'
  skills: string[] | null
  desired_salary: number | null
  location: string | null
  assigned_user_id: string | null
  created_at: string
}

export async function getCandidates(): Promise<CandidateRow[]> {
  const { data, error } = await supabase.from('candidates').select('*').order('created_at', { ascending: false })
  if (error) { console.error('getCandidates:', error.message); return [] }
  return (data ?? []) as CandidateRow[]
}

export async function getCandidateById(id: string): Promise<CandidateRow | null> {
  const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single()
  if (error) { console.error('getCandidateById:', error.message); return null }
  return data as CandidateRow
}

export type CandidateInput = Omit<CandidateRow, 'id' | 'created_at'>

export async function createCandidate(input: CandidateInput): Promise<CandidateRow | null> {
  const { data, error } = await (supabase as any).from('candidates').insert([input]).select().single()
  if (error) { console.error('createCandidate:', error.message); return null }
  return data as CandidateRow
}

export async function updateCandidate(id: string, input: Partial<CandidateInput>): Promise<boolean> {
  const { error } = await (supabase as any).from('candidates').update(input).eq('id', id)
  if (error) { console.error('updateCandidate:', error.message); return false }
  return true
}

export async function deleteCandidate(id: string): Promise<boolean> {
  const { error } = await (supabase as any).from('candidates').delete().eq('id', id)
  if (error) { console.error('deleteCandidate:', error.message); return false }
  return true
}
