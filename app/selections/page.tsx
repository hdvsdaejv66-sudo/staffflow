'use client'

import { useState, useEffect } from 'react'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import {
  getSelections, createSelection, updateSelection, deleteSelection,
  type SelectionWithDetails, type SelectionRow, type SelectionInput,
} from '@/lib/api/selections'
import { getCandidates, type CandidateRow } from '@/lib/api/candidates'
import { getJobs, type JobRow } from '@/lib/api/companies'

type Stage = { key: SelectionRow['stage']; label: string; color: string; headerColor: string }

const STAGES: Stage[] = [
  { key: 'proposed',  label: '提案',     color: 'bg-violet-50',  headerColor: 'bg-violet-500' },
  { key: 'document',  label: '書類選考', color: 'bg-amber-50',   headerColor: 'bg-amber-500' },
  { key: 'interview', label: '面接',     color: 'bg-orange-50',  headerColor: 'bg-orange-500' },
  { key: 'final',     label: '最終選考', color: 'bg-rose-50',    headerColor: 'bg-rose-500' },
  { key: 'offered',   label: '内定',     color: 'bg-emerald-50', headerColor: 'bg-emerald-500' },
]
const STAGE_KEYS = STAGES.map((s) => s.key)
const emptyForm = (): SelectionInput => ({ candidate_id: '', job_id: '', stage: 'proposed', result: 'pending', assigned_user_id: null })

function SelectionCard({ s, stageIndex, onEdit, onDelete, onMoveLeft, onMoveRight }: { s: SelectionWithDetails; stageIndex: number; onEdit: ()=>void; onDelete: ()=>void; onMoveLeft: ()=>void; onMoveRight: ()=>void }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 hover:shadow-md transition-shadow">
      <p className="font-semibold text-slate-800 text-sm mb-0.5">{s.candidates?.name ?? '—'}</p>
      <p className="text-xs text-slate-500 truncate mb-1">{s.jobs?.companies?.name ?? '—'}</p>
      <p className="text-xs text-[#185FA5] font-medium truncate mb-2.5">{s.jobs?.title ?? '—'}</p>
      <div className="flex items-center justify-between gap-1">
        <div className="flex gap-1">
          <button onClick={onMoveLeft} disabled={stageIndex===0} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">←</button>
          <button onClick={onMoveRight} disabled={stageIndex===STAGE_KEYS.length-1} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">→</button>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100">編集</button>
          <button onClick={onDelete} className="text-[10px] px-1.5 py-0.5 rounded border border-red-200 text-red-500 hover:bg-red-50">削除</button>
        </div>
      </div>
    </div>
  )
}

export default function SelectionsPage() {
  const { toast } = useToast()
  const [selections, setSelections] = useState<SelectionWithDetails[]>([])
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SelectionWithDetails | null>(null)
  const [form, setForm] = useState<SelectionInput>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SelectionWithDetails | null>(null)

  async function reload() { const data = await getSelections(); setSelections(data); return data }

  useEffect(() => {
    Promise.all([getSelections(), getCandidates(), getJobs()]).then(([sels, cands, js]) => {
      setSelections(sels); setCandidates(cands); setJobs(js); setLoading(false)
    })
  }, [])

  const filtered = selections.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.candidates?.name.toLowerCase().includes(q) || s.jobs?.companies?.name?.toLowerCase().includes(q) || s.jobs?.title.toLowerCase().includes(q)
  })

  function openCreate() { setEditTarget(null); setForm(emptyForm()); setModalOpen(true) }
  function openEdit(s: SelectionWithDetails) { setEditTarget(s); setForm({ candidate_id: s.candidate_id, job_id: s.job_id, stage: s.stage, result: s.result, assigned_user_id: s.assigned_user_id }); setModalOpen(true) }

  async function handleSave() {
    if (!form.candidate_id || !form.job_id) { toast('求職者と案件を選択してください', 'error'); return }
    setSaving(true)
    if (editTarget) { const ok = await updateSelection(editTarget.id, form); if (ok) { toast('選考を更新しました'); reload() } else toast('更新に失敗しました', 'error') }
    else { const created = await createSelection(form); if (created) { toast('選考を追加しました'); reload() } else toast('追加に失敗しました', 'error') }
    setSaving(false); setModalOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteSelection(deleteTarget.id)
    if (ok) { toast('選考を削除しました'); reload() } else toast('削除に失敗しました', 'error')
    setDeleteTarget(null)
  }

  async function moveStage(s: SelectionWithDetails, direction: 'left' | 'right') {
    const idx = STAGE_KEYS.indexOf(s.stage)
    const newStage = STAGE_KEYS[direction === 'left' ? idx-1 : idx+1]
    if (!newStage) return
    const ok = await updateSelection(s.id, { stage: newStage })
    if (ok) reload(); else toast('ステージ変更に失敗しました', 'error')
  }

  if (loading) return <LoadingSpinner label="選考データを読み込み中…" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <input type="text" placeholder="求職者・企業名で検索" value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5] w-64" />
          <span className="text-sm text-slate-500">合計 {filtered.length} 件</span>
        </div>
        <button onClick={openCreate} className="bg-[#185FA5] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#145292] transition-colors">＋ 選考を追加</button>
      </div>
      {selections.length === 0 ? <EmptyState message="選考データがありません" /> : (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 14rem)' }}>
          {STAGES.map((stage, stageIndex) => {
            const cards = filtered.filter((s) => s.stage === stage.key)
            return (
              <div key={stage.key} className={`flex-shrink-0 w-60 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col ${stage.color}`}>
                <div className={`${stage.headerColor} px-4 py-2.5 flex items-center justify-between`}>
                  <span className="text-white text-sm font-semibold">{stage.label}</span>
                  <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cards.length}</span>
                </div>
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                  {cards.length === 0 ? <p className="text-xs text-slate-400 text-center py-6">案件なし</p> : cards.map((s) => <SelectionCard key={s.id} s={s} stageIndex={stageIndex} onEdit={() => openEdit(s)} onDelete={() => setDeleteTarget(s)} onMoveLeft={() => moveStage(s, 'left')} onMoveRight={() => moveStage(s, 'right')} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? '選考を編集' : '選考を追加'}>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">求職者 *</label><select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"><option value="">選択してください</option>{candidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">案件 *</label><select value={form.job_id} onChange={(e) => setForm({ ...form, job_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"><option value="">選択してください</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">ステージ</label><select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as SelectionRow['stage'] })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]">{STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}<option value="hired">採用</option><option value="rejected">不採用</option></select></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">結果</label><select value={form.result ?? 'pending'} onChange={(e) => setForm({ ...form, result: e.target.value as SelectionRow['result'] })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"><option value="pending">選考中</option><option value="pass">通過</option><option value="fail">不合格</option></select></div>
          </div>
          <div className="flex gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">キャンセル</button><button onClick={handleSave} disabled={saving} className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-[#185FA5] text-white hover:bg-[#145292] disabled:opacity-50">{saving ? '保存中…' : editTarget ? '更新する' : '追加する'}</button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} message={`「${deleteTarget?.candidates?.name}」の選考を削除します。`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
