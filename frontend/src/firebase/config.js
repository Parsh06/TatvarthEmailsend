import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyBR5kxhYz3kDSPbfOKIcnnQUHdH1Dpb-Jw',
  authDomain:        'emailsender-dcb62.firebaseapp.com',
  projectId:         'emailsender-dcb62',
  storageBucket:     'emailsender-dcb62.firebasestorage.app',
  messagingSenderId: '1051479379146',
  appId:             '1:1051479379146:web:f32fdd430f70d3d50e7833',
  measurementId:     'G-MSZFDBDV4M',
}

const app = initializeApp(firebaseConfig)

export const auth           = getAuth(app)
export const db             = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export default app
