// aiHarness.js
// Main controller: orchestrates the full Copilot-style flow

const fs = require('fs');
const path = require('path');

const classifyIntent = require('./intentClassifier');
const selectContext = require('./contextSelector');
const loadContext = require('./contextLoader');
const finalResponder = require('./finalResponder');
const extractMemory = require('./memoryExtractor');
const memoryManager = require('./memoryManager');
const loadRelevantMemory = require('./memoryLoader');
const history = require('./utils/history');

async function main(userInput) {
  // Load user context (static)
  const userContextPath = path.join(__dirname, 'userContext.json');
  let userContext = {};
  try {
    userContext = JSON.parse(fs.readFileSync(userContextPath, 'utf-8'));
  } catch (e) {
    userContext = {};
  }

  // Step 1: Memory Extraction (AI Call #1)
  let extractedMemory = {};
  try {
    extractedMemory = await extractMemory(userInput);
  } catch (e) {
    extractedMemory = {};
  }

  // Step 2: Merge and Update memory.json
  let memory = memoryManager.loadMemory();
  let mergedMemory = memoryManager.mergeMemory(memory, extractedMemory);
  memoryManager.saveMemory(mergedMemory);

  // Step 3: Append user message to conversation history
  history.appendHistory('user', userInput);

  // Step 4: Detect intent (AI Call #2)
  const intent = await classifyIntent(userInput);
  if (!intent || intent === 'unknown') {
    return 'Sorry, I could not understand your request.';
  }

  // Step 5: Select required context
  const contextTypes = selectContext(intent);

  // Step 6: Load minimal required static context
  const loadedContext = await loadContext(contextTypes);

  // Step 7: Load relevant memory context (AI Call #3)
  let relevantMemory = {};
  try {
    relevantMemory = await loadRelevantMemory(userInput);
  } catch (e) {
    relevantMemory = {};
  }

  // Step 8: Merge static and memory context
  const mergedContext = { ...loadedContext, memory: relevantMemory };

  // Step 9: Load recent conversation history (last 20 turns)
  let conversation_history = [];
  const mem = history.loadMemory();
  if (mem && Array.isArray(mem.conversation_history)) {
    conversation_history = mem.conversation_history.slice(-20);
  }

  // Step 10: Call final responder (streaming AI), passing history
  const aiResponse = await finalResponder({
    userInput,
    mergedContext,
    userContext,
    conversation_history,
    memory: mem
  });

  // Step 11: Append assistant response to conversation history
  history.appendHistory('assistant', aiResponse);

  return aiResponse;
}

module.exports = main;
