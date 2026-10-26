// In-memory rate limiter for login protection
const loginAttempts = new Map();

/**
 * Check if a key (IP or username) is rate limited
 * @param {string} key 
 * @param {number} maxAttempts 
 * @param {number} windowMs 
 * @returns {{ allowed: boolean, remainingAttempts: number, retryAfterSeconds: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) {
    loginAttempts.set(key, { attempts: 1, resetTime: now + windowMs });
    return { allowed: true, remainingAttempts: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (now > record.resetTime) {
    // Window expired, reset
    loginAttempts.set(key, { attempts: 1, resetTime: now + windowMs });
    return { allowed: true, remainingAttempts: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (record.attempts >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  record.attempts += 1;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.attempts,
    retryAfterSeconds: 0,
  };
}

/**
 * Reset rate limit counter on successful login
 * @param {string} key 
 */
export function resetRateLimit(key) {
  loginAttempts.delete(key);
}
