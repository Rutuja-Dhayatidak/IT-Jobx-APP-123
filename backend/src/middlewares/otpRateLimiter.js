const {
  otpSendRateLimiterStore,
  otpCooldownLimiterStore,
  otpVerifyRateLimiterStore
} = require("../config/rateLimiter.config");
const { getLimiterKey } = require("../utils/rateLimitKeyGenerator");
const env = require("../config/env.config");

const otpSendRateLimiter = async (req, res, next) => {
  const identifier = req.body.email || req.body.phone;
  if (!identifier || typeof identifier !== "string") {
    return next();
  }

  const key = getLimiterKey(req, identifier);

  try {
    // 1. Check if the user is in 60-second cooldown period
    const cooldownRes = await otpCooldownLimiterStore.get(key);
    if (cooldownRes && cooldownRes.consumedPoints >= 1) {
      const secondsLeft = Math.round(cooldownRes.msBeforeNext / 1000) || 1;
      res.set("Retry-After", String(secondsLeft));
      return res.status(429).json({
        success: false,
        message: `Please wait ${secondsLeft} seconds before requesting another OTP.`
      });
    }

    // 2. Consume a point for OTP sending (max 3 in 10 minutes)
    await otpSendRateLimiterStore.consume(key);

    // 3. Initiate 60-second cooldown lockout
    await otpCooldownLimiterStore.consume(key);

    next();
  } catch (rateLimiterRes) {
    // Exceeded 3 requests in 10 minutes
    const secondsLeft = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    res.set("Retry-After", String(secondsLeft));
    return res.status(429).json({
      success: false,
      message: `Too many OTP requests. Please try again after ${Math.ceil(secondsLeft / 60)} minutes.`
    });
  }
};

const otpVerifyRateLimiter = async (req, res, next) => {
  const identifier = req.body.email || req.body.phone;
  if (!identifier || typeof identifier !== "string") {
    return next();
  }

  const key = getLimiterKey(req, identifier);

  try {
    // Check if verification limit is breached
    const limiterRes = await otpVerifyRateLimiterStore.get(key);
    if (limiterRes && limiterRes.consumedPoints >= 5) {
      const secondsLeft = Math.round(limiterRes.msBeforeNext / 1000) || 1;
      res.set("Retry-After", String(secondsLeft));
      return res.status(429).json({
        success: false,
        message: `Too many verification attempts. Please try again after ${Math.ceil(secondsLeft / 60)} minutes.`
      });
    }

    // Wrap res.json to reset verification attempts on success
    const originalJson = res.json;
    res.json = function (data) {
      res.json = originalJson; // Restore
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Verification succeeded -> reset attempts and send counters
        otpVerifyRateLimiterStore.delete(key).catch(() => {});
        otpSendRateLimiterStore.delete(key).catch(() => {});
        otpCooldownLimiterStore.delete(key).catch(() => {});
      } else {
        // Verification failed -> consume a point
        otpVerifyRateLimiterStore.consume(key).catch(() => {});
      }
      
      return originalJson.apply(this, arguments);
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  otpSendRateLimiter,
  otpVerifyRateLimiter
};
