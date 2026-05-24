import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Send,
  FileText,
  LogOut,
  X,
  Settings,
  BookOpen,
  Shield,
  History,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard',      label: 'Dashboard',      Icon: LayoutDashboard },
  { to: '/clients',        label: 'Clients',        Icon: Users            },
  { to: '/send-email',     label: 'Send Email',     Icon: Send             },
  { to: '/email-logs',     label: 'Email Logs',     Icon: FileText         },
  { to: '/access-control', label: 'Access Control', Icon: Shield           },
  { to: '/audit-logs',     label: 'Audit Logs',     Icon: History          },
  { to: '/guide',          label: 'Guide',          Icon: BookOpen         },
]

const NAV_BOTTOM = [
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Broker'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          w-64 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: '#060F1E', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <img
              src="/logo2.png"
              alt="Tatvarth Capital Logo"
              className="w-9 h-9 object-contain rounded-lg flex-shrink-0"
            />
            <div>
              <div className="text-sm font-bold text-white leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Tatvarth
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#F0B429', letterSpacing: '0.06em', fontWeight: 600 }}>
                CAPITAL
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section label */}
        <div className="px-5 pt-6 pb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Main Menu
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.filter(item => item.to !== '/audit-logs' || user?.email === 'korojitha@gmail.com').map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings */}
        <div className="px-3 pb-2" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
          {NAV_BOTTOM.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* User & Logout */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 p-3 rounded-10 mb-3" style={{ background: 'rgba(26,48,96,0.25)', borderRadius: 10 }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F0B429, #D97706)', color: '#020C1B' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-300 truncate">{displayName}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ color: '#EF4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
          >
            <LogOut size={16} strokeWidth={1.8} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
