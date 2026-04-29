import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'
import { fetchEntry } from '@/lib/pinecone'

/**
 * GET /api/entries/[id] — Fetch a single entry
 */
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const entry = await fetchEntry(user.uid, id)

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('[api/entries/id] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 })
  }
}
