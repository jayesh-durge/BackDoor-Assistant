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
    console.error('[AIHarness] Failed to load userContext.json:', e);
    userContext = {};
  }

  // Step 1: Memory Extraction (AI Call #1)
  let extractedMemory = {};
  try {
    extractedMemory = await extractMemory(userInput);
  } catch (e) {
    console.error('[AIHarness] Memory extraction failed:', e);
    extractedMemory = {};
  }

  // Step 2: Merge and Update memory.json
  let memory = memoryManager.loadMemory();
  let mergedMemory = memoryManager.mergeMemory(memory, extractedMemory);
  memoryManager.saveMemory(mergedMemory);
  console.log('[AIHarness] Merged memory:', mergedMemory);

  // Step 3: Append user message to conversation history
  history.appendHistory('user', userInput);
  console.log('[AIHarness] Appended user message to history:', userInput);

  // Step 4: Detect intent (AI Call #2)
  const intent = await classifyIntent(userInput);
  console.log('[AIHarness] Detected intent:', intent);
  if (!intent || intent === 'unknown') {
    return 'Sorry, I could not understand your request.';
  }

  // Step 5: Select required context
  const contextTypes = selectContext(intent);
  console.log('[AIHarness] Context types selected:', contextTypes);

  // Step 6: Load minimal required static context
  const loadedContext = await loadContext(contextTypes);
  console.log('[AIHarness] Loaded context:', loadedContext);

  // Step 7: Load relevant memory context (AI Call #3)
  let relevantMemory = {};
  try {
    relevantMemory = await loadRelevantMemory(userInput);
  } catch (e) {
    console.error('[AIHarness] Failed to load relevant memory:', e);
    relevantMemory = {};
  }
  console.log('[AIHarness] Relevant memory:', relevantMemory);

  // Step 8: Merge static and memory context
  const mergedContext = { ...loadedContext, memory: relevantMemory };
  console.log('[AIHarness] Merged context:', mergedContext);

  // Step 9: Load recent conversation history (last 20 turns)
  let conversation_history = [];
  const mem = history.loadMemory();
  if (mem && Array.isArray(mem.conversation_history)) {
    conversation_history = mem.conversation_history.slice(-20);
  }
  console.log('[AIHarness] Conversation history:', conversation_history);

  // Step 10: Call final responder (streaming AI), passing history
  let aiResponse;
  try {
    aiResponse = await finalResponder({
      userInput,
      mergedContext,
      userContext,
      conversation_history,
      memory: mem
    });
    if (!aiResponse || typeof aiResponse !== 'string' || !aiResponse.trim()) {
      console.error('[AIHarness] AI response is empty or invalid:', aiResponse);
      aiResponse = '[AI Error] No response generated.';
    }
  } catch (e) {
    console.error('[AIHarness] Error in finalResponder:', e);
    aiResponse = '[AI Error] ' + (e.message || e.toString());
  }
  // Step 11: Append assistant response to conversation history
  history.appendHistory('assistant', aiResponse);
  console.log('[AIHarness] Appended assistant response to history:', aiResponse);
  return aiResponse;
}

module.exports = main;
