import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const MODEL_CHAT = 'gemini-2.0-flash-lite'
const MODEL_EMBED = 'gemini-embedding-001'
const EMBED_DIMS = 768

/**
 * Generate a reflection + mood from a journal entry in a single API call.
 * Returns { reflection: string, mood: string }
 */
export async function generateReflection(entryText, pastEntries = []) {
  let memoryBlock = ''
  if (pastEntries.length > 0) {
    const joined = pastEntries.map(e => `- ${e}`).join('\n')
    memoryBlock = `\n\nRelevant past journal entries (for pattern recognition):\n${joined}\n`
  }

  const prompt = `You are Mira, a thoughtful mentor. Someone shares a journal entry with you.

Read it carefully. In 2-3 sentences, reflect back what matters most — the core tension, the unspoken question, or the pattern worth noticing. Be direct and warm, not clinical. If past entries are provided, weave patterns you notice naturally. End with one sharp question that pushes their thinking forward.

Also identify the dominant mood. Pick ONE word from: calm, grateful, hopeful, anxious, stressed, frustrated, sad, confused, tired, excited, proud, restless.

Format your response EXACTLY like this:
MOOD: <one word>
REFLECTION: <your reflection text>
${memoryBlock}
Journal entry:
${entryText}`

  try {
    const result = await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: prompt,
    })

    const text = result.text || ''
    const moodMatch = text.match(/MOOD:\s*(\w+)/i)
    const reflectionMatch = text.match(/REFLECTION:\s*([\s\S]+)/i)

    return {
      mood: moodMatch ? moodMatch[1].toLowerCase().trim() : 'calm',
      reflection: reflectionMatch ? reflectionMatch[1].trim() : text.trim(),
    }
  } catch (error) {
    console.error('[mira] generateReflection error:', error.message)
    return { mood: null, reflection: null }
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

  const prompt = `You are Mira, a mentor who thinks before speaking. You have context about this person's journal entries and important dates.

Be direct, be honest, consolidate patterns you see. Give practical, grounded suggestions — not motivational fluff. Keep responses to 2-4 sentences unless the person explicitly asks for depth. If they're stuck in a loop, name it. If they need action, give one clear step.

Never diagnose. Never give unsolicited medical advice. If someone seems in genuine distress, gently suggest they talk to someone they trust.

Original journal entry:
${entryText}

Your initial reflection:
${reflection}
${memoryBlock}${calendarBlock}
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
