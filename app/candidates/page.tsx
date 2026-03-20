'use client'

import { useState, useEffect } from 'react'
import StatusPill from '@/components/ui/StatusPill'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import {
  getCandidates, createCandidate, updateCandidate, deleteCandidate,
  type CandidateRow, type CandidateInput,
} from '@/lib/api/candidates'

const statusFilters = [
  { value: '', label: 'すべて' },
  { value: 'active',   label: '求職中' },
  { value: 'placed',   label: '就業中' },
  { value: 'inactive', label: '非稼働' },
]

const STATUSES: CandidateRow['status'][] = ['active', 'placed', 'inactive', 'blacklist']

const emptyForm = (): CandidateInput => ({
  name: '', email: null, phone: null, status: 'active',
  skills: null, desired_salary: null, location: null, assigned_user_id: null,
})

export default function CandidatesPage() {
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<CandidateRow | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CandidateRow | null>(null)
  const [form, setForm] = useState<CandidateInput>(emptyForm())
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<CandidateRow | null>(null)

  async function reload() {
    const data = await getCandidates()
    setCandidates(data)
    return data
  }

  useEffect(() => {
    getCandidates().then((data) => {
      setCandidates(data)
      if (data.length > 0) setSelected(data[0])
      setLoading(false)
    })
  }, [])

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(q) ||
      c.skills?.some((s) => s.toLowerCase().includes(q)) ||
      c.location?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchStatus
  })

  function openCreate() {
    setEditTarget(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(c: CandidateRow) {
    setEditTarget(c)
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      skills: c.skills,
      desired_salary: c.desired_salary,
      location: c.location,
      assigned_user_id: c.assigned_user_id,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast('氏名を入力してください', 'error'); return }
    setSaving(true)
    if (editTarget) {
      const ok = await updateCandidate(editTarget.id, form)
      if (ok) {
        toast('求職者情報を更新しました')
        const data = await reload()
        setSelected(data.find((c) => c.id === editTarget.id) ?? null)
      } else {
        toast('更新に失敗しました', 'error')
      }
    } else {
      const created = await createCandidate(form)
      if (created) {
        toast('求職者を追加しました')
        const data = await reload()
        setSelected(data.find((c) => c.id === created.id) ?? null)
      } else {
        toast('追加に失敗しました', 'error')
      }
    }
    setSaving(false)
    setModalOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteCandidate(deleteTarget.id)
    if (ok) {
      toast('求職者を削除しました')
      const data = await reload()
      setSelected(data.length > 0 ? data[0] : null)
    } else {
      toast('削除に失敗しました', 'error')
    }
    setDeleteTarget(null)
  }

  if (loading) return <LoadingSpinner label="求職者データを読み込み中…" />

  return (
    <div className="flex gap-5 h-[calc(100vh-8rem)]">
      <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="名前・スキル・エリアで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
            />
            <button
              onClick={openCreate}
              className="bg-[#185FA5] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#145292] transition-colors font-medium flex-shrink-0"
            >
              ＋
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  statusFilter === f.value
                    ? 'bg-[#185FA5] text-white border-[#185FA5]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#185FA5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">{filtered.length} 件</p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="該当する求職者がいません" />
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((c) => (
              <li
                key={c.id}
                onClick={() => setSelected(c)}
                className={`px-4 py-3.5 cursor-pointer transition-colors ${
                  selected?.id === c.id ? 'bg-[#185FA5]/5 border-r-2 border-[#185FA5]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800 text-sm">{c.name}</span>
                  <StatusPill status={c.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 truncate">{c.skills?.slice(0, 3).join(' · ')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.location ?? '—'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selected.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{selected.location ?? '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={selected.status} />
              <button
                onClick={() => openEdit(selected)}
                className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                編集
              </button>
              <button
                onClick={() => setDeleteTarget(selected)}
                className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
              >
                削除
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">基本情報</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'メール',  value: selected.email },
                  { label: '電話',    value: selected.phone },
                  { label: 'エリア',  value: selected.location },
                  { label: '希望月給', value: selected.desired_salary ? `¥${selected.desired_salary.toLocaleString()}` : null },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-slate-400 mb-0.5">{item.label}</p>
                    <p className="text-sm text-slate-800 font-medium">{item.value ?? '—'}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">スキル</h3>
              {selected.skills && selected.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((skill) => (
                    <span key={skill} className="bg-[#185FA5]/10 text-[#185FA5] text-xs font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">スキル情報がありません</p>
              )}
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">登録情報</h3>
              <p className="text-sm text-slate-600">
                登録日: {new Date(selected.created_at).toLocaleDateString('ja-JP')}
              </p>
            </section>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
          <EmptyState message="求職者を選択してください" />
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? '求職者を編集' : '求職者を追加'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">氏名 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">メール</label>
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value || null })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">電話</label>
              <input
                type="tel"
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ステータス</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CandidateRow['status'] })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">エリア</label>
              <input
                type="text"
                value={form.location ?? ''}
                onChange={(e) => setForm({ ...form, location: e.target.value || null })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">希望月給（円）</label>
            <input
              type="number"
              value={form.desired_salary ?? ''}
              onChange={(e) => setForm({ ...form, desired_salary: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">スキル（カンマ区切り）</label>
            <input
              type="text"
              value={form.skills?.join(', ') ?? ''}
              onChange={(e) => {
                const val = e.target.value
                setForm({ ...form, skills: val ? val.split(',').map((s) => s.trim()).filter(Boolean) : null })
              }}
              placeholder="例: Java, SQL, Excel"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-[#185FA5] text-white hover:bg-[#145292] transition-colors disabled:opacity-50"
            >
              {saving ? '保存中…' : editTarget ? '更新する' : '追加する'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`「${deleteTarget?.name}」を削除します。この操作は元に戻せません。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
