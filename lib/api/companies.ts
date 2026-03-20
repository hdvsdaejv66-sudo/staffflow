import { supabase } from '@/lib/supabase'

export type CompanyRow = {
  id: string
  name: string
  industry: string | null
  address: string | null
  assigned_user_id: string | null
  created_at: string
}

export type JobRow = {
  id: string
  company_id: string
  title: string
  employment_type: 'dispatch' | 'introduction' | 'temp_to_perm'
  salary_min: number | null
  salary_max: number | null
  status: 'open' | 'filled' | 'closed' | 'cancelled'
  headcount: number
  created_at: string
}

export type CompanyContactRow = {
  id: string
  company_id: string
  name: string
  role: string | null
  email: string | null
}

export async function getCompanies(): Promise<CompanyRow[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('getCompanies:', error.message); return [] }
  return (data ?? []) as CompanyRow[]
}

export async function getJobs(companyId?: string): Promise<JobRow[]> {
  let query = supabase.from('jobs').select('*').order('created_at', { ascending: false })
  if (companyId) query = query.eq('company_id', companyId)
  const { data, error } = await query
  if (error) { console.error('getJobs:', error.message); return [] }
  return (data ?? []) as JobRow[]
}

export async function getCompanyContacts(companyId: string): Promise<CompanyContactRow[]> {
  const { data, error } = await supabase
    .from('company_contacts')
    .select('*')
    .eq('company_id', companyId)
  if (error) { console.error('getCompanyContacts:', error.message); return [] }
  return (data ?? []) as CompanyContactRow[]
}
