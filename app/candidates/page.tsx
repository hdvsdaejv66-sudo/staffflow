'use client'

import { useState, useEffect } from 'react'
import StatusPill from '@/components/ui/StatusPill'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import { getCandidates, type CandidateRow } from '@/lib/api/candidates'

const statusFilters = [
  { value: '', label: 'すべて' },
  { value: 'active',   label: '求職中' },
  { value: 'placed',   label: '就業中' },
  { value: 'inactive', label: '非稼働' },
]

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<CandidateRow | null>(null)

  useEffect(() => {
    getCandidates().then((data) => {
      setCandidates(data)
      if (data.length > 0) setSelected(data[0])
      setLoading(false)
    })
  }, [])

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(q) ||
      c.skills?.some((s) => s.toLowerCase().includes(q)) ||
      c.location?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <LoadingSpinner label="求職者データを読み込み中…" />

  return (
    <div className="flex gap-5 h-[calc(100vh-8rem)]">
      {/* 左：一覧 */}
      <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-2.5">
          <input
            type="text"
            placeholder="名前・スキル・エリアで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
          />
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  statusFilter === f.value
                    ? 'bg-[#185FA5] text-white border-[#185FA5]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#185FA5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">{filtered.length} 件</p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="該当する求職者がいません" />
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((c) => (
              <li
                key={c.id}
                onClick={() => setSelected(c)}
                className={`px-4 py-3.5 cursor-pointer transition-colors ${
                  selected?.id === c.id ? 'bg-[#185FA5]/5 border-r-2 border-[#185FA5]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800 text-sm">{c.name}</span>
                  <StatusPill status={c.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 truncate">{c.skills?.slice(0, 3).join(' · ')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.location ?? '—'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 右：詳細 */}
      {selected ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selected.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{selected.location ?? '—'}</p>
            </div>
            <StatusPill status={selected.status} />
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* 基本情報 */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">基本情報</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'メール',  value: selected.email },
                  { label: '電話',    value: selected.phone },
                  { label: 'エリア',  value: selected.location },
                  { label: '希望月給', value: selected.desired_salary ? `¥${selected.desired_salary.toLocaleString()}` : null },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-slate-400 mb-0.5">{item.label}</p>
                    <p className="text-sm text-slate-800 font-medium">{item.value ?? '—'}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* スキル */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">スキル</h3>
              {selected.skills && selected.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((skill) => (
                    <span key={skill} className="bg-[#185FA5]/10 text-[#185FA5] text-xs font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">スキル情報がありません</p>
              )}
            </section>

            {/* 登録日 */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">登録情報</h3>
              <p className="text-sm text-slate-600">
                登録日: {new Date(selected.created_at).toLocaleDateString('ja-JP')}
              </p>
            </section>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
          <EmptyState message="求職者を選択してください" />
        </div>
      )}
    </div>
  )
}
