const { jobApiRateLimiterStore } = require("../config/rateLimiter.config");
const { getClientIp } = require("../utils/rateLimitKeyGenerator");

const jobRateLimiter = async (req, res, next) => {
  // Bypass rate limiting in development/local environments
  const env = require("../config/env.config");
  if (env.NODE_ENV !== "production") {
    return next();
  }

  // If user is authenticated, use User ID. Otherwise, fallback to Client IP.
  const identifier = req.user ? (req.user.id || req.user._id || "").toString() : null;
  const key = identifier ? `user_${identifier}` : getClientIp(req);

  try {
    await jobApiRateLimiterStore.consume(key);
    next();
  } catch (rateLimiterRes) {
    const secondsLeft = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    res.set("Retry-After", String(secondsLeft));
    return res.status(429).json({
      success: false,
      message: "Too many search requests. Please slow down and try again later.",
      retryAfter: secondsLeft
    });
  }
};

module.exports = jobRateLimiter;
