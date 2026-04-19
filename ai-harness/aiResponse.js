// aiResponse.js
// Makes the final AI call to OpenRouter, supports streaming, context injection, coaching style

const fetch = require('node-fetch');
const retry = require('./utils/retry');

const API_KEY = require('./utils/apikey');
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-3.5-turbo";


// Prompt template for true context-aware chat
function buildPrompt({ userInput, mergedContext, userContext, conversation_history, memory }) {
  // Build conversation history string
  let historyStr = '';
  if (Array.isArray(conversation_history) && conversation_history.length > 0) {
    historyStr = conversation_history.map(turn => `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}`).join('\n');
  }
  // Add memory facts
  let memoryStr = '';
  if (memory) {
    memoryStr = `\nUser Profile: ${JSON.stringify(memory.profile || {})}\nPreferences: ${JSON.stringify(memory.preferences || [])}\nSkills: ${JSON.stringify(memory.skills || [])}\nWeak Areas: ${JSON.stringify(memory.weak_areas || [])}\nGoals: ${JSON.stringify(memory.goals || [])}\nFacts: ${JSON.stringify(memory.facts || [])}`;
  }
  return `You are an expert competitive programming coach.\n\nConversation history:\n${historyStr}\n${memoryStr}\n\nCurrent user message: "${userInput}"\n\nRelevant context: ${JSON.stringify(mergedContext)}\n\nCoaching Response:`;
}

// Streaming API call and response handler with retry and token/cost logging

// Accepts an object with userInput, mergedContext, userContext, conversation_history, memory
async function getAIResponse({ userInput, mergedContext, userContext, conversation_history, memory }) {
  const prompt = buildPrompt({ userInput, mergedContext, userContext, conversation_history, memory });
  let response;
  response = await retry(async () => {
    return await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "AI Coaching Response"
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: "system", content: "You are a helpful coach." },
          { role: "user", content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.7
      })
    });
  }, 3, 500);

  if (!response.ok || !response.body) {
    throw new Error("Failed to connect to OpenRouter API");
  }

  // Check if streaming is supported (Node.js fetch polyfill does not support .body.getReader)
  if (typeof response.body.getReader === 'function') {
    // Streaming response handler
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";
    let totalTokens = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.replace("data: ", "");
          if (data === "[DONE]") {
            console.log(`[AIResponse] Streamed tokens: ~${totalTokens}`);
            return result.trim();
          }
          try {
            const json = JSON.parse(data);
            const token = json.choices[0].delta?.content || "";
            result += token;
            totalTokens += token.length / 4; // Rough estimate
          } catch (e) {
            // Ignore malformed lines
          }
        }
      }
    }
    return result.trim();
  } else {
    // Fallback: non-streaming (Node.js fetch polyfill)
    let text = await response.text();
    try {
      const data = JSON.parse(text);
      return data.choices?.[0]?.message?.content?.trim() || "[No response]";
    } catch (e) {
      // Try to parse streaming response line by line
      let result = "";
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.replace("data: ", "");
          if (dataStr === "[DONE]") break;
          try {
            const json = JSON.parse(dataStr);
            const token = json.choices?.[0]?.delta?.content || "";
            result += token;
          } catch (err) {
            // Ignore malformed lines
          }
        }
      }
      if (result.trim()) return result.trim();
      console.error('[AIResponse] Non-JSON response from OpenRouter:', text);
      throw new Error('OpenRouter returned non-JSON response: ' + text.slice(0, 200));
    }
  }
}

module.exports = getAIResponse;
