'use client'

import { usePathname } from 'next/navigation'

const titleMap: Record<string, string> = {
  '/dashboard':  'ダッシュボード',
  '/candidates': '求職者管理',
  '/companies':  '企業・案件管理',
  '/selections': '選考管理',
  '/contracts':  '契約・就業管理',
  '/attendance': '勤怠・給与管理',
  '/reports':    'レポート・分析',
}

export default function TopBar() {
  const pathname = usePathname()
  const base = '/' + (pathname.split('/')[1] ?? '')
  const title = titleMap[base] ?? 'StaffFlow'

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="text-slate-400 hover:text-slate-600 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          🔔
        </button>
        <div className="w-7 h-7 bg-[#185FA5] rounded-full flex items-center justify-center text-white text-xs font-bold">
          山
        </div>
      </div>
    </header>
  )
}
