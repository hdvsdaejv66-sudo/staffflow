export default function LoadingSpinner({ label = '読み込み中…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-4 border-[#185FA5] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
      <span className="text-4xl">📭</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}
