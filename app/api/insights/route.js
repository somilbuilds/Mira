import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'
import { fetchAllEntries } from '@/lib/pinecone'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const MODEL_CHAT = 'gemini-2.5-flash'

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json()
    
    // Fetch user's entries (up to last 100 for context)
    const entries = await fetchAllEntries(user.uid)
    if (!entries || entries.length < 3) {
      return NextResponse.json({ result: "Not enough entries to generate insights yet. Keep journaling!" })
    }

    // Limit to 50 entries to save tokens, sorted newest first
    const recentEntries = entries.slice(0, 50)
    const historyText = recentEntries
      .map((e) => `[${e.timestamp}] MOOD:${e.mood || e.sentiments || 'unknown'} | ${e.text}`)
      .join('\n\n')

    let prompt = ''

    if (type === 'drift') {
      prompt = `You are Mira, a mentor analyzing a user's journal history over time.
Review the following chronological journal entries. Identify the "drift" — how their dominant themes, struggles, and moods have shifted from the oldest entries provided to the newest ones.
Write a 3-4 paragraph "Drift Report". Be direct, honest, and consolidate patterns. Don't be overly dramatic, just state the shifts clearly.

Entries:
${historyText}`
    } else if (type === 'chapters') {
      prompt = `You are Mira, a mentor. Review the following chronological journal entries.
Cluster these entries into 3 to 5 "Life Chapters" based on dominant themes or shifts in circumstances.
For each chapter, provide:
1. A Title (e.g., "The Burnout Period")
2. The Date Range
3. A 2-sentence summary of the core theme and growth during that time.

Entries:
${historyText}`
    } else {
      return NextResponse.json({ error: 'Invalid insight type' }, { status: 400 })
    }

    const result = await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: prompt,
    })

    return NextResponse.json({ result: result.text })
  } catch (error) {
    console.error('[api/insights] error:', error)
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 })
  }
}
