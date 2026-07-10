/**
 * Middleware to check if the authenticated user has specific permissions.
 * @param {string|string[]} requiredPermissions - The permission(s) required to access the route.
 */
const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userPermissions = req.user.permissions || [];
      
      // Handle single permission or array of permissions
      const permsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      
      // Check if user has ALL required permissions (or at least one depending on business logic, 
      // but usually for moderation it's "has this specific permission")
      // DEBUG LOGS (Remove in production)
      console.log(`[Permission Check] User: ${req.user.email}, Role: ${req.user.role}`);
      console.log(`[Permission Check] Required: ${permsToCheck}, Actual: ${userPermissions}`);

      const hasPermission = permsToCheck.every(p => userPermissions.includes(p));

      const isAdmin = req.user.role?.toLowerCase() === 'superadmin' || req.user.role?.toLowerCase() === 'super_admin';

      if (!hasPermission && !isAdmin) {
        console.warn(`[Permission Denied] User ${req.user.email} missing permissions: ${permsToCheck}`);
        return res.status(403).json({ 
          message: "Permission Denied: You do not have the required permissions for this action.",
          required: permsToCheck,
          actual: userPermissions
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error in Permission Middleware" });
    }
  };
};

module.exports = checkPermission;
