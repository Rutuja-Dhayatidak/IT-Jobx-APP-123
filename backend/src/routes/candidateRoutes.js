const express = require("express");
const router = express.Router();

const {
  registerCandidate,
  verifyOtp,
  loginCandidate,
  getProfile,
  changePassword
} = require("../controllers/candidateController");

const verifyToken = require("../middleware/verifyToken");
const validateRequest = require("../middlewares/validateRequest");
const { registerSchema, verifyOtpSchema, loginSchema } = require("../validations/auth.validation");

const registerRateLimiter = require("../middlewares/registerRateLimiter");
const loginRateLimiter = require("../middlewares/loginRateLimiter");
const { otpVerifyRateLimiter } = require("../middlewares/otpRateLimiter");

// 🔹 Register (OTP send)
router.post(
  "/register",
  registerRateLimiter,
  validateRequest(registerSchema),
  registerCandidate
);

// 🔹 Verify OTP
router.post(
  "/verify-otp",
  otpVerifyRateLimiter,
  validateRequest(verifyOtpSchema),
  verifyOtp
);

// 🔹 Login
router.post(
  "/login",
  loginRateLimiter,
  validateRequest(loginSchema),
  loginCandidate
);

// 🔹 Protected Profile
router.get("/profile", verifyToken, getProfile);

// 🔹 Change Password
router.put("/change-password", verifyToken, changePassword);

module.exports = router;