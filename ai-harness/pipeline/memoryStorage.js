// memoryStorage.js
// Store updated memory/context to persistent storage (memory.json).

const fs = require('fs');
const path = require('path');

/**
 * Memory Storage
 * @param {Object} params
 * @param {Object} params.memory - Memory/context to store
 * @param {string} [params.memoryPath] - Path to memory.json
 * @returns {boolean} Success
 */
function memoryStorage({ memory = {}, memoryPath }) {
  const filePath = memoryPath || path.join(__dirname, '../memory.json');
  try {
    fs.writeFileSync(filePath, JSON.stringify(memory, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = memoryStorage;

// Example usage:
// const ok = memoryStorage({
//   memory: { goals: ['Learn AI'] },
//   memoryPath: path.join(__dirname, '../memory.json')
// });
// console.log(ok);