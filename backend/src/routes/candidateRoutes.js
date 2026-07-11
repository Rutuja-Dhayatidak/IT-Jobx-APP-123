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

// 🔹 Register (OTP send)
router.post("/register", registerCandidate);

// 🔹 Verify OTP
router.post("/verify-otp", verifyOtp);

// 🔹 Login
router.post("/login", loginCandidate);

// 🔹 Protected Profile
router.get("/profile", verifyToken, getProfile);

// 🔹 Change Password
router.put("/change-password", verifyToken, changePassword);

module.exports = router;