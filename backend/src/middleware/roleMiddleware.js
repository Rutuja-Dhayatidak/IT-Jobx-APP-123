const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found in request" });
    }

    const userRole = req.user.role;
    
    // Convert to array if string
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Case-insensitive check
    const hasRole = rolesArray.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    );

    if (hasRole) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: You do not have the required permissions" });
    }
  };
};

module.exports = roleMiddleware;
