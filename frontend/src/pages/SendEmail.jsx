import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send, User, Building2, Hash, Package, DollarSign,
  FileText, ChevronDown, CheckCircle, AlertCircle, Eye, X, Loader2,
  ChevronRight, AtSign, MessageSquare, Settings, Check, Square, CheckSquare, Layers, Sparkles
} from 'lucide-react'
import { apiGet, apiPost } from '../utils/api'

const BLANK = {
  transactionType: 'buy',
  companyName: '',
  stockSymbol: '',
  quantity: '',
  pricePerShare: '',
  additionalInfo: '',
  overrideToEmail:  '',
  overrideCcEmail:  '',
  overrideBccEmail: '',
  overrideSubject:  '',
}

// ── Single Client Selector ───────────────────────────────────────────────────
function ClientSelector({ clients, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const active = clients.filter(c => c.active)

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
        style={{
          background: 'rgba(2,12,27,0.7)',
          border: open ? '1px solid #F0B429' : '1px solid var(--border-default)',
          boxShadow: open ? '0 0 0 3px rgba(240,180,41,0.1)' : 'none',
        }}>
        {selected ? (
          <>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(240,180,41,0.15)', color: '#F0B429' }}>
              {selected.clientName?.slice(0,1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{selected.clientName}</div>
              <div className="text-xs text-slate-500 truncate">{selected.email}</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(30,58,110,0.3)', border: '1px solid var(--border-default)' }}>
              <User size={15} color="#475569" />
            </div>
            <span className="text-slate-500 text-sm">Select a client to send from…</span>
          </>
        )}
        <ChevronDown size={16}
          className={`text-slate-600 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-20"
          style={{ background: '#071425', border: '1px solid var(--border-default)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
          {active.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">No active clients available</div>
          ) : active.map(c => (
            <button key={c.id} type="button"
              onClick={() => { onSelect(c); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
              style={{ borderBottom: '1px solid rgba(26,48,96,0.3)' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(30,58,110,0.3)'}
              onMouseOut={e  => e.currentTarget.style.background = 'transparent'}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'rgba(240,180,41,0.12)', color: '#F0B429' }}>
                {c.clientName?.slice(0,1)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-200">{c.clientName}</div>
                <div className="text-xs text-slate-500 truncate">{c.email}</div>
              </div>
              {selected?.id === c.id && <CheckCircle size={15} color="#10B981" className="ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Multi-Client Selector for Bulk Sending ───────────────────────────────────
function BulkClientSelector({ clients, selectedIds, onChange }) {
  const active = clients.filter(c => c.active)
  const allSelected = active.length > 0 && selectedIds.length === active.length

  const handleToggleAll = () => {
    if (allSelected) {
      onChange([])
    } else {
      onChange(active.map(c => c.id))
    }
  }

  const handleToggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleToggleAll}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {allSelected ? (
            <CheckSquare size={14} className="text-amber-500" />
          ) : (
            <Square size={14} />
          )}
          <span>Select All Active ({active.length})</span>
        </button>
        <span className="text-xs text-slate-500 font-semibold">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 space-y-1">
        {active.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-600">No active clients onboarded yet.</div>
        ) : (
          active.map(c => {
            const isSel = selectedIds.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleToggle(c.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                style={{
                  background: isSel ? 'rgba(240,180,41,0.06)' : 'transparent',
                  border: isSel ? '1px solid rgba(240,180,41,0.2)' : '1px solid transparent'
                }}
              >
                <div className="flex-shrink-0 text-slate-500">
                  {isSel ? (
                    <CheckSquare size={16} className="text-amber-500" />
                  ) : (
                    <Square size={16} />
                  )}
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(240,180,41,0.1)', color: '#F0B429' }}>
                  {c.clientName?.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200 truncate">{c.clientName}</div>
                  <div className="text-[10px] text-slate-500 truncate">{c.email}</div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── HTML Preview Modal ───────────────────────────────────────────────────────
function PreviewModal({ clientId, formData, onClose }) {
  const [html, setHtml]         = useState('')
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!clientId || !formData) return
    setLoading(true)
    apiPost('/email/preview', { clientId, formData })
      .then(data => { setHtml(data.html); setDelivery(data.delivery || null); setError('') })
      .catch(e => setError(e.message || 'Failed to generate preview'))
      .finally(() => setLoading(false))
  }, [clientId, formData])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 className="font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Email Preview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Rendered HTML — exactly as it will be received</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4" style={{ minHeight: 0 }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={28} className="animate-spin" style={{ color: '#F0B429' }} />
              <p className="text-slate-500 text-sm">Generating preview…</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          ) : (
            <>
              {/* Delivery meta bar */}
              {delivery && (
                <div className="rounded-xl p-3.5 mb-3 space-y-1.5 text-xs"
                  style={{ background: 'rgba(10,26,48,0.6)', border: '1px solid var(--border-subtle)' }}>
                  {[
                    ['To',      delivery.toEmail],
                    delivery.ccEmail  ? ['CC',  delivery.ccEmail]  : null,
                    ['Subject', delivery.subject],
                  ].filter(Boolean).map(([k,v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-slate-600 w-14 flex-shrink-0">{k}:</span>
                      <span className="text-slate-300 break-all">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-subtle)' }}>
                <iframe
                  srcDoc={html}
                  title="Email Preview"
                  className="w-full"
                  style={{ height: 520, border: 'none', background: '#EEF2F7' }}
                />
              </div>
            </>
          )}
        </div>
        <div className="px-6 py-3 flex-shrink-0 text-xs text-slate-600 text-center"
          style={{ borderTop: '1px solid var(--border-subtle)' }}>
          Rendered using your actual settings. This is exactly what the recipient will receive.
        </div>
      </div>
    </div>
  )
}

// ── Bulk Job Progress View ────────────────────────────────────────────────────
function BulkProgressView({ jobId, onFinish }) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const pollJobStatus = async () => {
    try {
      const res = await apiGet(`/email/bulk-job/${jobId}`)
      setJob(res)
      setError(null)
      
      // Continue polling if pending or processing
      if (res.status === 'PENDING' || res.status === 'PROCESSING') {
        timerRef.current = setTimeout(pollJobStatus, 2000)
      }
    } catch (err) {
      console.error('Error polling bulk job:', err)
      setError('Failed to refresh bulk email dispatch status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    pollJobStatus()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [jobId])

  if (loading && !job) {
    return (
      <div className="max-w-lg mx-auto mt-14 text-center p-8 space-y-4">
        <Loader2 size={32} className="animate-spin text-amber-500 mx-auto" />
        <h3 className="font-bold text-white text-lg">Initiating Bulk dispatch…</h3>
        <p className="text-slate-500 text-sm">Deploying background worker job.</p>
      </div>
    )
  }

  const processed = (job?.completed || 0) + (job?.failed || 0)
  const total = job?.total || 1
  const pct = Math.min(Math.round((processed / total) * 100), 100)

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-6 p-6 rounded-2xl"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-amber-950/50 border border-amber-900 flex items-center justify-center mx-auto">
          {job?.status === 'COMPLETED' ? (
            <CheckCircle size={22} className="text-emerald-400" />
          ) : (
            <Loader2 size={22} className="text-amber-500 animate-spin" />
          )}
        </div>
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {job?.status === 'COMPLETED' ? 'Bulk Dispatch Finished!' : 'Processing Bulk Queue'}
        </h3>
        <p className="text-xs text-slate-500">
          Staggered delivery at 1.5s delay to protect domain reputation and avoid spam flags.
        </p>
      </div>

      {/* Progress metrics */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-400">Dispatch Progress</span>
          <span className="text-amber-500 font-mono">{pct}% ({processed} of {total})</span>
        </div>
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total</div>
          <div className="text-lg font-bold text-white mt-0.5">{total}</div>
        </div>
        <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
          <div className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Succeeded</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{job?.completed || 0}</div>
        </div>
        <div className="bg-red-950/20 p-3 rounded-xl border border-red-900/30">
          <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Failed</div>
          <div className="text-lg font-bold text-red-400 mt-0.5">{job?.failed || 0}</div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 text-center flex items-center justify-center gap-1.5 bg-red-950/30 p-2.5 rounded-xl border border-red-950">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {job?.status === 'COMPLETED' && (
        <button
          onClick={onFinish}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-4"
        >
          <span>Send Another Request</span>
        </button>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SendEmail() {
  const [clients, setClients]         = useState([])
  const [selected, setSelected]       = useState(null)          // for single send
  const [form, setForm]               = useState(BLANK)
  const [sending, setSending]         = useState(false)
  const [result, setResult]           = useState(null)          // null | 'success' | 'error'
  const [errMsg, setErrMsg]           = useState('')
  const [preview, setPreview]         = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [defaultTo, setDefaultTo]     = useState('tatvarthcapital@gmail.com')
  const navigate = useNavigate()

  useEffect(() => {
    apiGet('/clients').then(setClients).catch(() => {})
    apiGet('/settings').then(s => setDefaultTo(s.toEmail || 'tatvarthcapital@gmail.com')).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const estimatedValue = form.quantity && form.pricePerShare
    ? (Number(form.quantity) * Number(form.pricePerShare)).toLocaleString('en-IN')
    : null

  const handleSend = async (e) => {
    e.preventDefault()
    
    if (!selected) { setErrMsg('Please select a client.'); return }
    if (!form.companyName || !form.quantity) {
      setErrMsg('Company name and quantity are required.'); return
    }
    setErrMsg('')
    setSending(true)
    try {
      await apiPost('/email/send', { clientId: selected.id, formData: form })
      setResult('success')
      setForm(BLANK)
      setSelected(null)
    } catch (e) {
      setResult('error')
      setErrMsg(e.message || 'Failed to send email.')
    } finally {
      setSending(false)
    }
  }

  // ── Success screen (Single) ──────────────────────────────────────────────────
  if (result === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-14 text-center animate-slide-up">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle size={38} color="#10B981" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Request Dispatched!
        </h2>
        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
          The share transaction request was sent successfully to Tatvarth Capital.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="btn-ghost" onClick={() => setResult(null)}>Send Another</button>
          <button className="btn-gold" onClick={() => navigate('/email-logs')}>View Logs</button>
        </div>
      </div>
    )
  }

  const isBuy = form.transactionType === 'buy'
  const previewClientId = selected?.id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Send Transaction Request
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Dispatch a share transaction request from a client's whitelisted identity.
        </p>
      </div>

      <form onSubmit={handleSend} className="space-y-5">
        
        {/* Identity selection */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            Send From Client <span className="text-red-500">*</span>
          </label>
          <ClientSelector clients={clients} selected={selected} onSelect={setSelected} />
          {selected && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 animate-slide-up">
              <span className="badge badge-success">● Active</span>
              <span>·</span>
              <span>Will send from <span className="text-slate-300">{selected.email}</span> via SMTP</span>
            </div>
          )}
        </div>

        {/* Transaction type toggle */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[['buy', 'BUY', '#10B981', 'rgba(16,185,129,0.12)', 'rgba(16,185,129,0.25)'],
              ['sell','SELL','#F59E0B','rgba(245,158,11,0.12)','rgba(245,158,11,0.25)']].map(([val, label, color, bg, activeBg]) => (
              <button
                key={val}
                type="button"
                onClick={() => set('transactionType', val)}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: form.transactionType === val ? activeBg : 'rgba(10,26,48,0.4)',
                  border: form.transactionType === val ? `2px solid ${color}` : '2px solid var(--border-default)',
                  color: form.transactionType === val ? color : '#64748B',
                  boxShadow: form.transactionType === val ? `0 0 20px ${color}20` : 'none',
                }}>
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock details */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: isBuy ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)' }}>
              <FileText size={12} color={isBuy ? '#10B981' : '#F59E0B'} />
            </div>
            Transaction Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text" className="input-base pl-10"
                  placeholder="e.g. Reliance Industries"
                  value={form.companyName}
                  onChange={e => set('companyName', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Stock Symbol */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Stock Symbol
              </label>
              <div className="relative">
                <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text" className="input-base pl-10"
                  placeholder="e.g. RELIANCE"
                  value={form.stockSymbol}
                  onChange={e => set('stockSymbol', e.target.value.toUpperCase())}
                  maxLength={20}
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Quantity (Shares) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="number" className="input-base pl-10"
                  placeholder="e.g. 500"
                  value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Price per share */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Price per Share (₹)
              </label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="number" className="input-base pl-10"
                  placeholder="e.g. 2450.00"
                  value={form.pricePerShare}
                  onChange={e => set('pricePerShare', e.target.value)}
                  min="0" step="0.01"
                />
              </div>
            </div>

            {/* Estimated value display */}
            {estimatedValue && (
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl animate-slide-up"
                  style={{
                    background: isBuy ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
                    border: `1px solid ${isBuy ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                  }}>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
                      Estimated Value
                    </div>
                    <div className="text-lg font-bold" style={{ color: isBuy ? '#10B981' : '#F59E0B' }}>
                      ₹ {estimatedValue}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    {Number(form.quantity).toLocaleString('en-IN')} shares × ₹{Number(form.pricePerShare).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional info */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Additional Information
            </label>
            <textarea
              className="input-base resize-none"
              rows={3}
              placeholder="e.g. Please process at market price. Preferred settlement: T+1…"
              value={form.additionalInfo}
              onChange={e => set('additionalInfo', e.target.value)}
              maxLength={500}
              style={{ fontFamily: 'inherit' }}
            />
            <div className="text-right text-xs text-slate-600 mt-1">{form.additionalInfo.length}/500</div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Settings size={14} style={{ color: showAdvanced ? '#F0B429' : '#475569' }} />
              <span className="text-sm font-semibold" style={{ color: showAdvanced ? '#F0B429' : '#94A3B8' }}>
                Advanced Options
              </span>
              <span className="text-xs text-slate-600">— override defaults for this send only</span>
            </div>
            <ChevronRight size={15}
              className={`text-slate-600 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="px-5 pb-5 space-y-4 animate-slide-up"
              style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-xs text-slate-600 pt-4">
                These fields override the portal-wide defaults stored in Settings — only for this one email.
                Leave blank to use the defaults.
              </p>

              {/* Override To */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Override Recipient (To)
                </label>
                <div className="relative">
                  <AtSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="email"
                    className="input-base pl-10"
                    placeholder={`Default: ${defaultTo}`}
                    value={form.overrideToEmail}
                    onChange={e => set('overrideToEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Override CC */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    CC Email
                  </label>
                  <div className="relative">
                    <AtSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      type="email"
                      className="input-base pl-10"
                      placeholder="cc@company.com"
                      value={form.overrideCcEmail}
                      onChange={e => set('overrideCcEmail', e.target.value)}
                    />
                  </div>
                </div>

                {/* Override BCC */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    BCC Email
                  </label>
                  <div className="relative">
                    <AtSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      type="email"
                      className="input-base pl-10"
                      placeholder="bcc@company.com"
                      value={form.overrideBccEmail}
                      onChange={e => set('overrideBccEmail', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Override Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Custom Subject
                </label>
                <div className="relative">
                  <MessageSquare size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="text"
                    className="input-base pl-10"
                    placeholder={`Default: Share ${(form.transactionType || 'BUY').toUpperCase()} Request – ${form.companyName || '[Company]'}`}
                    value={form.overrideSubject}
                    onChange={e => set('overrideSubject', e.target.value)}
                    maxLength={200}
                  />
                </div>
              </div>

              {/* Active override summary */}
              {(form.overrideToEmail || form.overrideCcEmail || form.overrideBccEmail || form.overrideSubject) && (
                <div className="rounded-lg p-3 text-xs space-y-1"
                  style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="font-semibold mb-1.5" style={{ color: '#F59E0B' }}>Active overrides for this send:</div>
                  {form.overrideToEmail  && <div className="text-slate-300">To: <span className="text-white">{form.overrideToEmail}</span></div>}
                  {form.overrideCcEmail  && <div className="text-slate-300">CC: <span className="text-white">{form.overrideCcEmail}</span></div>}
                  {form.overrideBccEmail && <div className="text-slate-300">BCC: <span className="text-white">{form.overrideBccEmail}</span></div>}
                  {form.overrideSubject  && <div className="text-slate-300">Subject: <span className="text-white">{form.overrideSubject}</span></div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {(errMsg || result === 'error') && (
          <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errMsg || 'Something went wrong. Please try again.'}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!previewClientId || !form.companyName || !form.quantity}
            onClick={() => setPreview(true)}
            className="btn-ghost flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye size={15} />Preview Template
          </button>
          <button
            type="submit"
            disabled={sending}
            className="btn-gold flex-1 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Sending…</span>
              </>
            ) : (
              <>
                <Send size={15} strokeWidth={2.2} />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>
      </form>

      {preview && previewClientId && (
        <PreviewModal
          clientId={previewClientId}
          formData={form}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  )
}
