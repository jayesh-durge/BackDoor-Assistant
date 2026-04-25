# 💡 Usage & Integration

The BackDoor Assistant is designed to be extensible. You can use it as a standalone app or integrate the `ai-harness` logic into your own projects.

## 🔌 Using the API

The backend (`server.js`) exposes a POST endpoint: `/api/ask`.

**Request Body:**
```json
{
  "question": "What are my current project goals?",
  "conversation": [...], 
  "availableFunctions": [...],
  "functionRegistry": {...},
  "memoryStore": {...}
}
```

**Response:**
The endpoint returns a Server-Sent Events (SSE) stream.
- `chunk`: Incremental text for real-time display.
- `finalResponse`: The complete final text from the model.
- `error`: Error details if something fails.

## 🛠️ Adding New Functions

To give the harness more "powers," you can register functions in the `functionRegistry`.
1. Define your function in a JS file.
2. Add the function definition to the `availableFunctions` array in your request.
3. The `functionPlanner` will then be able to "choose" your function when appropriate.

## 🧩 Customizing the Pipeline

Since every stage is a separate file in `ai-harness/pipeline/`, you can easily swap them out:
- Want to use a Vector Database instead of a JSON file for memory? Update `memoryStorage.js` and `memoryRetriever.js`.
- Want a different summarization logic? Edit `conversationSummarizer.js`.

---

[⬅️ Architecture & Pipeline](./ARCHITECTURE.md) | [Next: Contributing ➡️](./CONTRIBUTING.md)
