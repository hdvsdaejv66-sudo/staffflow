'use client'

import { useState, useEffect } from 'react'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import { getSelections, type SelectionWithDetails } from '@/lib/api/selections'

type Stage = { key: string; label: string; color: string; headerColor: string }

const stages: Stage[] = [
  { key: 'proposed',  label: '提案',     color: 'bg-violet-50',  headerColor: 'bg-violet-500' },
  { key: 'document',  label: '書類選考', color: 'bg-amber-50',   headerColor: 'bg-amber-500' },
  { key: 'interview', label: '面接',     color: 'bg-orange-50',  headerColor: 'bg-orange-500' },
  { key: 'final',     label: '最終選考', color: 'bg-rose-50',    headerColor: 'bg-rose-500' },
  { key: 'offered',   label: '内定',     color: 'bg-emerald-50', headerColor: 'bg-emerald-500' },
]

function SelectionCard({ s }: { s: SelectionWithDetails }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer">
      <p className="font-semibold text-slate-800 text-sm mb-0.5">{s.candidates?.name ?? '—'}</p>
      <p className="text-xs text-slate-500 truncate mb-1.5">{s.jobs?.companies?.name ?? '—'}</p>
      <p className="text-xs text-[#185FA5] font-medium truncate">{s.jobs?.title ?? '—'}</p>
    </div>
  )
}

export default function SelectionsPage() {
  const [selections, setSelections] = useState<SelectionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getSelections().then((data) => {
      setSelections(data)
      setLoading(false)
    })
  }, [])

  const filtered = selections.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.candidates?.name.toLowerCase().includes(q) ||
      s.jobs?.companies?.name.toLowerCase().includes(q) ||
      s.jobs?.title.toLowerCase().includes(q)
    )
  })

  if (loading) return <LoadingSpinner label="選考データを読み込み中…" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="求職者・企業名で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5] w-64"
          />
          <span className="text-sm text-slate-500">合計 {filtered.length} 件</span>
        </div>
        <button className="bg-[#185FA5] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#145292] transition-colors">
          + 選考を追加
        </button>
      </div>

      {selections.length === 0 ? (
        <EmptyState message="選考データがありません" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 14rem)' }}>
          {stages.map((stage) => {
            const cards = filtered.filter((s) => s.stage === stage.key)
            return (
              <div
                key={stage.key}
                className={`flex-shrink-0 w-60 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col ${stage.color}`}
              >
                <div className={`${stage.headerColor} px-4 py-2.5 flex items-center justify-between`}>
                  <span className="text-white text-sm font-semibold">{stage.label}</span>
                  <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cards.length}</span>
                </div>
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                  {cards.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">案件なし</p>
                  ) : (
                    cards.map((s) => <SelectionCard key={s.id} s={s} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
