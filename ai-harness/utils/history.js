const fs = require('fs');
const path = require('path');
const MEMORY_PATH = path.join(__dirname, '../memory.json');

function loadMemory() {
  if (!fs.existsSync(MEMORY_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
  } catch (e) {
    return null;
  }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2), 'utf8');
}

function appendHistory(role, content) {
  let memory = loadMemory() || { conversation_history: [] };
  if (!Array.isArray(memory.conversation_history)) memory.conversation_history = [];
  memory.conversation_history.push({ role, content });
  // Keep only last 20 turns for context
  if (memory.conversation_history.length > 40) memory.conversation_history = memory.conversation_history.slice(-40);
  saveMemory(memory);
}

module.exports = { loadMemory, saveMemory, appendHistory };
