import { useState, useEffect } from 'react'
import {
  Users, Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  Mail, Lock, Server, X, Check, Eye, EyeOff, AlertCircle, KeyRound,
} from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const BLANK = {
  clientName: '', email: '', appPassword: '',
  smtpHost: 'smtp.gmail.com', smtpPort: 587, active: true,
}

// ── Client add/edit modal ────────────────────────────────────────────────────
function ClientModal({ mode, initial, onSave, onClose }) {
  const [form, setForm]   = useState(
    mode === 'edit'
      ? { ...BLANK, ...initial, appPassword: '' }   // never pre-fill password
      : BLANK
  )
  const [showPwd, setShowPwd] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientName || !form.email) { setErr('Name and email are required.'); return }
    if (mode === 'add' && !form.appPassword) { setErr('App password is required.'); return }
    setSaving(true)
    try { await onSave(form) }
    catch (e) { setErr(e.message || 'Failed to save.') }
    finally   { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 className="font-bold text-white text-base"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {mode === 'add' ? 'Add New Client' : 'Edit Client'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'add' ? 'Onboard a new client profile' : 'Update client configuration'}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              <AlertCircle size={14} />{err}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input className="input-base" placeholder="e.g. Ravi Mehta"
              value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Gmail Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input type="email" className="input-base pl-10" placeholder="client@gmail.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>

          {/* App Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Gmail App Password {mode === 'add' && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type={showPwd ? 'text' : 'password'}
                className="input-base pl-10 pr-11"
                placeholder={mode === 'edit' ? 'Leave blank to keep current password' : 'xxxx xxxx xxxx xxxx'}
                value={form.appPassword}
                onChange={e => set('appPassword', e.target.value)}
                required={mode === 'add'}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                tabIndex={-1}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1">
              <KeyRound size={10} />
              {mode === 'edit'
                ? 'Only fill this to change the stored password — it is encrypted at rest'
                : 'Encrypted with AES-256 before storage — never exposed to the frontend'}
            </p>
          </div>

          {/* SMTP row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">SMTP Host</label>
              <div className="relative">
                <Server size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input className="input-base pl-9" placeholder="smtp.gmail.com"
                  value={form.smtpHost} onChange={e => set('smtpHost', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">SMTP Port</label>
              <input type="number" className="input-base" placeholder="587"
                value={form.smtpPort} onChange={e => set('smtpPort', Number(e.target.value))} />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(2,12,27,0.5)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="text-sm font-semibold text-slate-200">Active Status</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {form.active ? 'Ready to send emails' : 'Client disabled'}
              </div>
            </div>
            <button type="button" onClick={() => set('active', !form.active)}
              style={{ color: form.active ? '#10B981' : '#475569' }} className="transition-colors">
              {form.active
                ? <ToggleRight size={32} strokeWidth={1.5} />
                : <ToggleLeft  size={32} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving}
              className="btn-gold flex-1 flex items-center justify-center gap-2">
              {saving
                ? <><div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />Saving…</>
                : <><Check size={15} strokeWidth={2.5} />{mode === 'add' ? 'Add Client' : 'Save Changes'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteConfirm({ client, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const handle = async () => { setBusy(true); await onConfirm(); setBusy(false) }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={22} color="#EF4444" />
          </div>
          <h3 className="font-bold text-white text-base mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delete Client</h3>
          <p className="text-slate-400 text-sm mb-6">
            Remove <span className="text-white font-semibold">{client.clientName}</span>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handle} disabled={busy}
              className="btn-danger flex-1 flex items-center justify-center gap-2">
              {busy
                ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                : <Trash2 size={14} />}
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(null)   // null | 'add' | { mode:'edit', client }
  const [delTarget, setDel]     = useState(null)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const loadClients = async () => {
    try {
      const data = await apiGet('/clients')
      setClients(data)
    } catch (e) {
      showToast(e.message || 'Failed to load clients', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClients() }, [])

  const handleAdd = async (form) => {
    await apiPost('/clients', form)
    await loadClients()
    setModal(null)
    showToast(`${form.clientName} added successfully`)
  }

  const handleEdit = async (form) => {
    await apiPut(`/clients/${modal.client.id}`, form)
    await loadClients()
    setModal(null)
    showToast(`${form.clientName} updated`)
  }

  const handleDelete = async () => {
    await apiDelete(`/clients/${delTarget.id}`)
    await loadClients()
    showToast(`${delTarget.clientName} removed`, 'error')
    setDel(null)
  }

  const handleToggle = async (client) => {
    try {
      await apiPut(`/clients/${client.id}`, { active: !client.active })
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, active: !c.active } : c))
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const filtered = clients.filter(c =>
    c.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl
          text-sm font-medium shadow-xl animate-slide-up
          ${toast.type === 'success'
            ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
            : 'bg-red-950 border border-red-900 text-red-300'}`}>
          {toast.type === 'success' ? <Check size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Client Profiles
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {clients.length} client{clients.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setModal('add')}>
          <Plus size={16} strokeWidth={2.5} />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
        <input className="input-base pl-10" placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 shimmer rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.15)' }}>
              <Users size={28} color="#F0B429" strokeWidth={1.5} />
            </div>
            <h3 className="text-white font-semibold mb-2">No clients found</h3>
            <p className="text-slate-500 text-sm mb-5">
              {search ? 'Try a different search term.' : 'Add your first client to get started.'}
            </p>
            {!search && (
              <button className="btn-gold flex items-center gap-2" onClick={() => setModal('add')}>
                <Plus size={14} /> Add Client
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tc-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>SMTP Config</th>
                  <th>Password</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center
                          text-sm font-bold flex-shrink-0"
                          style={{ background: 'rgba(240,180,41,0.12)', color: '#F0B429' }}>
                          {client.clientName?.slice(0,1)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 block">{client.clientName}</span>
                          {client.createdBy && (
                            <span className="text-[10px] text-slate-500 block mt-0.5" title="Onboarding Broker">
                              by: {client.createdBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail size={13} className="text-slate-600 flex-shrink-0" />
                        {client.email}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Server size={12} />{client.smtpHost}:{client.smtpPort}
                      </div>
                    </td>
                    <td>
                      {client.hasPassword
                        ? <span className="badge badge-success"><Lock size={9} /> Encrypted</span>
                        : <span className="badge badge-error">Not set</span>}
                    </td>
                    <td>
                      <button onClick={() => handleToggle(client)}
                        className={`badge cursor-pointer transition-opacity hover:opacity-75
                          ${client.active ? 'badge-success' : 'badge-neutral'}`}>
                        {client.active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal({ mode: 'edit', client })}
                          className="p-2 rounded-lg transition-all text-slate-500 hover:text-blue-400"
                          style={{ background: 'rgba(30,58,110,0.3)' }} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        {user?.email === 'korojitha@gmail.com' ? (
                          <button onClick={() => setDel(client)}
                            className="p-2 rounded-lg transition-all text-slate-500 hover:text-red-400"
                            style={{ background: 'rgba(239,68,68,0.08)' }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button disabled
                            className="p-2 rounded-lg text-slate-700 cursor-not-allowed opacity-30"
                            style={{ background: 'rgba(255,255,255,0.02)' }} title="Deletion restricted to Admin">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <ClientModal mode="add" onSave={handleAdd} onClose={() => setModal(null)} />
      )}
      {modal?.mode === 'edit' && (
        <ClientModal mode="edit" initial={modal.client} onSave={handleEdit} onClose={() => setModal(null)} />
      )}
      {delTarget && (
        <DeleteConfirm client={delTarget} onConfirm={handleDelete} onClose={() => setDel(null)} />
      )}
    </div>
  )
}
