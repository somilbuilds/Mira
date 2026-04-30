'use client'
import { useState, useEffect } from 'react'

export default function Calendar({ entries = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  // Load events from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mira_calendar')
    if (stored) setEvents(JSON.parse(stored))
  }, [])

  // Save events to localStorage
  const saveEvents = (updated) => {
    setEvents(updated)
    localStorage.setItem('mira_calendar', JSON.stringify(updated))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Calendar grid calculations
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const getDateStr = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getEventsForDate = (day) => {
    const dateStr = getDateStr(day)
    return events.filter(e => e.date === dateStr)
  }

  const getJournalEntriesForDate = (day) => {
    const dateStr = getDateStr(day)
    return entries.filter(e => e.timestamp && e.timestamp.startsWith(dateStr))
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const selectDate = (day) => {
    if (!day) return
    const dateStr = getDateStr(day)
    setSelectedDate(dateStr)
    setShowAddForm(false)
    setNewTitle('')
    setNewDesc('')
  }

  const addEvent = () => {
    if (!newTitle.trim() || !selectedDate) return
    const updated = [...events, {
      id: `evt_${Date.now()}`,
      date: selectedDate,
      title: newTitle.trim(),
      description: newDesc.trim(),
    }]
    saveEvents(updated)
    setNewTitle('')
    setNewDesc('')
    setShowAddForm(false)
  }

  const deleteEvent = (eventId) => {
    const updated = events.filter(e => e.id !== eventId)
    saveEvents(updated)
  }

  const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate) : []
  const selectedJournalEntries = selectedDate ? entries.filter(e => e.timestamp && e.timestamp.startsWith(selectedDate)) : []

  const moodColors = {
    calm: 'var(--mood-calm)', grateful: 'var(--mood-grateful)',
    hopeful: 'var(--mood-hopeful)', anxious: 'var(--mood-anxious)',
    stressed: 'var(--mood-stressed)', frustrated: 'var(--mood-frustrated)',
    sad: 'var(--mood-sad)', confused: 'var(--mood-confused)',
    tired: 'var(--mood-tired)', excited: 'var(--mood-excited)',
    proud: 'var(--mood-proud)', restless: 'var(--mood-restless)',
  }

  // Get upcoming events (next 7 days)
  const upcoming = events
    .filter(e => {
      const d = new Date(e.date)
      const diff = (d - today) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <div className="calendar-wrapper">
      {/* Calendar Header */}
      <div className="cal-header">
        <button className="btn-ghost cal-nav" onClick={prevMonth}>←</button>
        <h3 className="cal-month">{monthName}</h3>
        <button className="btn-ghost cal-nav" onClick={nextMonth}>→</button>
      </div>

      {/* Calendar Grid */}
      <div className="cal-grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="cal-day-label">{d}</div>
        ))}
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="cal-cell empty" />
          const dateStr = getDateStr(day)
          const dayEvents = getEventsForDate(day)
          const dayEntries = getJournalEntriesForDate(day)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const hasActivity = dayEvents.length > 0 || dayEntries.length > 0

          // Gather sentiments for the day
          let daySentiments = []
          dayEntries.forEach(entry => {
            if (entry.sentiments) {
              daySentiments.push(...entry.sentiments.split(','))
            }
          })
          // keep up to 3 unique sentiments to show as dots
          const uniqueSentiments = [...new Set(daySentiments)].slice(0, 3)

          return (
            <div
              key={i}
              className={`cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasActivity ? 'has-events' : ''}`}
              onClick={() => selectDate(day)}
            >
              <span className="cal-day-num">{day}</span>
              {dayEvents.length > 0 && uniqueSentiments.length === 0 && (
                <div className="cal-dots">
                  {dayEvents.slice(0, 3).map((_, j) => (
                    <span key={j} className="cal-dot" />
                  ))}
                </div>
              )}
              {uniqueSentiments.length > 0 && (
                <div className="cal-dots">
                  {uniqueSentiments.map((sentiment, j) => (
                    <span key={`sent-${j}`} className="cal-dot" style={{ backgroundColor: moodColors[sentiment] || 'var(--accent)' }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Upcoming Events */}
      {upcoming.length > 0 && !selectedDate && (
        <div className="cal-upcoming">
          <h4 className="cal-section-title">upcoming (next 7 days)</h4>
          {upcoming.map(evt => (
            <div key={evt.id} className="cal-event-item card">
              <div className="evt-date">{new Date(evt.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              <div className="evt-title">{evt.title}</div>
              {evt.description && <div className="evt-desc">{evt.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="cal-detail animate-fade-in">
          <div className="cal-detail-header">
            <h4 className="cal-section-title">
              {new Date(selectedDate + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>
            <button className="btn-ghost" onClick={() => setSelectedDate(null)}>close</button>
          </div>

          {selectedEvents.length === 0 && selectedJournalEntries.length === 0 && !showAddForm && (
            <p className="cal-empty">no events or dreams on this date</p>
          )}

          {selectedJournalEntries.map(entry => (
            <div key={entry.id} className="cal-event-item card" style={{borderLeft: '2px solid var(--accent)'}}>
              <div className="evt-title">Dream Entry</div>
              <div className="evt-desc">{entry.summary?.substring(0, 60)}...</div>
              <div className="sentiments-container" style={{display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8}}>
                {entry.sentiments && entry.sentiments.split(',').map((sentiment, i) => (
                  <span key={i} style={{fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${moodColors[sentiment] || 'var(--bg-tertiary)'}20`, color: moodColors[sentiment] || 'var(--text-tertiary)'}}>
                    {sentiment}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {selectedEvents.map(evt => (
            <div key={evt.id} className="cal-event-item card">
              <div className="evt-title">{evt.title}</div>
              {evt.description && <div className="evt-desc">{evt.description}</div>}
              <button className="btn-ghost evt-delete" onClick={() => deleteEvent(evt.id)}>remove</button>
            </div>
          ))}

          {showAddForm ? (
            <div className="cal-add-form card">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="event title"
                className="cal-form-input"
                autoFocus
                id="cal-event-title"
              />
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="description (optional)"
                className="cal-form-input"
                id="cal-event-desc"
              />
              <div className="cal-form-actions">
                <button className="btn-primary" onClick={addEvent} disabled={!newTitle.trim()} id="cal-save-btn">save</button>
                <button className="btn-ghost" onClick={() => setShowAddForm(false)}>cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-ghost cal-add-btn" onClick={() => setShowAddForm(true)} id="cal-add-event-btn">
              + add event
            </button>
          )}
        </div>
      )}

      <p className="cal-hint">
        💡 Events you add here are shared with Mira during conversations, so she can factor in your deadlines and milestones.
      </p>

      <style jsx>{`
        .calendar-wrapper { animation: fadeIn 0.3s ease-out; }
        .cal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .cal-month {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .cal-nav { padding: 6px 12px; font-size: 14px; }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 24px;
        }
        .cal-day-label {
          text-align: center;
          font-size: 11px;
          color: var(--text-ghost);
          padding: 8px 0;
          letter-spacing: 0.05em;
        }
        .cal-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition);
          position: relative;
          gap: 2px;
        }
        .cal-cell:not(.empty):hover {
          background: var(--bg-tertiary);
        }
        .cal-cell.today {
          background: var(--accent-subtle);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .cal-cell.selected {
          background: var(--accent);
        }
        .cal-cell.selected .cal-day-num { color: white; }
        .cal-day-num {
          font-size: 13px;
          color: var(--text-tertiary);
          font-weight: 400;
        }
        .cal-cell.today .cal-day-num { color: var(--accent); font-weight: 600; }
        .cal-dots {
          display: flex;
          gap: 2px;
        }
        .cal-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
        }
        .cal-cell.selected .cal-dot { background: white; }
        .cal-section-title {
          font-size: 13px;
          color: var(--text-tertiary);
          font-weight: 500;
          margin-bottom: 12px;
        }
        .cal-upcoming { margin-bottom: 24px; }
        .cal-detail { margin-bottom: 24px; }
        .cal-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .cal-detail-header .cal-section-title { margin-bottom: 0; }
        .cal-empty {
          font-size: 13px;
          color: var(--text-ghost);
          margin-bottom: 12px;
        }
        .cal-event-item {
          padding: 14px 16px;
          margin-bottom: 8px;
        }
        .evt-date {
          font-size: 11px;
          color: var(--accent);
          margin-bottom: 4px;
          letter-spacing: 0.03em;
        }
        .evt-title {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .evt-desc {
          font-size: 12px;
          color: var(--text-ghost);
          margin-top: 4px;
        }
        .evt-delete {
          margin-top: 8px;
          font-size: 11px;
          padding: 4px 10px;
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.2);
        }
        .cal-add-form { padding: 16px; }
        .cal-form-input {
          margin-bottom: 8px;
          padding: 10px 12px;
          font-size: 13px;
        }
        .cal-form-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .cal-form-actions .btn-primary { padding: 8px 16px; font-size: 13px; }
        .cal-form-actions .btn-ghost { padding: 8px 16px; font-size: 13px; }
        .cal-add-btn { font-size: 13px; }
        .cal-hint {
          font-size: 12px;
          color: var(--text-ghost);
          text-align: center;
          padding: 20px 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}
