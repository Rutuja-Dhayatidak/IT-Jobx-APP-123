const mongoose = require("mongoose");
const { RateLimiterMongo, RateLimiterMemory } = require("rate-limiter-flexible");
const env = require("./env.config");

// Common helper to resolve the appropriate rate-limiter store
function createLimiter(opts) {
  // If database is not connected (e.g. running unit tests without db), fallback to memory store
  if (process.env.NODE_ENV === "test" && mongoose.connection.readyState !== 1) {
    return new RateLimiterMemory(opts);
  }

  // Use MongoDB store for multi-instance distributed rate limiting
  return new RateLimiterMongo({
    storeClient: mongoose.connection,
    tableName: opts.tableName || "rate_limits",
    ...opts
  });
}

// 1. Global API Limiter
const globalRateLimiterStore = createLimiter({
  tableName: "global_rate_limits",
  points: env.GLOBAL_RATE_LIMIT_MAX_REQUESTS,
  duration: env.GLOBAL_RATE_LIMIT_WINDOW_MINUTES * 60, // in seconds
  blockDuration: 0 // Do not block indefinitely, just limit
});

// 2. Login Failed Attempt Limiter
const loginRateLimiterStore = createLimiter({
  tableName: "login_rate_limits",
  points: env.LOGIN_MAX_FAILED_ATTEMPTS,
  duration: env.LOGIN_RATE_LIMIT_WINDOW_MINUTES * 60, // in seconds
  blockDuration: env.LOGIN_BLOCK_DURATION_MINUTES * 60 // Block for 30 minutes on breach
});

// 3. Register Request Limiter
const registerRateLimiterStore = createLimiter({
  tableName: "register_rate_limits",
  points: env.REGISTER_RATE_LIMIT_MAX,
  duration: 3600 // 1 hour in seconds
});

// 4. OTP Request Cooldown & Attempts Limiters
const otpSendRateLimiterStore = createLimiter({
  tableName: "otp_send_limits",
  points: env.OTP_MAX_REQUESTS,
  duration: env.OTP_RATE_LIMIT_WINDOW_MINUTES * 60
});

const otpCooldownLimiterStore = createLimiter({
  tableName: "otp_cooldown_limits",
  points: 1, // Max 1 request
  duration: env.OTP_COOLDOWN_SECONDS, // Cooldown duration
  blockDuration: env.OTP_COOLDOWN_SECONDS
});

const otpVerifyRateLimiterStore = createLimiter({
  tableName: "otp_verify_limits",
  points: 5, // Max 5 verification attempts
  duration: 10 * 60 // 10 minutes
});

// 5. Password Reset Request Limiter
const passwordResetRateLimiterStore = createLimiter({
  tableName: "password_reset_limits",
  points: env.FORGOT_PASSWORD_RATE_LIMIT_MAX,
  duration: 3600 // 1 hour in seconds
});

// 6. Job Search / Detail API Limiter
const jobApiRateLimiterStore = createLimiter({
  tableName: "job_api_limits",
  points: env.JOB_API_RATE_LIMIT_MAX,
  duration: 60 // 1 minute
});

// 7. File Upload Limiters (Resume, Profile Image, Company Document)
const resumeUploadRateLimiterStore = createLimiter({
  tableName: "resume_upload_limits",
  points: 10,
  duration: 3600 // 1 hour
});

const profileImageUploadRateLimiterStore = createLimiter({
  tableName: "profile_image_upload_limits",
  points: 10,
  duration: 3600
});

const companyDocUploadRateLimiterStore = createLimiter({
  tableName: "company_doc_upload_limits",
  points: 10,
  duration: 3600
});

module.exports = {
  globalRateLimiterStore,
  loginRateLimiterStore,
  registerRateLimiterStore,
  otpSendRateLimiterStore,
  otpCooldownLimiterStore,
  otpVerifyRateLimiterStore,
  passwordResetRateLimiterStore,
  jobApiRateLimiterStore,
  resumeUploadRateLimiterStore,
  profileImageUploadRateLimiterStore,
  companyDocUploadRateLimiterStore
};
