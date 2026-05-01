 'use client'
import { useEffect, useMemo, useState } from 'react'

const SECTION_LABELS = {
  people: 'People',
  places: 'Places',
  symbols: 'Symbols',
  lucidity: 'Lucidity and nightmare',
  bodySensation: 'Body sensations',
  recurring: 'Recurring markers',
  tags: 'Tags',
  reflection: 'Reflection prompts',
}

const DEFAULT_FORM = {
  text: '',
  dreamDate: '',
  dreamTime: '',
  emotionalTone: '',
  sleepQuality: 5,
  notesToSelf: '',
  optionalEnabled: {
    people: false,
    places: false,
    symbols: false,
    lucidity: true,
    bodySensation: false,
    recurring: false,
    tags: true,
    reflection: false,
  },
  details: {
    people: '',
    places: '',
    symbols: '',
    lucidity: 5,
    isNightmare: false,
    bodySensation: '',
    recurring: '',
    tags: '',
    reflectionPrompt: '',
  },
}

function getInitialDateTime() {
  const now = new Date()
  const date = now.toISOString().split('T')[0]
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return { date, time }
}

export default function JournalWriter({ userId, getToken, onEntryCreated, onOpenChat }) {
  const initialDateTime = useMemo(() => getInitialDateTime(), [])
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    dreamDate: initialDateTime.date,
    dreamTime: initialDateTime.time,
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const draftKey = `mira_journal_draft_${userId || 'anon'}`

  useEffect(() => {
    if (!userId) return
    try {
      const stored = localStorage.getItem(draftKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        setForm((prev) => ({
          ...prev,
          ...parsed,
          optionalEnabled: { ...prev.optionalEnabled, ...(parsed.optionalEnabled || {}) },
          details: { ...prev.details, ...(parsed.details || {}) },
        }))
      }
    } catch (e) {
      console.error('Failed to restore draft', e)
    }
  }, [draftKey, userId])

  useEffect(() => {
    if (!userId) return
    localStorage.setItem(draftKey, JSON.stringify(form))
  }, [draftKey, form, userId])

  const submit = async () => {
    if (!form.text.trim() || submitting) return

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
          text: form.text.trim(),
          dreamData: {
            dreamDate: form.dreamDate,
            dreamTime: form.dreamTime,
            emotionalTone: form.emotionalTone,
            sleepQuality: Number(form.sleepQuality),
            notesToSelf: form.notesToSelf,
            optionalEnabled: form.optionalEnabled,
            details: form.details,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Something went wrong')
      }

      const data = await res.json()
      setResult(data)
      const freshDateTime = getInitialDateTime()
      setForm({
        ...DEFAULT_FORM,
        dreamDate: freshDateTime.date,
        dreamTime: freshDateTime.time,
      })
      localStorage.removeItem(draftKey)
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
        <span className="journal-heading">Dream capture</span>
      </div>

      <div className="journal-core-grid card">
        <label className="field">
          <span>Dream date</span>
          <input
            type="date"
            value={form.dreamDate}
            onChange={(e) => setForm((prev) => ({ ...prev, dreamDate: e.target.value }))}
          />
        </label>
        <label className="field">
          <span>Dream time</span>
          <input
            type="time"
            value={form.dreamTime}
            onChange={(e) => setForm((prev) => ({ ...prev, dreamTime: e.target.value }))}
          />
        </label>
        <label className="field">
          <span>Emotional tone</span>
          <input
            type="text"
            placeholder="e.g. uneasy, curious, relieved"
            value={form.emotionalTone}
            onChange={(e) => setForm((prev) => ({ ...prev, emotionalTone: e.target.value }))}
          />
        </label>
        <label className="field">
          <span>Sleep quality (1-10): {form.sleepQuality}</span>
          <input
            type="range"
            min="1"
            max="10"
            value={form.sleepQuality}
            onChange={(e) => setForm((prev) => ({ ...prev, sleepQuality: e.target.value }))}
          />
        </label>
      </div>

      <textarea
        id="journal-input"
        value={form.text}
        onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
        onKeyDown={handleKeyDown}
        placeholder="Write your dream in as much detail as you remember..."
        rows={7}
        disabled={submitting}
      />

      <label className="field notes-field">
        <span>Notes to self (optional)</span>
        <textarea
          value={form.notesToSelf}
          onChange={(e) => setForm((prev) => ({ ...prev, notesToSelf: e.target.value }))}
          rows={3}
          placeholder="What do you want to remember or revisit later?"
          disabled={submitting}
        />
      </label>

      <div className="optional-builder card">
        <div className="optional-header">
          <h3>Customize optional sections</h3>
          <p>Turn on only what matters for this dream.</p>
        </div>
        <div className="toggle-grid">
          {Object.keys(SECTION_LABELS).map((key) => (
            <label key={key} className="toggle-item">
              <input
                type="checkbox"
                checked={form.optionalEnabled[key]}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    optionalEnabled: {
                      ...prev.optionalEnabled,
                      [key]: e.target.checked,
                    },
                  }))
                }
              />
              <span>{SECTION_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="optional-sections">
        {form.optionalEnabled.people && (
          <label className="field">
            <span>People in dream</span>
            <input
              type="text"
              value={form.details.people}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, details: { ...prev.details, people: e.target.value } }))
              }
              placeholder="Names, roles, relationships"
            />
          </label>
        )}
        {form.optionalEnabled.places && (
          <label className="field">
            <span>Places and setting</span>
            <input
              type="text"
              value={form.details.places}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, details: { ...prev.details, places: e.target.value } }))
              }
              placeholder="Where did it happen?"
            />
          </label>
        )}
        {form.optionalEnabled.symbols && (
          <label className="field">
            <span>Symbols and themes</span>
            <input
              type="text"
              value={form.details.symbols}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, details: { ...prev.details, symbols: e.target.value } }))
              }
              placeholder="Objects, animals, motifs"
            />
          </label>
        )}
        {form.optionalEnabled.lucidity && (
          <div className="card optional-card">
            <label className="field">
              <span>Lucidity (1-10): {form.details.lucidity}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={form.details.lucidity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, details: { ...prev.details, lucidity: Number(e.target.value) } }))
                }
              />
            </label>
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={form.details.isNightmare}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, details: { ...prev.details, isNightmare: e.target.checked } }))
                }
              />
              <span>Mark as nightmare</span>
            </label>
          </div>
        )}
        {form.optionalEnabled.bodySensation && (
          <label className="field">
            <span>Body sensations</span>
            <input
              type="text"
              value={form.details.bodySensation}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, details: { ...prev.details, bodySensation: e.target.value } }))
              }
              placeholder="Heavy chest, floating, numb, energetic..."
            />
          </label>
        )}
        {form.optionalEnabled.recurring && (
          <label className="field">
            <span>Recurring markers</span>
            <input
              type="text"
              value={form.details.recurring}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, details: { ...prev.details, recurring: e.target.value } }))
              }
              placeholder="Any repeats from past dreams?"
            />
          </label>
        )}
        {form.optionalEnabled.tags && (
          <label className="field">
            <span>Tags</span>
            <input
              type="text"
              value={form.details.tags}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, details: { ...prev.details, tags: e.target.value } }))
              }
              placeholder="comma separated tags"
            />
          </label>
        )}
        {form.optionalEnabled.reflection && (
          <label className="field">
            <span>Reflection prompt</span>
            <textarea
              value={form.details.reflectionPrompt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, details: { ...prev.details, reflectionPrompt: e.target.value } }))
              }
              rows={2}
              placeholder="What question do you want Mira to focus on?"
            />
          </label>
        )}
      </div>

      <div className="journal-actions">
        <button
          className="btn-primary"
          onClick={submit}
          disabled={!form.text.trim() || submitting}
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
        .journal-heading {
          font-size: 14px;
          color: var(--text-muted);
        }
        .journal-core-grid {
          margin-bottom: 14px;
          padding: 14px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field span {
          font-size: 12px;
          color: var(--text-muted);
        }
        .notes-field {
          margin-top: 12px;
        }
        .optional-builder {
          margin-top: 12px;
          padding: 14px;
        }
        .optional-header h3 {
          font-size: 14px;
          margin-bottom: 2px;
        }
        .optional-header p {
          font-size: 12px;
          color: var(--text-ghost);
          margin-bottom: 12px;
        }
        .toggle-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .toggle-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .optional-sections {
          margin-top: 12px;
          display: grid;
          gap: 10px;
        }
        .optional-card {
          padding: 12px;
          display: grid;
          gap: 8px;
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

        @media (max-width: 700px) {
          .journal-core-grid,
          .toggle-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
