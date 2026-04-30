'use client'
import { useState } from 'react'

export default function JournalWriter({ getToken, onEntryCreated, onOpenChat }) {
  const [text, setText] = useState('')
  const [numPeople, setNumPeople] = useState('')
  const [names, setNames] = useState('')
  const [roles, setRoles] = useState('')
  const [location, setLocation] = useState('')
  const [lucidity, setLucidity] = useState(5)
  const [isNightmare, setIsNightmare] = useState(false)
  
  const [showDetails, setShowDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const submit = async () => {
    if (!text.trim() || submitting) return

    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const token = await getToken()
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          text: text.trim(),
          dreamData: { 
            numPeople, 
            names, 
            roles, 
            location, 
            lucidity, 
            isNightmare 
          }
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Something went wrong')
      }

      const data = await res.json()
      setResult(data)
      setText('')
      if (onEntryCreated) onEntryCreated(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      submit()
    }
  }

  const moodColors = {
    calm: 'var(--mood-calm)', grateful: 'var(--mood-grateful)',
    hopeful: 'var(--mood-hopeful)', anxious: 'var(--mood-anxious)',
    stressed: 'var(--mood-stressed)', frustrated: 'var(--mood-frustrated)',
    sad: 'var(--mood-sad)', confused: 'var(--mood-confused)',
    tired: 'var(--mood-tired)', excited: 'var(--mood-excited)',
    proud: 'var(--mood-proud)', restless: 'var(--mood-restless)',
  }

  return (
    <div className="journal-writer">
      <div className="mode-toggle" style={{marginBottom: 12}}>
        <button 
          className="btn-ghost" 
          onClick={() => setShowDetails(!showDetails)}
          style={{fontSize: 12, padding: '4px 8px'}}
        >
          {showDetails ? 'Hide Dream Details' : '+ Add Optional Dream Details'}
        </button>
      </div>

      {showDetails && (
        <div className="dream-details-form animate-fade-in" style={{marginBottom: 16, display: 'grid', gap: '12px', background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)'}}>
          <input type="number" placeholder="Number of people remembered" value={numPeople} onChange={e => setNumPeople(e.target.value)} />
          <input type="text" placeholder="Names of people" value={names} onChange={e => setNames(e.target.value)} />
          <input type="text" placeholder="Roles of people in the dream" value={roles} onChange={e => setRoles(e.target.value)} />
          <input type="text" placeholder="Location of the dream" value={location} onChange={e => setLocation(e.target.value)} />
          
          <label style={{fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4}}>
            Lucidity Level (1-10): {lucidity}
            <input type="range" min="1" max="10" value={lucidity} onChange={e => setLucidity(e.target.value)} />
          </label>

          <label style={{fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center'}}>
            <input type="checkbox" checked={isNightmare} onChange={e => setIsNightmare(e.target.checked)} />
            This was a nightmare / pleasant dream
          </label>
        </div>
      )}

      <textarea
        id="journal-input"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your dream down to every single detail..."
        rows={6}
        disabled={submitting}
      />

      <div className="journal-actions">
        <button
          className="btn-primary"
          onClick={submit}
          disabled={!text.trim() || submitting}
          id="reflect-btn"
        >
          {submitting ? 'reflecting...' : 'reflect'}
        </button>
        <span className="journal-hint">ctrl+enter to submit</span>
      </div>

      {error && (
        <div className="journal-error animate-fade-in">{error}</div>
      )}

      {result && (
        <div className="journal-result card animate-fade-in-up">
          <div className="sentiments-container" style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12}}>
            {result.sentiments && result.sentiments.map((sentiment, i) => (
              <span
                key={i}
                className="mood-tag"
                style={{
                  color: moodColors[sentiment] || 'var(--text-tertiary)',
                  borderColor: moodColors[sentiment] || 'var(--border-default)',
                  background: `${moodColors[sentiment] || 'var(--bg-tertiary)'}15`,
                }}
              >
                {sentiment}
              </span>
            ))}
          </div>
          <div className="result-label">mira's dream summary</div>
          <div className="result-reflection">{result.summary || 'Entry saved, but Mira couldn\'t reflect this time.'}</div>

          <div className="result-original">"{result.text}"</div>
          <button
            className="btn-ghost result-chat-btn"
            onClick={() => onOpenChat && onOpenChat(result)}
            id="open-chat-btn"
          >
            continue the conversation →
          </button>
        </div>
      )}

      <style jsx>{`
        .journal-writer {
          animation: fadeIn 0.3s ease-out;
        }
        .journal-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }
        .journal-hint {
          font-size: 11px;
          color: var(--text-ghost);
        }
        .journal-error {
          margin-top: 12px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          color: var(--danger);
          font-size: 13px;
        }
        .journal-result {
          margin-top: 28px;
          padding: 24px;
        }
        .result-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-ghost);
          margin: 12px 0 10px;
        }
        .result-reflection {
          font-size: 15px;
          line-height: 1.85;
          color: var(--text-secondary);
        }
        .result-original {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
          font-size: 13px;
          color: var(--text-ghost);
          line-height: 1.7;
          font-style: italic;
        }
        .result-chat-btn {
          margin-top: 16px;
          font-size: 12px;
        }
        .advanced-insight {
          margin-top: 16px;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          line-height: 1.5;
        }
        .pattern-insight {
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: var(--accent);
        }
        .commit-insight {
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: var(--success);
        }
      `}</style>
    </div>
  )
}
