// memoryStorage.js
// Merge new extracted memory into persistent memory.json (never overwrites, only grows).

const fs = require('fs').promises;
const path = require('path');

const MAX_PER_CATEGORY = 20;  // cap per category so file doesn't grow forever

// Schema: all recognised categories with empty defaults
const EMPTY_MEMORY = {
  skills:        [],
  interests:     [],
  projects:      [],
  preferences:   [],
  goals:         [],
  user_profile:  [],
  conversation_summary: []
};

/**
 * Memory Storage
 * @param {Object} params
 * @param {Object} params.memory     - New bucketed memory from memoryCompressor { skills:[...], ... }
 * @param {string} [params.memoryPath] - Path to memory.json
 * @returns {Promise<boolean>} Success
 */
async function memoryStorage({ memory = {}, memoryPath }) {
  const filePath = memoryPath || path.join(__dirname, '../memory.json');

  // Load existing memory (or start fresh)
  let existing = { ...EMPTY_MEMORY };
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    // Merge parsed keys into existing schema
    for (const key of Object.keys(EMPTY_MEMORY)) {
      if (Array.isArray(parsed[key])) existing[key] = parsed[key];
    }
  } catch { /* file missing or corrupt — start fresh */ }

  // Merge new items into each category (deduplicate, cap at MAX_PER_CATEGORY)
  for (const [cat, values] of Object.entries(memory)) {
    if (!Array.isArray(existing[cat])) existing[cat] = [];
    for (const val of (Array.isArray(values) ? values : [])) {
      if (!existing[cat].includes(val)) existing[cat].push(val);
    }
    // Keep only the most recent N
    existing[cat] = existing[cat].slice(-MAX_PER_CATEGORY);
  }

  try {
    await fs.writeFile(filePath, JSON.stringify(existing, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[memoryStorage] write failed:', e.message);
    return false;
  }
}

module.exports = memoryStorage;