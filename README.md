# 🚪 BackDoor Assistant: The Ultimate AI Harness

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/jayesh-durge/BackDoor-Assistant)
![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![AI Harness](https://img.shields.io/badge/AI-Harness-blue)

**BackDoor Assistant** is a high-performance, open-source AI harness designed to break the limitations of standard chat interfaces. While generic AI platforms (like ChatGPT's default harness) often struggle with context window exhaustion and "forgetting" crucial details, BackDoor provides a specialized **Multi-Stage Context Pipeline** that ensures your AI remains context-aware, persistent, and capable of complex task execution.

---

## 🚀 The Vision: Beyond the Context Window

The "BackDoor" philosophy is about creating a side-channel for intelligence. Instead of just sending a message to an LLM, we build a **harness** that:
1. **Never Forgets**: Uses semantic memory extraction and retrieval to maintain long-term user context.
2. **Infinite Context**: Managing token limits by summarizing, compressing, and retrieving only relevant facts.
3. **Agentic Power**: A built-in planner and executor for functions, turning a chatbot into an active assistant.
4. **Open Source Nature**: Built for developers who want a context-driven engine for their own projects without being locked into premium proprietary harnesses.

---

## 🛠️ Project Structure

The project is divided into several logical modules to ensure scalability and ease of contribution:

- [**📖 Setup Guide**](./docs/SETUP.md): Get the harness running locally in minutes.
- [**🏗️ Architecture & Pipeline**](./docs/ARCHITECTURE.md): Deep dive into how the multi-stage harness works.
- [**💡 Usage & Integration**](./docs/USAGE.md): How to use this harness for your own context-driven bots.
- [**🤝 Contributing**](./docs/CONTRIBUTING.md): Help us build the most powerful open-source AI harness.

---

## 📂 Repository at a Glance

```text
.
├── ai-harness/           # Core AI logic (The "Brain")
│   ├── pipeline/         # Specialized stages (Analysis, Memory, Execution)
│   └── aiHarness.js      # The pipeline orchestrator
├── server.js             # Express backend for API & SSE Streaming
├── index.html            # Premium Fintech-inspired UI
└── config.js             # Centralized environment management
```

---

## 🌟 Key Features

- **Semantic Memory**: Automatically extracts facts from conversations and stores them for future recall.
- **Task Planning**: Analyzes user intent to decide which functions to call before generating a response.
- **SSE Streaming**: Real-time response streaming for a premium, fast user experience.
- **Fintech Aesthetic**: High-contrast, minimal design focused on professional productivity.

---

## 🏷️ Tags & Keywords
`AI-Harness` `Context-Aware-AI` `Long-Term-Memory` `Open-Source-LLM` `Agentic-Workflows` `NodeJS-AI` `Semantic-Memory` `RAG-Implementation` `OpenRouter` `Chatbot-Harness`

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*“Build a harness so powerful that the model never feels the constraints of its window.”*
