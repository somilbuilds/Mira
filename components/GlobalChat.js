'use client'
import { useState, useEffect, useRef } from 'react'

export default function GlobalChat({ entries, getToken }) {
  const [tabs, setTabs] = useState([{ id: 'default', title: 'New Chat', messages: [], important: false }])
  const [activeTabId, setActiveTabId] = useState('default')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('mira_global_chat_tabs')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.length > 0) {
        setTabs(parsed)
        if (!parsed.find(t => t.id === activeTabId)) {
          setActiveTabId(parsed[0].id)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('mira_global_chat_tabs', JSON.stringify(tabs))
    }
  }, [tabs])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tabs, activeTabId])

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]

  const createNewTab = () => {
    const newTab = { id: `chat_${Date.now()}`, title: 'New Chat', messages: [], important: false }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  const deleteTab = (id) => {
    const updated = tabs.filter(t => t.id !== id)
    if (updated.length === 0) {
      const newTab = { id: `chat_${Date.now()}`, title: 'New Chat', messages: [], important: false }
      setTabs([newTab])
      setActiveTabId(newTab.id)
    } else {
      setTabs(updated)
      if (activeTabId === id) setActiveTabId(updated[0].id)
    }
  }

  const toggleImportant = async (id) => {
    const tabToUpdate = tabs.find(t => t.id === id)
    if (!tabToUpdate) return

    const newImportantStatus = !tabToUpdate.important
    setTabs(tabs.map(t => t.id === id ? { ...t, important: newImportantStatus } : t))

    if (newImportantStatus && tabToUpdate.messages.length > 0) {
      // In a real app, this would send an API request to embed the chat into Pinecone
      console.log('Marking chat as important for RAG:', id)
      try {
        const token = await getToken()
        await fetch('/api/chat/important', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chatId: id, messages: tabToUpdate.messages }),
        })
      } catch (err) {
        console.error('Failed to mark important:', err)
      }
    }
  }

  const sendMessage = async () => {
    const msg = input.trim()
    if (!msg || sending) return

    setInput('')
    setSending(true)

    const userMsg = { role: 'user', content: msg }
    const updatedMessages = [...activeTab.messages, userMsg]
    
    // Auto-generate title if this is the first message
    let newTitle = activeTab.title
    if (activeTab.messages.length === 0) {
      newTitle = msg.substring(0, 20) + '...'
    }

    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, title: newTitle, messages: updatedMessages } : t))

    try {
      const token = await getToken()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: msg,
          messages: updatedMessages,
          global: true
        }),
      })

      const data = await res.json()
      const miraMsg = { role: 'mira', content: data.content || data.error || 'Something went quiet.' }
      
      setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId ? { ...t, messages: [...t.messages, miraMsg] } : t))
    } catch (err) {
      setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId ? { ...t, messages: [...t.messages, { role: 'mira', content: 'Something went quiet. Try again?' }] } : t))
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
    <div className="global-chat">
      <div className="chat-sidebar">
        <button className="btn-primary new-chat-btn" onClick={createNewTab}>+ new chat</button>
        <div className="chat-tabs">
          {tabs.map(tab => (
            <div key={tab.id} className={`chat-tab-item ${activeTabId === tab.id ? 'active' : ''}`}>
              <div className="tab-click-area" onClick={() => setActiveTabId(tab.id)}>
                <span className="tab-title">{tab.title}</span>
                {tab.important && <span className="tab-important-icon">★</span>}
              </div>
              <div className="tab-actions">
                <button className={`btn-ghost tab-star ${tab.important ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleImportant(tab.id); }} title="Add to RAG Memory">★</button>
                <button className="btn-ghost tab-delete" onClick={(e) => { e.stopPropagation(); deleteTab(tab.id); }}>×</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-title">Dream Chat: {activeTab.title}</div>
        </div>

        <div className="chat-messages">
          {activeTab.messages.length === 0 && (
            <div className="chat-empty">
              <p>Ask Mira about your past dreams.</p>
              <p className="chat-empty-hint">"What are some recurring themes in my dreams?"</p>
            </div>
          )}
          {activeTab.messages.map((msg, i) => (
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
          />
          <button
            className="btn-primary chat-send"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
          >
            send
          </button>
        </div>
      </div>

      <style jsx>{`
        .global-chat {
          display: flex;
          height: calc(100vh - 160px);
          animation: fadeIn 0.3s ease-out;
          gap: 20px;
        }
        .chat-sidebar {
          width: 220px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-right: 1px solid var(--border-subtle);
          padding-right: 16px;
        }
        .new-chat-btn {
          width: 100%;
          padding: 10px;
          font-size: 13px;
        }
        .chat-tabs {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .chat-tab-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 13px;
          color: var(--text-tertiary);
          transition: all var(--transition);
        }
        .chat-tab-item:hover {
          background: var(--bg-tertiary);
        }
        .chat-tab-item.active {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
        }
        .tab-click-area {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
        }
        .tab-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tab-important-icon {
          color: var(--accent);
          font-size: 10px;
        }
        .tab-actions {
          display: flex;
          align-items: center;
        }
        .tab-star, .tab-delete {
          padding: 2px 6px;
          font-size: 12px;
          opacity: 0.5;
        }
        .tab-star:hover { color: var(--accent); opacity: 1; }
        .tab-star.active { color: var(--accent); opacity: 1; }
        .tab-delete:hover { color: var(--danger); opacity: 1; }
        
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          margin-bottom: 20px;
          flex-shrink: 0;
        }
        .chat-header-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-tertiary);
          font-size: 14px;
          text-align: center;
        }
        .chat-empty-hint {
          margin-top: 8px;
          font-style: italic;
          color: var(--text-ghost);
          font-size: 12px;
        }
        
        /* Message Styles Reused */
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
