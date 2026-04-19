const fetch = require('node-fetch');
const memoryManager = require('./memoryManager');
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const classifierPrompt = (userMessage, memory) => `Given the user message and memory, select only the most relevant memory items to help the AI respond efficiently.\nUser message: ${userMessage}\nMemory: ${JSON.stringify(memory)}\nReturn JSON with only relevant items.`;

async function loadRelevantMemory(userMessage) {
  const memory = memoryManager.loadMemory();
  if (!OPENROUTER_API_KEY) throw new Error('Missing OpenRouter API key');
  const body = {
    model: 'openai/gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Select only relevant memory for the user message.' },
      { role: 'user', content: classifierPrompt(userMessage, memory) }
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
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
}

module.exports = loadRelevantMemory;
