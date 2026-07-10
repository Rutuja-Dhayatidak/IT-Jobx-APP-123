const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const verifyToken = require("../middleware/verifyToken");
const { isSuperAdmin } = require("../middleware/superAdminMiddleware");
const logAction = require("../middleware/auditMiddleware");

// Apply middlewares to all routes
router.use(verifyToken, isSuperAdmin);

router.get("/dashboard", superAdminController.getDashboardStats);

// Candidates
router.get("/candidates", superAdminController.getCandidates);
router.put("/candidates/:id/block", logAction("candidates", "BLOCK"), superAdminController.toggleBlockCandidate);
router.patch("/candidates/:id/override", logAction("candidates", "OVERRIDE"), superAdminController.overrideUserStatus);
router.get("/candidates/:id/history", superAdminController.getBlockHistory);

// Admin Management
router.post("/admins/create", logAction("admins", "CREATE"), superAdminController.createAdmin);
router.get("/admins", superAdminController.getAdmins);
router.put("/admins/:id", logAction("admins", "UPDATE"), superAdminController.updateAdmin);
router.put("/admins/:id/suspend", logAction("admins", "SUSPEND"), superAdminController.toggleSuspendAdmin);
router.delete("/admins/:id", logAction("admins", "REVOKE"), superAdminController.revokeAdmin);

// Companies
router.get("/companies", superAdminController.getCompanies);
router.put("/companies/:id/verify", logAction("companies", "APPROVE"), superAdminController.verifyCompany);

// Jobs
router.get("/jobs", superAdminController.getJobs);
router.put("/jobs/:id/status", logAction("jobs", "UPDATE"), superAdminController.updateJobStatus);

// RBAC Management
router.use("/rbac", require("./rbacRoutes"));

// Audit Logs
router.use("/audit", require("./auditRoutes"));

module.exports = router;
