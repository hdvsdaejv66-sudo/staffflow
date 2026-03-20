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

/** 残日数を計算（end_date がなければ null） */
export function calcDaysLeft(endDate: string | null): number | null {
  if (!endDate) return null
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/** 3年ルール到達判定（start_date から 1095 日以上） */
export function isThreeYearRule(startDate: string): boolean {
  const diff = Date.now() - new Date(startDate).getTime()
  return diff >= 1095 * 24 * 60 * 60 * 1000
}

export async function getContracts(): Promise<ContractWithDetails[]> {
  const { data, error } = await supabase
    .from('contracts')
    .select('*, candidates(name), companies(name)')
    .order('created_at', { ascending: false })
  if (error) { console.error('getContracts:', error.message); return [] }
  return (data ?? []) as ContractWithDetails[]
}

/** アラート対象（7日以内に期限切れ）を取得 */
export async function getExpiringContracts(): Promise<ContractWithDetails[]> {
  const today = new Date().toISOString().split('T')[0]
  const in7days = new Date(Date.now() + 7 * 86400_000).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('contracts')
    .select('*, candidates(name), companies(name)')
    .gte('end_date', today)
    .lte('end_date', in7days)
  if (error) { console.error('getExpiringContracts:', error.message); return [] }
  return (data ?? []) as ContractWithDetails[]
}
