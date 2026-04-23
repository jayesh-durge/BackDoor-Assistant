// memoryRetriever.js
// Retrieve relevant memory/context based on requirement analysis.


/**
 * Memory Retriever
 * @param {Object} params
 * @param {Array<string>} params.required_memory - Memory categories to retrieve
 * @param {Object} params.memoryStore - The full memory store
 * @returns {Object} Retrieved memory
 */

const fs = require('fs');
const path = require('path');

// Simple semantic similarity: token overlap (replace with embeddings for production)
function semanticSimilarity(a, b) {
  const aTokens = new Set(a.toLowerCase().split(/\W+/));
  const bTokens = new Set(b.toLowerCase().split(/\W+/));
  const overlap = [...aTokens].filter(t => bTokens.has(t));
  return overlap.length / Math.max(aTokens.size, 1);
}

/**
 * Memory Retriever
 * @param {Object} params
 * @param {string} params.query - The user query/message
 * @param {string} [params.memoryPath] - Path to memory.json
 * @param {number} [params.topK] - Number of top relevant memories to return
 * @returns {Object} Top relevant memory items by category
 */
async function memoryRetriever({ query, memoryPath, topK = 2 }) {
  const filePath = memoryPath || path.join(__dirname, '../memory.json');
  let memory = {};
  try {
    memory = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    memory = {};
  }

  const categories = [
    'user_profile',
    'preferences',
    'projects',
    'skills',
    'goals',
    'long_term_memory',
    'conversation_summary'
  ];

  const relevant = {};
  for (const cat of categories) {
    const items = memory[cat];
    if (!items) continue;
    const arr = Array.isArray(items) ? items : [items];
    const scored = arr.map(item => {
      const text = typeof item === 'string' ? item : JSON.stringify(item);
      return { item, score: semanticSimilarity(query, text) };
    });
    scored.sort((a, b) => b.score - a.score);
    relevant[cat] = scored.slice(0, topK).map(s => s.item);
  }
  return relevant;
}

module.exports = memoryRetriever;

// Example usage:
// (async () => {
//   const result = await memoryRetriever({
//     query: 'What are my Python projects and goals?',
//     memoryPath: path.join(__dirname, '../memory.json'),
//     topK: 2
//   });
//   console.log(result);
// })();

module.exports = memoryRetriever;

// Example usage:
// (async () => {
//   const result = await memoryRetriever({
//     required_memory: ['profile', 'goals'],
//     memoryStore: { profile: { name: 'Jay' }, goals: ['Learn Python'] }
//   });
//   console.log(result);
// })();