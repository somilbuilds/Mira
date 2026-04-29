import { Pinecone } from '@pinecone-database/pinecone'

let _client = null
let _index = null

function getIndex() {
  if (!_index) {
    _client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    _index = _client.index(process.env.PINECONE_INDEX)
  }
  return _index
}

/**
 * Upsert a journal entry as a vector with metadata.
 * Namespace = userId (isolates each user's data).
 */
export async function upsertEntry(userId, entryId, embedding, metadata) {
  const index = getIndex()
  const ns = index.namespace(userId)

  await ns.upsert([
    {
      id: entryId,
      values: embedding,
      metadata: {
        text: metadata.text?.substring(0, 1000) || '',
        reflection: metadata.reflection?.substring(0, 1000) || '',
        mood: metadata.mood || '',
        timestamp: metadata.timestamp || new Date().toISOString(),
        commitment: metadata.commitment || '',
        pattern: metadata.pattern || '',
        type: 'entry',
      },
    },
  ])
}

/**
 * Query for similar entries using cosine similarity.
 * Returns top K similar entries (excluding the query entry itself).
 */
export async function querySimilar(userId, embedding, topK = 3, excludeId = null) {
  const index = getIndex()
  const ns = index.namespace(userId)

  const result = await ns.query({
    vector: embedding,
    topK: topK + 1,
    includeMetadata: true,
  })

  const matches = (result.matches || [])
    .filter(m => m.id !== excludeId)
    .slice(0, topK)

  return matches.map(m => ({
    id: m.id,
    score: m.score,
    ...m.metadata,
  }))
}

/**
 * Fetch all entries for a user.
 * Uses list + fetch to get all vectors with metadata.
 */
export async function fetchAllEntries(userId) {
  const index = getIndex()
  const ns = index.namespace(userId)

  const entries = []

  try {
    // List all vector IDs in this namespace
    const listResult = await ns.listPaginated()
    const ids = (listResult.vectors || []).map(v => v.id)

    if (ids.length === 0) return []

    // Fetch metadata for all IDs (batch in chunks of 100)
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100)
      const fetchResult = await ns.fetch(batch)

      for (const [id, record] of Object.entries(fetchResult.records || {})) {
        entries.push({
          id,
          ...record.metadata,
        })
      }
    }
  } catch (error) {
    console.error('[mira] fetchAllEntries error:', error.message)
  }

  // Sort by timestamp descending (newest first)
  return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

/**
 * Fetch a single entry by ID.
 */
export async function fetchEntry(userId, entryId) {
  const index = getIndex()
  const ns = index.namespace(userId)

  try {
    const result = await ns.fetch([entryId])
    const record = result.records?.[entryId]
    if (!record) return null

    return {
      id: entryId,
      ...record.metadata,
    }
  } catch (error) {
    console.error('[mira] fetchEntry error:', error.message)
    return null
  }
}

/**
 * Delete an entry.
 */
export async function deleteEntry(userId, entryId) {
  const index = getIndex()
  const ns = index.namespace(userId)

  try {
    await ns.deleteOne(entryId)
    return true
  } catch (error) {
    console.error('[mira] deleteEntry error:', error.message)
    return false
  }
}
