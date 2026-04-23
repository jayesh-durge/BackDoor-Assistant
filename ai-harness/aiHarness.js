const requirementAnalyzer = require('./pipeline/requirementAnalyzer');
const memoryRetriever = require('./pipeline/memoryRetriever');
const functionPlanner = require('./pipeline/functionPlanner');
const functionExecutor = require('./pipeline/functionExecutor');
const contextBuilder = require('./pipeline/contextBuilder');
const responseGenerator = require('./pipeline/responseGenerator');
const memoryExtractor = require('./pipeline/memoryExtractor');
const memoryCompressor = require('./pipeline/memoryCompressor');
const memoryStorage = require('./pipeline/memoryStorage');
const conversationSummarizer = require('./pipeline/conversationSummarizer');
const fs = require('fs').promises;
const path = require('path');

const MEMORY_PATH = path.join(__dirname, 'memory.json');

async function aiHarness({ userMessage, conversation = [], availableFunctions = [], functionRegistry = {} }) {
  const trace = {};
  try {
    // 1. Requirement Analyzer
    trace.analysis = await requirementAnalyzer({
      userMessage,
      availableFunctions,
      memory: await loadMemorySummary()  // Bug #1 fix: was memorySummary (ignored)
    });

    // 2. Memory Retrieval
    trace.memory = await memoryRetriever({
      query: userMessage,
      memoryPath: MEMORY_PATH,
      topK: 2
    });

    // 3. Function Planner
    trace.plan = await functionPlanner({
      userMessage,
      analysis: trace.analysis,
      availableFunctions
    });

    // 4. Function Execution
    trace.functionResults = await functionExecutor({
      planned_functions: trace.plan.functions,
      functionRegistry
    });

    // 5. Conversation Summarizer — runs BEFORE context builder so summary feeds into prompt
    trace.conversationSummary = conversationSummarizer({
      messages: conversation.slice(-10)  // Bug #6 fix: was 'conversation' (ignored by fn)
    });

    // 6. Context Builder
    trace.context = contextBuilder({
      userMessage,
      memory: trace.memory,
      conversationSummary: trace.conversationSummary.conversation_summary || '',
      recentMessages: conversation.slice(-6),
      functionResults: trace.functionResults
    });

    // 7. Response Generator — actual LLM call
    trace.response = await responseGenerator({
      userMessage,
      context: trace.context,
      memory: trace.memory,
      functionResults: trace.functionResults
    });

    // 8. Memory Extractor — semantic LLM call, needs the actual AI response text
    trace.extractedMemory = await memoryExtractor({
      userMessage,
      aiResponse: trace.response,
      conversationHistory: trace.context.recent_messages || []
    });

    // 9. Memory Compressor
    trace.compressedMemory = memoryCompressor({
      memory: trace.extractedMemory
    });

    // 10. Memory Storage — persists extracted facts to memory.json
    await memoryStorage({
      memory: trace.compressedMemory,
      memoryPath: MEMORY_PATH
    });

    return {
      response: trace.response,
      conversationTurn: { role: 'assistant', content: trace.response },  // For frontend history
      trace
    };
  } catch (err) {
    return {
      response: '[AI Harness Error] ' + (err.message || err.toString()),
      trace,
      error: err
    };
  }
}

async function loadMemorySummary() {
  try {
    const data = await fs.readFile(MEMORY_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

module.exports = aiHarness;