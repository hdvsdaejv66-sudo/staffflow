'use client'

import { useState, useEffect } from 'react'
import StatusPill from '@/components/ui/StatusPill'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import {
  getContracts, createContract, updateContract, deleteContract,
  calcDaysLeft, isThreeYearRule,
  type ContractWithDetails, type ContractRow, type ContractInput,
} from '@/lib/api/contracts'
import { getCandidates, type CandidateRow } from '@/lib/api/candidates'
import { getCompanies, getJobs, type CompanyRow, type JobRow } from '@/lib/api/companies'

function DaysLeftBadge({ daysLeft }: { daysLeft: number | null }) {
  if (daysLeft === null) return <span className="text-xs text-slate-400">無期限</span>
  if (daysLeft < 0) return <span className="text-xs text-slate-400">終了済み</span>
  if (daysLeft <= 7) return <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">残 {daysLeft}日</span>
  if (daysLeft <= 30) return <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">残 {daysLeft}日</span>
  return <span className="text-xs text-slate-500">残 {daysLeft}日</span>
}

const emptyForm = (): ContractInput => ({ candidate_id: '', company_id: '', job_id: null, contract_type: 'dispatch', start_date: '', end_date: null, monthly_salary: null })

export default function ContractsPage() {
  const { toast } = useToast()
  const [contracts, setContracts] = useState<ContractWithDetails[]>([])
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ContractWithDetails | null>(null)
  const [form, setForm] = useState<ContractInput>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ContractWithDetails | null>(null)

  async function reload() { const data = await getContracts(); setContracts(data); return data }

  useEffect(() => {
    Promise.all([getContracts(), getCandidates(), getCompanies(), getJobs()]).then(([c, cands, comps, js]) => {
      setContracts(c); setCandidates(cands); setCompanies(comps); setJobs(js); setLoading(false)
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const active = contracts.filter((c) => !c.end_date || c.end_date >= today)
  const expiring = active.filter((c) => { const d = calcDaysLeft(c.end_date); return d !== null && d <= 7 })
  const rule3y = contracts.filter((c) => isThreeYearRule(c.start_date))

  function openCreate() { setEditTarget(null); setForm(emptyForm()); setModalOpen(true) }
  function openEdit(c: ContractWithDetails) {
    setEditTarget(c)
    setForm({ candidate_id: c.candidate_id, company_id: c.company_id, job_id: c.job_id, contract_type: c.contract_type, start_date: c.start_date, end_date: c.end_date, monthly_salary: c.monthly_salary })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.candidate_id || !form.company_id || !form.start_date) { toast('求職者・企業・開始日は必須です', 'error'); return }
    setSaving(true)
    if (editTarget) { const ok = await updateContract(editTarget.id, form); if (ok) { toast('契約を更新しました'); reload() } else toast('更新に失敗しました', 'error') }
    else { const created = await createContract(form); if (created) { toast('契約を追加しました'); reload() } else toast('追加に失敗しました', 'error') }
    setSaving(false); setModalOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteContract(deleteTarget.id)
    if (ok) { toast('契約を削除しました'); reload() } else toast('削除に失敗しました', 'error')
    setDeleteTarget(null)
  }

  if (loading) return <LoadingSpinner label="契約データを読み込み中…" />

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-xs text-slate-500 mb-1">稼働中契約</p><p className="text-2xl font-bold text-slate-800">{active.length} <span className="text-sm font-normal text-slate-500">件</span></p></div>
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm"><p className="text-xs text-slate-500 mb-1">期限 7日以内</p><p className="text-2xl font-bold text-red-600">{expiring.length} <span className="text-sm font-normal text-slate-500">件</span></p></div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm"><p className="text-xs text-slate-500 mb-1">3年ルール到達</p><p className="text-2xl font-bold text-amber-600">{rule3y.length} <span className="text-sm font-normal text-slate-500">件</span></p></div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">契約一覧</h2>
          <button onClick={openCreate} className="bg-[#185FA5] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-[#145292] transition-colors">＋ 契約追加</button>
        </div>
        {contracts.length === 0 ? <EmptyState message="契約データがありません" /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-medium">求職者</th><th className="text-left px-4 py-3 font-medium">企業</th>
              <th className="text-left px-4 py-3 font-medium">種別</th><th className="text-left px-4 py-3 font-medium">開始日</th>
              <th className="text-left px-4 py-3 font-medium">終了日</th><th className="text-right px-4 py-3 font-medium">月給</th>
              <th className="text-left px-4 py-3 font-medium">残日数</th><th className="text-left px-4 py-3 font-medium">操作</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => { const daysLeft = calcDaysLeft(c.end_date); const rule3yFlag = isThreeYearRule(c.start_date); return (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3"><span className="font-medium text-slate-800">{c.candidates?.name ?? '—'}</span>{rule3yFlag && <span className="ml-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">3年</span>}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">{c.companies?.name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusPill status={c.contract_type} size="sm" /></td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{c.start_date}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{c.end_date ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">{c.monthly_salary ? `¥${c.monthly_salary.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3"><DaysLeftBadge daysLeft={daysLeft} /></td>
                  <td className="px-4 py-3"><div className="flex gap-1.5"><button onClick={() => openEdit(c)} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200">編集</button><button onClick={() => setDeleteTarget(c)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">削除</button></div></td>
                </tr>)})}
            </tbody>
          </table></div>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? '契約を編集' : '契約を追加'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">求職者 *</label><select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"><option value="">選択してください</option>{candidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">企業 *</label><select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"><option value="">選択してください</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">案件（任意）</label><select value={form.job_id ?? ''} onChange={(e) => setForm({ ...form, job_id: e.target.value || null })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"><option value="">なし</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">契約種別</label><select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value as ContractRow['contract_type'] })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"><option value="dispatch">派遣</option><option value="introduction">紹介</option><option value="temp_to_perm">紹介予定</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">開始日 *</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">終了日</label><input type="date" value={form.end_date ?? ''} onChange={(e) => setForm({ ...form, end_date: e.target.value || null })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" /></div>
          </div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">月給（円）</label><input type="number" value={form.monthly_salary ?? ''} onChange={(e) => setForm({ ...form, monthly_salary: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" /></div>
          <div className="flex gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">キャンセル</button><button onClick={handleSave} disabled={saving} className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-[#185FA5] text-white hover:bg-[#145292] disabled:opacity-50">{saving ? '保存中…' : editTarget ? '更新する' : '追加する'}</button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} message={`${deleteTarget?.candidates?.name ?? ''}の契約を削除します。この操作は元に戻せません。`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
