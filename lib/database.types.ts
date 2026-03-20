export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      /** ユーザー（システム利用者・スタッフ） */
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'staff' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'staff' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'staff' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }

      /** 求職者・派遣スタッフ候補 */
      candidates: {
        Row: {
          id: string
          full_name: string
          full_name_kana: string | null
          email: string | null
          phone: string | null
          birth_date: string | null
          gender: 'male' | 'female' | 'other' | null
          address: string | null
          status: 'active' | 'inactive' | 'placed' | 'blacklist'
          skills: string[] | null
          experience_years: number | null
          desired_salary: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          full_name_kana?: string | null
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: string | null
          status?: 'active' | 'inactive' | 'placed' | 'blacklist'
          skills?: string[] | null
          experience_years?: number | null
          desired_salary?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          full_name_kana?: string | null
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: string | null
          status?: 'active' | 'inactive' | 'placed' | 'blacklist'
          skills?: string[] | null
          experience_years?: number | null
          desired_salary?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      /** クライアント企業 */
      companies: {
        Row: {
          id: string
          name: string
          name_kana: string | null
          industry: string | null
          address: string | null
          phone: string | null
          website: string | null
          status: 'active' | 'inactive'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_kana?: string | null
          industry?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          status?: 'active' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_kana?: string | null
          industry?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          status?: 'active' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      /** 企業の担当者 */
      company_contacts: {
        Row: {
          id: string
          company_id: string
          full_name: string
          department: string | null
          position: string | null
          email: string | null
          phone: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          full_name: string
          department?: string | null
          position?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          full_name?: string
          department?: string | null
          position?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      /** 求人・案件 */
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          location: string | null
          employment_type: 'dispatch' | 'introduction' | 'temp_to_perm'
          salary_min: number | null
          salary_max: number | null
          required_skills: string[] | null
          headcount: number
          start_date: string | null
          end_date: string | null
          status: 'open' | 'closed' | 'filled' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          location?: string | null
          employment_type?: 'dispatch' | 'introduction' | 'temp_to_perm'
          salary_min?: number | null
          salary_max?: number | null
          required_skills?: string[] | null
          headcount?: number
          start_date?: string | null
          end_date?: string | null
          status?: 'open' | 'closed' | 'filled' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          location?: string | null
          employment_type?: 'dispatch' | 'introduction' | 'temp_to_perm'
          salary_min?: number | null
          salary_max?: number | null
          required_skills?: string[] | null
          headcount?: number
          start_date?: string | null
          end_date?: string | null
          status?: 'open' | 'closed' | 'filled' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }

      /** 選考プロセス */
      selections: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          stage: 'proposed' | 'document' | 'interview' | 'final' | 'offered' | 'hired' | 'rejected'
          scheduled_at: string | null
          result: 'pending' | 'pass' | 'fail' | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          stage?: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
          scheduled_at?: string | null
          result?: 'pending' | 'pass' | 'fail' | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          candidate_id?: string
          stage?: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
          scheduled_at?: string | null
          result?: 'pending' | 'pass' | 'fail' | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      /** 契約情報 */
      contracts: {
        Row: {
          id: string
          candidate_id: string
          company_id: string
          job_id: string | null
          contract_type: 'dispatch' | 'introduction' | 'temp_to_perm'
          start_date: string
          end_date: string | null
          hourly_rate: number | null
          monthly_salary: number | null
          billing_rate: number | null
          status: 'active' | 'ended' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          company_id: string
          job_id?: string | null
          contract_type: 'dispatch' | 'introduction' | 'temp_to_perm'
          start_date: string
          end_date?: string | null
          hourly_rate?: number | null
          monthly_salary?: number | null
          billing_rate?: number | null
          status?: 'active' | 'ended' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          company_id?: string
          job_id?: string | null
          contract_type?: 'dispatch' | 'introduction' | 'temp_to_perm'
          start_date?: string
          end_date?: string | null
          hourly_rate?: number | null
          monthly_salary?: number | null
          billing_rate?: number | null
          status?: 'active' | 'ended' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      /** 勤怠記録 */
      attendances: {
        Row: {
          id: string
          contract_id: string
          candidate_id: string
          work_date: string
          clock_in: string | null
          clock_out: string | null
          break_minutes: number
          work_minutes: number | null
          overtime_minutes: number
          status: 'draft' | 'submitted' | 'approved' | 'rejected'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          candidate_id: string
          work_date: string
          clock_in?: string | null
          clock_out?: string | null
          break_minutes?: number
          work_minutes?: number | null
          overtime_minutes?: number
          status?: 'draft' | 'submitted' | 'approved' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          candidate_id?: string
          work_date?: string
          clock_in?: string | null
          clock_out?: string | null
          break_minutes?: number
          work_minutes?: number | null
          overtime_minutes?: number
          status?: 'draft' | 'submitted' | 'approved' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      /** 活動ログ（営業・連絡履歴） */
      activity_logs: {
        Row: {
          id: string
          entity_type: 'candidate' | 'company' | 'job' | 'selection' | 'contract'
          entity_id: string
          action: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: 'candidate' | 'company' | 'job' | 'selection' | 'contract'
          entity_id: string
          action: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: 'candidate' | 'company' | 'job' | 'selection' | 'contract'
          entity_id?: string
          action?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// 便利な型エイリアス
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertDTO<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateDTO<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// よく使う個別型
export type User = Tables<'users'>
export type Candidate = Tables<'candidates'>
export type Company = Tables<'companies'>
export type CompanyContact = Tables<'company_contacts'>
export type Job = Tables<'jobs'>
export type Selection = Tables<'selections'>
export type Contract = Tables<'contracts'>
export type Attendance = Tables<'attendances'>
export type ActivityLog = Tables<'activity_logs'>
