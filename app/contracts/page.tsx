import StatusPill from '@/components/ui/StatusPill'
import { EmptyState } from '@/components/ui/LoadingSpinner'
import { getContracts, calcDaysLeft, isThreeYearRule } from '@/lib/api/contracts'

export const dynamic = 'force-dynamic'

function DaysLeftBadge({ daysLeft }: { daysLeft: number | null }) {
  if (daysLeft === null) return <span className="text-xs text-slate-400">無期限</span>
  if (daysLeft < 0)    return <span className="text-xs text-slate-400">終了済み</span>
  if (daysLeft <= 7)   return <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">残 {daysLeft}日</span>
  if (daysLeft <= 30)  return <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">残 {daysLeft}日</span>
  return <span className="text-xs text-slate-500">残 {daysLeft}日</span>
}

export default async function ContractsPage() {
  const contracts = await getContracts()

  const today = new Date().toISOString().split('T')[0]
  const active  = contracts.filter((c) => !c.end_date || c.end_date >= today)
  const expiring = active.filter((c) => {
    const d = calcDaysLeft(c.end_date)
    return d !== null && d <= 7
  })
  const rule3y = contracts.filter((c) => isThreeYearRule(c.start_date))

  return (
    <div className="space-y-5">
      {/* 概要 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">稼働中契約</p>
          <p className="text-2xl font-bold text-slate-800">{active.length} <span className="text-sm font-normal text-slate-500">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">期限 7日以内</p>
          <p className="text-2xl font-bold text-red-600">{expiring.length} <span className="text-sm font-normal text-slate-500">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">3年ルール到達</p>
          <p className="text-2xl font-bold text-amber-600">{rule3y.length} <span className="text-sm font-normal text-slate-500">件</span></p>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">契約一覧</h2>
          <button className="bg-[#185FA5] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-[#145292] transition-colors">
            + 契約追加
          </button>
        </div>

        {contracts.length === 0 ? (
          <EmptyState message="契約データがありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium">求職者</th>
                  <th className="text-left px-4 py-3 font-medium">企業</th>
                  <th className="text-left px-4 py-3 font-medium">種別</th>
                  <th className="text-left px-4 py-3 font-medium">開始日</th>
                  <th className="text-left px-4 py-3 font-medium">終了日</th>
                  <th className="text-right px-4 py-3 font-medium">月給</th>
                  <th className="text-left px-4 py-3 font-medium">残日数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => {
                  const daysLeft = calcDaysLeft(c.end_date)
                  const rule3yFlag = isThreeYearRule(c.start_date)
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{c.candidates?.name ?? '—'}</span>
                        {rule3yFlag && (
                          <span className="ml-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">3年</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">{c.companies?.name ?? '—'}</td>
                      <td className="px-4 py-3"><StatusPill status={c.contract_type} size="sm" /></td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{c.start_date}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{c.end_date ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {c.monthly_salary ? `¥${c.monthly_salary.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3"><DaysLeftBadge daysLeft={daysLeft} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
