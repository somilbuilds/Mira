import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'
import { generateEmbedding } from '@/lib/gemini'
import { upsertEntry } from '@/lib/pinecone'

/**
 * POST /api/chat/important — Mark a chat as important and add to RAG
 * Body: { chatId, messages[] }
 * Auth: Bearer token required
 */
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId, messages = [] } = await request.json()

    if (!chatId || messages.length === 0) {
      return NextResponse.json({ error: 'chatId and messages are required' }, { status: 400 })
    }

    // Convert messages to a string block
    const chatText = messages.map(m => `${m.role === 'user' ? 'User' : 'Mira'}: ${m.content}`).join('\n')

    // Generate embedding for the chat text
    const embedding = await generateEmbedding(chatText)

    if (embedding) {
      const entryId = `chat_${chatId}`
      const timestamp = new Date().toISOString()
      
      await upsertEntry(user.uid, entryId, embedding, {
        text: "Important Chat Session",
        summary: chatText,
        timestamp,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/chat/important] POST error:', error)
    return NextResponse.json({ error: 'Failed to mark chat as important' }, { status: 500 })
  }
}
