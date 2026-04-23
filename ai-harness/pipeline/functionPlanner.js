// functionPlanner.js
// Decide which functions/tools (if any) need to be called.



/**
 * Function Planner
 * @param {Object} params
 * @param {string} params.userMessage - The user's message
 * @param {Object} params.analysis - Requirement analysis result
 * @param {Array<string>} params.availableFunctions - List of available function names
 * @returns {Object} Planning result
 */
async function functionPlanner({ userMessage, analysis = {}, availableFunctions = [] }) {
  // Decide if functions are needed
  const call_functions = !!(analysis.needs_functions && Array.isArray(analysis.required_functions) && analysis.required_functions.length > 0);
  // Select functions to call (intersection of required and available)
  const functions = (analysis.required_functions || []).filter(fn => availableFunctions.includes(fn));
  // Simple execution order: as they appear in user message, else as listed
  const msg = (userMessage || '').toLowerCase();
  const ordered = functions.slice().sort((a, b) => {
    const aIdx = msg.indexOf(a.toLowerCase());
    const bIdx = msg.indexOf(b.toLowerCase());
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });
  return {
    call_functions,
    functions,
    execution_order: ordered
  };
}

module.exports = functionPlanner;

// Example usage:
// (async () => {
//   const result = await functionPlanner({
//     userMessage: 'First summarize, then translate',
//     analysis: {
//       needs_functions: true,
//       required_functions: ['summarize', 'translate']
//     },
//     availableFunctions: ['summarize', 'translate', 'search']
//   });
//   console.log(result);
// })();