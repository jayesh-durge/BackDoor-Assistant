// contextLoader.js
// Loads only the required context sections from userContext.json
// Requirements: efficient, scalable, safe fallback, logging

const fs = require('fs');
const path = require('path');
const cache = require('./utils/cache');
const summarizeSection = require('./utils/summarize');

const USER_CONTEXT_PATH = path.join(__dirname, 'userContext.json');
const TOKEN_THRESHOLD = 600; // Approximate max chars before summarizing

function log(msg) {
  // Simple logging, can be replaced with more advanced logger
  console.log(`[ContextLoader] ${msg}`);
}

function estimateTokens(str) {
  // Rough estimate: 1 token ≈ 4 chars (for English)
  return Math.ceil(str.length / 4);
}

/**
 * Loads only requested context sections from userContext.json, with caching and summarization
 * @param {string[]} contextTypes - e.g. ["profile", "contest_history"]
 * @returns {object} - { section1: {...}, section2: {...}, ... }
 */
async function loadContext(contextTypes) {
  let userContext;
  try {
    const raw = fs.readFileSync(USER_CONTEXT_PATH, 'utf-8');
    userContext = JSON.parse(raw);
  } catch (e) {
    log(`Failed to load userContext.json: ${e.message}`);
    return { error: 'userContext.json not found or invalid', loaded: {} };
  }

  const loaded = {};
  for (const section of contextTypes) {
    // Caching: check cache first
    let cached = cache.get(section);
    if (cached) {
      loaded[section] = cached;
      log(`Cache hit: ${section}`);
      continue;
    }
    // Support both flat and nested (e.g. contest_history inside contestHistory)
    let value = undefined;
    if (userContext.hasOwnProperty(section)) {
      value = userContext[section];
      log(`Loaded section: ${section}`);
    } else {
      // Try snake_case to camelCase fallback
      const camel = section.replace(/_([a-z])/g, g => g[1].toUpperCase());
      if (userContext.hasOwnProperty(camel)) {
        value = userContext[camel];
        log(`Loaded section (fallback): ${section} -> ${camel}`);
      } else {
        value = null;
        log(`Section not found: ${section}`);
      }
    }
    // Token optimization: summarize if too large
    if (value && typeof value === 'object') {
      const str = JSON.stringify(value);
      if (estimateTokens(str) > TOKEN_THRESHOLD) {
        log(`Summarizing section: ${section}`);
        value = await summarizeSection(section, value);
      }
    }
    cache.set(section, value, 60000); // Cache for 1 min
    loaded[section] = value;
  }
  return loaded;
}

// Example usage
if (require.main === module) {
  (async () => {
    const input = ["profile", "contest_history", "nonexistent_section"];
    const result = await loadContext(input);
    console.log("Loaded context:", JSON.stringify(result, null, 2));
  })();
}

module.exports = loadContext;
