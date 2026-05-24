import { useState, useEffect } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import {
  Shield, Plus, Trash2, Mail, Check, X, ShieldAlert, KeyRound, Loader2, Info
} from 'lucide-react'
import { apiPost } from '../utils/api'

export default function AccessControl() {
  const { user } = useAuth()
  const [emails, setEmails] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    // Read whitelist from Firestore in real-time
    const docRef = doc(db, 'access_control', 'whitelist')
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const list = docSnap.data().emails || []
        // Make sure korojitha@gmail.com is in the list
        if (!list.map(e => e.toLowerCase()).includes('korojitha@gmail.com')) {
          list.push('korojitha@gmail.com')
        }
        setEmails(list)
      } else {
        // Fallback default
        setEmails(['korojitha@gmail.com'])
      }
      setLoading(false)
    }, (err) => {
      console.error('Error fetching whitelist:', err)
      showToast('Failed to load access list. Check permissions.', 'error')
      setLoading(false)
    })

    return unsub
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    const emailToAdd = newEmail.trim().toLowerCase()
    if (!emailToAdd) return

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailToAdd)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }

    if (emails.map(e => e.toLowerCase()).includes(emailToAdd)) {
      showToast('This email address already has access.', 'error')
      return
    }

    setActionLoading(true)
    try {
      const updatedList = [...emails, emailToAdd]
      // Enforce korojitha@gmail.com remains
      if (!updatedList.map(e => e.toLowerCase()).includes('korojitha@gmail.com')) {
        updatedList.push('korojitha@gmail.com')
      }
      await setDoc(doc(db, 'access_control', 'whitelist'), {
        emails: updatedList,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'unknown'
      })

      // Log to audit trails
      await apiPost('/audit-logs', {
        action: 'Whitelist Email Added',
        details: `Granted portal access to email: ${emailToAdd}`,
      }).catch(err => console.error('Audit logging failed:', err))

      setNewEmail('')
      showToast('Email access granted successfully.')
    } catch (err) {
      console.error(err)
      showToast('Permission denied. Cannot update access control.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (emailToDelete) => {
    const emailLower = emailToDelete.toLowerCase()
    if (emailLower === 'korojitha@gmail.com') {
      showToast('Cannot revoke access for the permanent system administrator.', 'error')
      return
    }

    if (!window.confirm(`Revoke portal access for ${emailToDelete}?`)) {
      return
    }

    setActionLoading(true)
    try {
      const updatedList = emails.filter(e => e.toLowerCase() !== emailLower)
      // Enforce korojitha@gmail.com remains
      if (!updatedList.map(e => e.toLowerCase()).includes('korojitha@gmail.com')) {
        updatedList.push('korojitha@gmail.com')
      }

      await setDoc(doc(db, 'access_control', 'whitelist'), {
        emails: updatedList,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'unknown'
      })

      // Log to audit trails
      await apiPost('/audit-logs', {
        action: 'Whitelist Email Revoked',
        details: `Revoked portal access for email: ${emailToDelete}`,
      }).catch(err => console.error('Audit logging failed:', err))

      showToast('Access revoked successfully.')
    } catch (err) {
      console.error(err)
      showToast('Permission denied. Cannot modify whitelist.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
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

      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Access Control
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage authorized Google email IDs allowed to log in and use this portal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Add email form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl p-6 space-y-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Grant Portal Access
              </h3>
              <p className="text-xs text-slate-500">
                Authorized Gmail IDs will be allowed to bypass security rules.
              </p>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Gmail Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="email"
                    className="input-base pl-10"
                    placeholder="e.g. broker@gmail.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading || !newEmail}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Grant Access</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3.5 rounded-xl text-xs space-y-2 leading-relaxed"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', color: '#93C5FD' }}>
              <div className="flex gap-2">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Access control restricts the Firebase Google OAuth flow. Only accounts whitelisted here will be allowed entry.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: List of whitelisted emails */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <Shield size={16} color="#F0B429" />
                <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Authorized Email Whitelist ({emails.length})
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 shimmer rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="tc-table">
                  <thead>
                    <tr>
                      <th>Broker Email</th>
                      <th>Access Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map(email => {
                      const isSuperAdmin = email.toLowerCase() === 'korojitha@gmail.com'
                      return (
                        <tr key={email}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{
                                  background: isSuperAdmin ? 'rgba(240,180,41,0.12)' : 'rgba(59,130,246,0.1)',
                                  color: isSuperAdmin ? '#F0B429' : '#60A5FA'
                                }}>
                                {email.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-200 block">{email}</span>
                                {isSuperAdmin && (
                                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                                    System Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {isSuperAdmin ? (
                              <span className="badge badge-success flex items-center gap-1 w-max">
                                <KeyRound size={9} /> Permitted (Admin)
                              </span>
                            ) : (
                              <span className="badge badge-success flex items-center gap-1 w-max">
                                <Check size={9} /> Permitted
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-2">
                              {isSuperAdmin ? (
                                <button
                                  disabled
                                  className="p-2 rounded-lg text-slate-700 cursor-not-allowed opacity-40"
                                  style={{ background: 'rgba(255,255,255,0.02)' }}
                                  title="Super Admin cannot be deleted"
                                >
                                  <ShieldAlert size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDelete(email)}
                                  disabled={actionLoading}
                                  className="p-2 rounded-lg transition-all text-slate-500 hover:text-red-400"
                                  style={{ background: 'rgba(239,68,68,0.08)' }}
                                  title="Revoke access"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
