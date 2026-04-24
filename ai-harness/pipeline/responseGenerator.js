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
async function responseGenerator({ userMessage, context = {}, memory = {}, functionResults = {}, onChunk }) {
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
  // ── Optimized System Prompt ──────────────────────────────────────────────
  const systemPrompt = `You are Findly AI, a helpful assistant with persistent memory.

CORE INSTRUCTIONS:
1. Use the "User Memory" below to answer questions about the user's skills, projects, and goals.
2. If memory exists, reference it naturally (e.g., "Since you're working on your Chess Engine...").
3. If memory is empty, explain that you haven't learned enough about them yet.
4. COPIABLE DATA: When asked for data in a "copiable block", ALWAYS use Markdown code blocks (e.g., \`\`\`text or \`\`\`json).
5. NEVER output raw technical placeholders like "[object Object]". Always format data for human reading.

USER MEMORY:
${memoryBlock}

CONVERSATION CONTEXT:
Summary: ${summaryBlock}
Recent History:
${recentBlock}

Rules:
- Priority: User Memory > Conversation Context > Current Message.
- Be concise, friendly, and structured.`;

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
    body: JSON.stringify({ model, messages, stream: !!onChunk })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
  }

  if (onChunk) {
    return new Promise((resolve, reject) => {
      let fullReply = '';
      let buffer = '';
      res.body.on('data', (chunk) => {
        buffer += chunk.toString();
        let lastIndex = 0;
        while (true) {
          const newLineIndex = buffer.indexOf('\n', lastIndex);
          if (newLineIndex === -1) break;
          const line = buffer.slice(lastIndex, newLineIndex).trim();
          lastIndex = newLineIndex + 1;
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const token = data.choices[0]?.delta?.content || '';
              if (token) {
                fullReply += token;
                onChunk(token);
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
        buffer = buffer.slice(lastIndex);
      });
      res.body.on('end', () => resolve(fullReply));
      res.body.on('error', reject);
    });
  } else {
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Empty response from model: ' + JSON.stringify(data));
    return reply;
  }
}

module.exports = responseGenerator;