import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [authError, setAuthError] = useState('')
  const [toast, setToast]         = useState(null)

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    let unsubWhitelist = null

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      // Clear any existing whitelist listener when auth state changes
      if (unsubWhitelist) {
        unsubWhitelist()
        unsubWhitelist = null
      }

      setAuthError('')

      if (u) {
        const email = u.email?.toLowerCase()
        if (email === 'korojitha@gmail.com') {
          setUser(u)
          setLoading(false)
          return
        }

        // Set up real-time listener for the whitelist document
        const docRef = doc(db, 'access_control', 'whitelist')
        unsubWhitelist = onSnapshot(docRef, async (docSnap) => {
          let allowed = false
          if (docSnap.exists()) {
            const list = docSnap.data().emails || []
            const lowerList = list.map(e => e.toLowerCase())
            if (lowerList.includes(email)) {
              allowed = true
            }
          }

          if (allowed) {
            setUser(u)
            setLoading(false)
          } else {
            setUser(prevUser => {
              if (prevUser) {
                // Real-time revocation toast
                triggerToast('Access Revoked: Your session was terminated.', 'error')
              } else {
                // Denied during initial session restored check
                triggerToast('Access is not granted', 'error')
              }
              return null
            })
            setLoading(false)
            await signOut(auth)
          }
        }, async (err) => {
          console.error('Whitelist real-time listener error:', err)
          setAuthError('Error checking authorization. Please try again.')
          setUser(null)
          setLoading(false)
          await signOut(auth)
        })

      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      unsubAuth()
      if (unsubWhitelist) {
        unsubWhitelist()
      }
    }
  }, [])

  const login       = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const loginGoogle = ()                => signInWithPopup(auth, googleProvider)
  const logout      = ()                => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, login, loginGoogle, logout, authError, setAuthError, toast, triggerToast }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
