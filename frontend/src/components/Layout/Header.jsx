import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import NotificationBell from '../Notifications/NotificationBell'
import GlobalSearch from '../Search/GlobalSearch'

const PAGE_META = {
  '/dashboard':      { title: 'Dashboard',      subtitle: 'Overview & analytics' },
  '/clients':        { title: 'Clients',        subtitle: 'Manage client profiles' },
  '/send-email':     { title: 'Send Email',     subtitle: 'Dispatch share transaction requests' },
  '/email-logs':     { title: 'Email Logs',     subtitle: 'Transaction history & audit trail' },
  '/access-control': { title: 'Access Control', subtitle: 'Manage authorised broker emails' },
  '/audit-logs':     { title: 'Audit Logs',     subtitle: 'System & compliance audit trail logs' },
  '/settings':       { title: 'Settings',       subtitle: 'Customise portal behaviour & email defaults' },
  '/guide':          { title: 'Guide',          subtitle: 'How to use the portal & client setup instructions' },
}

export default function Header({ onMenuToggle }) {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || { title: 'Tatvarth Capital', subtitle: '' }
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header
        className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative z-30"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(6,15,30,0.8)', backdropFilter: 'blur(12px)' }}
      >
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-300 transition-all"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1
              className="text-lg font-bold text-white leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {meta.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
          </div>
        </div>

        {/* Right: search + date + notifications */}
        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-slate-500 hover:text-slate-300"
            style={{ background: 'rgba(10,26,48,0.6)', border: '1px solid var(--border-subtle)' }}
            title="Search (Ctrl+K)"
          >
            <Search size={14} strokeWidth={1.8} />
            <span className="hidden md:block text-xs">Search…</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-xs rounded font-mono"
              style={{ background: 'rgba(30,58,110,0.4)', color: '#475569', border: '1px solid var(--border-subtle)' }}>
              ⌘K
            </kbd>
          </button>

          <span
            className="hidden sm:block text-xs text-slate-500 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(10,26,48,0.6)', border: '1px solid var(--border-subtle)' }}
          >
            {now}
          </span>

          <NotificationBell />
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
