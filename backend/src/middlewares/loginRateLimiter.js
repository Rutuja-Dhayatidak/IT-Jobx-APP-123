const { loginRateLimiterStore } = require("../config/rateLimiter.config");
const { getLimiterKey } = require("../utils/rateLimitKeyGenerator");
const env = require("../config/env.config");

const loginRateLimiter = async (req, res, next) => {
  const email = req.body.email;
  if (!email || typeof email !== "string") {
    return next();
  }

  const key = getLimiterKey(req, email);

  try {
    // 1. Check if key is currently blocked
    const limiterRes = await loginRateLimiterStore.get(key);
    if (limiterRes && limiterRes.consumedPoints >= env.LOGIN_MAX_FAILED_ATTEMPTS) {
      const secondsLeft = Math.round(limiterRes.msBeforeNext / 1000) || 1;
      res.set("Retry-After", String(secondsLeft));
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please try again after ${Math.ceil(secondsLeft / 60)} minutes.`
      });
    }

    // 2. Wrap res.json to detect successful logins and reset attempts
    const originalJson = res.json;
    res.json = function (data) {
      res.json = originalJson; // Restore
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Successful login -> delete failed attempt logs
        loginRateLimiterStore.delete(key).catch(() => {});
      } else if (res.statusCode === 401 || res.statusCode === 400 || res.statusCode === 404 || res.statusCode === 422) {
        // Failed login attempt -> consume a point
        loginRateLimiterStore.consume(key).catch(() => {});
      }
      
      return originalJson.apply(this, arguments);
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = loginRateLimiter;
