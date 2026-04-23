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

  // ── Build system prompt from memory & context ──────────────────────────────
  const memoryLines = [];
  if (memory.goals?.length)        memoryLines.push(`User goals: ${memory.goals.join(', ')}`);
  if (memory.skills?.length)       memoryLines.push(`User skills: ${memory.skills.join(', ')}`);
  if (memory.projects?.length)     memoryLines.push(`User projects: ${memory.projects.join(', ')}`);
  if (memory.user_profile?.length) memoryLines.push(`User profile: ${memory.user_profile.join(', ')}`);
  if (memory.preferences?.length)  memoryLines.push(`User preferences: ${memory.preferences.join(', ')}`);

  const systemPrompt = [
    'You are a helpful, concise AI assistant.',
    memoryLines.length ? '\nKnown context about the user:\n' + memoryLines.join('\n') : '',
    context.conversation_summary ? '\nConversation so far: ' + context.conversation_summary : ''
  ].join('').trim();

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