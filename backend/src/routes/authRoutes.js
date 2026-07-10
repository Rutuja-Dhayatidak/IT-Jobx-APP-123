const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const googleAuth = require("../controllers/googleAuthController");

router.post("/login", authController.login);
router.post("/google", googleAuth.googleLogin);
router.get("/verify-invite/:token", authController.verifyInvite);
router.post("/activate-admin", authController.activateAdmin);

module.exports = router;
