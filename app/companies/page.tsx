'use client'

import { useState, useEffect } from 'react'
import StatusPill from '@/components/ui/StatusPill'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import {
  getCompanies, getJobs, getCompanyContacts,
  type CompanyRow, type JobRow, type CompanyContactRow,
} from '@/lib/api/companies'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [contacts, setContacts] = useState<CompanyContactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CompanyRow | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCompanies().then((data) => {
      setCompanies(data)
      if (data.length > 0) setSelected(data[0])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    getJobs(selected.id).then(setJobs)
    getCompanyContacts(selected.id).then(setContacts)
  }, [selected])

  const filtered = companies.filter(
    (c) => !search || c.name.includes(search) || c.industry?.includes(search)
  )

  if (loading) return <LoadingSpinner label="企業データを読み込み中…" />

  return (
    <div className="flex gap-5 h-[calc(100vh-8rem)]">
      {/* 左：企業一覧 */}
      <div className="w-[38%] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="企業名・業種で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
          />
          <p className="text-xs text-slate-400 mt-2">{filtered.length} 社</p>
        </div>
        {filtered.length === 0 ? (
          <EmptyState message="企業データがありません" />
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((c) => (
              <li
                key={c.id}
                onClick={() => setSelected(c)}
                className={`px-4 py-4 cursor-pointer transition-colors ${
                  selected?.id === c.id ? 'bg-[#185FA5]/5 border-r-2 border-[#185FA5]' : 'hover:bg-slate-50'
                }`}
              >
                <p className="font-semibold text-slate-800 text-sm leading-tight mb-1">{c.name}</p>
                <p className="text-xs text-slate-500">{c.industry ?? '—'}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{c.address ?? '—'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 右：企業詳細 */}
      {selected ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">{selected.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{selected.industry} · {selected.address ?? '—'}</p>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* 募集案件 */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                募集案件 <span className="text-slate-300 ml-1">({jobs.length}件)</span>
              </h3>
              {jobs.length === 0 ? (
                <p className="text-sm text-slate-400">募集中の案件はありません</p>
              ) : (
                <ul className="space-y-2">
                  {jobs.map((job) => (
                    <li key={job.id} className="border border-slate-200 rounded-lg px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-slate-800 text-sm">{job.title}</span>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <StatusPill status={job.employment_type} size="sm" />
                          <StatusPill status={job.status} size="sm" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {job.salary_min && job.salary_max
                          ? `¥${job.salary_min.toLocaleString()} 〜 ¥${job.salary_max.toLocaleString()}`
                          : '給与応相談'}
                        　募集 {job.headcount}名
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* 担当者 */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">担当者連絡先</h3>
              {contacts.length === 0 ? (
                <p className="text-sm text-slate-400">担当者情報がありません</p>
              ) : (
                <ul className="space-y-2">
                  {contacts.map((contact) => (
                    <li key={contact.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                      <div className="w-8 h-8 bg-[#185FA5]/10 rounded-full flex items-center justify-center text-[#185FA5] font-bold text-sm flex-shrink-0">
                        {contact.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{contact.name}</p>
                        <p className="text-xs text-slate-500">{contact.role ?? '—'} · {contact.email ?? '—'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
          <EmptyState message="企業を選択してください" />
        </div>
      )}
    </div>
  )
}
