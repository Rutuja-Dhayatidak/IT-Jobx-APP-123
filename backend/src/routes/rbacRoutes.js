const express = require("express");
const router = express.Router();
const rbacController = require("../controllers/rbacController");
const verifyToken = require("../middleware/verifyToken");

const logAction = require("../middleware/auditMiddleware");

// Protected routes (Super Admin only check should be here, but using verifyToken for now)
router.use(verifyToken); 

router.post("/seed", rbacController.seedRoles);
router.get("/roles", rbacController.getAllRoles);
router.get("/permissions/:roleName", rbacController.getRolePermissions);
router.post("/update", logAction("rbac", "UPDATE"), rbacController.updatePermissions);

module.exports = router;
