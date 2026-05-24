import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, FileText, TrendingUp, X, CornerDownLeft } from 'lucide-react'
import { apiGet } from '../../utils/api'

function useDebounce(val, delay) {
  const [debounced, setDebounced] = useState(val)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(val), delay)
    return () => clearTimeout(t)
  }, [val, delay])
  return debounced
}

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState({ clients: [], logs: [] })
  const [loading, setLoading]   = useState(false)
  const [cursor, setCursor]     = useState(0)
  const inputRef                = useRef(null)
  const navigate                = useNavigate()
  const debouncedQuery          = useDebounce(query.trim(), 250)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults({ clients: [], logs: [] })
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Search
  useEffect(() => {
    if (!debouncedQuery) { setResults({ clients: [], logs: [] }); return }
    setLoading(true)
    const q = debouncedQuery.toLowerCase()
    Promise.all([
      apiGet('/clients').catch(() => []),
      apiGet(`/email/logs?limit=50`).then(d => d.logs || []).catch(() => []),
    ]).then(([clients, logs]) => {
      setResults({
        clients: clients.filter(c =>
          c.clientName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
        ).slice(0, 5),
        logs: logs.filter(l =>
          l.clientName?.toLowerCase().includes(q) ||
          l.companyName?.toLowerCase().includes(q) ||
          l.stockSymbol?.toLowerCase().includes(q) ||
          l.transactionType?.toLowerCase().includes(q)
        ).slice(0, 5),
      })
    }).finally(() => { setLoading(false); setCursor(0) })
  }, [debouncedQuery])

  const allItems = [
    ...results.clients.map(c => ({ type: 'client', data: c })),
    ...results.logs.map(l   => ({ type: 'log',    data: l })),
  ]

  // Arrow key navigation
  useEffect(() => {
    const handler = (e) => {
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, allItems.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
      if (e.key === 'Enter' && allItems[cursor]) { handleSelect(allItems[cursor]) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, cursor, allItems])

  const handleSelect = useCallback((item) => {
    onClose()
    setQuery('')
    if (item.type === 'client') navigate('/clients')
    else navigate('/email-logs')
  }, [navigate, onClose])

  if (!open) return null

  const txColor = (tx) => tx === 'BUY' ? '#10B981' : tx === 'SELL' ? '#F59E0B' : '#94A3B8'
  const txBg    = (tx) => tx === 'BUY' ? 'rgba(16,185,129,0.1)' : tx === 'SELL' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-2xl overflow-hidden animate-slide-up"
        style={{
          maxWidth: 600,
          background: '#081326',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {loading
            ? <div className="w-4 h-4 border-2 rounded-full flex-shrink-0 animate-spin"
                style={{ borderColor: 'rgba(240,180,41,0.3)', borderTopColor: '#F0B429' }} />
            : <Search size={16} className="flex-shrink-0" style={{ color: '#F0B429' }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clients, companies, transactions…"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-600"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs rounded font-mono"
              style={{ background: 'rgba(30,58,110,0.4)', color: '#64748B', border: '1px solid var(--border-subtle)' }}>
              ESC
            </kbd>
            <button onClick={onClose} className="p-1 rounded text-slate-600 hover:text-slate-400">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {!debouncedQuery ? (
            <div className="p-6 text-center">
              <Search size={28} className="mx-auto mb-3" style={{ color: '#1E3A6E' }} strokeWidth={1.5} />
              <p className="text-slate-500 text-sm font-medium">Start typing to search</p>
              <p className="text-slate-700 text-xs mt-1">Clients, companies, stock symbols, transactions</p>
            </div>
          ) : allItems.length === 0 && !loading ? (
            <div className="p-6 text-center">
              <p className="text-slate-500 text-sm">No results for <span className="text-slate-300">"{query}"</span></p>
            </div>
          ) : (
            <>
              {/* Clients section */}
              {results.clients.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                    <Users size={11} style={{ color: '#60A5FA' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#60A5FA' }}>
                      Clients
                    </span>
                  </div>
                  {results.clients.map((c, i) => {
                    const idx = results.logs.length > 0 ? i : i
                    const isFocused = cursor === i
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelect({ type: 'client', data: c })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                        style={{
                          background: isFocused ? 'rgba(30,58,110,0.4)' : 'transparent',
                          borderBottom: '1px solid rgba(26,48,96,0.2)',
                        }}
                        onMouseEnter={() => setCursor(i)}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA' }}>
                          {c.clientName?.slice(0,1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-200">{c.clientName}</div>
                          <div className="text-xs text-slate-500 truncate">{c.email}</div>
                        </div>
                        <span className={`badge ${c.active ? 'badge-success' : 'badge-error'} flex-shrink-0`}>
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                        {isFocused && <CornerDownLeft size={13} className="flex-shrink-0 text-slate-600" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Logs section */}
              {results.logs.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                    <TrendingUp size={11} style={{ color: '#F0B429' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F0B429' }}>
                      Transactions
                    </span>
                  </div>
                  {results.logs.map((l, i) => {
                    const idx = results.clients.length + i
                    const isFocused = cursor === idx
                    return (
                      <button
                        key={l.id}
                        onClick={() => handleSelect({ type: 'log', data: l })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                        style={{
                          background: isFocused ? 'rgba(30,58,110,0.4)' : 'transparent',
                          borderBottom: '1px solid rgba(26,48,96,0.2)',
                        }}
                        onMouseEnter={() => setCursor(idx)}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: txBg(l.transactionType), border: `1px solid ${txColor(l.transactionType)}30` }}>
                          <TrendingUp size={14} style={{ color: txColor(l.transactionType) }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {l.transactionType && (
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                                style={{ background: txBg(l.transactionType), color: txColor(l.transactionType) }}>
                                {l.transactionType}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-slate-200 truncate">
                              {l.companyName || l.clientName}
                            </span>
                            {l.stockSymbol && (
                              <span className="text-xs text-slate-500">({l.stockSymbol})</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            via {l.clientName} · {l.quantity ? `${l.quantity} shares` : ''}
                          </div>
                        </div>
                        <span className={`badge flex-shrink-0 ${l.status === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>
                          {l.status === 'SUCCESS' ? 'Sent' : 'Failed'}
                        </span>
                        {isFocused && <CornerDownLeft size={13} className="flex-shrink-0 text-slate-600" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        {allItems.length > 0 && (
          <div className="px-4 py-2.5 flex items-center gap-4 text-xs text-slate-700"
            style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">ESC</kbd> close</span>
          </div>
        )}
      </div>
    </div>
  )
}
