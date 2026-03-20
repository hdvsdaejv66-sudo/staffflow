import { supabase } from '@/lib/supabase'

export type ContractRow = {
  id: string
  candidate_id: string
  company_id: string
  job_id: string | null
  contract_type: 'dispatch' | 'introduction' | 'temp_to_perm'
  start_date: string
  end_date: string | null
  monthly_salary: number | null
  created_at: string
}

export type ContractWithDetails = ContractRow & {
  candidates: { name: string } | null
  companies: { name: string } | null
}

export function calcDaysLeft(endDate: string | null): number | null {
  if (!endDate) return null
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function isThreeYearRule(startDate: string): boolean {
  return Date.now() - new Date(startDate).getTime() >= 1095 * 24 * 60 * 60 * 1000
}

export async function getContracts(): Promise<ContractWithDetails[]> {
  const { data, error } = await supabase.from('contracts').select('*, candidates(name), companies(name)').order('created_at', { ascending: false })
  if (error) { console.error('getContracts:', error.message); return [] }
  return (data ?? []) as ContractWithDetails[]
}

export async function getExpiringContracts(): Promise<ContractWithDetails[]> {
  const today = new Date().toISOString().split('T')[0]
  const in7days = new Date(Date.now() + 7 * 86400_000).toISOString().split('T')[0]
  const { data, error } = await supabase.from('contracts').select('*, candidates(name), companies(name)').gte('end_date', today).lte('end_date', in7days)
  if (error) { console.error('getExpiringContracts:', error.message); return [] }
  return (data ?? []) as ContractWithDetails[]
}

export type ContractInput = Omit<ContractRow, 'id' | 'created_at'>

export async function createContract(input: ContractInput): Promise<ContractRow | null> {
  const { data, error } = await (supabase as any).from('contracts').insert([input]).select().single()
  if (error) { console.error('createContract:', error.message); return null }
  return data as ContractRow
}

export async function updateContract(id: string, input: Partial<ContractInput>): Promise<boolean> {
  const { error } = await (supabase as any).from('contracts').update(input).eq('id', id)
  if (error) { console.error('updateContract:', error.message); return false }
  return true
}

export async function deleteContract(id: string): Promise<boolean> {
  const { error } = await (supabase as any).from('contracts').delete().eq('id', id)
  if (error) { console.error('deleteContract:', error.message); return false }
  return true
}
