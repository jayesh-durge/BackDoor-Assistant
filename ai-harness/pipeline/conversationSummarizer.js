// conversationSummarizer.js
// Summarize the conversation so far for context compression.

/**
 * Conversation Summarizer
 * @param {Object} params
 * @param {Array<Object>} params.messages - Conversation messages [{role, content}]
 * @returns {{ conversation_summary: string }} Summary object
 */
function conversationSummarizer({ messages = [] }) {
  if (!messages.length) return { conversation_summary: '' };
  const lines = messages
    .slice(-6)  // last 6 turns max
    .map(m => `[${m.role}] ${m.content}`)
    .join(' | ');
  return { conversation_summary: lines };
}

module.exports = conversationSummarizer;