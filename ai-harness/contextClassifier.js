// contextClassifier.js
// Determines required context for a user request (AI call)
// Requirements: OpenRouter API, lightweight model, strict JSON, error handling

const fetch = require('node-fetch');
const retry = require('./utils/retry');

const API_KEY = require('./utils/apikey');
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-3.5-turbo"; // Lightweight, cost-effective

// Prompt template
function buildPrompt(userQuestion) {
  return `
You are a context classifier for an AI assistant for competitive programmers.
Given a user question, return a strict JSON object listing the minimal context sections needed to answer it.
Possible sections: profile, contest_history, submission_patterns, weak_areas, strong_areas, coding_style, learning_goals, performance_metrics.
If unsure, pick the most relevant. Do not explain. Output only strict JSON.

User Question: "${userQuestion}"

Output:
`;
}

// API call with retry and token/cost logging
async function classifyContext(userInput, userContext) {
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
          "X-Title": "Context Classifier"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          max_tokens: 128,
          temperature: 0
        })
      });
      return await response.json();
    }, 3, 500);
    // Defensive: check for valid response
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in OpenRouter response");
    // Parse strict JSON from response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON substring if model added text
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (e2) {
          throw new Error("Failed to parse JSON from model response");
        }
      } else {
        throw new Error("No JSON object found in model response");
      }
    }
    // Validate output
    if (!parsed.needed_context || !Array.isArray(parsed.needed_context)) {
      throw new Error("Invalid context classifier output");
    }
    // Token/cost logging (if available)
    if (data.usage) {
      console.log(`[Classifier] prompt_tokens: ${data.usage.prompt_tokens}, completion_tokens: ${data.usage.completion_tokens}`);
    }
    return parsed;
  } catch (err) {
    return { needed_context: [], error: err.message };
  }
}

module.exports = classifyContext;
