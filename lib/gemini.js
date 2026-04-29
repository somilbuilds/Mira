import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const MODEL_CHAT = 'gemini-2.5-flash'
const MODEL_EMBED = 'gemini-embedding-001'
const EMBED_DIMS = 768

/**
 * Generate a reflection + mood from a journal entry in a single API call.
 * Returns { reflection: string, mood: string }
 */
export async function generateReflection(entryText, pastEntries = [], options = { isUnsentLetter: false, recipient: '' }) {
  let memoryBlock = ''
  if (pastEntries.length > 0) {
    const joined = pastEntries.map(e => `- ${e}`).join('\n')
    memoryBlock = `\n\nRelevant past journal entries (for pattern recognition):\n${joined}\n`
  }

  let prompt = ''
  
  if (options.isUnsentLetter && options.recipient) {
    prompt = `You are Mira, a neutral observer. The user has written an "unsent letter" to ${options.recipient}.
Read it carefully. In 2-3 sentences, reflect on the relationship dynamics shown in the letter and any past entries. Don't speak as the recipient. Speak as an objective, wise observer pointing out the emotional truth of the relationship.
Also identify the dominant mood. Pick ONE word from: calm, grateful, hopeful, anxious, stressed, frustrated, sad, confused, tired, excited, proud, restless.`
  } else {
    prompt = `You are Mira, a thoughtful, friendly mentor. Someone shares a journal entry with you.
Read it carefully. In 2-3 sentences, reflect back what matters most. Be direct and warm. End with one sharp question.
Also identify the dominant mood. Pick ONE word from: calm, grateful, hopeful, anxious, stressed, frustrated, sad, confused, tired, excited, proud, restless.`
  }

  prompt += `

ADVANCED TASKS:
1. COMMITMENT: If the user explicitly promises or intends to do a specific action in the future (e.g., "I will talk to my boss tomorrow"), extract it. If none, output NONE.
2. PATTERN: Look at the past entries and this new one. Is there a strong repeating theme, word, or behavior? (e.g. "You've mentioned feeling overwhelmed 4 times when discussing work"). If yes, state it briefly. If no, output NONE.

Format your response EXACTLY like this:
MOOD: <one word>
COMMITMENT: <commitment or NONE>
PATTERN: <pattern or NONE>
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
    const moodMatch = text.match(/MOOD:\s*([^\n]+)/i)
    const commitMatch = text.match(/COMMITMENT:\s*([^\n]+)/i)
    const patternMatch = text.match(/PATTERN:\s*([^\n]+)/i)
    const reflectionMatch = text.match(/REFLECTION:\s*([\s\S]+)/i)

    const commitment = commitMatch && commitMatch[1].trim() !== 'NONE' ? commitMatch[1].trim() : null
    const pattern = patternMatch && patternMatch[1].trim() !== 'NONE' ? patternMatch[1].trim() : null

    return {
      mood: moodMatch ? moodMatch[1].toLowerCase().trim() : 'calm',
      reflection: reflectionMatch ? reflectionMatch[1].trim() : text.trim(),
      commitment,
      pattern,
    }
  } catch (error) {
    console.error('[mira] generateReflection error:', error.message)
    return { mood: null, reflection: null, commitment: null, pattern: null }
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

  const prompt = `You are Mira, a friendly and wise mentor. You have context about this person's journal entries and important dates.

Be honest but gentle. Give practical, grounded suggestions. Keep responses to 2-4 sentences unless explicitly asked for depth. Do not poke at past traumas or push the user to analyze past entries unless it's strictly necessary and helpful for the current conversation. Be supportive.

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
