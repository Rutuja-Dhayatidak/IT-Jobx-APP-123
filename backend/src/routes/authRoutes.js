const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const googleAuth = require("../controllers/googleAuthController");
const validateRequest = require("../middlewares/validateRequest");
const { loginSchema, resetPasswordSchema } = require("../validations/auth.validation");
const loginRateLimiter = require("../middlewares/loginRateLimiter");

router.post("/login", loginRateLimiter, validateRequest(loginSchema), authController.login);
router.post("/google", googleAuth.googleLogin);
router.get("/verify-invite/:token", authController.verifyInvite);
router.post("/activate-admin", validateRequest(resetPasswordSchema), authController.activateAdmin);

module.exports = router;
