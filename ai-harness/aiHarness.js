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
      memorySummary: await loadMemorySummary()
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

    // 5. Context Builder
    trace.context = contextBuilder({
      userMessage,
      memory: trace.memory,
      conversationSummary: '', // Will update after summarizer
      recentMessages: conversation.slice(-5),
      functionResults: trace.functionResults
    });

    // 6. Response Generator
    trace.response = await responseGenerator({
      userMessage,
      context: trace.context,
      memory: trace.memory,
      functionResults: trace.functionResults
    });

    // 7. Memory Extractor
    trace.extractedMemory = memoryExtractor({
      userMessage,
      aiResponse: trace.response
    });

    // 8. Memory Compressor
    trace.compressedMemory = memoryCompressor({
      memory: trace.extractedMemory
    });

    // 9. Memory Storage
    await memoryStorage({
      compressed_memory: trace.compressedMemory.compressed_memory,
      memoryPath: MEMORY_PATH
    });

    // 10. Conversation Summarizer
    trace.conversationSummary = conversationSummarizer({
      conversation: conversation.concat({ role: 'user', content: userMessage }, { role: 'assistant', content: trace.response }),
      maxMessages: 10
    });

    // Update context with new summary
    trace.context.conversation_summary = trace.conversationSummary.conversation_summary;

    return {
      response: trace.response,
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