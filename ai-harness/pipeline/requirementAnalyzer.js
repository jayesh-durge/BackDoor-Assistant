// requirementAnalyzer.js
// Analyze user message and context to determine requirements (functions, memory, summary, etc.)

/**
 * Requirement Analyzer
 * @param {Object} params
 * @param {string} params.userMessage - The user's message
 * @param {Object} params.memory - Retrieved memory/context
 * @param {string} params.conversationSummary - Summarized conversation
 * @returns {Object} Analysis result: needs_functions, required_functions, needs_memory, required_memory, needs_summary
 */
function requirementAnalyzer({ userMessage = '', memory = {}, conversationSummary = '' }) {
  // Simple heuristics for demo: look for keywords
  const msg = userMessage.toLowerCase();
  const required_functions = [];
  const required_memory = [];
  let needs_summary = false;

  if (/summarize|summary|recap/.test(msg)) {
    required_functions.push('summarize');
    needs_summary = true;
  }
  if (/translate|language|convert/.test(msg)) {
    required_functions.push('translate');
  }
  if (/project|goal|skill|profile/.test(msg)) {
    required_memory.push('projects', 'goals', 'skills', 'user_profile');
  }
  if (/search|find|lookup/.test(msg)) {
    required_functions.push('search');
  }

  const needs_functions = required_functions.length > 0;
  const needs_memory = required_memory.length > 0;

  return {
    needs_functions,
    required_functions,
    needs_memory,
    required_memory,
    needs_summary
  };
}

module.exports = requirementAnalyzer;

// Example usage:
// const analysis = requirementAnalyzer({
//   userMessage: 'Summarize my Python projects',
//   memory: {},
//   conversationSummary: ''
// });
// console.log(analysis);