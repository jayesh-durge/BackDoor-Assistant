// contextBuilder.js
// Combines user message, memory, conversation summary, recent messages, and function results into an optimized context.

/**
 * Context Builder
 * @param {Object} params
 * @param {string} params.userMessage - The user's message
 * @param {Object} params.memory - Retrieved memory/context
 * @param {string} params.conversationSummary - Summarized conversation
 * @param {Array<Object>} params.recentMessages - Recent conversation messages [{role, content}]
 * @param {Object} params.functionResults - Results from executed functions
 * @returns {Object} Optimized context for LLM or downstream modules
 */
function contextBuilder({ userMessage, memory = {}, conversationSummary = '', recentMessages = [], functionResults = {} }) {
  // Helper: flatten and deduplicate strings
  function dedup(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  // Compress memory: prioritize goals, profile, and recent items
  const importantKeys = ['goals', 'user_profile', 'skills', 'projects'];
  const compressedMemory = {};
  for (const key of importantKeys) {
    if (memory[key]) {
      const val = Array.isArray(memory[key]) ? memory[key].slice(0, 2) : [memory[key]];
      compressedMemory[key] = dedup(val.map(v => typeof v === 'string' ? v : JSON.stringify(v)));
    }
  }

  // Build context sections
  const context = {
    user_message: userMessage,
    memory: compressedMemory,
    conversation_summary: conversationSummary,
    recent_messages: dedup(recentMessages.map(m => `[${m.role}] ${m.content}`)).slice(-6),
    function_results: functionResults
  };

  return context;
}

module.exports = contextBuilder;

// Example usage:
// const context = contextBuilder({
//   userMessage: 'Summarize my Python projects',
//   memory: {
//     user_profile: { name: 'Jay' },
//     goals: ['Learn AI', 'Build a bot'],
//     projects: ['AI chatbot', 'Python tool'],
//     skills: ['Python', 'JS']
//   },
//   conversationSummary: 'User discussed goals and projects.',
//   recentMessages: [
//     { role: 'user', content: 'What are my goals?' },
//     { role: 'assistant', content: 'Your goals are: Learn AI, Build a bot.' }
//   ],
//   functionResults: { summarize: 'You have 2 Python projects.' }
// });
// console.log(context);
