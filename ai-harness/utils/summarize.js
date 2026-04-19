// summarize.js - Summarize large context sections using OpenRouter
const fetch = require('node-fetch');
const API_KEY = require('./apikey');
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-3.5-turbo";

async function summarizeSection(sectionName, sectionData) {
  const prompt = `Summarize the following ${sectionName} for a competitive programming coach. Be concise and keep only the most relevant details.\n\n${JSON.stringify(sectionData)}`;
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "Summarizer"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a helpful summarizer." },
        { role: "user", content: prompt }
      ],
      max_tokens: 128,
      temperature: 0.2
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

module.exports = summarizeSection;
