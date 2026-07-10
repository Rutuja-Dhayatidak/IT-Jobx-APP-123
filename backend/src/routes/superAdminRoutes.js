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

// Plans Management
const plansController = require("../controllers/plansController");
router.get("/plans", plansController.getPlans);
router.post("/plans", logAction("plans", "CREATE"), plansController.createPlan);
router.put("/plans/:id", logAction("plans", "UPDATE"), plansController.updatePlan);
router.patch("/plans/:id/toggle", logAction("plans", "TOGGLE_ACTIVE"), plansController.togglePlanActive);
router.delete("/plans/:id", logAction("plans", "DELETE"), plansController.deletePlan);
router.get("/plans/stats", plansController.getStats);

// Subscriptions
router.use("/subscriptions", require("./superAdminSubscriptionRoutes"));

// RBAC Management
router.use("/rbac", require("./rbacRoutes"));

// Audit Logs
router.use("/audit", require("./auditRoutes"));

// Enterprise Management
const enterpriseManagementController = require("../controllers/enterpriseManagementController");
router.get("/enterprise/leads", enterpriseManagementController.getLeads);
router.get("/enterprise/leads/:id", enterpriseManagementController.getLeadById);
router.patch("/enterprise/leads/:id/status", logAction("enterprise", "UPDATE_LEAD_STATUS"), enterpriseManagementController.updateLeadStatus);
router.delete("/enterprise/leads/:id", logAction("enterprise", "DELETE_LEAD"), enterpriseManagementController.deleteLead);
router.get("/enterprise/payments", enterpriseManagementController.getPayments);
router.get("/enterprise/active-clients", enterpriseManagementController.getActiveClients);
router.get("/enterprise/account-managers", enterpriseManagementController.getAccountManagers);
router.post("/enterprise/activate", logAction("enterprise", "ACTIVATE_PLAN"), enterpriseManagementController.activateEnterprisePlan);
router.post("/enterprise/leads/:id/note", logAction("enterprise", "ADD_NOTE"), enterpriseManagementController.updateLeadNote);
router.put("/enterprise/payments/:id/verify", logAction("enterprise", "VERIFY_PAYMENT"), enterpriseManagementController.verifyEnterprisePayment);

module.exports = router;
