import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'
import { analyzeDream, generateEmbedding } from '@/lib/gemini'
import { upsertEntry, fetchAllEntries, querySimilar } from '@/lib/pinecone'

/**
 * POST /api/entries — Create a new journal entry
 * Body: { text: string }
 * Auth: Bearer token required
 */
export async function POST(request) {
  try {
    // Auth
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, dreamData } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Entry text is required' }, { status: 400 })
    }

    const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const timestamp = new Date().toISOString()

    // Step 1: Generate embedding
    const embedding = await generateEmbedding(text.trim())

    // Step 2: Retrieve similar past entries for RAG context
    let pastEntries = []
    if (embedding) {
      const similar = await querySimilar(user.uid, embedding, 5)
      pastEntries = similar.map(e => e.text).filter(Boolean)
    }

    // Step 3: Generate summary + 3 sentiments
    const { summary, sentiments } = await analyzeDream(text.trim(), pastEntries, dreamData)
    const normalizedSentiments = Array.isArray(sentiments) ? sentiments : []

    // Step 4: Store in Pinecone
    if (embedding) {
      await upsertEntry(user.uid, entryId, embedding, {
        text: text.trim(),
        summary: summary || '',
        sentiments: normalizedSentiments.join(','),
        mood: normalizedSentiments[0] || dreamData?.emotionalTone || '',
        timestamp,
        dreamData,
        sleepQuality: dreamData?.sleepQuality || '',
        dreamDate: dreamData?.dreamDate || '',
        dreamTime: dreamData?.dreamTime || '',
        notesToSelf: dreamData?.notesToSelf || '',
      })
    }

    return NextResponse.json({
      id: entryId,
      text: text.trim(),
      summary,
      sentiments: normalizedSentiments,
      dreamData,
      timestamp,
    })
  } catch (error) {
    console.error('[api/entries] POST error:', error)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}

/**
 * GET /api/entries — List all entries for the authenticated user
 * Auth: Bearer token required
 */
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entries = await fetchAllEntries(user.uid)
    return NextResponse.json(entries)
  } catch (error) {
    console.error('[api/entries] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}
