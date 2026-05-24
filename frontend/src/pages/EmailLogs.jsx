import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Search, Filter, RefreshCw, X,
  CheckCircle, XCircle, Clock, ChevronDown, Eye, Calendar,
  TrendingUp, ChevronRight,
} from 'lucide-react'
import { apiGet } from '../utils/api'
import { format } from 'date-fns'

const TX_COLOR = { BUY: '#10B981', SELL: '#F59E0B' }
const TX_BG    = { BUY: 'rgba(16,185,129,0.1)', SELL: 'rgba(245,158,11,0.1)' }

// ── Detail modal ─────────────────────────────────────────────────────────────
function DetailModal({ log, onClose }) {
  const ts = log.timestamp ? new Date(log.timestamp) : null
  const metaRows = [
    ['Sent From',    log.clientName],
    ['Client Email', log.clientEmail],
    ['Sent To',      log.sentTo || '—'],
    log.ccEmail ? ['CC', log.ccEmail] : null,
    ['Subject',      log.subject],
    ['Status',
      <span key="s" className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>
        {log.status}
      </span>
    ],
    log.status === 'SUCCESS'
      ? ['Message ID', <span key="r" className="text-emerald-400 text-xs break-all font-mono">{log.response}</span>]
      : ['Failure Reason',
          <span key="r" className="text-red-400 text-sm leading-relaxed">{log.errorMessage}</span>
        ],
  ].filter(Boolean)
  const txRows = [
    ['Transaction',   log.transactionType],
    ['Company',       log.companyName],
    ['Stock Symbol',  log.stockSymbol],
    ['Quantity',      log.quantity ? `${Number(log.quantity).toLocaleString('en-IN')} shares` : null],
    ['Price / Share', log.pricePerShare ? `₹ ${Number(log.pricePerShare).toLocaleString('en-IN')}` : null],
    ['Est. Value',    log.estimatedValue ? `₹ ${Number(log.estimatedValue).toLocaleString('en-IN')}` : null],
  ].filter(([, v]) => v)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center
              ${log.status === 'SUCCESS' ? 'bg-emerald-900/40' : 'bg-red-900/30'}`}>
              {log.status === 'SUCCESS'
                ? <CheckCircle size={16} color="#10B981" />
                : <XCircle    size={16} color="#EF4444" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Transaction Log
              </h3>
              <p className="text-xs text-slate-500">
                {ts ? format(ts, 'dd MMM yyyy, hh:mm a') : '—'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Transaction badge */}
          {log.transactionType && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: TX_BG[log.transactionType] || 'rgba(30,58,110,0.2)',
                border: `1px solid ${TX_COLOR[log.transactionType] || '#1E3A6E'}40`,
              }}>
              <TrendingUp size={16} style={{ color: TX_COLOR[log.transactionType] || '#94A3B8' }} />
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Transaction</div>
                <div className="font-bold text-sm" style={{ color: TX_COLOR[log.transactionType] || '#94A3B8' }}>
                  {log.transactionType} — {log.companyName}{log.stockSymbol ? ` (${log.stockSymbol})` : ''}
                </div>
              </div>
              {log.estimatedValue && (
                <div className="ml-auto text-right">
                  <div className="text-xs text-slate-500">Est. Value</div>
                  <div className="font-bold text-white">₹ {Number(log.estimatedValue).toLocaleString('en-IN')}</div>
                </div>
              )}
            </div>
          )}

          {/* Transaction details table */}
          {txRows.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Transaction Details
              </h4>
              <div className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-subtle)' }}>
                {txRows.map(([label, val], i) => (
                  <div key={label} className="flex"
                    style={{
                      background: i % 2 === 0 ? 'rgba(10,22,40,0.5)' : 'rgba(5,13,26,0.5)',
                      borderBottom: i < txRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}>
                    <div className="w-36 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide
                      text-slate-500 flex-shrink-0"
                      style={{ borderRight: '1px solid var(--border-subtle)' }}>
                      {label}
                    </div>
                    <div className="px-4 py-2.5 text-sm text-slate-200">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="divider" />

          {/* Email meta */}
          <div className="space-y-3 text-sm">
            {metaRows.map(([label, val]) => (
              <div key={label} className="flex gap-4">
                <span className="text-slate-500 w-28 flex-shrink-0 text-xs font-semibold uppercase tracking-wide pt-0.5">
                  {label}
                </span>
                <span className="text-slate-200 font-medium">{val}</span>
              </div>
            ))}
          </div>

          {/* Additional info */}
          {log.additionalInfo && (
            <>
              <div className="divider" />
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Additional Information
                </h4>
                <div className="p-3 rounded-lg text-sm text-slate-300 leading-relaxed"
                  style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.15)' }}>
                  {log.additionalInfo}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EmailLogs() {
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadMore] = useState(false)
  const [refreshing, setRefresh]  = useState(false)
  const [hasMore, setHasMore]     = useState(false)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('ALL')
  const [txFilter, setTxFilter]   = useState('ALL')
  const [detail, setDetail]       = useState(null)

  const fetchPage = useCallback(async (before = null, append = false) => {
    if (!append) setLoading(true)
    else setLoadMore(true)
    try {
      const qs = `/email/logs?limit=20${before ? `&before=${encodeURIComponent(before)}` : ''}`
      const data = await apiGet(qs)
      const incoming = data.logs || []
      setLogs(prev => append ? [...prev, ...incoming] : incoming)
      setHasMore(data.hasMore ?? false)
    } catch {
      // keep existing data
    } finally {
      setLoading(false)
      setLoadMore(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefresh(true)
    try {
      const data = await apiGet('/email/logs?limit=20')
      setLogs(data.logs || [])
      setHasMore(data.hasMore ?? false)
    } catch {
    } finally {
      setRefresh(false)
    }
  }, [])

  useEffect(() => { fetchPage() }, [fetchPage])

  const loadMore = () => {
    if (!logs.length || loadingMore) return
    const last = logs[logs.length - 1]
    fetchPage(last.timestamp, true)
  }

  const fmtTime = (iso) => {
    if (!iso) return '—'
    try { return format(new Date(iso), 'dd MMM, hh:mm a') } catch { return '—' }
  }

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      l.clientName?.toLowerCase().includes(q) ||
      l.companyName?.toLowerCase().includes(q) ||
      l.stockSymbol?.toLowerCase().includes(q) ||
      l.subject?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter
    const matchTx     = txFilter === 'ALL' || l.transactionType === txFilter
    return matchSearch && matchStatus && matchTx
  })

  const successCount = logs.filter(l => l.status === 'SUCCESS').length
  const failCount    = logs.filter(l => l.status === 'FAILED').length
  const rate         = logs.length ? Math.round((successCount / logs.length) * 100) : 0

  const SUMMARY = [
    { label: 'Total Sent',   val: logs.length,   color: '#60A5FA' },
    { label: 'Delivered',    val: successCount,  color: '#10B981' },
    { label: 'Failed',       val: failCount,     color: '#EF4444' },
    { label: 'Success Rate', val: `${rate}%`,    color: '#F0B429' },
  ]

  return (
    <div className="space-y-5">

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUMMARY.map(({ label, val, color }) => (
          <div key={label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
            <div>
              <div className="text-lg font-bold text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{val}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input className="input-base pl-10" placeholder="Search client, company, symbol…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <select className="input-base pl-8 pr-8 appearance-none cursor-pointer"
            style={{ width: 'auto', minWidth: 140 }}
            value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Delivered</option>
            <option value="FAILED">Failed</option>
          </select>
          <ChevronDown size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        </div>
        <div className="relative">
          <TrendingUp size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <select className="input-base pl-8 pr-8 appearance-none cursor-pointer"
            style={{ width: 'auto', minWidth: 120 }}
            value={txFilter} onChange={e => setTxFilter(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          <ChevronDown size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="btn-ghost flex items-center gap-2 px-4">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Log table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
              <FileText size={14} color="#F0B429" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Transaction Log</span>
            <span className="badge badge-info">{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 shimmer rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.15)' }}>
              <FileText size={24} color="#F0B429" strokeWidth={1.5} />
            </div>
            <h3 className="text-white font-semibold mb-1">No logs found</h3>
            <p className="text-slate-500 text-sm">
              {search || statusFilter !== 'ALL' || txFilter !== 'ALL'
                ? 'Try adjusting your filters.'
                : 'Transaction logs will appear here after dispatching emails.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="tc-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Company</th>
                    <th>Qty</th>
                    <th>Est. Value</th>
                    <th><Clock size={11} className="inline mr-1" />Time</th>
                    <th className="text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id} onClick={() => setDetail(log)} className="cursor-pointer">
                      <td>
                        <div>
                          <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>
                            {log.status === 'SUCCESS'
                              ? <><CheckCircle size={10} />Sent</>
                              : <><XCircle    size={10} />Failed</>}
                          </span>
                          {log.status === 'FAILED' && log.errorMessage && (
                            <div className="text-xs mt-1 max-w-[180px] truncate"
                              style={{ color: '#EF4444', opacity: 0.75 }}
                              title={log.errorMessage}>
                              {log.errorMessage}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center
                            text-xs font-bold flex-shrink-0"
                            style={{ background: 'rgba(240,180,41,0.1)', color: '#F0B429' }}>
                            {log.clientName?.slice(0,1)}
                          </div>
                          <span className="font-medium text-slate-200">{log.clientName}</span>
                        </div>
                      </td>
                      <td>
                        {log.transactionType ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{
                              background: TX_BG[log.transactionType] || 'rgba(30,58,110,0.2)',
                              color: TX_COLOR[log.transactionType] || '#94A3B8',
                            }}>
                            {log.transactionType}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <div>
                          <div className="text-slate-200 font-medium text-sm">{log.companyName || '—'}</div>
                          {log.stockSymbol && (
                            <div className="text-slate-600 text-xs">{log.stockSymbol}</div>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-400 text-sm">
                        {log.quantity ? Number(log.quantity).toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="text-slate-400 text-sm">
                        {log.estimatedValue
                          ? <span style={{ color: TX_COLOR[log.transactionType] || '#94A3B8' }}>
                              ₹ {Number(log.estimatedValue).toLocaleString('en-IN')}
                            </span>
                          : '—'}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs whitespace-nowrap">
                          <Calendar size={11} />{fmtTime(log.timestamp)}
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <button
                            onClick={e => { e.stopPropagation(); setDetail(log) }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-gold-500 transition-colors"
                            style={{ background: 'rgba(240,180,41,0.06)' }}
                            title="View details">
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load more */}
            {hasMore && !search && statusFilter === 'ALL' && txFilter === 'ALL' && (
              <div className="flex justify-center px-5 py-4"
                style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-ghost flex items-center gap-2 px-6"
                >
                  {loadingMore
                    ? <><div className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(240,180,41,0.3)', borderTopColor: '#F0B429' }} />Loading…</>
                    : <><ChevronRight size={14} />Load more</>}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {detail && <DetailModal log={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
