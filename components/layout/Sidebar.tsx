'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard',   icon: '◼', label: 'ダッシュボード' },
  { href: '/candidates',  icon: '👤', label: '求職者管理' },
  { href: '/companies',   icon: '🏢', label: '企業・案件管理' },
  { href: '/selections',  icon: '🔄', label: '選考管理' },
  { href: '/contracts',   icon: '📝', label: '契約・就業管理' },
  { href: '/attendance',  icon: '🕐', label: '勤怠・給与管理' },
  { href: '/reports',     icon: '📊', label: 'レポート・分析' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0f1c2e] flex flex-col h-screen sticky top-0">
      {/* ロゴ */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#185FA5] rounded-lg flex items-center justify-center text-white font-bold text-xs">
            SF
          </div>
          <span className="text-white font-bold text-base tracking-wide">StaffFlow</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 pl-0.5">人材派遣・紹介管理</p>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#185FA5] text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* フッター */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            山
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white truncate">山田 太郎</p>
            <p className="text-[10px] text-slate-400">管理者</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
