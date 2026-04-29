'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider, db } from '@/lib/firebase'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check Firestore for profile
        let isRegistered = false
        let profileName = firebaseUser.displayName || firebaseUser.email?.split('@')[0]
        
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            isRegistered = true
            profileName = userDoc.data().name || profileName
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profileName,
          photo: firebaseUser.photoURL,
          isRegistered,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const registerUser = async (name) => {
    if (!auth.currentUser) return false
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        name: name.trim(),
        email: auth.currentUser.email,
        createdAt: new Date().toISOString(),
      })
      setUser(prev => ({ ...prev, name: name.trim(), isRegistered: true }))
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Sign in failed:', error.message)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out failed:', error.message)
    }
  }

  /** Get the current user's ID token for API calls */
  const getToken = async () => {
    if (!auth.currentUser) return null
    return auth.currentUser.getIdToken()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, getToken, registerUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
