// memoryRetriever.js
// Retrieve relevant memory/context based on requirement analysis.


/**
 * Memory Retriever
 * @param {Object} params
 * @param {Array<string>} params.required_memory - Memory categories to retrieve
 * @param {Object} params.memoryStore - The full memory store
 * @returns {Object} Retrieved memory
 */

const fs = require('fs').promises;
const path = require('path');

// Simple semantic similarity: token overlap (replace with embeddings for production)
function semanticSimilarity(query, text, category) {
  const qTokens = new Set(query.toLowerCase().split(/\W+/).filter(Boolean));
  const tTokens = new Set(`${category} ${text}`.toLowerCase().split(/\W+/).filter(Boolean));
  const overlap = [...qTokens].filter(t => tTokens.has(t));
  return overlap.length / Math.max(qTokens.size, 1);
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
    const data = await fs.readFile(filePath, 'utf8');
    memory = JSON.parse(data);
  } catch (e) {
    memory = {};
  }

  const categories = [
    'skills',
    'interests',
    'projects',
    'preferences',
    'goals',
    'user_profile',
    'conversation_summary'
  ];

  const relevant = {};
  for (const cat of categories) {
    const items = memory[cat];
    if (!items || !items.length) continue;
    const arr = Array.isArray(items) ? items : [items];
    const scored = arr.map(item => {
      const text = typeof item === 'string' ? item : JSON.stringify(item);
      return { item, score: semanticSimilarity(query, text, cat) };
    });
    
    // Filter memory relevant to user_message (score > 0)
    const filtered = scored.filter(s => s.score > 0);
    filtered.sort((a, b) => b.score - a.score);
    
    if (filtered.length > 0) {
      relevant[cat] = filtered.slice(0, topK).map(s => s.item);
    }
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