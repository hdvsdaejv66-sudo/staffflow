'use client'

import { useState, useEffect } from 'react'
import KpiCard from '@/components/ui/KpiCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
} from 'recharts'

type StaffPerf = { name: string; placements: number; inProgress: number }
type FunnelItem = { name: string; value: number; fill: string }

const FUNNEL_COLORS: Record<string, string> = {
  proposed:  '#8B5CF6',
  document:  '#F59E0B',
  interview: '#F97316',
  final:     '#F43F5E',
  offered:   '#10B981',
  hired:     '#059669',
}
const STAGE_LABELS: Record<string, string> = {
  proposed: '提案', document: '書類', interview: '面接',
  final: '最終', offered: '内定', hired: '採用',
}

const formatYen = (v: number) => `¥${(v / 10000).toFixed(0)}万`

// 月次ダミーデータ（売上は契約数×平均単価の概算）
const monthlyRevenue = [
  { month: '10月', revenue: 1800000 },
  { month: '11月', revenue: 2100000 },
  { month: '12月', revenue: 1900000 },
  { month: '1月',  revenue: 2400000 },
  { month: '2月',  revenue: 2200000 },
  { month: '3月',  revenue: 2570000 },
]

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [placedCount, setPlacedCount] = useState(0)
  const [hiredCount, setHiredCount] = useState(0)
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([])
  const [staffPerf, setStaffPerf] = useState<StaffPerf[]>([])

  useEffect(() => {
    async function load() {
      // 稼働中スタッフ数
      const { count: placed } = await supabase
        .from('candidates').select('*', { count: 'exact', head: true }).eq('status', 'placed')
      setPlacedCount(placed ?? 0)

      // 今月成約
      const firstOfMonth = new Date(); firstOfMonth.setDate(1); firstOfMonth.setHours(0,0,0,0)
      const { count: hired } = await supabase
        .from('selections').select('*', { count: 'exact', head: true })
        .eq('stage', 'hired').gte('updated_at', firstOfMonth.toISOString())
      setHiredCount(hired ?? 0)

      // ファネル（ステージ別件数）
      const { data: sels } = await supabase.from('selections').select('stage')
      if (sels) {
        const counts: Record<string, number> = {}
        sels.forEach((s: { stage: string }) => { counts[s.stage] = (counts[s.stage] ?? 0) + 1 })
        const stages = ['proposed','document','interview','final','offered','hired']
        setFunnelData(stages
          .filter((st) => counts[st])
          .map((st) => ({ name: STAGE_LABELS[st] ?? st, value: counts[st], fill: FUNNEL_COLORS[st] ?? '#94A3B8' }))
        )
      }

      // 担当者別実績
      const { data: selUsers } = await supabase
        .from('selections')
        .select('stage, assigned_user_id, users:assigned_user_id(name)')
      const { data: userList } = await supabase.from('users').select('id, name')

      if (selUsers && userList) {
        const perf: Record<string, StaffPerf> = {}
        userList.forEach((u: { id: string; name: string }) => {
          perf[u.id] = { name: u.name, placements: 0, inProgress: 0 }
        })
        selUsers.forEach((s: { stage: string; assigned_user_id: string | null }) => {
          if (!s.assigned_user_id || !perf[s.assigned_user_id]) return
          if (s.stage === 'hired') perf[s.assigned_user_id].placements++
          else if (s.stage !== 'rejected') perf[s.assigned_user_id].inProgress++
        })
        setStaffPerf(Object.values(perf).filter((p) => p.placements + p.inProgress > 0))
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner label="レポートを集計中…" />

  const activeRate = placedCount > 0 ? Math.round((placedCount / (placedCount + 3)) * 100) : 0

  return (
    <div className="space-y-6 max-w-6xl">
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="今月売上（概算）" value="¥2.6M" icon="💴" accent />
        <KpiCard label="今月成約数"       value={hiredCount} unit="件" icon="✅" />
        <KpiCard label="稼働率（概算）"   value={activeRate} unit="%" icon="📈" />
        <KpiCard label="稼働中スタッフ"   value={placedCount} unit="名" icon="👤" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 月次売上グラフ */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">月次売上推移（概算）</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatYen} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#185FA5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 選考ファネル */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">選考ファネル（累計）</h2>
          {funnelData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">データがありません</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <FunnelChart>
                <Tooltip formatter={(v: number) => `${v}件`} />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  {funnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  <LabelList position="right" fill="#475569" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 担当者別実績 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">担当者別実績（今月）</h2>
        </div>
        {staffPerf.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">データがありません</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left px-5 py-3 font-medium">担当者</th>
                <th className="text-right px-5 py-3 font-medium">今月成約</th>
                <th className="text-right px-5 py-3 font-medium">進行中</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffPerf.map((s) => (
                <tr key={s.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-5 py-3 text-right font-semibold text-[#185FA5]">{s.placements}件</td>
                  <td className="px-5 py-3 text-right text-slate-600">{s.inProgress}件</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
