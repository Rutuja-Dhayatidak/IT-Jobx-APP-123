const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const superAdminController = require("../controllers/superAdminController");
const verifyToken = require("../middleware/verifyToken");
const isPlatformAdmin = require("../middleware/isPlatformAdmin");
const checkPermission = require("../middleware/checkPermission");
const logAction = require("../middleware/auditMiddleware");

// All routes protected by verifyToken
router.use(verifyToken);

// Dashboard (General access, no specific module check unless needed)
router.get("/dashboard", adminController.getDashboardStats);

// Users Management
router.get("/users", checkPermission("Candidates", "view"), adminController.getUsers);
router.post("/users/add", checkPermission("Candidates", "create"), logAction("candidates", "CREATE"), adminController.addCandidate);
router.put("/users/:id/block", checkPermission("Candidates", "edit"), logAction("candidates", "BLOCK"), adminController.blockUser);
router.get("/users/:id/history", checkPermission("Candidates", "view"), superAdminController.getBlockHistory);

// Companies Management
router.get("/companies", checkPermission("Companies", "view"), adminController.getCompanies);
router.get("/companies/:id/review", checkPermission("Companies", "view"), adminController.getCompanyReviewDetails);
router.put("/companies/:id/verify", checkPermission("Companies", "approve"), logAction("companies", "APPROVE"), adminController.verifyCompany);
router.put("/companies/:id/approve", checkPermission("Companies", "approve"), logAction("companies", "APPROVE_REGISTRATION"), adminController.approveCompany);
router.put("/companies/:id/reject", checkPermission("Companies", "approve"), logAction("companies", "REJECT_REGISTRATION"), adminController.rejectCompany);
router.put("/companies/:id/escalate", checkPermission("Companies", "approve"), logAction("companies", "ESCALATE"), adminController.escalateCompany);

// Jobs Management
router.get("/jobs", checkPermission("Jobs", "view"), adminController.getJobs);
router.put("/jobs/:id/approve", checkPermission("Jobs", "APPROVE"), logAction("jobs", "APPROVE"), adminController.approveJob);

// Support Management
router.get("/tickets", checkPermission("Support", "view"), adminController.getTickets);
router.put("/tickets/:id/resolve", checkPermission("Support", "edit"), logAction("support", "RESOLVE_TICKET"), adminController.resolveTicket);

module.exports = router;
