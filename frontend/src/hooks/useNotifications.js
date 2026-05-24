import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, limit,
  onSnapshot, updateDoc, doc, serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) { setLoading(false); return }

    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(30)
    )

    const unsub = onSnapshot(
      q,
      snap => {
        setNotifications(snap.docs.map(d => {
          const data = d.data()
          return {
            id:              d.id,
            type:            data.type,
            clientName:      data.clientName,
            companyName:     data.companyName,
            transactionType: data.transactionType,
            quantity:        data.quantity,
            message:         data.message,
            read:            data.read ?? false,
            createdAt:       data.createdAt?.toDate?.()?.toISOString() ?? null,
          }
        }))
        setLoading(false)
      },
      () => setLoading(false) // silently handle permission errors before rules deploy
    )

    return unsub
  }, [user])

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true,
        readAt: serverTimestamp(),
      })
    } catch { /* ignore if rules not yet deployed */ }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read)
    if (!unread.length) return
    try {
      const batch = writeBatch(db)
      unread.forEach(n => batch.update(doc(db, 'notifications', n.id), {
        read: true, readAt: serverTimestamp(),
      }))
      await batch.commit()
    } catch { /* ignore */ }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead }
}
