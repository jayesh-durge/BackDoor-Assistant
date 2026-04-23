// memoryExtractor.js
// Semantically extract long-term memory from conversation using an LLM call.

const fetch = require('node-fetch');
const config = require('../../config');

/**
 * Memory Extractor
 * Calls OpenRouter to infer implicit user facts (skills, interests, projects, preferences)
 * from the conversation — no keyword matching.
 *
 * @param {Object} params
 * @param {string} params.userMessage - The user's message
 * @param {string} params.aiResponse  - The assistant's reply for this turn
 * @returns {Promise<{ memory: Array<{category:string, value:string, confidence:number}> }>}
 */
async function memoryExtractor({ userMessage = '', aiResponse = '', conversationHistory = [] }) {
  const { apiKey, model, siteUrl, siteName, baseUrl } = config.openrouter;

  const historyStr = Array.isArray(conversationHistory) && conversationHistory.length > 0
    ? conversationHistory.join('\n')
    : '(none)';

  const prompt = `You are a semantic memory extractor.
Extract meaningful long-term information from conversation.

Input:
Conversation History:
${historyStr}

Current User Message:
${userMessage}

Current AI Response:
${aiResponse}

Extract even implicit information such as:
* User is coding → infer "interest: programming"
* User asked DSA → infer "skill: data structures"
* Repeated topics → infer "project or focus area"

Return JSON only, no explanation:
{
  "memory": [
    {
      "category": "skills | interests | projects | preferences",
      "value": "<extracted value>",
      "confidence": <0.0 to 1.0>
    }
  ]
}

Rules:
* Do NOT rely on keywords alone
* Infer meaning from context
* Be aggressive but reasonable
* Return empty array if nothing meaningful can be inferred
* Output ONLY valid JSON`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'HTTP-Referer':  siteUrl,
        'X-Title':       siteName
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) return { memory: [] };

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || '{"memory":[]}';
    const parsed = JSON.parse(raw);
    return { memory: Array.isArray(parsed.memory) ? parsed.memory : [] };
  } catch (e) {
    console.warn('[memoryExtractor] extraction failed, skipping:', e.message);
    return { memory: [] };
  }
}

module.exports = memoryExtractor;