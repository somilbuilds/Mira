'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth-context'

function SignInContent() {
  const router = useRouter()
  const { user, loading, signInWithGoogle, registerUser } = useAuth()
  const [regName, setRegName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user?.isRegistered) {
      router.replace('/app')
    }
  }, [loading, user, router])

  const completeProfile = async () => {
    if (!regName.trim() || submitting) return
    setSubmitting(true)
    const ok = await registerUser(regName)
    setSubmitting(false)
    if (ok) router.replace('/app')
  }

  if (loading) {
    return (
      <div className="signin-page">
        <div className="signin-card glass">
          <p className="signin-muted">loading your journal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="signin-page">
        <div className="signin-card glass">
          <div className="signin-logo">mira</div>
          <p className="signin-tagline">mind reflective agent</p>
          <p className="signin-desc">
            Start in one click. Your entries stay private and tied to your Google account.
          </p>
          <button className="btn-primary signin-btn" onClick={signInWithGoogle} id="sign-in-btn">
            Continue with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="signin-page">
      <div className="signin-card glass">
        <h2 className="signin-title">Welcome to Mira</h2>
        <p className="signin-desc">What should Mira call you?</p>
        <input
          type="text"
          placeholder="Your preferred name"
          value={regName}
          onChange={(e) => setRegName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') completeProfile()
          }}
        />
        <button
          className="btn-primary signin-btn"
          onClick={completeProfile}
          disabled={!regName.trim() || submitting}
        >
          {submitting ? 'Saving...' : 'Enter workspace'}
        </button>
      </div>
      <style jsx>{`
        .signin-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .signin-card {
          max-width: 420px;
          width: 100%;
          padding: 42px 32px;
          border-radius: var(--radius-xl);
          text-align: center;
        }
        .signin-logo {
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .signin-tagline {
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 22px;
        }
        .signin-title {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .signin-desc {
          color: var(--text-tertiary);
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 18px;
        }
        .signin-btn {
          margin-top: 12px;
          width: 100%;
        }
        .signin-muted {
          color: var(--text-ghost);
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}

export default function SignInPage() {
  return (
    <AuthProvider>
      <SignInContent />
    </AuthProvider>
  )
}
