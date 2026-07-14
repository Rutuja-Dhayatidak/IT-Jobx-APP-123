const { passwordResetRateLimiterStore } = require("../config/rateLimiter.config");
const { getLimiterKey } = require("../utils/rateLimitKeyGenerator");

const passwordResetRateLimiter = async (req, res, next) => {
  const email = req.body.email;
  if (!email || typeof email !== "string") {
    return next();
  }

  const key = getLimiterKey(req, email);

  try {
    await passwordResetRateLimiterStore.consume(key);
    next();
  } catch (rateLimiterRes) {
    const secondsLeft = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    res.set("Retry-After", String(secondsLeft));
    return res.status(429).json({
      success: false,
      message: `Too many password reset requests. Please try again after ${Math.ceil(secondsLeft / 60)} minutes.`
    });
  }
};

module.exports = passwordResetRateLimiter;
