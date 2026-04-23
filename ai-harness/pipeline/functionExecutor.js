// functionExecutor.js
// Execute planned functions/tools and collect results.


/**
 * Function Executor
 * @param {Object} params
 * @param {Array<string>} params.planned_functions - Functions to execute
 * @param {Object} params.functionRegistry - Map of function names to actual functions
 * @param {Object} params.inputData - Optional input data for functions
 * @returns {Object} Results of executed functions
 */
async function functionExecutor({ planned_functions = [], functionRegistry = {}, inputData = {} }) {
  const results = {};
  for (const fnName of planned_functions) {
    if (typeof functionRegistry[fnName] === 'function') {
      try {
        results[fnName] = await functionRegistry[fnName](inputData);
      } catch (e) {
        results[fnName] = { error: e.message };
      }
    } else {
      results[fnName] = { error: 'Function not found' };
    }
  }
  return { function_results: results };
}

module.exports = functionExecutor;

// Example usage:
// (async () => {
//   const registry = {
//     runCode: async () => 'Code executed',
//     searchDocs: async () => 'Docs found'
//   };
//   const result = await functionExecutor({
//     planned_functions: ['runCode', 'searchDocs', 'notExist'],
//     functionRegistry: registry
//   });
//   console.log(result);
// })();