// retry.js - Retry logic with exponential backoff
async function retry(fn, maxAttempts = 3, baseDelay = 500) {
  let attempt = 0;
  let lastErr;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise(res => setTimeout(res, baseDelay * Math.pow(2, attempt)));
      attempt++;
    }
  }
  throw lastErr;
}

module.exports = retry;
