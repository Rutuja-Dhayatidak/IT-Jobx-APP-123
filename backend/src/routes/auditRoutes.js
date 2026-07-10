const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const verifyToken = require("../middleware/verifyToken");
const { isSuperAdmin } = require("../middleware/superAdminMiddleware");

// Only Super Admin can view audit logs
router.use(verifyToken, isSuperAdmin);

router.get("/", auditController.getAuditLogs);
router.get("/:id", auditController.getAuditLogById);

module.exports = router;
