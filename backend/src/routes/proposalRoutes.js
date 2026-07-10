const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposalController");

// Public routes for proposal actions
router.get("/accept/:token", proposalController.acceptProposal);
router.get("/request-changes/:token", proposalController.getChangeRequestForm);
router.post("/submit-changes/:token", proposalController.submitChangeRequest);
router.get("/reject/:token", proposalController.getRejectConfirmation);
router.post("/confirm-reject/:token", proposalController.confirmRejection);
router.get("/track/:token", proposalController.trackProposal);

module.exports = router;
