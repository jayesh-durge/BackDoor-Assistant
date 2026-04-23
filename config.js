// config.js
// ─────────────────────────────────────────────────────────────
// Single source of truth for all environment / API config.
// Every module in this project should require this file instead
// of reading process.env directly.
// ─────────────────────────────────────────────────────────────

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const config = {
  openrouter: {
    apiKey:   process.env.OPENROUTER_API_KEY   || '',
    model:    process.env.OPENROUTER_MODEL      || 'openai/gpt-4o-mini',
    siteUrl:  process.env.OPENROUTER_SITE_URL   || 'http://localhost:3000',
    siteName: process.env.OPENROUTER_SITE_NAME  || 'AI Harness Chatbot',
    baseUrl:  'https://openrouter.ai/api/v1',
  }
};

// Warn loudly at startup if the key is missing
if (!config.openrouter.apiKey || config.openrouter.apiKey === 'your-openrouter-api-key-here') {
  console.warn(
    '\n⚠️  [config] OPENROUTER_API_KEY is not set.\n' +
    '   Copy .env.example → .env and add your key from https://openrouter.ai/keys\n'
  );
}

module.exports = config;
