const express = require("express");
const router = express.Router();
const enterprisePaymentController = require("../controllers/enterprisePaymentController");

// 💳 Enterprise Payment Routes
router.post("/create-payment-link", enterprisePaymentController.createPaymentLink);
router.get("/payment-status/:lead_id", enterprisePaymentController.getPaymentStatus);
router.get("/sync-payment-status/:lead_id", enterprisePaymentController.syncPaymentStatus);

// Note: Webhook route requires raw body parsing in app.js
router.post("/payment-webhook", enterprisePaymentController.handleWebhook);

module.exports = router;
