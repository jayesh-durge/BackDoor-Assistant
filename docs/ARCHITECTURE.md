# 🏗️ Architecture & Pipeline

The BackDoor Assistant is not just a chatbot wrapper; it is a **Multi-Stage AI Pipeline**. It breaks down the interaction into distinct logical steps to ensure the model has maximum context and minimum "hallucination."

## 🛣️ The Execution Pipeline

Every message sent to the harness goes through the following stages (found in `ai-harness/pipeline/`):

### 1. 🔍 Requirement Analysis
The `requirementAnalyzer.js` parses the user's input against available tools and existing memory to determine what the model needs to "know" or "do" before it can answer.

### 2. 🧠 Memory Retrieval
Instead of dumping the entire history, `memoryRetriever.js` performs a semantic search (using `memory.json`) to pull only the relevant facts related to the current query. This keeps the prompt clean and focused.

### 3. 📝 Function Planning
The `functionPlanner.js` decides if any external functions (APIs, calculations, etc.) need to be called to fulfill the user's request.

### 4. ⚙️ Function Execution
`functionExecutor.js` runs the planned functions and captures their output to be injected into the model's context.

### 5. 📉 Conversation Summarization
To handle long conversations, `conversationSummarizer.js` maintains a high-level summary of the chat, allowing the model to remember the "vibe" and "goal" of the session without needing every single token from line 1.

### 6. 🏗️ Context Building
The `contextBuilder.js` assembles all the gathered pieces (Memory, Function Results, Summaries, Recent Messages) into a structured prompt.

### 7. ✍️ Response Generation
The `responseGenerator.js` sends the final context to the LLM (via OpenRouter) and streams the response back to the user.

### 8. 🧬 Memory Extraction & Storage
After the response is generated, `memoryExtractor.js` looks at the new information exchanged and updates `memory.json`. This ensures the "BackDoor" to the user's world is always up to date.

---

## 🎨 Design Philosophy: "The Harness vs. The Model"

We believe that the **Harness** is more important than the **Model**. A weak model with a great harness (good memory, perfect context, tool use) will always outperform a powerful model with a weak harness.

By building this harness as an open-source project, we are enabling developers to:
- Use cheaper/smaller models effectively.
- Bypass proprietary context limits.
- Build agents that actually *learn* from their users over time.

---

[⬅️ Setup Guide](./SETUP.md) | [Next: Usage & Integration ➡️](./USAGE.md)
