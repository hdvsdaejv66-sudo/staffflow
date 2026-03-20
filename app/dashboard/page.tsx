import KpiCard from '@/components/ui/KpiCard'
import StatusPill from '@/components/ui/StatusPill'
import { EmptyState } from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { getExpiringContracts, isThreeYearRule } from '@/lib/api/contracts'
import { getRecentSelections } from '@/lib/api/selections'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // 稼働中スタッフ数
  const { count: placedCount } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'placed')

  // 進行中選考数
  const { count: activeSelectionCount } = await supabase
    .from('selections')
    .select('*', { count: 'exact', head: true })
    .not('stage', 'in', '("hired","rejected")')

  // 今月成約数
  const firstOfMonth = new Date()
  firstOfMonth.setDate(1)
  firstOfMonth.setHours(0, 0, 0, 0)
  const { count: hiredCount } = await supabase
    .from('selections')
    .select('*', { count: 'exact', head: true })
    .eq('stage', 'hired')
    .gte('updated_at', firstOfMonth.toISOString())

  // アラート：7日以内期限切れ契約
  const expiringContracts = await getExpiringContracts()

  // アラート：3年ルール到達
  const { data: allContracts } = await supabase
    .from('contracts')
    .select('id, start_date, end_date, candidates(name), companies(name)')
  const rule3yContracts = (allContracts ?? []).filter((c: { start_date: string }) =>
    isThreeYearRule(c.start_date)
  )

  // 最近の選考
  const recentSelections = await getRecentSelections(6)

  type ContractAlert = {
    id: string
    start_date: string
    end_date: string | null
    candidates: { name: string } | null
    companies: { name: string } | null
  }

  const alerts: { label: string; name: string; detail: string; color: string }[] = [
    ...expiringContracts.map((c) => ({
      label: '期限 7日以内',
      name: (c.candidates?.name ?? '—'),
      detail: `${c.companies?.name ?? '—'} — ${c.end_date} 終了`,
      color: 'border-l-red-500 bg-red-50',
    })),
    ...(rule3yContracts as ContractAlert[]).map((c) => ({
      label: '3年ルール到達',
      name: (c.candidates?.name ?? '—'),
      detail: `${c.companies?.name ?? '—'} — 開始: ${c.start_date}`,
      color: 'border-l-amber-500 bg-amber-50',
    })),
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="稼働中スタッフ"  value={placedCount ?? 0}        unit="名" icon="👤" accent />
        <KpiCard label="今月成約数"       value={hiredCount ?? 0}          unit="件" icon="✅" />
        <KpiCard label="進行中選考"       value={activeSelectionCount ?? 0} unit="件" icon="🔄" />
        <KpiCard label="要対応アラート"   value={alerts.length}             unit="件" icon="⚠️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* アラート */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">⚠ 要対応アラート</h2>
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {alerts.length}件
            </span>
          </div>
          {alerts.length === 0 ? (
            <EmptyState message="現在アラートはありません" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {alerts.map((a, i) => (
                <li key={i} className={`flex items-start gap-3 px-5 py-3.5 border-l-4 ${a.color}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-700">{a.name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        a.label.includes('期限') ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                      }`}>{a.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 最近の選考 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">📋 最近の選考状況</h2>
          </div>
          {recentSelections.length === 0 ? (
            <EmptyState message="選考データがありません" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500">
                    <th className="text-left px-4 py-2 font-medium">求職者</th>
                    <th className="text-left px-4 py-2 font-medium">企業</th>
                    <th className="text-left px-4 py-2 font-medium">ステージ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSelections.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {s.candidates?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[140px]">
                        {s.jobs?.companies?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3"><StatusPill status={s.stage} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
