const fetch = require('node-fetch');
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const extractionPrompt = (userMessage) => `You are a memory extraction system.\nExtract only:\n* preferences (including how the user wants to be greeted or referred to)\n* goals\n* skills\n* weak areas\n* learning interests\n* personal info useful for coaching (such as preferred name, pronouns, etc.)\nConversation:\nUser: ${userMessage}\nReturn JSON only:\n{\n  \"profile\": [],\n  \"preferences\": [],\n  \"goals\": [],\n  \"skills\": [],\n  \"weak_areas\": [],\n  \"facts\": []\n}\nIf nothing useful, return empty arrays.`;

async function extractMemory(userMessage) {
  if (!OPENROUTER_API_KEY) throw new Error('Missing OpenRouter API key');
  const body = {
    model: 'openai/gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Extract only long-term memory from user conversation.' },
      { role: 'user', content: extractionPrompt(userMessage) }
    ],
    max_tokens: 256,
    temperature: 0
  };
  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || '';
  try {
    const parsed = JSON.parse(text);
    // Ensure all keys exist for mergeMemory
    return {
      profile: parsed.profile || [],
      preferences: parsed.preferences || [],
      goals: parsed.goals || [],
      skills: parsed.skills || [],
      weak_areas: parsed.weak_areas || [],
      facts: parsed.facts || []
    };
  } catch (e) {
    return { profile: [], preferences: [], goals: [], skills: [], weak_areas: [], facts: [] };
  }
}

module.exports = extractMemory;
