import { supabase } from '@/lib/supabase'

export type CompanyRow = { id: string; name: string; industry: string | null; address: string | null; assigned_user_id: string | null; created_at: string }
export type JobRow = { id: string; company_id: string; title: string; employment_type: 'dispatch' | 'introduction' | 'temp_to_perm'; salary_min: number | null; salary_max: number | null; status: 'open' | 'filled' | 'closed' | 'cancelled'; headcount: number; created_at: string }
export type CompanyContactRow = { id: string; company_id: string; name: string; role: string | null; email: string | null }

export async function getCompanies(): Promise<CompanyRow[]> {
  const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
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
  const { data, error } = await supabase.from('company_contacts').select('*').eq('company_id', companyId)
  if (error) { console.error('getCompanyContacts:', error.message); return [] }
  return (data ?? []) as CompanyContactRow[]
}

export type CompanyInput = Omit<CompanyRow, 'id' | 'created_at'>
export type JobInput = Omit<JobRow, 'id' | 'created_at'>
export type CompanyContactInput = Omit<CompanyContactRow, 'id'>

export async function createCompany(input: CompanyInput): Promise<CompanyRow | null> {
  const { data, error } = await (supabase as any).from('companies').insert([input]).select().single()
  if (error) { console.error('createCompany:', error.message); return null }
  return data as CompanyRow
}
export async function updateCompany(id: string, input: Partial<CompanyInput>): Promise<boolean> {
  const { error } = await (supabase as any).from('companies').update(input).eq('id', id)
  if (error) { console.error('updateCompany:', error.message); return false }
  return true
}
export async function deleteCompany(id: string): Promise<boolean> {
  const { error } = await (supabase as any).from('companies').delete().eq('id', id)
  if (error) { console.error('deleteCompany:', error.message); return false }
  return true
}
export async function createJob(input: JobInput): Promise<JobRow | null> {
  const { data, error } = await (supabase as any).from('jobs').insert([input]).select().single()
  if (error) { console.error('createJob:', error.message); return null }
  return data as JobRow
}
export async function updateJob(id: string, input: Partial<JobInput>): Promise<boolean> {
  const { error } = await (supabase as any).from('jobs').update(input).eq('id', id)
  if (error) { console.error('updateJob:', error.message); return false }
  return true
}
export async function deleteJob(id: string): Promise<boolean> {
  const { error } = await (supabase as any).from('jobs').delete().eq('id', id)
  if (error) { console.error('deleteJob:', error.message); return false }
  return true
}
export async function createContact(input: CompanyContactInput): Promise<CompanyContactRow | null> {
  const { data, error } = await (supabase as any).from('company_contacts').insert([input]).select().single()
  if (error) { console.error('createContact:', error.message); return null }
  return data as CompanyContactRow
}
export async function deleteContact(id: string): Promise<boolean> {
  const { error } = await (supabase as any).from('company_contacts').delete().eq('id', id)
  if (error) { console.error('deleteContact:', error.message); return false }
  return true
}
