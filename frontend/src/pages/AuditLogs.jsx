import { useState, useEffect } from 'react'
import { apiGet } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import {
  History, Search, RefreshCw, AlertTriangle, ShieldCheck, Mail, Users, Settings, Database
} from 'lucide-react'

export default function AuditLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet('/audit-logs')
      setLogs(data || [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to fetch compliance audit logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.email === 'korojitha@gmail.com') {
      fetchLogs()
    } else {
      setLoading(false)
      setError('Access Denied: Only the system administrator can view audit logs.')
    }
  }, [user])

  const getActionIcon = (action) => {
    const act = action.toLowerCase()
    if (act.includes('created')) return <Users size={14} className="text-emerald-400" />
    if (act.includes('deleted')) return <AlertTriangle size={14} className="text-red-400" />
    if (act.includes('updated')) return <Settings size={14} className="text-amber-400" />
    if (act.includes('email')) return <Mail size={14} className="text-blue-400" />
    if (act.includes('access') || act.includes('whitelist')) return <ShieldCheck size={14} className="text-purple-400" />
    return <Database size={14} className="text-slate-400" />
  }

  const getActionBadgeClass = (action) => {
    const act = action.toLowerCase()
    if (act.includes('created')) return 'bg-emerald-950 border border-emerald-800 text-emerald-300'
    if (act.includes('deleted')) return 'bg-red-950 border border-red-900 text-red-300'
    if (act.includes('updated')) return 'bg-amber-950 border border-amber-800 text-amber-300'
    if (act.includes('email')) return 'bg-blue-950 border border-blue-900 text-blue-300'
    if (act.includes('access') || act.includes('whitelist')) return 'bg-purple-950 border border-purple-900 text-purple-300'
    return 'bg-slate-900 border border-slate-700 text-slate-300'
  }

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase()
    return (
      (log.action || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term) ||
      (log.performedBy || '').toLowerCase().includes(term)
    )
  })

  // Format date nicely
  const formatDate = (isoString) => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (user?.email !== 'korojitha@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle size={48} className="text-red-500 animate-pulse" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-md text-center">
          The page you are trying to access is restricted to system administrators for audit and compliance purposes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <History className="text-amber-500" size={22} />
            Compliance Audit Logs
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Full compliance record of system operations, whitelist edits, and email dispatches.
          </p>
        </div>
        
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        
        {/* Search bar */}
        <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="input-base pl-10"
              placeholder="Search by broker, action, details..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Showing {filteredLogs.length} of {logs.length} compliance entries
          </span>
        </div>

        {error && (
          <div className="p-6 text-center text-red-400 flex flex-col items-center justify-center space-y-2">
            <AlertTriangle size={24} />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 shimmer rounded-lg" />
            ))}
          </div>
        ) : !error && filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History size={36} className="mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="font-semibold">No audit logs found</p>
            <p className="text-xs text-slate-600 mt-1">Actions performed by brokers will be tracked here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tc-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Category</th>
                  <th>Details & Changes</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap text-xs text-slate-400 font-mono">
                      {formatDate(log.timestamp)}
                    </td>
                    <td>
                      <span className={`badge flex items-center gap-1.5 w-max font-semibold py-1 px-2.5 rounded-lg text-xs ${getActionBadgeClass(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-300 text-xs font-medium block max-w-xl leading-relaxed whitespace-pre-wrap">
                        {log.details}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{
                            background: log.performedBy === 'korojitha@gmail.com' ? 'rgba(240,180,41,0.1)' : 'rgba(59,130,246,0.1)',
                            color: log.performedBy === 'korojitha@gmail.com' ? '#F0B429' : '#60A5FA'
                          }}>
                          {log.performedBy.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-300 font-semibold">{log.performedBy}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
