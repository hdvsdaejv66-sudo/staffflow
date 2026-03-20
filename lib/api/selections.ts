import { supabase } from '@/lib/supabase'

export type SelectionRow = {
  id: string
  candidate_id: string
  job_id: string
  stage: 'proposed' | 'document' | 'interview' | 'final' | 'offered' | 'hired' | 'rejected'
  result: 'pending' | 'pass' | 'fail' | null
  assigned_user_id: string | null
  updated_at: string
}

export type SelectionWithDetails = SelectionRow & {
  candidates: { name: string } | null
  jobs: {
    title: string
    companies: { name: string } | null
  } | null
}

export async function getSelections(): Promise<SelectionWithDetails[]> {
  const { data, error } = await supabase
    .from('selections')
    .select('*, candidates(name), jobs(title, companies(name))')
    .order('updated_at', { ascending: false })
  if (error) { console.error('getSelections:', error.message); return [] }
  return (data ?? []) as SelectionWithDetails[]
}

export async function getRecentSelections(limit = 5): Promise<SelectionWithDetails[]> {
  const { data, error } = await supabase
    .from('selections')
    .select('*, candidates(name), jobs(title, companies(name))')
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('getRecentSelections:', error.message); return [] }
  return (data ?? []) as SelectionWithDetails[]
}
