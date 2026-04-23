// conversationSummarizer.js
// Summarize the conversation so far for context compression.

/**
 * Conversation Summarizer
 * @param {Object} params
 * @param {Array<Object>} params.messages - Conversation messages [{role, content}]
 * @returns {string} Conversation summary
 */
function conversationSummarizer({ messages = [] }) {
  // Simple summary: concatenate last 3 messages
  const last = messages.slice(-3).map(m => `[${m.role}] ${m.content}`).join(' ');
  return `Summary: ${last}`;
}

module.exports = conversationSummarizer;

// Example usage:
// const summary = conversationSummarizer({
//   messages: [
//     { role: 'user', content: 'Hi' },
//     { role: 'assistant', content: 'Hello!' },
//     { role: 'user', content: 'Summarize my projects' }
//   ]
// });
// console.log(summary);