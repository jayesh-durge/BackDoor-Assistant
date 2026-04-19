// server.js - Express backend to connect website to AI harness
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const aiHarness = require('./ai-harness/aiHarness');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (including index.html) from the project root
app.use(express.static(__dirname));

// POST /api/ask - expects { question: "..." }
app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Invalid or empty question.' });
  }
  try {
    const response = await aiHarness(question.trim());
    res.json({ response });
  } catch (err) {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ error: 'AI harness error', details: err.message, stack: err.stack });
  }
});

app.listen(PORT, () => {
  console.log(`AI Harness server running at http://localhost:${PORT}`);
});
