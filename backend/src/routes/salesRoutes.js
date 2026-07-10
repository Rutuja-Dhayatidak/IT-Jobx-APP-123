const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const salesController = require("../controllers/salesController");

// Role authorization middleware for Sales users
const isSales = (req, res, next) => {
  if (req.user && (req.user.role === "sales" || req.user.role === "Sales Panel")) {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access denied. Sales Panel authorization required." });
  }
};

// 👁️ PUBLIC TRACKING PIXEL (No Auth)
router.get("/track-proposal/:id", salesController.trackProposalOpen);

// Apply security guards
router.use(verifyToken, isSales);

// 📊 Dashboard KPIs
router.get("/dashboard", salesController.getDashboardStats);

// 👥 Leads CRM Routes
router.get("/leads", salesController.getLeads);
router.post("/leads", salesController.createLead);
router.put("/leads/:id", salesController.updateLead);
router.delete("/leads/:id", salesController.deleteLead);
router.post("/leads/:id/schedule-demo", salesController.scheduleDemo);
router.post("/leads/:id/send-proposal", salesController.sendProposal);
router.get("/leads/:id/preview-proposal", salesController.previewProposal);
router.post("/leads/:id/generate-invoice", require('../controllers/financeController').generateInvoice);

// 📆 Tasks Routes
router.get("/tasks", salesController.getTasks);
router.post("/tasks", salesController.createTask);
router.put("/tasks/:id", salesController.updateTask);

// 🗓️ Follow-Ups list
router.get("/followups", salesController.getFollowups);

// 👤 Profile settings
router.get("/profile", salesController.getProfile);
router.put("/profile", salesController.updateProfile);

module.exports = router;
