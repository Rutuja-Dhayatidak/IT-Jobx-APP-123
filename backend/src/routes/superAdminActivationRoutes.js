const express = require("express");
const router = express.Router();
const activationController = require("../controllers/activationController");
// Assuming you have a middleware for superAdmin protection
// const { protect, superAdminOnly } = require("../middleware/authMiddleware");

// 🚀 Super Admin Activation Routes
router.post("/activate", activationController.activateEnterprisePlan);
router.get("/pending", activationController.getPendingActivations);
router.get("/account-managers", activationController.getAccountManagers);

module.exports = router;
