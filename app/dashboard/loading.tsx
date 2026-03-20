import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse h-24" />
        ))}
      </div>
      <LoadingSpinner label="ダッシュボードを読み込み中…" />
    </div>
  )
}
