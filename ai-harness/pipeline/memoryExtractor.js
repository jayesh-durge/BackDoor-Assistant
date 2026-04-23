// memoryExtractor.js
// Extract new memory items from the latest user message and context.

/**
 * Memory Extractor
 * @param {Object} params
 * @param {string} params.userMessage - The user's message
 * @param {Object} params.context - Optimized context
 * @returns {Object} Extracted memory items
 */
function memoryExtractor({ userMessage = '', context = {} }) {
  // Simple extraction: look for keywords and phrases
  const extracted = {};
  const msg = userMessage.toLowerCase();
  if (/goal|want to|plan to/.test(msg)) {
    extracted.goals = [userMessage];
  }
  if (/project|working on|building/.test(msg)) {
    extracted.projects = [userMessage];
  }
  if (/skill|learning|expert in/.test(msg)) {
    extracted.skills = [userMessage];
  }
  return extracted;
}

module.exports = memoryExtractor;

// Example usage:
// const memory = memoryExtractor({
//   userMessage: 'I want to learn AI',
//   context: {}
// });
// console.log(memory);