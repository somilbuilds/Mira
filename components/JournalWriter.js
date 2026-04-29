'use client'
import { useState } from 'react'

export default function JournalWriter({ getToken, onEntryCreated, onOpenChat }) {
  const [text, setText] = useState('')
  const [isUnsentLetter, setIsUnsentLetter] = useState(false)
  const [recipient, setRecipient] = useState('')
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
          options: { isUnsentLetter, recipient: recipient.trim() }
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
        <label style={{fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', gap: 8, alignItems: 'center'}}>
          <input 
            type="checkbox" 
            checked={isUnsentLetter} 
            onChange={e => setIsUnsentLetter(e.target.checked)} 
          />
          Unsent Letter Mode
        </label>
      </div>

      {isUnsentLetter && (
        <input
          type="text"
          placeholder="To whom?"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          style={{marginBottom: 12}}
        />
      )}

      <textarea
        id="journal-input"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="what's on your mind today..."
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
          {result.mood && (
            <span
              className="mood-tag"
              style={{
                color: moodColors[result.mood] || 'var(--text-tertiary)',
                borderColor: moodColors[result.mood] || 'var(--border-default)',
                background: `${moodColors[result.mood] || 'var(--bg-tertiary)'}15`,
              }}
            >
              {result.mood}
            </span>
          )}
          <div className="result-label">mira</div>
          <div className="result-reflection">{result.reflection || 'Entry saved, but Mira couldn\'t reflect this time.'}</div>
          
          {result.pattern && (
            <div className="advanced-insight pattern-insight">
              <strong>Pattern Spotted:</strong> {result.pattern}
            </div>
          )}
          {result.commitment && (
            <div className="advanced-insight commit-insight">
              <strong>Commitment Logged:</strong> {result.commitment}
            </div>
          )}

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
