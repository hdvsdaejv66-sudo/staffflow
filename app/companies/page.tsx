'use client'

import { useState, useEffect } from 'react'
import StatusPill from '@/components/ui/StatusPill'
import LoadingSpinner, { EmptyState } from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import {
  getCompanies, getJobs, getCompanyContacts,
  createCompany, updateCompany, deleteCompany,
  createJob, updateJob, deleteJob,
  createContact, deleteContact,
  type CompanyRow, type JobRow, type CompanyContactRow,
  type CompanyInput, type JobInput, type CompanyContactInput,
} from '@/lib/api/companies'

const emptyCompanyForm = (): CompanyInput => ({
  name: '', industry: null, address: null, assigned_user_id: null,
})

const emptyJobForm = (companyId: string): JobInput => ({
  company_id: companyId, title: '', employment_type: 'dispatch',
  salary_min: null, salary_max: null, status: 'open', headcount: 1,
})

const emptyContactForm = (companyId: string): CompanyContactInput => ({
  company_id: companyId, name: '', role: null, email: null,
})

export default function CompaniesPage() {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [contacts, setContacts] = useState<CompanyContactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CompanyRow | null>(null)
  const [search, setSearch] = useState('')

  const [companyModal, setCompanyModal] = useState(false)
  const [editCompany, setEditCompany] = useState<CompanyRow | null>(null)
  const [companyForm, setCompanyForm] = useState<CompanyInput>(emptyCompanyForm())
  const [savingCompany, setSavingCompany] = useState(false)
  const [deleteCompanyTarget, setDeleteCompanyTarget] = useState<CompanyRow | null>(null)

  const [jobModal, setJobModal] = useState(false)
  const [editJob, setEditJob] = useState<JobRow | null>(null)
  const [jobForm, setJobForm] = useState<JobInput>(emptyJobForm(''))
  const [savingJob, setSavingJob] = useState(false)
  const [deleteJobTarget, setDeleteJobTarget] = useState<JobRow | null>(null)

  const [contactModal, setContactModal] = useState(false)
  const [contactForm, setContactForm] = useState<CompanyContactInput>(emptyContactForm(''))
  const [savingContact, setSavingContact] = useState(false)
  const [deleteContactTarget, setDeleteContactTarget] = useState<CompanyContactRow | null>(null)

  async function reloadCompanies() {
    const data = await getCompanies()
    setCompanies(data)
    return data
  }

  async function reloadDetail(companyId: string) {
    const [j, c] = await Promise.all([getJobs(companyId), getCompanyContacts(companyId)])
    setJobs(j); setContacts(c)
  }

  useEffect(() => {
    getCompanies().then((data) => {
      setCompanies(data)
      if (data.length > 0) setSelected(data[0])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    reloadDetail(selected.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const filtered = companies.filter(
    (c) => !search || c.name.includes(search) || c.industry?.includes(search)
  )

  function openCreateCompany() {
    setEditCompany(null); setCompanyForm(emptyCompanyForm()); setCompanyModal(true)
  }
  function openEditCompany(c: CompanyRow) {
    setEditCompany(c)
    setCompanyForm({ name: c.name, industry: c.industry, address: c.address, assigned_user_id: c.assigned_user_id })
    setCompanyModal(true)
  }
  async function handleSaveCompany() {
    if (!companyForm.name.trim()) { toast('企業名を入力してください', 'error'); return }
    setSavingCompany(true)
    if (editCompany) {
      const ok = await updateCompany(editCompany.id, companyForm)
      if (ok) {
        toast('企業情報を更新しました')
        const data = await reloadCompanies()
        setSelected(data.find((c) => c.id === editCompany.id) ?? null)
      } else { toast('更新に失敗しました', 'error') }
    } else {
      const created = await createCompany(companyForm)
      if (created) {
        toast('企業を追加しました')
        const data = await reloadCompanies()
        setSelected(data.find((c) => c.id === created.id) ?? null)
      } else { toast('追加に失敗しました', 'error') }
    }
    setSavingCompany(false); setCompanyModal(false)
  }
  async function handleDeleteCompany() {
    if (!deleteCompanyTarget) return
    const ok = await deleteCompany(deleteCompanyTarget.id)
    if (ok) {
      toast('企業を削除しました')
      const data = await reloadCompanies()
      setSelected(data.length > 0 ? data[0] : null)
    } else { toast('削除に失敗しました', 'error') }
    setDeleteCompanyTarget(null)
  }

  function openCreateJob() {
    if (!selected) return
    setEditJob(null); setJobForm(emptyJobForm(selected.id)); setJobModal(true)
  }
  function openEditJob(j: JobRow) {
    setEditJob(j)
    setJobForm({
      company_id: j.company_id, title: j.title, employment_type: j.employment_type,
      salary_min: j.salary_min, salary_max: j.salary_max, status: j.status, headcount: j.headcount,
    })
    setJobModal(true)
  }
  async function handleSaveJob() {
    if (!jobForm.title.trim()) { toast('案件タイトルを入力してください', 'error'); return }
    setSavingJob(true)
    if (editJob) {
      const ok = await updateJob(editJob.id, jobForm)
      if (ok) { toast('案件を更新しました'); if (selected) reloadDetail(selected.id) }
      else { toast('更新に失敗しました', 'error') }
    } else {
      const created = await createJob(jobForm)
      if (created) { toast('案件を追加しました'); if (selected) reloadDetail(selected.id) }
      else { toast('追加に失敗しました', 'error') }
    }
    setSavingJob(false); setJobModal(false)
  }
  async function handleDeleteJob() {
    if (!deleteJobTarget || !selected) return
    const ok = await deleteJob(deleteJobTarget.id)
    if (ok) { toast('案件を削除しました'); reloadDetail(selected.id) }
    else { toast('削除に失敗しました', 'error') }
    setDeleteJobTarget(null)
  }

  function openCreateContact() {
    if (!selected) return
    setContactForm(emptyContactForm(selected.id)); setContactModal(true)
  }
  async function handleSaveContact() {
    if (!contactForm.name.trim()) { toast('担当者名を入力してください', 'error'); return }
    setSavingContact(true)
    const created = await createContact(contactForm)
    if (created) { toast('担当者を追加しました'); if (selected) reloadDetail(selected.id) }
    else { toast('追加に失敗しました', 'error') }
    setSavingContact(false); setContactModal(false)
  }
  async function handleDeleteContact() {
    if (!deleteContactTarget || !selected) return
    const ok = await deleteContact(deleteContactTarget.id)
    if (ok) { toast('担当者を削除しました'); reloadDetail(selected.id) }
    else { toast('削除に失敗しました', 'error') }
    setDeleteContactTarget(null)
  }

  if (loading) return <LoadingSpinner label="企業データを読み込み中…" />

  return (
    <div className="flex gap-5 h-[calc(100vh-8rem)]">
      <div className="w-[38%] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="企業名・業種で検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
            />
            <button
              onClick={openCreateCompany}
              className="bg-[#185FA5] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#145292] transition-colors flex-shrink-0"
            >
              ＋
            </button>
          </div>
          <p className="text-xs text-slate-400">{filtered.length} 社</p>
        </div>
        {filtered.length === 0 ? (
          <EmptyState message="企業データがありません" />
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((c) => (
              <li
                key={c.id}
                onClick={() => setSelected(c)}
                className={`px-4 py-4 cursor-pointer transition-colors ${
                  selected?.id === c.id ? 'bg-[#185FA5]/5 border-r-2 border-[#185FA5]' : 'hover:bg-slate-50'
                }`}
              >
                <p className="font-semibold text-slate-800 text-sm leading-tight mb-1">{c.name}</p>
                <p className="text-xs text-slate-500">{c.industry ?? '—'}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{c.address ?? '—'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{selected.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{selected.industry} · {selected.address ?? '—'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditCompany(selected)}
                className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                編集
              </button>
              <button
                onClick={() => setDeleteCompanyTarget(selected)}
                className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
              >
                削除
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  募集案件 <span className="text-slate-300 ml-1">({jobs.length}件)</span>
                </h3>
                <button onClick={openCreateJob} className="text-xs text-[#185FA5] hover:underline">＋ 案件追加</button>
              </div>
              {jobs.length === 0 ? (
                <p className="text-sm text-slate-400">募集中の案件はありません</p>
              ) : (
                <ul className="space-y-2">
                  {jobs.map((job) => (
                    <li key={job.id} className="border border-slate-200 rounded-lg px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-slate-800 text-sm">{job.title}</span>
                        <div className="flex gap-1.5 flex-shrink-0 items-center">
                          <StatusPill status={job.employment_type} size="sm" />
                          <StatusPill status={job.status} size="sm" />
                          <button onClick={() => openEditJob(job)}
                            className="text-[10px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 hover:border-slate-400 transition-colors">
                            編集
                          </button>
                          <button onClick={() => setDeleteJobTarget(job)}
                            className="text-[10px] text-red-400 hover:text-red-600 px-1.5 py-0.5 rounded border border-red-200 hover:border-red-400 transition-colors">
                            削除
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {job.salary_min && job.salary_max
                          ? `¥${job.salary_min.toLocaleString()} 〜 ¥${job.salary_max.toLocaleString()}`
                          : '給与応相談'}
                        　募集 {job.headcount}名
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">担当者連絡先</h3>
                <button onClick={openCreateContact} className="text-xs text-[#185FA5] hover:underline">＋ 担当者追加</button>
              </div>
              {contacts.length === 0 ? (
                <p className="text-sm text-slate-400">担当者情報がありません</p>
              ) : (
                <ul className="space-y-2">
                  {contacts.map((contact) => (
                    <li key={contact.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                      <div className="w-8 h-8 bg-[#185FA5]/10 rounded-full flex items-center justify-center text-[#185FA5] font-bold text-sm flex-shrink-0">
                        {contact.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{contact.name}</p>
                        <p className="text-xs text-slate-500">{contact.role ?? '—'} · {contact.email ?? '—'}</p>
                      </div>
                      <button onClick={() => setDeleteContactTarget(contact)}
                        className="text-[10px] text-red-400 hover:text-red-600 px-1.5 py-0.5 rounded border border-red-200 transition-colors flex-shrink-0">
                        削除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
          <EmptyState message="企業を選択してください" />
        </div>
      )}

      <Modal open={companyModal} onClose={() => setCompanyModal(false)} title={editCompany ? '企業を編集' : '企業を追加'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">企業名 *</label>
            <input type="text" value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">業種</label>
            <input type="text" value={companyForm.industry ?? ''}
              onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value || null })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">住所</label>
            <input type="text" value={companyForm.address ?? ''}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value || null })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setCompanyModal(false)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              キャンセル
            </button>
            <button onClick={handleSaveCompany} disabled={savingCompany}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-[#185FA5] text-white hover:bg-[#145292] transition-colors disabled:opacity-50">
              {savingCompany ? '保存中…' : editCompany ? '更新する' : '追加する'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={jobModal} onClose={() => setJobModal(false)} title={editJob ? '案件を編集' : '案件を追加'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">タイトル *</label>
            <input type="text" value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">雇用形態</label>
              <select value={jobForm.employment_type}
                onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value as JobRow['employment_type'] })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]">
                <option value="dispatch">派遣</option>
                <option value="introduction">紹介</option>
                <option value="temp_to_perm">紹介予定</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ステータス</label>
              <select value={jobForm.status}
                onChange={(e) => setJobForm({ ...jobForm, status: e.target.value as JobRow['status'] })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]">
                <option value="open">募集中</option>
                <option value="filled">充足</option>
                <option value="closed">終了</option>
                <option value="cancelled">中止</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">給与下限（円）</label>
              <input type="number" value={jobForm.salary_min ?? ''}
                onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">給与上限（円）</label>
              <input type="number" value={jobForm.salary_max ?? ''}
                onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">募集人数</label>
            <input type="number" min={1} value={jobForm.headcount}
              onChange={(e) => setJobForm({ ...jobForm, headcount: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setJobModal(false)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              キャンセル
            </button>
            <button onClick={handleSaveJob} disabled={savingJob}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-[#185FA5] text-white hover:bg-[#145292] transition-colors disabled:opacity-50">
              {savingJob ? '保存中…' : editJob ? '更新する' : '追加する'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={contactModal} onClose={() => setContactModal(false)} title="担当者を追加">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">氏名 *</label>
            <input type="text" value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">役職</label>
            <input type="text" value={contactForm.role ?? ''}
              onChange={(e) => setContactForm({ ...contactForm, role: e.target.value || null })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">メール</label>
            <input type="email" value={contactForm.email ?? ''}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value || null })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setContactModal(false)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              キャンセル
            </button>
            <button onClick={handleSaveContact} disabled={savingContact}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-[#185FA5] text-white hover:bg-[#145292] transition-colors disabled:opacity-50">
              {savingContact ? '保存中…' : '追加する'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteCompanyTarget}
        message={`「${deleteCompanyTarget?.name}」を削除します。この操作は元に戻せません。`}
        onConfirm={handleDeleteCompany}
        onCancel={() => setDeleteCompanyTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteJobTarget}
        message={`「${deleteJobTarget?.title}」案件を削除します。`}
        onConfirm={handleDeleteJob}
        onCancel={() => setDeleteJobTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteContactTarget}
        message={`「${deleteContactTarget?.name}」の担当者情報を削除します。`}
        onConfirm={handleDeleteContact}
        onCancel={() => setDeleteContactTarget(null)}
      />
    </div>
  )
}
