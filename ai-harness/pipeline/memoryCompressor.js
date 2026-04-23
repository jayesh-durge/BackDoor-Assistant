// memoryCompressor.js
// Convert the LLM extractor's [{category, value, confidence}] array
// into flat category buckets ready for merging into memory.json.

const VALID_CATEGORIES = ['skills', 'interests', 'projects', 'preferences', 'goals', 'user_profile'];
const MIN_CONFIDENCE   = 0.4;  // discard low-confidence extractions

/**
 * Memory Compressor
 * @param {Object} params
 * @param {{ memory: Array<{category:string, value:string, confidence:number}> }} params.memory
 *   — output from memoryExtractor
 * @returns {{ [category: string]: string[] }} Bucketed, deduplicated memory
 */
function memoryCompressor({ memory = {} }) {
  const items = Array.isArray(memory.memory) ? memory.memory : [];
  const buckets = {};

  for (const item of items) {
    const cat = (item.category || '').toLowerCase().trim();
    if (!VALID_CATEGORIES.includes(cat)) continue;
    if ((item.confidence ?? 1) < MIN_CONFIDENCE) continue;
    if (!item.value) continue;

    if (!buckets[cat]) buckets[cat] = [];
    const val = String(item.value).trim();
    if (!buckets[cat].includes(val)) buckets[cat].push(val);
  }

  return buckets;  // e.g. { skills: ['JavaScript'], interests: ['AI'] }
}

module.exports = memoryCompressor;