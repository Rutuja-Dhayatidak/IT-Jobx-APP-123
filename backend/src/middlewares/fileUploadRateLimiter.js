const {
  resumeUploadRateLimiterStore,
  profileImageUploadRateLimiterStore,
  companyDocUploadRateLimiterStore
} = require("../config/rateLimiter.config");
const { getClientIp } = require("../utils/rateLimitKeyGenerator");

function createUploadLimiterMiddleware(store) {
  return async (req, res, next) => {
    const identifier = req.user ? (req.user.id || req.user._id || "").toString() : null;
    const key = identifier ? `user_${identifier}` : getClientIp(req);

    try {
      await store.consume(key);
      next();
    } catch (rateLimiterRes) {
      const secondsLeft = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
      res.set("Retry-After", String(secondsLeft));
      
      return res.status(429).json({
        success: false,
        error: {
          code: "UPLOAD_RATE_LIMIT_EXCEEDED",
          message: "Too many upload attempts. Please try again later.",
          retryAfter: secondsLeft
        }
      });
    }
  };
}

const resumeUploadRateLimiter = createUploadLimiterMiddleware(resumeUploadRateLimiterStore);
const profileImageUploadRateLimiter = createUploadLimiterMiddleware(profileImageUploadRateLimiterStore);
const companyDocUploadRateLimiter = createUploadLimiterMiddleware(companyDocUploadRateLimiterStore);

module.exports = {
  resumeUploadRateLimiter,
  profileImageUploadRateLimiter,
  companyDocUploadRateLimiter
};
