import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle, XCircle, Check, Inbox } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

function timeAgo(iso) {
  if (!iso) return ''
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }) }
  catch { return '' }
}

export default function NotificationBell() {
  const [open, setOpen]     = useState(false)
  const panelRef            = useRef(null)
  const navigate            = useNavigate()
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = async (notif) => {
    if (!notif.read) await markAsRead(notif.id)
    setOpen(false)
    navigate('/email-logs')
  }

  return (
    <div className="relative" ref={panelRef}>

      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg transition-all"
        style={{
          background: open ? 'rgba(240,180,41,0.1)' : 'rgba(10,26,48,0.6)',
          border: open ? '1px solid rgba(240,180,41,0.3)' : '1px solid var(--border-subtle)',
          color: open ? '#F0B429' : '#64748B',
        }}
        onMouseOver={e => { if (!open) e.currentTarget.style.color = '#F0B429' }}
        onMouseOut={e  => { if (!open) e.currentTarget.style.color = '#64748B'  }}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center
              rounded-full text-white font-bold animate-fade-in"
            style={{ background: '#EF4444', fontSize: '10px', padding: '0 4px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 animate-slide-up"
          style={{
            width: 380,
            background: 'rgba(8,19,38,0.97)',
            border: '1px solid rgba(30,58,110,0.8)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3), 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(240,180,41,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2.5">
              <Bell size={15} color="#F0B429" strokeWidth={1.8} />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-error" style={{ fontSize: 10, padding: '2px 7px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: '#F0B429' }}
                onMouseOver={e => e.currentTarget.style.color = '#FCD34D'}
                onMouseOut={e  => e.currentTarget.style.color = '#F0B429'}
              >
                <Check size={12} strokeWidth={2.5} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 shimmer rounded-lg" />)}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <Inbox size={32} className="mb-3" style={{ color: '#1E3A6E' }} strokeWidth={1.5} />
                <p className="text-slate-500 text-sm font-medium">No notifications yet</p>
                <p className="text-slate-600 text-xs mt-1">
                  Email activity will appear here in real time
                </p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left transition-all"
                  style={{
                    borderBottom: '1px solid rgba(26,48,96,0.3)',
                    background: notif.read ? 'transparent' : 'rgba(240,180,41,0.04)',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(30,58,110,0.25)'}
                  onMouseOut={e  => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(240,180,41,0.04)'}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {notif.type === 'SUCCESS'
                      ? <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <CheckCircle size={15} color="#10B981" />
                        </div>
                      : <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <XCircle size={15} color="#EF4444" />
                        </div>
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      {notif.transactionType && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded`}
                          style={{
                            background: notif.transactionType === 'BUY' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                            color:      notif.transactionType === 'BUY' ? '#10B981' : '#F59E0B',
                          }}>
                          {notif.transactionType}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-300 truncate">
                        {notif.companyName || notif.clientName}
                      </span>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: '#F0B429' }} />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: '#475569' }}>
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer link */}
          {notifications.length > 0 && (
            <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { setOpen(false); navigate('/email-logs') }}
                className="w-full text-center text-xs font-semibold transition-colors"
                style={{ color: '#F0B429' }}
              >
                View all activity in Email Logs →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
