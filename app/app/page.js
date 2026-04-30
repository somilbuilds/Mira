'use client'
import { useState, useEffect } from 'react'
import { useAuth, AuthProvider } from '@/lib/auth-context'

// Dynamic imports to avoid SSR issues with Firebase
import JournalWriter from '@/components/JournalWriter'
import EntryHistory from '@/components/EntryHistory'
import ChatPanel from '@/components/ChatPanel'
import Calendar from '@/components/Calendar'
import MoodInsights from '@/components/MoodInsights'

const TABS = [
  { id: 'journal', label: 'journal' },
  { id: 'history', label: 'history' },
  { id: 'calendar', label: 'calendar' },
  { id: 'insights', label: 'insights' },
]

function AppContent() {
  const { user, loading, signInWithGoogle, signOut, getToken, registerUser } = useAuth()
  const [activeTab, setActiveTab] = useState('journal')
  const [chatEntry, setChatEntry] = useState(null)
  const [entries, setEntries] = useState([])
  const [regName, setRegName] = useState('')

  // Fetch entries when user logs in
  useEffect(() => {
    if (user) loadEntries()
  }, [user])

  const loadEntries = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/entries', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch (e) {
      console.error('Failed to load entries:', e)
    }
  }

  const openChat = (entry) => {
    setChatEntry(entry)
  }

  const closeChat = () => {
    setChatEntry(null)
  }

  // Loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-text">mira</div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card glass">
          <div className="auth-logo">mira</div>
          <p className="auth-tagline">mind reflective agent</p>
          <p className="auth-desc">
            Sign in to start journaling with depth.<br />
            Your entries are private and encrypted.
          </p>
          <button className="btn-primary auth-btn" onClick={signInWithGoogle} id="sign-in-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  // Registration gate
  if (user && !user.isRegistered) {
    return (
      <div className="auth-page">
        <div className="auth-card glass">
          <h2 className="auth-title" style={{marginBottom: 16}}>Welcome to Mira.</h2>
          <p className="auth-desc" style={{marginBottom: 24}}>
            Before we begin, how should I call you?
          </p>
          <input 
            type="text" 
            placeholder="Your preferred name" 
            value={regName}
            onChange={e => setRegName(e.target.value)}
            style={{marginBottom: 20}}
          />
          <button 
            className="btn-primary auth-btn" 
            onClick={() => registerUser(regName)} 
            disabled={!regName.trim()}
          >
            Start Journaling
          </button>
        </div>
      </div>
    )
  }

  // Chat overlay
  if (chatEntry) {
    return (
      <div className="app-shell">
        <AppHeader user={user} signOut={signOut} />
        <main className="app-main">
          <ChatPanel
            entry={chatEntry}
            onBack={closeChat}
            getToken={getToken}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AppHeader user={user} signOut={signOut} />

      {/* Tabs */}
      <div className="app-tabs" id="app-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`app-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`tab-${tab.id}`}
          >
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <main className="app-main">
        {activeTab === 'journal' && (
          <JournalWriter
            getToken={getToken}
            onEntryCreated={(entry) => {
              setEntries(prev => [entry, ...prev])
            }}
            onOpenChat={openChat}
          />
        )}
        {activeTab === 'history' && (
          <EntryHistory
            entries={entries}
            onRefresh={loadEntries}
            onOpenChat={openChat}
          />
        )}
        {activeTab === 'calendar' && <Calendar entries={entries} />}
        {activeTab === 'insights' && <MoodInsights entries={entries} />}
      </main>
    </div>
  )
}

function AppHeader({ user, signOut }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-left">
          <span className="app-logo">mira</span>
          <span className="app-logo-sub">mind reflective agent</span>
        </div>
        <div className="app-header-right">
          <span className="app-user-name">{user.name}</span>
          {user.photo && (
            <img src={user.photo} alt="" className="app-user-photo" referrerPolicy="no-referrer" />
          )}
          <button className="btn-ghost app-signout" onClick={signOut} id="sign-out-btn">
            sign out
          </button>
        </div>
      </div>
    </header>
  )
}

export default function AppPage() {
  return (
    <AuthProvider>
      <AppContent />
      <style jsx global>{`
        .app-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-loading-text {
          font-size: 24px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          animation: pulse-soft 2s ease-in-out infinite;
        }

        /* Auth */
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .auth-card {
          max-width: 400px;
          width: 100%;
          padding: 48px 36px;
          border-radius: var(--radius-xl);
          text-align: center;
        }
        .auth-logo {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .auth-tagline {
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 24px;
        }
        .auth-desc {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-tertiary);
          margin-bottom: 32px;
        }
        .auth-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px 24px;
          font-size: 15px;
        }

        /* App Shell */
        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .app-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(9, 9, 11, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 12px 24px;
        }
        .app-header-inner {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .app-header-left {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .app-logo {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
        }
        .app-logo-sub {
          font-size: 11px;
          color: var(--text-ghost);
          letter-spacing: 0.06em;
        }
        .app-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .app-user-name {
          font-size: 13px;
          color: var(--text-tertiary);
        }
        .app-user-photo {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--border-default);
        }
        .app-signout {
          padding: 6px 12px;
          font-size: 12px;
        }

        /* Tabs */
        .app-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--border-subtle);
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px;
        }
        .app-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 18px;
          font-size: 13px;
          color: var(--text-muted);
          background: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all var(--transition);
        }
        .app-tab:hover { color: var(--text-tertiary); }
        .app-tab.active {
          color: var(--text-secondary);
          border-bottom-color: var(--accent);
        }
        .tab-icon { font-size: 14px; }
        .tab-label { letter-spacing: 0.02em; }

        /* Main */
        .app-main {
          flex: 1;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          padding: 32px 24px 80px;
        }

        @media (max-width: 640px) {
          .app-logo-sub { display: none; }
          .app-user-name { display: none; }
          .app-tab { padding: 10px 12px; font-size: 12px; }
          .app-main { padding: 20px 16px 60px; }
        }
      `}</style>
    </AuthProvider>
  )
}
