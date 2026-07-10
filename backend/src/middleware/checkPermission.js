const Role = require("../models/Role");

const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      // 1. Get user and role from request (set by verifyToken)
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: "Unauthorized. Role not found." });
      }

      const userRole = req.user.role;

      // 2. Super Admin bypass
      if (userRole === "superAdmin") {
        return next();
      }

      // 3. Find role permissions in DB
      const roleData = await Role.findOne({ name: { $regex: new RegExp(`^${userRole}$`, "i") } });

      if (!roleData) {
        return res.status(403).json({ message: "Access denied. Role configuration missing." });
      }

      // 4. Check if permission exists in the new nested structure
      const modulePermission = roleData.permissions.find(
        p => p.module.toLowerCase() === moduleName.toLowerCase()
      );

      if (modulePermission && modulePermission.actions.includes(action.toLowerCase())) {
        return next();
      }

      res.status(403).json({ 
        message: `Access denied. You don't have '${action}' permission for '${moduleName}' module.` 
      });

    } catch (err) {
      console.error("Permission Check Error:", err);
      res.status(500).json({ message: "Server error during permission check." });
    }
  };
};

module.exports = checkPermission;
