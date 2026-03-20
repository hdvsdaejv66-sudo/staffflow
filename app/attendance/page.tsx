'use client'

import { useState, useEffect, useCallback } from 'react'
import StatusPill from '@/components/ui/StatusPill'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import {
  getAttendances, updateAttendanceStatus, createAttendance, updateAttendance, deleteAttendance,
  type AttendanceWithDetails, type AttendanceRow, type AttendanceInput,
} from '@/lib/api/attendances'
import { supabase } from '@/lib/supabase'

const statusFilters = [
  { value: '', label: 'すべて' },
  { value: 'draft',     label: '下書き' },
  { value: 'submitted', label: '承認待ち' },
  { value: 'approved',  label: '承認済み' },
  { value: 'rejected',  label: '要修正' },
]

const months = ['2026-03', '2026-02', '2026-01']

type ContractOption = { id: string; label: string }

const emptyForm = (contractId = ''): AttendanceInput => ({
  contract_id: contractId,
  month: new Date().toISOString().split('T')[0].slice(0, 7) + '-01',
  scheduled_hours: 160,
  actual_hours: 160,
  overtime_hours: 0,
  status: 'draft',
})

export default function AttendancePage() {
  const { toast } = useToast()
  const [attendances, setAttendances] = useState<AttendanceWithDetails[]>([])
  const [contracts, setContracts] = useState<ContractOption[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('2026-03')

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AttendanceWithDetails | null>(null)
  const [form, setForm] = useState<AttendanceInput>(emptyForm())
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<AttendanceWithDetails | null>(null)

  const load = useCallback((month: string) => {
    setLoading(true)
    getAttendances(month).then((data) => {
      setAttendances(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => { load(monthFilter) }, [monthFilter, load])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('contracts')
      .select('id, candidates(name), companies(name)')
      .then(({ data }: { data: Array<{ id: string; candidates: { name: string } | null; companies: { name: string } | null }> }) => {
        if (data) {
          setContracts(data.map((c) => ({
            id: c.id,
            label: `${c.candidates?.name ?? '?'} → ${c.companies?.name ?? '?'}`,
          })))
        }
      })
  }, [])

  const filtered = attendances.filter(
    (a) => !statusFilter || a.status === statusFilter
  )

  const pending   = filtered.filter((a) => a.status === 'submitted').length
  const approved  = filtered.filter((a) => a.status === 'approved').length
  const overtime45 = filtered.filter((a) => a.overtime_hours > 45).length

  async function handleStatus(id: string, status: 'approved' | 'rejected') {
    await updateAttendanceStatus(id, status)
    load(monthFilter)
  }

  function openCreate() {
    setEditTarget(null); setForm(emptyForm()); setModalOpen(true)
  }

  function openEdit(a: AttendanceWithDetails) {
    setEditTarget(a)
    setForm({
      contract_id: a.contract_id,
      month: a.month,
      scheduled_hours: a.scheduled_hours,
      actual_hours: a.actual_hours,
      overtime_hours: a.overtime_hours,
      status: a.status,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.contract_id) { toast('契約を選択してください', 'error'); return }
    setSaving(true)
    if (editTarget) {
      const ok = await updateAttendance(editTarget.id, form)
      if (ok) { toast('勤怠を更新しました'); load(monthFilter) }
      else { toast('更新に失敗しました', 'error') }
    } else {
      const created = await createAttendance(form)
      if (created) { toast('勤怠を追加しました'); load(monthFilter) }
      else { toast('追加に失敗しました', 'error') }
    }
    setSaving(false); setModalOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteAttendance(deleteTarget.id)
    if (ok) { toast('勤怠を削除しました'); load(monthFilter) }
    else { toast('削除に失敗しました', 'error') }
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setMonthFilter(m)}
              className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${
                monthFilter === m
                  ? 'bg-[#185FA5] text-white border-[#185FA5]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#185FA5]'
              }`}
            >
              {m.replace('-', '年')}月
            </button>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="bg-[#185FA5] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-[#145292] transition-colors"
        >
          ＋ 勤怠追加
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">承認待ち</p>
          <p className="text-2xl font-bold text-amber-600">{pending}<span className="text-sm font-normal text-slate-500 ml-1">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">承認済み</p>
          <p className="text-2xl font-bold text-green-600">{approved}<span className="text-sm font-normal text-slate-500 ml-1">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">残業 45h 超え</p>
          <p className="text-2xl font-bold text-red-600">{overtime45}<span className="text-sm font-normal text-slate-500 ml-1">件</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === f.value
                  ? 'bg-[#185FA5] text-white border-[#185FA5]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#185FA5]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="勤怠データを読み込み中…" />
        ) : filtered.length === 0 ? (
          <EmptyState message="該当する勤怠データがありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium">スタッフ</th>
                  <th className="text-left px-4 py-3 font-medium">就業先</th>
                  <th className="text-right px-4 py-3 font-medium">所定</th>
                  <th className="text-right px-4 py-3 font-medium">実労</th>
                  <th className="text-right px-4 py-3 font-medium">残業</th>
                  <th className="text-left px-4 py-3 font-medium">ステータス</th>
                  <th className="text-left px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {a.contracts?.candidates?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">
                      {a.contracts?.companies?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{a.scheduled_hours}h</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{a.actual_hours}h</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${
                        a.overtime_hours > 45 ? 'text-red-600' :
                        a.overtime_hours > 0  ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {a.overtime_hours}h
                        {a.overtime_hours > 45 && (
                          <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">⚠</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={a.status} size="sm" /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {a.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleStatus(a.id, 'approved')}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                            >承認</button>
                            <button
                              onClick={() => handleStatus(a.id, 'rejected')}
                              className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                            >差戻</button>
                          </>
                        )}
                        <button
                          onClick={() => openEdit(a)}
                          className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
                          className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? '勤怠を編集' : '勤怠を追加'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">契約（スタッフ → 企業）*</label>
            <select value={form.contract_id}
              onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]">
              <option value="">選択してください</option>
              {contracts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">対象月</label>
            <input type="month" value={form.month.slice(0, 7)}
              onChange={(e) => setForm({ ...form, month: e.target.value + '-01' })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">所定時間</label>
              <input type="number" value={form.scheduled_hours}
                onChange={(e) => setForm({ ...form, scheduled_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">実労時間</label>
              <input type="number" value={form.actual_hours}
                onChange={(e) => setForm({ ...form, actual_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">残業時間</label>
              <input type="number" value={form.overtime_hours}
                onChange={(e) => setForm({ ...form, overtime_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ステータス</label>
            <select value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceRow['status'] })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]">
              <option value="draft">下書き</option>
              <option value="submitted">承認待ち</option>
              <option value="approved">承認済み</option>
              <option value="rejected">要修正</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              キャンセル
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-[#185FA5] text-white hover:bg-[#145292] transition-colors disabled:opacity-50">
              {saving ? '保存中…' : editTarget ? '更新する' : '追加する'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`${deleteTarget?.contracts?.candidates?.name ?? ''}の勤怠データを削除します。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
