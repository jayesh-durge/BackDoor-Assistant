// cache.js - Simple in-memory cache with TTL for context sections
const cache = {};

function set(key, value, ttlMs = 60000) {
  cache[key] = { value, expires: Date.now() + ttlMs };
}

function get(key) {
  const entry = cache[key];
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    delete cache[key];
    return undefined;
  }
  return entry.value;
}

function clear(key) {
  delete cache[key];
}

module.exports = { set, get, clear };
