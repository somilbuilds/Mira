'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function MoodInsights({ entries }) {
  const { getToken } = useAuth()
  const [insightLoading, setInsightLoading] = useState(null)
  const [advancedInsight, setAdvancedInsight] = useState(null)

  const generateInsight = async (type) => {
    setInsightLoading(type)
    setAdvancedInsight(null)
    try {
      const token = await getToken()
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      setAdvancedInsight({ type, text: data.result || data.error })
    } catch (e) {
      setAdvancedInsight({ type, text: 'Failed to generate insight.' })
    } finally {
      setInsightLoading(null)
    }
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="insights-empty">
        <div className="empty-icon">📊</div>
        <p>no data yet.</p>
        <p className="empty-hint">write a few entries to see your mood patterns.</p>
        <style jsx>{`
          .insights-empty {
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

  const moodColors = {
    calm: 'var(--mood-calm)', grateful: 'var(--mood-grateful)',
    hopeful: 'var(--mood-hopeful)', anxious: 'var(--mood-anxious)',
    stressed: 'var(--mood-stressed)', frustrated: 'var(--mood-frustrated)',
    sad: 'var(--mood-sad)', confused: 'var(--mood-confused)',
    tired: 'var(--mood-tired)', excited: 'var(--mood-excited)',
    proud: 'var(--mood-proud)', restless: 'var(--mood-restless)',
  }

  const getEntryMood = (entry) => {
    if (entry.mood) return entry.mood
    if (Array.isArray(entry.sentiments) && entry.sentiments[0]) return entry.sentiments[0]
    if (typeof entry.sentiments === 'string') return entry.sentiments.split(',').map((s) => s.trim()).filter(Boolean)[0] || ''
    return ''
  }

  // Count moods
  const moodCounts = {}
  entries.forEach(e => {
    const mood = getEntryMood(e)
    if (mood) {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1
    }
  })

  const sortedMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])

  const maxCount = Math.max(...Object.values(moodCounts), 1)
  const totalEntries = entries.length
  const moodedEntries = entries.filter(e => getEntryMood(e)).length

  // Recent mood timeline (last 14 entries)
  const recentEntries = entries
    .filter(e => getEntryMood(e))
    .slice(0, 14)
    .reverse()

  // Streak - consecutive days with entries
  let streak = 0
  const today = new Date()
  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i].timestamp)
    const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24))
    if (diffDays <= streak + 1) {
      streak = diffDays + 1
    } else break
  }

  return (
    <div className="insights">
      {/* Advanced Insights Buttons */}
      <div className="advanced-insights-actions" style={{display: 'flex', gap: 12, marginBottom: 24}}>
        <button 
          className="btn-primary" 
          onClick={() => generateInsight('drift')}
          disabled={insightLoading !== null}
        >
          {insightLoading === 'drift' ? 'Generating...' : 'Generate Drift Report'}
        </button>
        <button 
          className="btn-ghost" 
          onClick={() => generateInsight('chapters')}
          disabled={insightLoading !== null}
        >
          {insightLoading === 'chapters' ? 'Generating...' : 'Generate Life Chapters'}
        </button>
      </div>

      {advancedInsight && (
        <div className="advanced-insight-result card animate-fade-in" style={{marginBottom: 32, padding: 24}}>
          <h3 className="section-title">{advancedInsight.type === 'drift' ? 'The Drift Report' : 'Life Chapters'}</h3>
          <div style={{fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.8}}>
            {advancedInsight.text}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card card">
          <div className="stat-value">{totalEntries}</div>
          <div className="stat-label">total entries</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{sortedMoods.length}</div>
          <div className="stat-label">unique moods</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{streak}</div>
          <div className="stat-label">day streak</div>
        </div>
      </div>

      {/* Mood Distribution */}
      {sortedMoods.length > 0 && (
        <div className="mood-section">
          <h3 className="section-title">mood distribution</h3>
          <div className="mood-bars">
            {sortedMoods.map(([mood, count]) => (
              <div key={mood} className="mood-bar-row">
                <span className="mood-bar-label" style={{ color: moodColors[mood] || 'var(--text-tertiary)' }}>
                  {mood}
                </span>
                <div className="mood-bar-track">
                  <div
                    className="mood-bar-fill"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: moodColors[mood] || 'var(--text-tertiary)',
                    }}
                  />
                </div>
                <span className="mood-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Timeline */}
      {recentEntries.length > 1 && (
        <div className="timeline-section">
          <h3 className="section-title">recent mood flow</h3>
          <div className="timeline">
            {recentEntries.map((entry, i) => (
              <div key={i} className="timeline-item">
                <div
                  className="timeline-dot"
                  style={{ background: moodColors[getEntryMood(entry)] || 'var(--text-ghost)' }}
                  title={`${getEntryMood(entry)} — ${new Date(entry.timestamp).toLocaleDateString()}`}
                />
                <span className="timeline-mood">{getEntryMood(entry)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Mood */}
      {sortedMoods.length > 0 && (
        <div className="top-mood card">
          <div className="top-mood-label">most frequent mood</div>
          <div className="top-mood-value" style={{ color: moodColors[sortedMoods[0][0]] }}>
            {sortedMoods[0][0]}
          </div>
          <div className="top-mood-pct">
            {Math.round((sortedMoods[0][1] / moodedEntries) * 100)}% of entries
          </div>
        </div>
      )}

      <style jsx>{`
        .insights { animation: fadeIn 0.3s ease-out; }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 32px;
        }
        .stat-card {
          padding: 20px;
          text-align: center;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-ghost);
          letter-spacing: 0.05em;
        }
        .section-title {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 16px;
          letter-spacing: 0.03em;
        }
        .mood-section { margin-bottom: 32px; }
        .mood-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mood-bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mood-bar-label {
          width: 80px;
          font-size: 12px;
          font-weight: 500;
          text-align: right;
        }
        .mood-bar-track {
          flex: 1;
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .mood-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.6s ease-out;
          opacity: 0.8;
        }
        .mood-bar-count {
          width: 24px;
          font-size: 12px;
          color: var(--text-ghost);
          text-align: right;
        }
        .timeline-section { margin-bottom: 32px; }
        .timeline {
          display: flex;
          gap: 4px;
          align-items: flex-end;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .timeline-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-width: 48px;
        }
        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          transition: transform var(--transition);
        }
        .timeline-dot:hover { transform: scale(1.4); }
        .timeline-mood {
          font-size: 9px;
          color: var(--text-ghost);
          letter-spacing: 0.02em;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          height: 50px;
        }
        .top-mood {
          padding: 28px;
          text-align: center;
        }
        .top-mood-label {
          font-size: 11px;
          color: var(--text-ghost);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .top-mood-value {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .top-mood-pct {
          font-size: 12px;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr; }
          .mood-bar-label { width: 60px; font-size: 11px; }
        }
      `}</style>
    </div>
  )
}
