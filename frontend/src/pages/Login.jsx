import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Zap, Users, Check, X } from 'lucide-react'

const FEATURES = [
  { Icon: Shield, text: 'Bank-grade AES-256 credential encryption' },
  { Icon: Zap,    text: 'One-click multi-client email dispatch'     },
  { Icon: Users,  text: 'Centralised broker dashboard & audit logs' },
]

function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

const AUTH_ERRORS = {
  'auth/popup-closed-by-user':   'Sign-in was cancelled.',
  'auth/popup-blocked':          'Pop-up blocked — please allow pop-ups for this site.',
  'auth/account-exists-with-different-credential':
    'An account already exists with a different sign-in method.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/too-many-requests':      'Too many attempts. Please try again later.',
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { loginGoogle, authError, setAuthError, toast } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (setAuthError) setAuthError('')
  }, [setAuthError])

  const handleGoogle = async () => {
    setError('')
    if (setAuthError) setAuthError('')
    setLoading(true)
    try {
      await loginGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Google sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #060F1E 0%, #0A1628 60%, #0F1F3D 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F0B429 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)', transform: 'translate(-40%,40%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <img
            src="/logo2.png"
            alt="Tatvarth Capital Logo"
            className="w-11 h-11 object-contain rounded-xl"
          />
          <div>
            <div className="text-white font-bold text-base leading-none"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tatvarth Capital</div>
            <div className="text-xs mt-1 tracking-widest font-semibold" style={{ color: '#F0B429' }}>BROKER PORTAL</div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Empowering<br />
            <span className="text-gradient-gold">Brokers,</span><br />
            Connecting Capital.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Manage all your client communications from a single secure dashboard.
            Professional. Automated. Reliable.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
                  <Icon size={15} color="#F0B429" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          © {new Date().getFullYear()} Tatvarth Capital · Secure & Confidential
        </p>
      </div>

      {/* ── Right sign-in panel ── */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img
              src="/logo2.png"
              alt="Tatvarth Capital Logo"
              className="w-10 h-10 object-contain rounded-xl"
            />
            <div>
              <div className="text-white font-bold text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tatvarth Capital</div>
              <div className="text-xs tracking-widest font-semibold" style={{ color: '#F0B429' }}>BROKER PORTAL</div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8"
            style={{ background: 'rgba(10,26,48,0.75)', border: '1px solid var(--border-default)',
              backdropFilter: 'blur(16px)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>

            <div className="mb-8 text-center">
              <img
                src="/logo2.png"
                alt="Tatvarth Capital Logo"
                className="w-16 h-16 object-contain rounded-2xl mx-auto mb-5"
              />
              <h3 className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back</h3>
              <p className="text-slate-500 text-sm">Sign in to your broker account</p>
            </div>

            {/* Error */}
            {(authError || error) && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-lg mb-6 text-sm animate-slide-up"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {authError || error}
              </div>
            )}

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl
                font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#FFFFFF',
                color: '#1A202C',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#F8FAFC' }}
              onMouseOut={e  => { e.currentTarget.style.background = '#FFFFFF' }}
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                : <GoogleLogo size={20} />}
              <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
            </button>
          </div>
        </div>
      </div>

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
    </div>
  )
}
