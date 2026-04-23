// responseGenerator.js
// Generate the final response for the user based on context and function results.

/**
 * Response Generator
 * @param {Object} params
 * @param {Object} params.context - Optimized context for response
 * @param {Object} params.functionResults - Results from executed functions
 * @returns {string} Final response to user
 */
function responseGenerator({ context = {}, functionResults = {} }) {
  // Simple template: prioritize function results, else summarize context
  if (functionResults && Object.keys(functionResults).length > 0) {
    return Object.entries(functionResults)
      .map(([fn, res]) => `${fn}: ${typeof res === 'object' ? JSON.stringify(res) : res}`)
      .join('\n');
  }
  // Fallback: summarize context
  return `Here is your context summary: ${JSON.stringify(context)}`;
}

module.exports = responseGenerator;

// Example usage:
// const response = responseGenerator({
//   context: { user_message: 'Summarize my projects' },
//   functionResults: { summarize: 'You have 2 Python projects.' }
// });
// console.log(response);