const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.get("/verify-invite/:token", authController.verifyInvite);
router.post("/activate-admin", authController.activateAdmin);

module.exports = router;
