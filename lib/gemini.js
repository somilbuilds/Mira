import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const MODEL_CHAT = 'gemini-2.5-flash'
const MODEL_EMBED = 'gemini-embedding-001'
const EMBED_DIMS = 768

/**
 * Generate a detailed summary + 3 sentiments from a dream journal entry.
 * Returns { summary: string, sentiments: string[] }
 */
export async function analyzeDream(entryText, pastEntries = [], dreamData = {}) {
  let memoryBlock = ''
  if (pastEntries.length > 0) {
    const joined = pastEntries.map(e => `- ${e}`).join('\n')
    memoryBlock = `\n\nRelevant past dream entries (for pattern recognition):\n${joined}\n`
  }

  let dreamDetailsBlock = ''
  if (dreamData && Object.keys(dreamData).length > 0) {
    dreamDetailsBlock = `\n\nStructured Dream Details provided by user:\n`
    for (const [key, value] of Object.entries(dreamData)) {
      if (value) {
         dreamDetailsBlock += `- ${key}: ${value}\n`
      }
    }
  }

  const prompt = `You are a perceptive and empathetic dream analyst. A user is sharing a dream they had.
Read it carefully. Your task is to:
1. Write a highly detailed, beautifully rephrased summary of what the user saw and experienced in their dream. Expand on the imagery to make it vivid, but stay true to what the user described. Do not just output a short summary, write a thoughtful rephrasing of their dream.
2. Identify EXACTLY 3 dominant emotions or sentiments present in the dream.

Format your response EXACTLY like this:
SENTIMENTS: <emotion 1>, <emotion 2>, <emotion 3>
SUMMARY: <your detailed rephrasing of the dream>
${memoryBlock}${dreamDetailsBlock}
Dream entry:
${entryText}`

  try {
    const result = await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: prompt,
    })

    const text = result.text || ''
    const sentimentsMatch = text.match(/SENTIMENTS:\s*([^\n]+)/i)
    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]+)/i)

    let sentiments = ['curious', 'mysterious', 'calm'] // fallbacks
    if (sentimentsMatch) {
      sentiments = sentimentsMatch[1]
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0)
        .slice(0, 3)
      while (sentiments.length < 3) sentiments.push('neutral')
    }

    return {
      sentiments,
      summary: summaryMatch ? summaryMatch[1].trim() : text.trim(),
    }
  } catch (error) {
    console.error('[mira] analyzeDream error:', error.message)
    return { sentiments: ['neutral', 'neutral', 'neutral'], summary: null }
  }
}

/**
 * Generate a chat response with RAG context.
 */
export async function generateChatResponse({
  entryText,
  reflection,
  messages,
  pastEntries = [],
  calendarEvents = [],
}) {
  let memoryBlock = ''
  if (pastEntries.length > 0) {
    const joined = pastEntries.map(e => `- ${e}`).join('\n')
    memoryBlock = `\nRelevant past entries (memory):\n${joined}\n`
  }

  let calendarBlock = ''
  if (calendarEvents.length > 0) {
    const joined = calendarEvents.map(e => `- ${e.date}: ${e.title}`).join('\n')
    calendarBlock = `\nUpcoming events/deadlines:\n${joined}\n`
  }

  // Only include last 6 messages to save tokens
  const recentMessages = messages.slice(-6)
  const historyStr = recentMessages
    .map(m => `${m.role === 'user' ? 'User' : 'Mira'}: ${m.content}`)
    .join('\n')

  const prompt = `You are Mira, a friendly and insightful dream interpreter. You have context about this person's past dreams.

Be engaging and thoughtful. Analyze their dreams creatively but also connect them to waking life if appropriate. Keep responses grounded. Do not rely heavily on the past entries (memory) unless the user specifically asks about recurring themes or past dreams. Use your own intelligence to respond naturally to the current conversation first, and only pull from memory when highly relevant.

Original dream entry being discussed (if any):
${entryText || 'N/A'}

Your initial summary of that dream:
${reflection || 'N/A'}
${memoryBlock}
Conversation:
${historyStr}

Mira:`

  try {
    const result = await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: prompt,
    })
    return result.text?.trim() || "I'm here, but something went quiet on my end. Try again?"
  } catch (error) {
    console.error('[mira] generateChatResponse error:', error.message)
    return null
  }
}

/**
 * Generate a 768-dim embedding for text.
 */
export async function generateEmbedding(text) {
  try {
    const result = await ai.models.embedContent({
      model: MODEL_EMBED,
      contents: text,
      config: {
        outputDimensionality: EMBED_DIMS,
      },
    })
    return result.embeddings?.[0]?.values || null
  } catch (error) {
    console.error('[mira] generateEmbedding error:', error.message)
    return null
  }
}
