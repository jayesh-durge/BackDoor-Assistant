# 📖 Setup Guide

Welcome to the BackDoor Assistant! This guide will help you get the AI harness up and running on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- An [OpenRouter API Key](https://openrouter.ai/keys) (The harness uses OpenRouter to access various LLMs)

## 🚀 Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/jayesh-durge/BackDoor-Assistant.git
cd BackDoor-Assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and add your credentials:
```bash
cp .env.example .env
```
Open the `.env` file and fill in the following:
- `OPENROUTER_API_KEY`: Your API key from OpenRouter.
- `OPENROUTER_MODEL`: (Optional) The model you want to use (default is `openai/gpt-4o-mini`).

### 4. Start the Server
```bash
node server.js
```
The server will start at `http://localhost:3000`.

## 🌐 Accessing the UI
Once the server is running, simply open `http://localhost:3000` in your web browser. You'll be greeted by the high-contrast fintech UI where you can start interacting with the harness.

## 🧪 Testing the Harness
Try asking the bot something about yourself or give it a task. You can observe the `memory.json` file in the root directory to see how the harness extracts and stores facts about the interaction in real-time.

---

[⬅️ Back to README](../README.md) | [Next: Architecture & Pipeline ➡️](./ARCHITECTURE.md)
