// finalResponder.js
// Handles final AI call and response (streaming, context injection, coaching style)
const getAIResponse = require('./aiResponse');

async function finalResponder(userInput, loadedContext, userContext) {
  // Optionally, add more formatting or post-processing here
  return await getAIResponse(userInput, loadedContext, userContext);
}

module.exports = finalResponder;
