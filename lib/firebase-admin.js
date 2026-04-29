import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

/**
 * Verify a Firebase ID token from the client.
 * Returns the decoded user info or null.
 */
export async function verifyToken(token) {
  if (!token) return null

  try {
    const app = getAdminApp()
    const auth = getAuth(app)
    const decoded = await auth.verifyIdToken(token)
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email?.split('@')[0] || 'User',
    }
  } catch (error) {
    console.error('[mira] Token verification failed:', error.message)
    return null
  }
}
