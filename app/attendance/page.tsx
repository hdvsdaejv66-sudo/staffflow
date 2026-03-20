'use client'

import { useState, useEffect, useCallback } from 'react'
import StatusPill from '@/components/ui/StatusPill'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import { getAttendances, updateAttendanceStatus, type AttendanceWithDetails } from '@/lib/api/attendances'

const statusFilters = [
  { value: '', label: 'すべて' },
  { value: 'draft',     label: '下書き' },
  { value: 'submitted', label: '承認待ち' },
  { value: 'approved',  label: '承認済み' },
  { value: 'rejected',  label: '要修正' },
]

const months = ['2026-03', '2026-02', '2026-01']

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<AttendanceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('2026-03')

  const load = useCallback((month: string) => {
    setLoading(true)
    getAttendances(month).then((data) => {
      setAttendances(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => { load(monthFilter) }, [monthFilter, load])

  const filtered = attendances.filter(
    (a) => !statusFilter || a.status === statusFilter
  )

  const pending   = filtered.filter((a) => a.status === 'submitted').length
  const approved  = filtered.filter((a) => a.status === 'approved').length
  const overtime45 = filtered.filter((a) => a.overtime_hours > 45).length

  async function handleStatus(id: string, status: 'approved' | 'rejected') {
    await updateAttendanceStatus(id, status)
    load(monthFilter)
  }

  return (
    <div className="space-y-5">
      {/* 月選択 */}
      <div className="flex gap-1.5">
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setMonthFilter(m)}
            className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${
              monthFilter === m
                ? 'bg-[#185FA5] text-white border-[#185FA5]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#185FA5]'
            }`}
          >
            {m.replace('-', '年')}月
          </button>
        ))}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">承認待ち</p>
          <p className="text-2xl font-bold text-amber-600">{pending}<span className="text-sm font-normal text-slate-500 ml-1">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">承認済み</p>
          <p className="text-2xl font-bold text-green-600">{approved}<span className="text-sm font-normal text-slate-500 ml-1">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">残業 45h 超え</p>
          <p className="text-2xl font-bold text-red-600">{overtime45}<span className="text-sm font-normal text-slate-500 ml-1">件</span></p>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === f.value
                  ? 'bg-[#185FA5] text-white border-[#185FA5]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#185FA5]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="勤怠データを読み込み中…" />
        ) : filtered.length === 0 ? (
          <EmptyState message="該当する勤怠データがありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium">スタッフ</th>
                  <th className="text-left px-4 py-3 font-medium">就業先</th>
                  <th className="text-right px-4 py-3 font-medium">所定</th>
                  <th className="text-right px-4 py-3 font-medium">実労</th>
                  <th className="text-right px-4 py-3 font-medium">残業</th>
                  <th className="text-left px-4 py-3 font-medium">ステータス</th>
                  <th className="text-left px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {a.contracts?.candidates?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">
                      {a.contracts?.companies?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{a.scheduled_hours}h</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{a.actual_hours}h</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${
                        a.overtime_hours > 45 ? 'text-red-600' :
                        a.overtime_hours > 0  ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {a.overtime_hours}h
                        {a.overtime_hours > 45 && (
                          <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">⚠</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={a.status} size="sm" /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {a.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleStatus(a.id, 'approved')}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                            >承認</button>
                            <button
                              onClick={() => handleStatus(a.id, 'rejected')}
                              className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                            >差戻</button>
                          </>
                        )}
                        <span className="text-xs text-slate-400 px-1">詳細</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
