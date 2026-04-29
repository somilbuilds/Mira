'use client'
import { useState, useEffect, useRef } from 'react'

export default function ChatPanel({ entry, onBack, getToken }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`mira_chat_${entry.id}`)
    if (stored) {
      setMessages(JSON.parse(stored))
    } else if (entry.reflection) {
      // Show the initial reflection as Mira's first message
      const initial = [{ role: 'mira', content: entry.reflection }]
      setMessages(initial)
      localStorage.setItem(`mira_chat_${entry.id}`, JSON.stringify(initial))
    }
    inputRef.current?.focus()
  }, [entry.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Persist to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`mira_chat_${entry.id}`, JSON.stringify(messages))
    }
  }, [messages, entry.id])

  // Get calendar events from localStorage for context
  const getCalendarEvents = () => {
    try {
      const stored = localStorage.getItem('mira_calendar')
      if (!stored) return []
      const events = JSON.parse(stored)
      const now = new Date()
      // Only include events in the next 14 days
      return events.filter(e => {
        const eventDate = new Date(e.date)
        const diff = (eventDate - now) / (1000 * 60 * 60 * 24)
        return diff >= -1 && diff <= 14
      })
    } catch { return [] }
  }

  const sendMessage = async () => {
    const msg = input.trim()
    if (!msg || sending) return

    setInput('')
    setSending(true)

    const userMsg = { role: 'user', content: msg }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)

    try {
      const token = await getToken()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entryId: entry.id,
          message: msg,
          messages: updatedMessages,
          calendarEvents: getCalendarEvents(),
        }),
      })

      const data = await res.json()
      const miraMsg = { role: 'mira', content: data.content || data.error || 'Something went quiet.' }
      setMessages(prev => [...prev, miraMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'mira',
        content: "Something went quiet on my end. Try again?",
      }])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <button className="btn-ghost chat-back" onClick={onBack} id="chat-back-btn">
          ← back
        </button>
        <div className="chat-entry-preview">"{entry.text}"</div>
      </div>

      <div className="chat-messages" id="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="chat-msg-label">
              {msg.role === 'mira' ? 'mira' : 'you'}
            </div>
            <div className="chat-msg-text">{msg.content}</div>
          </div>
        ))}
        {sending && (
          <div className="chat-typing">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="say something..."
          rows={1}
          disabled={sending}
          id="chat-input"
        />
        <button
          className="btn-primary chat-send"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          id="chat-send-btn"
        >
          send
        </button>
      </div>

      <style jsx>{`
        .chat-panel {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 160px);
          animation: fadeIn 0.3s ease-out;
        }
        .chat-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-shrink: 0;
        }
        .chat-back { padding: 6px 12px; font-size: 12px; }
        .chat-entry-preview {
          font-size: 13px;
          color: var(--text-ghost);
          font-style: italic;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 16px;
        }
        .chat-msg {
          max-width: 85%;
          padding: 14px 18px;
          border-radius: var(--radius-lg);
          font-size: 14px;
          line-height: 1.75;
          animation: fadeIn 0.3s ease-out;
        }
        .chat-msg.user {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          color: var(--text-primary);
          align-self: flex-end;
        }
        .chat-msg.mira {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          align-self: flex-start;
        }
        .chat-msg-label {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-ghost);
          margin-bottom: 6px;
        }
        .chat-msg.user .chat-msg-label { text-align: right; }
        .chat-typing {
          display: flex;
          gap: 4px;
          padding: 12px 18px;
          align-self: flex-start;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-ghost);
          animation: pulse-soft 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .chat-input-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          flex-shrink: 0;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
        }
        .chat-input {
          flex: 1;
          min-height: 44px;
          max-height: 120px;
          resize: none;
          padding: 12px 14px;
          font-size: 14px;
        }
        .chat-send {
          padding: 12px 20px;
          font-size: 13px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
