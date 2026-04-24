// server.js - Express backend to connect website to AI harness
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mainHarness = require('./ai-harness/mainHarness');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (including index.html) from the project root
app.use(express.static(__dirname));


// POST /api/ask - expects { question: "..." }
app.post('/api/ask', async (req, res) => {
  const { question, conversation, availableFunctions, functionRegistry, memoryStore } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Invalid or empty question.' });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // For demo: fallback to empty or default values if not provided
    const result = await mainHarness({
      userMessage: question.trim(),
      conversation: Array.isArray(conversation) ? conversation.slice(-6) : [],
      availableFunctions: Array.isArray(availableFunctions) ? availableFunctions : [],
      functionRegistry: typeof functionRegistry === 'object' && functionRegistry !== null ? functionRegistry : {},
      memoryStore: typeof memoryStore === 'object' && memoryStore !== null ? memoryStore : {},
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    });
    res.write(`data: ${JSON.stringify({ trace: result.trace, finalResponse: result.response })}\n\n`);
    res.end();
  } catch (err) {
    console.error('[SERVER ERROR]', err);
    res.write(`data: ${JSON.stringify({ error: 'AI harness error', details: err.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`AI Harness server running at http://localhost:${PORT}`);
});
