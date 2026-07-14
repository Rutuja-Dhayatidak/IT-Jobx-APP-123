const { registerRateLimiterStore } = require("../config/rateLimiter.config");
const { getClientIp } = require("../utils/rateLimitKeyGenerator");
const env = require("../config/env.config");

const registerRateLimiter = async (req, res, next) => {
  const key = getClientIp(req);

  try {
    await registerRateLimiterStore.consume(key);
    next();
  } catch (rateLimiterRes) {
    const secondsLeft = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    res.set("Retry-After", String(secondsLeft));
    return res.status(429).json({
      success: false,
      message: `Too many registration attempts from this IP. Please try again after ${Math.ceil(secondsLeft / 60)} minutes.`
    });
  }
};

module.exports = registerRateLimiter;
