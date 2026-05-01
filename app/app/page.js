'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, AuthProvider } from '@/lib/auth-context'

// Dynamic imports to avoid SSR issues with Firebase
import JournalWriter from '@/components/JournalWriter'
import EntryHistory from '@/components/EntryHistory'
import ChatPanel from '@/components/ChatPanel'
import Calendar from '@/components/Calendar'
import MoodInsights from '@/components/MoodInsights'
import GlobalChat from '@/components/GlobalChat'

const SECTIONS = [
  { id: 'new-entry', label: 'New Entry' },
  { id: 'dream-chat', label: 'Dream Chat' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'history', label: 'History' },
  { id: 'insights', label: 'Insights' },
]

function AppContent() {
  const router = useRouter()
  const { user, loading, signOut, getToken } = useAuth()
  const [activeSection, setActiveSection] = useState('new-entry')
  const [chatEntry, setChatEntry] = useState(null)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const storedSection = localStorage.getItem('mira_active_section')
    if (storedSection) setActiveSection(storedSection)
  }, [])

  useEffect(() => {
    localStorage.setItem('mira_active_section', activeSection)
  }, [activeSection])

  useEffect(() => {
    if (user) loadEntries()
  }, [user])

  useEffect(() => {
    if (!loading && (!user || !user.isRegistered)) {
      router.replace('/signin')
    }
  }, [loading, user, router])

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

  if (loading) {
    return (
      <div className="workspace-loading">
        <div className="workspace-loading-text">mira</div>
      </div>
    )
  }

  if (!user || !user.isRegistered) {
    return null
  }

  if (chatEntry) {
    return (
      <div className="workspace-shell">
        <main className="workspace-main">
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
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div>
          <div className="workspace-brand">mira</div>
          <p className="workspace-brand-sub">mind reflective agent</p>
        </div>
        <nav className="workspace-nav" id="app-tabs">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`workspace-nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              id={`tab-${section.id}`}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="workspace-account">
          <div className="workspace-user-row">
            {user.photo && <img src={user.photo} alt="" className="workspace-user-photo" referrerPolicy="no-referrer" />}
            <span className="workspace-user-name">{user.name}</span>
          </div>
          <button
            className="btn-ghost workspace-signout"
            onClick={async () => {
              await signOut()
              router.replace('/signin')
            }}
            id="sign-out-btn"
          >
            sign out
          </button>
        </div>
      </aside>

      <main className="workspace-main">
        <section className={`workspace-section ${activeSection === 'new-entry' ? 'active' : ''}`}>
          <JournalWriter
            userId={user.uid}
            getToken={getToken}
            onEntryCreated={(entry) => {
              setEntries(prev => [entry, ...prev])
            }}
            onOpenChat={openChat}
          />
        </section>
        <section className={`workspace-section ${activeSection === 'dream-chat' ? 'active' : ''}`}>
          <GlobalChat entries={entries} getToken={getToken} />
        </section>
        <section className={`workspace-section ${activeSection === 'calendar' ? 'active' : ''}`}>
          <Calendar entries={entries} />
        </section>
        <section className={`workspace-section ${activeSection === 'history' ? 'active' : ''}`}>
          <EntryHistory
            entries={entries}
            onRefresh={loadEntries}
            onOpenChat={openChat}
          />
        </section>
        <section className={`workspace-section ${activeSection === 'insights' ? 'active' : ''}`}>
          <MoodInsights entries={entries} />
        </section>
      </main>
    </div>
  )
}

export default function AppPage() {
  return (
    <AuthProvider>
      <AppContent />
      <style jsx global>{`
        .workspace-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .workspace-loading-text {
          font-size: 24px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          animation: pulse-soft 2s ease-in-out infinite;
        }
        .workspace-shell {
          min-height: 100vh;
          display: flex;
          background: var(--bg-primary);
        }
        .workspace-sidebar {
          width: 260px;
          border-right: 1px solid var(--border-subtle);
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .workspace-brand {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .workspace-brand-sub {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          margin-top: 2px;
        }
        .workspace-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .workspace-nav-btn {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-tertiary);
          font-size: 14px;
        }
        .workspace-nav-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }
        .workspace-nav-btn.active {
          background: var(--bg-card);
          border-color: var(--border-default);
          color: var(--text-primary);
        }
        .workspace-account {
          margin-top: auto;
          border-top: 1px solid var(--border-subtle);
          padding-top: 14px;
        }
        .workspace-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .workspace-user-name {
          font-size: 13px;
          color: var(--text-tertiary);
        }
        .workspace-user-photo {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--border-default);
        }
        .workspace-signout {
          width: 100%;
          padding: 6px 12px;
          font-size: 12px;
        }
        .workspace-main {
          flex: 1;
          min-width: 0;
          padding: 24px;
        }
        .workspace-section {
          display: none;
        }
        .workspace-section.active {
          display: block;
        }
        @media (max-width: 640px) {
          .workspace-shell {
            flex-direction: column;
          }
          .workspace-sidebar {
            width: 100%;
            border-right: 0;
            border-bottom: 1px solid var(--border-subtle);
          }
          .workspace-nav {
            flex-direction: row;
            overflow-x: auto;
          }
          .workspace-nav-btn {
            white-space: nowrap;
          }
          .workspace-main {
            padding: 18px 14px;
          }
        }
      `}</style>
    </AuthProvider>
  )
}
