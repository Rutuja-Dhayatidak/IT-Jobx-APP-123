const { globalRateLimiterStore } = require("../config/rateLimiter.config");
const { getClientIp } = require("../utils/rateLimitKeyGenerator");

const globalRateLimiter = async (req, res, next) => {
  // Exclude health check endpoint from global rate limiting
  if (req.path === "/health" || req.path === "/api/health") {
    return next();
  }

  const key = getClientIp(req);

  try {
    const rateLimiterRes = await globalRateLimiterStore.consume(key);
    
    // Set standard rate limit headers
    res.set("X-RateLimit-Limit", String(globalRateLimiterStore.points));
    res.set("X-RateLimit-Remaining", String(rateLimiterRes.remainingPoints));
    res.set("X-RateLimit-Reset", new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
    
    next();
  } catch (rateLimiterRes) {
    // If rateLimiterRes is an object with remaining points, we exceeded limits
    const secondsLeft = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    res.set("Retry-After", String(secondsLeft));
    res.set("X-RateLimit-Limit", String(globalRateLimiterStore.points));
    res.set("X-RateLimit-Remaining", "0");
    res.set("X-RateLimit-Reset", new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());

    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again after some time.",
      retryAfter: secondsLeft
    });
  }
};

module.exports = globalRateLimiter;
