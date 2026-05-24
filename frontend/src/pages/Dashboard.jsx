import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Send, CheckCircle, Activity,
  ArrowUpRight, Clock, TrendingUp,
} from 'lucide-react'
import { apiGet } from '../utils/api'
import { format } from 'date-fns'

const TX_COLOR = { BUY: '#10B981', SELL: '#F59E0B' }
const TX_BG    = { BUY: 'rgba(16,185,129,0.1)', SELL: 'rgba(245,158,11,0.1)' }

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <div className="stat-card cursor-pointer group" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
          <Icon size={19} color={color} strokeWidth={1.8} />
        </div>
        <ArrowUpRight size={16}
          className="text-slate-700 group-hover:text-slate-500 transition-colors" />
      </div>
      <div className="text-2xl font-bold text-white mb-1"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
      <div className="text-sm text-slate-400 font-medium">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]   = useState({ clients: 0, sentToday: 0, successRate: 0, active: 0 })
  const [logs, setLogs]     = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [clients, logsResp] = await Promise.all([
          apiGet('/clients'),
          apiGet('/email/logs?limit=5'),
        ])
        const logsData = logsResp.logs || []

        const today = new Date(); today.setHours(0,0,0,0)
        const todayLogs = logsData.filter(l => l.timestamp && new Date(l.timestamp) >= today)
        const successN  = logsData.filter(l => l.status === 'SUCCESS').length
        const rate      = logsData.length ? Math.round((successN / logsData.length) * 100) : 100

        setStats({
          clients:     clients.length,
          sentToday:   todayLogs.length,
          successRate: rate,
          active:      clients.filter(c => c.active).length,
        })
        setLogs(logsData)
      } catch {
        // Backend not yet configured — show zeros
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmtTime = (iso) => {
    if (!iso) return '—'
    try { return format(new Date(iso), 'dd MMM, hh:mm a') } catch { return '—' }
  }

  const STAT_CARDS = [
    { icon: Users,       label: 'Total Clients',     value: loading ? '—' : stats.clients,            sub: 'Registered profiles',   color: '#60A5FA', path: '/clients'    },
    { icon: Send,        label: 'Emails Sent Today', value: loading ? '—' : stats.sentToday,           sub: 'Outbound dispatches',   color: '#F0B429', path: '/email-logs' },
    { icon: CheckCircle, label: 'Success Rate',       value: loading ? '—' : `${stats.successRate}%`,  sub: 'All-time delivery',     color: '#10B981', path: '/email-logs' },
    { icon: Activity,    label: 'Active Clients',    value: loading ? '—' : stats.active,              sub: 'Ready to send',         color: '#A78BFA', path: '/clients'    },
  ]

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'

  return (
    <div className="space-y-6">

      {/* Greeting banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F1F3D 100%)', border: '1px solid var(--border-default)' }}>
        <div className="absolute right-0 top-0 w-64 h-full pointer-events-none opacity-5"
          style={{ background: 'radial-gradient(circle at 80% 50%, #F0B429, transparent 60%)' }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Good {greeting}, Broker
            </h2>
            <p className="text-slate-400 text-sm">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button className="btn-gold flex items-center gap-2" onClick={() => navigate('/send-email')}>
            <Send size={15} strokeWidth={2.2} />
            Send Email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(s => (
          <StatCard key={s.label} {...s} onClick={() => navigate(s.path)} />
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
              <Clock size={15} color="#F0B429" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              <p className="text-xs text-slate-600">Last 5 email dispatches</p>
            </div>
          </div>
          <button className="text-xs font-medium flex items-center gap-1 transition-colors"
            style={{ color: '#F0B429' }} onClick={() => navigate('/email-logs')}>
            View all <ArrowUpRight size={13} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 shimmer rounded-lg" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Clock size={28} className="mx-auto mb-3 text-slate-700" strokeWidth={1.5} />
            <p className="text-slate-500 text-sm">No activity yet — send your first email</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tc-table">
              <thead>
                <tr><th>Client</th><th>Type</th><th>Company</th><th>Qty</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} onClick={() => navigate('/email-logs')} className="cursor-pointer">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center
                          text-xs font-bold flex-shrink-0"
                          style={{ background: 'rgba(240,180,41,0.12)', color: '#F0B429' }}>
                          {log.clientName?.slice(0,1) || 'C'}
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
                      <div className="text-slate-300 text-sm">{log.companyName || '—'}</div>
                      {log.stockSymbol && <div className="text-slate-600 text-xs">{log.stockSymbol}</div>}
                    </td>
                    <td className="text-slate-400 text-sm">
                      {log.quantity ? Number(log.quantity).toLocaleString('en-IN') : '—'}
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>
                        {log.status === 'SUCCESS' ? '● Sent' : '● Failed'}
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs">{fmtTime(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { Icon: Users,      label: 'Add New Client', sub: 'Onboard a client', color: '#60A5FA', path: '/clients'    },
          { Icon: Send,       label: 'Send Email',      sub: 'Dispatch now',    color: '#F0B429', path: '/send-email' },
          { Icon: TrendingUp, label: 'View Full Logs',  sub: 'Audit trail',     color: '#10B981', path: '/email-logs' },
        ].map(({ Icon, label, sub, color, path }) => (
          <button key={label} onClick={() => navigate(path)}
            className="flex items-center gap-4 p-4 rounded-xl text-left transition-all group"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = 'var(--bg-card-hover)' }}
            onMouseOut={e  => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-card)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
              <Icon size={18} color={color} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">{label}</div>
              <div className="text-xs text-slate-500">{sub}</div>
            </div>
            <ArrowUpRight size={15}
              className="ml-auto text-slate-700 group-hover:text-slate-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}
