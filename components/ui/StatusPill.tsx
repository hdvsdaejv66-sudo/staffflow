type StatusPillProps = {
  status: string
  size?: 'sm' | 'md'
}

const statusMap: Record<string, { label: string; className: string }> = {
  // 求職者ステータス
  active:    { label: '求職中',   className: 'bg-blue-100 text-blue-700' },
  placed:    { label: '就業中',   className: 'bg-green-100 text-green-700' },
  inactive:  { label: '非稼働',   className: 'bg-slate-100 text-slate-500' },
  blacklist: { label: 'BL',       className: 'bg-red-100 text-red-600' },
  // 選考ステータス
  proposed:  { label: '提案',     className: 'bg-violet-100 text-violet-700' },
  document:  { label: '書類選考', className: 'bg-amber-100 text-amber-700' },
  interview: { label: '面接',     className: 'bg-orange-100 text-orange-700' },
  final:     { label: '最終選考', className: 'bg-rose-100 text-rose-700' },
  offered:   { label: '内定',     className: 'bg-emerald-100 text-emerald-700' },
  hired:     { label: '採用',     className: 'bg-green-100 text-green-700' },
  rejected:  { label: '不採用',   className: 'bg-slate-100 text-slate-500' },
  // 求人ステータス
  open:      { label: '募集中',   className: 'bg-blue-100 text-blue-700' },
  filled:    { label: '充足',     className: 'bg-green-100 text-green-700' },
  closed:    { label: '終了',     className: 'bg-slate-100 text-slate-500' },
  cancelled: { label: '中止',     className: 'bg-red-100 text-red-600' },
  // 勤怠ステータス
  draft:     { label: '下書き',   className: 'bg-slate-100 text-slate-500' },
  submitted: { label: '承認待ち', className: 'bg-amber-100 text-amber-700' },
  approved:  { label: '承認済み', className: 'bg-green-100 text-green-700' },
  pending:   { label: '保留',     className: 'bg-amber-100 text-amber-700' },
  // 契約種別
  dispatch:      { label: '派遣',   className: 'bg-indigo-100 text-indigo-700' },
  introduction:  { label: '紹介',   className: 'bg-teal-100 text-teal-700' },
  temp_to_perm:  { label: '紹介予定', className: 'bg-cyan-100 text-cyan-700' },
}

export default function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const config = statusMap[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  const sizeClass = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  )
}
