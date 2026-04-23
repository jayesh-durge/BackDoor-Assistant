// responseGenerator.js
// Generate the final AI response by calling the OpenRouter chat completions API.

const fetch = require('node-fetch');
const config = require('../../config');

/**
 * Response Generator
 * Calls the OpenRouter LLM API and returns the model's reply as a string.
 *
 * @param {Object} params
 * @param {string} params.userMessage      - The current user message
 * @param {Object} params.context          - Optimized context (memory, recent msgs, etc.)
 * @param {Object} params.memory           - Retrieved memory object
 * @param {Object} params.functionResults  - Results from any executed tools
 * @returns {Promise<string>} The model's reply text
 */
async function responseGenerator({ userMessage, context = {}, memory = {}, functionResults = {} }) {
  const { apiKey, model, siteUrl, siteName, baseUrl } = config.openrouter;

  // ── Build memory block for prompt ─────────────────────────────────────────
  const memoryLines = [];
  if (memory.skills?.length)        memoryLines.push(`Skills: ${memory.skills.join(', ')}`);
  if (memory.interests?.length)     memoryLines.push(`Interests: ${memory.interests.join(', ')}`);
  if (memory.projects?.length)      memoryLines.push(`Projects: ${memory.projects.join(', ')}`);
  if (memory.preferences?.length)   memoryLines.push(`Preferences: ${memory.preferences.join(', ')}`);
  if (memory.goals?.length)         memoryLines.push(`Goals: ${memory.goals.join(', ')}`);
  if (memory.user_profile?.length)  memoryLines.push(`Profile: ${memory.user_profile.join(', ')}`);
  const memoryBlock = memoryLines.length ? memoryLines.join('\n') : '(empty — no facts stored yet)';

  const recentBlock = Array.isArray(context.recent_messages) && context.recent_messages.length
    ? context.recent_messages.join('\n')
    : '(none)';

  const summaryBlock = context.conversation_summary || '(none)';

  // ── System prompt (user-specified) ────────────────────────────────────────
  const systemPrompt = `You are an AI assistant with persistent memory.

You MUST use the provided memory and conversation history.

If the user asks "What do you know about me?" you MUST answer using memory.

If memory is empty: Explain honestly.

Memory:
${memoryBlock}

Conversation Summary:
${summaryBlock}

Recent Messages:
${recentBlock}

User Message:
${userMessage}

Rules:
* Memory has HIGH priority
* Conversation history has MEDIUM priority
* Current message has HIGHEST priority
* Do NOT ignore memory
* Do NOT say "I don't know you" if memory exists
* If relevant memory exists, reference it naturally and connect past and present (e.g., "Since you're working on...")

Generate a helpful response.`;

  // ── Build message array (recent history + current user message) ────────────
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  // Inject up to last 5 conversation turns stored in context
  if (Array.isArray(context.recent_messages)) {
    for (const line of context.recent_messages) {
      // Format is "[role] content"
      const match = line.match(/^\[(user|assistant)\]\s(.+)$/s);
      if (match) messages.push({ role: match[1], content: match[2] });
    }
  }

  // Append tool results as an assistant note if any ran
  if (functionResults && Object.keys(functionResults.function_results || {}).length > 0) {
    const toolNote = Object.entries(functionResults.function_results)
      .map(([fn, res]) => `[tool:${fn}] ${typeof res === 'object' ? JSON.stringify(res) : res}`)
      .join('\n');
    messages.push({ role: 'system', content: 'Tool results:\n' + toolNote });
  }

  messages.push({ role: 'user', content: userMessage });

  // ── Call OpenRouter ────────────────────────────────────────────────────────
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization':   `Bearer ${apiKey}`,
      'Content-Type':    'application/json',
      'HTTP-Referer':    siteUrl,
      'X-Title':         siteName
    },
    body: JSON.stringify({ model, messages })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error('Empty response from model: ' + JSON.stringify(data));

  return reply;
}

module.exports = responseGenerator;