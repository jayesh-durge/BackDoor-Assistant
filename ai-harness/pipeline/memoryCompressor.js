// memoryCompressor.js
// Compress memory/context for efficient storage and retrieval.

/**
 * Memory Compressor
 * @param {Object} params
 * @param {Object} params.memory - Full memory/context object
 * @returns {Object} Compressed memory
 */
function memoryCompressor({ memory = {} }) {
  // Simple compression: keep only most recent 2 items per category
  const compressed = {};
  for (const key of Object.keys(memory)) {
    const arr = Array.isArray(memory[key]) ? memory[key] : [memory[key]];
    compressed[key] = arr.slice(-2);
  }
  return compressed;
}

module.exports = memoryCompressor;

// Example usage:
// const compressed = memoryCompressor({
//   memory: { goals: ['A', 'B', 'C'], projects: ['X', 'Y'] }
// });
// console.log(compressed);