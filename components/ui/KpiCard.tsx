type KpiCardProps = {
  label: string
  value: string | number
  unit?: string
  sub?: string
  icon?: string
  accent?: boolean
}

export default function KpiCard({ label, value, unit, sub, icon, accent }: KpiCardProps) {
  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col gap-2 ${
      accent ? 'border-[#185FA5]/30' : 'border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        {icon && (
          <span className="text-lg">{icon}</span>
        )}
      </div>
      <p className={`text-3xl font-bold ${accent ? 'text-[#185FA5]' : 'text-slate-800'}`}>
        {value}
        {unit && (
          <span className="text-base font-normal text-slate-500 ml-1">{unit}</span>
        )}
      </p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  )
}
