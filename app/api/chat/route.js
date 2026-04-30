import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'
import { generateChatResponse, generateEmbedding } from '@/lib/gemini'
import { fetchEntry, querySimilar } from '@/lib/pinecone'

/**
 * POST /api/chat — Send a message and get Mira's response
 * Body: { entryId, message, messages[], calendarEvents[] }
 * Auth: Bearer token required
 */
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entryId, message, messages = [], calendarEvents = [], global = false } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    let pastEntries = []
    let entryText = ''
    let reflection = ''

    if (global) {
      // RAG across all based on the current message
      try {
        const embedding = await generateEmbedding(message)
        if (embedding) {
          const similar = await querySimilar(user.uid, embedding, 5)
          pastEntries = similar.map(e => `Dream Summary: ${e.summary || e.text}`).filter(Boolean)
        }
      } catch (e) {
        console.error('[api/chat] Global RAG lookup failed:', e.message)
      }
    } else {
      if (!entryId) {
        return NextResponse.json({ error: 'entryId required for local chat' }, { status: 400 })
      }

      // Load the entry this conversation is about
      const entry = await fetchEntry(user.uid, entryId)
      if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
      }

      entryText = entry.text
      reflection = entry.summary || entry.reflection || ''

      // RAG: find similar past entries using the entry's embedding
      try {
        const embedding = await generateEmbedding(entry.text)
        if (embedding) {
          const similar = await querySimilar(user.uid, embedding, 3, entryId)
          pastEntries = similar.map(e => e.summary || e.text).filter(Boolean)
        }
      } catch (e) {
        // RAG failure is non-fatal — continue without memory
        console.error('[api/chat] RAG lookup failed:', e.message)
      }
    }

    // Build full messages list including the new message
    const allMessages = [...messages, { role: 'user', content: message.trim() }]

    // Generate Mira's response
    const reply = await generateChatResponse({
      entryText: entryText,
      reflection: reflection,
      messages: allMessages,
      pastEntries,
      calendarEvents,
    })

    if (!reply) {
      return NextResponse.json({
        role: 'mira',
        content: "I'm here, but something went quiet on my end. Try again?",
      })
    }

    return NextResponse.json({
      role: 'mira',
      content: reply,
    })
  } catch (error) {
    console.error('[api/chat] POST error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
