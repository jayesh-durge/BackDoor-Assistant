const fs = require('fs');
const path = require('path');
const MEMORY_PATH = path.join(__dirname, '../memory.json');

const defaultMemory = {
  profile: [],
  preferences: [],
  skills: [],
  weak_areas: [],
  goals: [],
  facts: [],
  conversation_summary: []
};

function loadMemory() {
  if (!fs.existsSync(MEMORY_PATH)) return { ...defaultMemory };
  try {
    const raw = fs.readFileSync(MEMORY_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { ...defaultMemory };
  }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2), 'utf8');
}

function mergeMemory(oldMem, newMem) {
  const merged = { ...oldMem };
  for (const key of Object.keys(newMem)) {
    if (Array.isArray(newMem[key]) && Array.isArray(oldMem[key])) {
      merged[key] = Array.from(new Set([...oldMem[key], ...newMem[key]].filter(Boolean)));
    }
  }
  return merged;
}

module.exports = { loadMemory, saveMemory, mergeMemory, MEMORY_PATH };
