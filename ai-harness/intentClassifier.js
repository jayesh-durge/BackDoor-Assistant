// intentClassifier.js
// Classifies user intent from input (e.g., ask, explain, debug, etc.)
const fetch = require('node-fetch');
const retry = require('./utils/retry');

const API_KEY = require('./utils/apikey');
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-3.5-turbo";

function buildPrompt(userInput) {
  return `Classify the user's intent for the following input. Choose one: ask_advice, explain, debug, suggest_problems, review_performance, general_advice.\nUser Input: \"${userInput}\"\nOutput: {\"intent\": "..."}`;
}

async function classifyIntent(userInput) {
  const prompt = buildPrompt(userInput);
  let data;
  try {
    data = await retry(async () => {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "Intent Classifier"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          max_tokens: 32,
          temperature: 0
        })
      });
      return await response.json();
    }, 3, 500);
    const content = data.choices?.[0]?.message?.content;
    // Debug log: print raw model response
    console.log("[IntentClassifier] Raw model response:", content);
    if (!content) throw new Error("No content in OpenRouter response");
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON object from text
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        // Fallback: try to map plain text to intent
        const lower = content.toLowerCase();
        const intents = ["ask_advice", "explain", "debug", "suggest_problems", "review_performance", "general_advice"];
        for (const intent of intents) {
          if (lower.includes(intent)) return intent;
        }
        throw new Error("No JSON object or recognizable intent in model response");
      }
    }
    if (!parsed.intent) throw new Error("No intent in classifier output");
    return parsed.intent;
  } catch (err) {
    console.error("[IntentClassifier] Error:", err);
    return "unknown";
  }
}

module.exports = classifyIntent;
