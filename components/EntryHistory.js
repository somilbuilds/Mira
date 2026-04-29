'use client'
import { useState } from 'react'

export default function EntryHistory({ entries, onRefresh, onOpenChat }) {
  const [expandedId, setExpandedId] = useState(null)

  const toggleEntry = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const moodColors = {
    calm: 'var(--mood-calm)', grateful: 'var(--mood-grateful)',
    hopeful: 'var(--mood-hopeful)', anxious: 'var(--mood-anxious)',
    stressed: 'var(--mood-stressed)', frustrated: 'var(--mood-frustrated)',
    sad: 'var(--mood-sad)', confused: 'var(--mood-confused)',
    tired: 'var(--mood-tired)', excited: 'var(--mood-excited)',
    proud: 'var(--mood-proud)', restless: 'var(--mood-restless)',
  }

  if (entries.length === 0) {
    return (
      <div className="history-empty">
        <div className="empty-icon">📖</div>
        <p>nothing here yet.</p>
        <p className="empty-hint">write your first entry in the journal tab.</p>
        <style jsx>{`
          .history-empty {
            text-align: center;
            padding: 80px 0;
            color: var(--text-muted);
            font-size: 14px;
          }
          .empty-icon { font-size: 32px; margin-bottom: 16px; }
          .empty-hint { font-size: 12px; color: var(--text-ghost); margin-top: 4px; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="history">
      <div className="history-header">
        <span className="history-count">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
        <button className="btn-ghost history-refresh" onClick={onRefresh} id="refresh-entries-btn">
          refresh
        </button>
      </div>

      <div className="history-list">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className="entry-card card"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="entry-header" onClick={() => toggleEntry(entry.id)}>
              <div className="entry-preview">{entry.text}</div>
              <div className="entry-meta">
                {entry.mood && (
                  <span
                    className="mood-tag"
                    style={{
                      color: moodColors[entry.mood] || 'var(--text-muted)',
                      borderColor: `${moodColors[entry.mood] || 'var(--border-default)'}50`,
                      background: `${moodColors[entry.mood] || 'var(--bg-tertiary)'}10`,
                    }}
                  >
                    {entry.mood}
                  </span>
                )}
                <span className="entry-date">{formatDate(entry.timestamp)}</span>
                <span className="entry-chevron">{expandedId === entry.id ? '▾' : '▸'}</span>
              </div>
            </div>

            {expandedId === entry.id && (
              <div className="entry-body animate-fade-in">
                <div className="entry-full-text">{entry.text}</div>
                {entry.reflection && (
                  <>
                    <div className="entry-reflection-label">mira</div>
                    <div className="entry-reflection-text">{entry.reflection}</div>
                  </>
                )}
                <button
                  className="btn-ghost entry-chat-btn"
                  onClick={(e) => { e.stopPropagation(); onOpenChat(entry); }}
                >
                  talk to mira about this →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .history { animation: fadeIn 0.3s ease-out; }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .history-count {
          font-size: 13px;
          color: var(--text-muted);
        }
        .history-refresh { font-size: 12px; padding: 6px 12px; }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .entry-card {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
          overflow: hidden;
        }
        .entry-header {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          cursor: pointer;
        }
        .entry-preview {
          font-size: 14px;
          color: var(--text-tertiary);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .entry-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .entry-date {
          font-size: 11px;
          color: var(--text-ghost);
          white-space: nowrap;
        }
        .entry-chevron {
          font-size: 10px;
          color: var(--text-ghost);
        }
        .entry-body {
          padding: 0 20px 20px;
          border-top: 1px solid var(--border-subtle);
        }
        .entry-full-text {
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.75;
          padding: 16px 0 14px;
          font-style: italic;
          border-bottom: 1px solid var(--border-subtle);
        }
        .entry-reflection-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-ghost);
          margin-top: 14px;
          margin-bottom: 10px;
        }
        .entry-reflection-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.8;
        }
        .entry-chat-btn {
          margin-top: 16px;
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}
