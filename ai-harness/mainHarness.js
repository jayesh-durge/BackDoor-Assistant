// mainHarness.js
// Entry point for the AI harness, re-exports aiHarness for server.js compatibility

const aiHarness = require('./aiHarness');
module.exports = aiHarness;
